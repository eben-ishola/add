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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_jwt_1 = require("passport-jwt");
const passport_1 = require("@nestjs/passport");
const mongoose_1 = require("mongoose");
const mongoose_2 = require("@nestjs/mongoose");
const supervisor_util_1 = require("../../utils/user/supervisor.util");
const additional_roles_util_1 = require("../../utils/user/additional-roles.util");
const config_1 = require("../../config");
const request_source_1 = require("../request-source");
const exit_clearance_schema_1 = require("../../schemas/exit-clearance.schema");
const user_cache_1 = require("../user-cache");
const readAccessScope = (payload) => {
    if (payload?.accessScope === 'full' && payload?.mfaSetupPending !== true) {
        return 'full';
    }
    if (payload?.accessScope === 'mfa-setup' && payload?.mfaSetupPending === true) {
        return 'mfa-setup';
    }
    if (payload?.accessScope === 'exit-clearance') {
        return 'exit-clearance';
    }
    return null;
};
const attachAuthenticationState = (user, payload, accessScope) => ({
    ...user,
    accessScope,
    requestSource: (0, request_source_1.normalizeRequestSource)(payload?.source),
    mfaSetupPending: accessScope === 'mfa-setup',
    mfaVerified: accessScope === 'full' && payload?.mfaVerified === true,
});
const mfaAccessDenied = (user, accessScope) => accessScope === 'full' &&
    Boolean(user?.mfaRequired) &&
    user?.mfaVerified !== true;
const assertMfaAccess = (user, accessScope) => {
    if (mfaAccessDenied(user, accessScope)) {
        throw new common_1.UnauthorizedException('MFA verification is required.');
    }
};
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(staffModel, clearanceModel) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config_1.config.jwtSecret,
        });
        this.staffModel = staffModel;
        this.clearanceModel = clearanceModel;
    }
    async validate(payload) {
        const accessScope = readAccessScope(payload);
        if (!accessScope) {
            throw new common_1.UnauthorizedException('Invalid authentication scope. Sign in again.');
        }
        if (accessScope === 'exit-clearance') {
            const staffId = typeof payload?.sub === 'string' ? payload.sub.trim() : '';
            const open = staffId && mongoose_1.Types.ObjectId.isValid(staffId)
                ? await this.clearanceModel
                    .findOne({ staff: new mongoose_1.Types.ObjectId(staffId), status: 'IN_PROGRESS' })
                    .select('_id')
                    .lean()
                    .exec()
                : null;
            if (!open) {
                throw new common_1.UnauthorizedException('Your exit clearance is complete. This account is closed.');
            }
        }
        const cacheKey = (0, user_cache_1.buildUserCacheKey)(payload);
        const cachedUser = (0, user_cache_1.readUserCache)(cacheKey);
        if (cachedUser) {
            const authenticatedUser = attachAuthenticationState(cachedUser, payload, accessScope);
            if (mfaAccessDenied(authenticatedUser, accessScope)) {
                (0, user_cache_1.dropUserCacheKey)(cacheKey);
            }
            else {
                return authenticatedUser;
            }
        }
        const email = typeof payload?.email === 'string' ? payload.email.trim() : '';
        const sub = typeof payload?.sub === 'string' ? payload.sub.trim() : '';
        const staffId = typeof payload?.staffId === 'string' ? payload.staffId.trim() : '';
        const lookup = {};
        if (sub && mongoose_1.Types.ObjectId.isValid(sub)) {
            lookup._id = new mongoose_1.Types.ObjectId(sub);
        }
        else if (email) {
            lookup.email = email;
        }
        else if (staffId) {
            lookup.staffId = staffId;
        }
        if (!Object.keys(lookup).length) {
            throw new common_1.UnauthorizedException();
        }
        const user = await this.staffModel
            .findOne(lookup)
            .select('-password -__v')
            .populate([
            {
                path: "role",
                skipInvalidIds: true,
                populate: {
                    path: "permissions",
                    skipInvalidIds: true,
                }
            },
            {
                path: "businessUnit",
                populate: {
                    path: "territory"
                }
            },
            {
                path: "department"
            },
            {
                path: "additionalBranch",
                select: "name entity latitude longitude",
            },
            {
                path: "entity",
                select: "_id name short gl",
            },
            {
                path: "level",
            },
            {
                path: "branch",
                select: "_id name gl latitude longitude",
            },
            {
                path: "additionalRoles",
                skipInvalidIds: true,
                populate: [
                    {
                        path: "role",
                        skipInvalidIds: true,
                    },
                    {
                        path: "entity",
                        skipInvalidIds: true,
                    }
                ]
            }
        ]);
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        await this.normalizeAndPopulateAdditionalRoles(user);
        await (0, supervisor_util_1.injectSupervisorMetadata)(this.staffModel, user);
        const safeUser = this.sanitizeUser(user);
        (0, user_cache_1.writeUserCache)(cacheKey, safeUser);
        const authenticatedUser = attachAuthenticationState(safeUser, payload, accessScope);
        assertMfaAccess(authenticatedUser, accessScope);
        return authenticatedUser;
    }
    sanitizeUser(user) {
        const plain = typeof user?.toObject === 'function' ? user.toObject() : { ...user };
        const { password, __v, ...rest } = plain ?? {};
        const resolvedId = String(rest?._id ?? rest?.id ?? '');
        return {
            ...rest,
            id: resolvedId,
            userId: rest?.userId ?? resolvedId,
        };
    }
    async normalizeAndPopulateAdditionalRoles(user) {
        if (!user) {
            return;
        }
        const { assignments, mutated } = (0, additional_roles_util_1.normalizeAdditionalRoleAssignments)(user.additionalRoles);
        if (mutated) {
            await this.staffModel
                .updateOne({ _id: user._id }, {
                $set: {
                    additionalRoles: assignments.map(({ role, entity }) => ({ role, entity })),
                },
            })
                .exec();
        }
        user.additionalRoles = assignments;
        await user.populate({
            path: 'additionalRoles',
            options: { lean: true },
            populate: [
                {
                    path: 'role',
                    options: { lean: true },
                    skipInvalidIds: true,
                    populate: { path: 'permissions', options: { lean: true }, skipInvalidIds: true },
                },
                { path: 'entity', options: { lean: true }, skipInvalidIds: true },
            ],
        });
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_2.InjectModel)('User')),
    __param(1, (0, mongoose_2.InjectModel)(exit_clearance_schema_1.ExitClearance.name)),
    __metadata("design:paramtypes", [mongoose_1.Model,
        mongoose_1.Model])
], JwtStrategy);
//# sourceMappingURL=jwt.stategy.js.map