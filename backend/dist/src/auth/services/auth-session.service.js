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
exports.AuthSessionService = exports.accessTokenTtlSeconds = exports.hashRefreshToken = exports.SESSION_ENDED_MESSAGE = exports.resolveSessionMaxMs = exports.REFRESH_REUSE_GRACE_MS = exports.DEFAULT_SESSION_MAX_HOURS = exports.SESSION_IDLE_TTL_MS = exports.ACCESS_TOKEN_TTL_SECONDS = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const crypto_1 = require("crypto");
const auth_session_schema_1 = require("../../schemas/auth-session.schema");
const config_1 = require("../../config");
const HOUR_MS = 60 * 60 * 1000;
exports.ACCESS_TOKEN_TTL_SECONDS = 4 * 60 * 60;
exports.SESSION_IDLE_TTL_MS = exports.ACCESS_TOKEN_TTL_SECONDS * 1000;
exports.DEFAULT_SESSION_MAX_HOURS = 12;
exports.REFRESH_REUSE_GRACE_MS = 60 * 1000;
const resolveSessionMaxMs = (hours) => {
    const parsed = Number(hours);
    const requested = Number.isFinite(parsed) && parsed > 0 ? parsed : exports.DEFAULT_SESSION_MAX_HOURS;
    return Math.max(exports.SESSION_IDLE_TTL_MS, requested * HOUR_MS);
};
exports.resolveSessionMaxMs = resolveSessionMaxMs;
exports.SESSION_ENDED_MESSAGE = 'Your session has ended. Sign in again.';
const hashRefreshToken = (raw) => (0, crypto_1.createHash)('sha256').update(raw).digest('hex');
exports.hashRefreshToken = hashRefreshToken;
const generateRefreshToken = () => (0, crypto_1.randomBytes)(32).toString('base64url');
const accessTokenTtlSeconds = (sessionExpiresAt, now = new Date()) => {
    const remaining = Math.floor((sessionExpiresAt.getTime() - now.getTime()) / 1000);
    return Math.max(1, Math.min(exports.ACCESS_TOKEN_TTL_SECONDS, remaining));
};
exports.accessTokenTtlSeconds = accessTokenTtlSeconds;
let AuthSessionService = class AuthSessionService {
    constructor(sessionModel) {
        this.sessionModel = sessionModel;
    }
    async start(input, now = new Date()) {
        const refreshToken = generateRefreshToken();
        const expiresAt = new Date(now.getTime() + (0, exports.resolveSessionMaxMs)(config_1.config?.sessionMaxHours));
        const session = await this.sessionModel.create({
            user: new mongoose_2.Types.ObjectId(input.userId),
            tokenHash: (0, exports.hashRefreshToken)(refreshToken),
            accessScope: input.accessScope,
            mfaVerified: input.mfaVerified,
            source: input.source,
            idleExpiresAt: new Date(now.getTime() + exports.SESSION_IDLE_TTL_MS),
            expiresAt,
            lastUsedAt: now,
        });
        return { sessionId: String(session._id), refreshToken, expiresAt };
    }
    async rotate(rawToken, now = new Date()) {
        const presented = typeof rawToken === 'string' ? rawToken.trim() : '';
        if (!presented) {
            throw new common_1.UnauthorizedException(exports.SESSION_ENDED_MESSAGE);
        }
        const presentedHash = (0, exports.hashRefreshToken)(presented);
        const refreshToken = generateRefreshToken();
        const session = await this.sessionModel
            .findOneAndUpdate({
            tokenHash: presentedHash,
            revokedAt: null,
            idleExpiresAt: { $gt: now },
            expiresAt: { $gt: now },
        }, {
            $set: {
                tokenHash: (0, exports.hashRefreshToken)(refreshToken),
                previousTokenHash: presentedHash,
                rotatedAt: now,
                lastUsedAt: now,
                idleExpiresAt: new Date(now.getTime() + exports.SESSION_IDLE_TTL_MS),
            },
        }, { new: true })
            .lean()
            .exec();
        if (!session) {
            await this.revokeIfReused(presentedHash, now);
            throw new common_1.UnauthorizedException(exports.SESSION_ENDED_MESSAGE);
        }
        return {
            sessionId: String(session._id),
            refreshToken,
            expiresAt: new Date(session.expiresAt),
            userId: String(session.user),
            accessScope: session.accessScope,
            mfaVerified: Boolean(session.mfaVerified),
            source: session.source,
        };
    }
    async findActive(sessionId, userId, now = new Date()) {
        if (!sessionId || !mongoose_2.Types.ObjectId.isValid(sessionId) || !mongoose_2.Types.ObjectId.isValid(userId)) {
            return null;
        }
        const session = await this.sessionModel
            .findOne({
            _id: new mongoose_2.Types.ObjectId(sessionId),
            user: new mongoose_2.Types.ObjectId(userId),
            revokedAt: null,
            expiresAt: { $gt: now },
        })
            .select({ expiresAt: 1 })
            .lean()
            .exec();
        return session
            ? { sessionId: String(session._id), expiresAt: new Date(session.expiresAt) }
            : null;
    }
    async updateScope(sessionId, accessScope) {
        await this.sessionModel
            .updateOne({ _id: new mongoose_2.Types.ObjectId(sessionId) }, { $set: { accessScope } })
            .exec();
    }
    async revoke(rawToken, reason, now = new Date()) {
        const presented = typeof rawToken === 'string' ? rawToken.trim() : '';
        if (!presented)
            return;
        await this.sessionModel
            .updateOne({ tokenHash: (0, exports.hashRefreshToken)(presented), revokedAt: null }, { $set: { revokedAt: now, revokedReason: reason } })
            .exec();
    }
    async revokeSession(sessionId, reason, now = new Date()) {
        if (!mongoose_2.Types.ObjectId.isValid(sessionId))
            return;
        await this.sessionModel
            .updateOne({ _id: new mongoose_2.Types.ObjectId(sessionId), revokedAt: null }, { $set: { revokedAt: now, revokedReason: reason } })
            .exec();
    }
    async revokeAllForUser(userId, options, now = new Date()) {
        if (!mongoose_2.Types.ObjectId.isValid(userId))
            return;
        const filter = {
            user: new mongoose_2.Types.ObjectId(userId),
            revokedAt: null,
        };
        if (options.except && mongoose_2.Types.ObjectId.isValid(options.except)) {
            filter._id = { $ne: new mongoose_2.Types.ObjectId(options.except) };
        }
        await this.sessionModel
            .updateMany(filter, { $set: { revokedAt: now, revokedReason: options.reason } })
            .exec();
    }
    async revokeIfReused(presentedHash, now) {
        const superseded = await this.sessionModel
            .findOne({ previousTokenHash: presentedHash, revokedAt: null })
            .select({ rotatedAt: 1 })
            .lean()
            .exec();
        if (!superseded)
            return;
        const rotatedAt = superseded.rotatedAt ? new Date(superseded.rotatedAt).getTime() : 0;
        if (now.getTime() - rotatedAt <= exports.REFRESH_REUSE_GRACE_MS)
            return;
        await this.revokeSession(String(superseded._id), 'reuse', now);
    }
};
exports.AuthSessionService = AuthSessionService;
exports.AuthSessionService = AuthSessionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(auth_session_schema_1.AuthSession.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AuthSessionService);
//# sourceMappingURL=auth-session.service.js.map