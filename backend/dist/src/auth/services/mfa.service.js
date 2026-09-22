"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MfaService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const mfa_policy_schema_1 = require("../../schemas/mfa-policy.schema");
const mfa_trust_1 = require("../mfa-trust");
const user_cache_1 = require("../user-cache");
const ISSUER = 'Addosser HRMS';
const BACKUP_CODE_COUNT = 10;
const BACKUP_CODE_BYTES = 5;
const TOTP_WINDOW = 1;
const mfaChallengeSecret = () => process.env.MFA_CHALLENGE_SECRET ?? '';
let MfaService = class MfaService {
    constructor(userModel, policyModel) {
        this.userModel = userModel;
        this.policyModel = policyModel;
    }
    async getPolicy() {
        const doc = await this.policyModel
            .findOne({ key: mfa_policy_schema_1.MFA_POLICY_SINGLETON_KEY })
            .lean();
        return { requireForAll: Boolean(doc?.requireForAll) };
    }
    async setPolicy(requireForAll, actorId) {
        await this.policyModel
            .findOneAndUpdate({ key: mfa_policy_schema_1.MFA_POLICY_SINGLETON_KEY }, {
            $set: { requireForAll: Boolean(requireForAll), updatedBy: actorId ?? null },
            $setOnInsert: { key: mfa_policy_schema_1.MFA_POLICY_SINGLETON_KEY },
        }, { upsert: true, new: true, setDefaultsOnInsert: true })
            .exec();
        return { requireForAll: Boolean(requireForAll) };
    }
    async isMfaEffectivelyRequired(userOrId) {
        let perUser = false;
        let exempt = false;
        if (userOrId && typeof userOrId === 'object') {
            perUser = Boolean(userOrId?.mfaRequired);
            exempt = Boolean(userOrId?.mfaExempt);
        }
        else if (userOrId) {
            const u = await this.userModel
                .findById(userOrId)
                .select('mfaRequired mfaExempt')
                .lean();
            perUser = Boolean(u?.mfaRequired);
            exempt = Boolean(u?.mfaExempt);
        }
        if (exempt)
            return false;
        if (perUser)
            return true;
        const policy = await this.getPolicy();
        return policy.requireForAll;
    }
    async startSetup(userId) {
        const user = await this.userModel
            .findById(userId)
            .select('email staffId firstName lastName mfaEnabled mfaRequired')
            .lean();
        if (!user)
            throw new common_1.NotFoundException('User not found.');
        if (user.mfaEnabled) {
            throw new common_1.BadRequestException('MFA is already enabled. Contact an administrator to reset it.');
        }
        const effectivelyRequired = await this.isMfaEffectivelyRequired(user);
        if (!effectivelyRequired) {
            throw new common_1.BadRequestException('MFA is not required for your account. Contact an administrator if you need to enable it.');
        }
        const label = user.email || user.staffId || 'user';
        const secret = speakeasy.generateSecret({
            length: 20,
            name: `${ISSUER}:${label}`,
            issuer: ISSUER,
        });
        const otpauthUrl = secret.otpauth_url ?? '';
        const qrDataUrl = await qrcode.toDataURL(otpauthUrl);
        await this.userModel.updateOne({ _id: userId }, { $set: { totpSecret: secret.base32, mfaEnabled: false } });
        return { otpauthUrl, qrDataUrl, secret: secret.base32 };
    }
    async confirmSetup(userId, token) {
        if (!token || !/^\d{6}$/.test(token)) {
            throw new common_1.BadRequestException('Enter the 6-digit code from your authenticator app.');
        }
        const user = await this.userModel
            .findById(userId)
            .select('+totpSecret mfaEnabled')
            .lean();
        if (!user)
            throw new common_1.NotFoundException('User not found.');
        const secret = user?.totpSecret;
        if (!secret) {
            throw new common_1.BadRequestException('No MFA setup in progress. Generate a new secret first.');
        }
        const ok = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window: TOTP_WINDOW,
        });
        if (!ok)
            throw new common_1.UnauthorizedException('Invalid authenticator code.');
        const { plain, hashed } = await this.generateBackupCodes();
        await this.userModel.updateOne({ _id: userId }, {
            $set: {
                mfaEnabled: true,
                mfaSetupAt: new Date(),
                mfaVerifiedAt: new Date(),
                mfaBackupCodes: hashed,
            },
        });
        (0, user_cache_1.invalidateUserCache)(userId);
        return {
            backupCodes: plain,
            mfaTrustToken: (0, mfa_trust_1.issueMfaTrustToken)(mfaChallengeSecret(), userId, secret),
            mfaTrustDays: mfa_trust_1.MFA_TRUST_TTL_DAYS,
        };
    }
    async verifyToken(userId, token) {
        if (!token) {
            throw new common_1.BadRequestException('Code is required.');
        }
        const user = await this.userModel
            .findById(userId)
            .select('+totpSecret +mfaBackupCodes mfaEnabled')
            .exec();
        if (!user)
            throw new common_1.NotFoundException('User not found.');
        if (!user.mfaEnabled || !user.totpSecret) {
            throw new common_1.BadRequestException('MFA is not enabled for this account.');
        }
        const trimmed = token.trim();
        if (/^\d{6}$/.test(trimmed)) {
            const ok = speakeasy.totp.verify({
                secret: user.totpSecret,
                encoding: 'base32',
                token: trimmed,
                window: TOTP_WINDOW,
            });
            if (!ok)
                throw new common_1.UnauthorizedException('Invalid authenticator code.');
            user.mfaVerifiedAt = new Date();
            await user.save();
            return true;
        }
        const normalizedCode = trimmed.replace(/[\s-]/g, '').toLowerCase();
        const codes = user.mfaBackupCodes ?? [];
        let matchedIndex = -1;
        for (let i = 0; i < codes.length; i += 1) {
            if (await bcrypt.compare(normalizedCode, codes[i])) {
                matchedIndex = i;
                break;
            }
        }
        if (matchedIndex < 0) {
            throw new common_1.UnauthorizedException('Invalid authenticator code.');
        }
        codes.splice(matchedIndex, 1);
        user.mfaBackupCodes = codes;
        user.mfaVerifiedAt = new Date();
        await user.save();
        return true;
    }
    async isDeviceTrusted(userId, trustToken) {
        if (!trustToken)
            return false;
        const user = await this.userModel
            .findById(userId)
            .select('+totpSecret mfaEnabled')
            .lean();
        if (!user || !user.mfaEnabled)
            return false;
        return (0, mfa_trust_1.verifyMfaTrustToken)(mfaChallengeSecret(), trustToken, userId, user.totpSecret);
    }
    async issueDeviceTrust(userId) {
        const user = await this.userModel
            .findById(userId)
            .select('+totpSecret')
            .lean();
        return (0, mfa_trust_1.issueMfaTrustToken)(mfaChallengeSecret(), userId, user?.totpSecret);
    }
    async disable(userId, opts) {
        if (!opts?.adminOverride) {
            throw new common_1.BadRequestException('MFA can only be reset by an administrator. Contact your IT admin for help.');
        }
        await this.userModel.updateOne({ _id: userId }, {
            $set: {
                mfaEnabled: false,
                totpSecret: null,
                mfaBackupCodes: [],
                mfaSetupAt: null,
            },
        });
        (0, user_cache_1.invalidateUserCache)(userId);
    }
    async setRequired(targetUserId, required) {
        const update = { mfaRequired: required, mfaExempt: !required };
        await this.userModel.updateOne({ _id: targetUserId }, { $set: update });
        (0, user_cache_1.invalidateUserCache)(targetUserId);
    }
    async listUsers(opts) {
        const page = Math.max(Number(opts?.page) || 1, 1);
        const limit = Math.min(Math.max(Number(opts?.limit) || 20, 1), 100);
        const filter = {};
        if (opts?.entity)
            filter.entity = opts.entity;
        if (opts?.search) {
            const re = new RegExp(opts.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [
                { firstName: re },
                { lastName: re },
                { email: re },
                { staffId: re },
            ];
        }
        const [rows, total] = await Promise.all([
            this.userModel
                .find(filter)
                .select('firstName lastName email staffId department mfaEnabled mfaRequired mfaExempt mfaSetupAt mfaVerifiedAt')
                .populate('department', 'name')
                .sort({ firstName: 1, lastName: 1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean()
                .exec(),
            this.userModel.countDocuments(filter).exec(),
        ]);
        return {
            data: rows.map((u) => ({
                _id: String(u._id),
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
                staffId: u.staffId,
                department: u.department,
                mfaEnabled: Boolean(u.mfaEnabled),
                mfaRequired: Boolean(u.mfaRequired),
                mfaExempt: Boolean(u.mfaExempt),
                mfaSetupAt: u.mfaSetupAt ?? null,
                mfaVerifiedAt: u.mfaVerifiedAt ?? null,
            })),
            total,
            page,
            limit,
            totalPages: Math.max(Math.ceil(total / limit), 1),
        };
    }
    async regenerateBackupCodes(userId) {
        const user = await this.userModel
            .findById(userId)
            .select('mfaEnabled')
            .lean();
        if (!user)
            throw new common_1.NotFoundException('User not found.');
        if (!user.mfaEnabled) {
            throw new common_1.BadRequestException('MFA is not enabled for this account.');
        }
        const { plain, hashed } = await this.generateBackupCodes();
        await this.userModel.updateOne({ _id: userId }, { $set: { mfaBackupCodes: hashed } });
        return { backupCodes: plain };
    }
    async getStatus(userId) {
        const user = await this.userModel
            .findById(userId)
            .select('+mfaBackupCodes mfaEnabled mfaRequired mfaExempt mfaSetupAt mfaVerifiedAt')
            .lean();
        if (!user)
            throw new common_1.NotFoundException('User not found.');
        const policy = await this.getPolicy();
        const perUser = Boolean(user.mfaRequired);
        const exempt = Boolean(user.mfaExempt);
        return {
            enabled: Boolean(user.mfaEnabled),
            required: exempt ? false : perUser || policy.requireForAll,
            requiredByOrg: policy.requireForAll,
            requiredByUser: perUser,
            exempt,
            setupAt: user.mfaSetupAt ?? null,
            verifiedAt: user.mfaVerifiedAt ?? null,
            backupCodesRemaining: (user.mfaBackupCodes ?? []).length,
        };
    }
    async generateBackupCodes() {
        const plain = [];
        const hashed = [];
        for (let i = 0; i < BACKUP_CODE_COUNT; i += 1) {
            const code = crypto.randomBytes(BACKUP_CODE_BYTES).toString('hex');
            plain.push(code);
            hashed.push(await bcrypt.hash(code, 10));
        }
        return { plain, hashed };
    }
};
exports.MfaService = MfaService;
exports.MfaService = MfaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __param(1, (0, mongoose_1.InjectModel)(mfa_policy_schema_1.MfaPolicy.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], MfaService);
//# sourceMappingURL=mfa.service.js.map