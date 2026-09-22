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
exports.MfaController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const main_source_guard_1 = require("./guards/main-source.guard");
const user_decorator_1 = require("./decorators/user.decorator");
const mfa_service_1 = require("./services/mfa.service");
const auth_service_1 = require("./services/auth.service");
const mfa_request_dto_1 = require("./dto/mfa-request.dto");
const validation_pipe_1 = require("./dto/validation.pipe");
const access_control_util_1 = require("../utils/shared/access-control.util");
let MfaController = class MfaController {
    constructor(mfaService, authService) {
        this.mfaService = mfaService;
        this.authService = authService;
    }
    status(user) {
        const id = user?._id ?? user?.id;
        return this.mfaService.getStatus(String(id));
    }
    setup(user) {
        const id = user?._id ?? user?.id;
        return this.mfaService.startSetup(String(id));
    }
    async confirm(user, body) {
        const id = user?._id ?? user?.id;
        const enrollment = await this.mfaService.confirmSetup(String(id), body.token);
        const accessToken = await this.authService.issueAccessTokenAfterMfaSetup(String(id), body?.source ?? user?.requestSource);
        return {
            ...enrollment,
            accessToken,
            access_token: accessToken,
        };
    }
    async disable(user, body) {
        const id = user?._id ?? user?.id;
        await this.mfaService.verifyToken(String(id), body.token);
        await this.mfaService.disable(String(id));
        return { status: 200, message: 'MFA disabled.' };
    }
    regenerateBackupCodes(user) {
        const id = user?._id ?? user?.id;
        return this.mfaService.regenerateBackupCodes(String(id));
    }
    verify(body) {
        return this.authService.verifyMfaChallenge(body.challengeToken, body.code, body.source);
    }
    async adminRequire(actor, userId) {
        if (!(0, access_control_util_1.userIsItStaff)(actor)) {
            throw new common_1.ForbiddenException('Only administrators can change MFA policy.');
        }
        if (!userId)
            throw new common_1.BadRequestException('userId is required.');
        await this.mfaService.setRequired(userId, true);
        return { status: 200, message: 'MFA enrollment is now required for this user.' };
    }
    async adminUnrequire(actor, userId) {
        if (!(0, access_control_util_1.userIsItStaff)(actor)) {
            throw new common_1.ForbiddenException('Only administrators can change MFA policy.');
        }
        if (!userId)
            throw new common_1.BadRequestException('userId is required.');
        await this.mfaService.setRequired(userId, false);
        return { status: 200, message: 'MFA enrollment is no longer required for this user.' };
    }
    async adminReset(actor, userId) {
        if (!(0, access_control_util_1.userIsItStaff)(actor)) {
            throw new common_1.ForbiddenException('Only administrators can reset MFA.');
        }
        if (!userId)
            throw new common_1.BadRequestException('userId is required.');
        await this.mfaService.disable(userId, { adminOverride: true });
        return { status: 200, message: 'MFA reset. The user can enroll a new device on next login.' };
    }
    adminListUsers(actor, entity, search, page, limit) {
        if (!(0, access_control_util_1.userIsItStaff)(actor)) {
            throw new common_1.ForbiddenException('Only administrators can view MFA status for other users.');
        }
        return this.mfaService.listUsers({
            entity,
            search,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });
    }
    adminGetPolicy(actor) {
        if (!(0, access_control_util_1.userIsItStaff)(actor)) {
            throw new common_1.ForbiddenException('Only administrators can view MFA policy.');
        }
        return this.mfaService.getPolicy();
    }
    adminSetPolicy(actor, body) {
        if (!(0, access_control_util_1.userIsItStaff)(actor)) {
            throw new common_1.ForbiddenException('Only administrators can change MFA policy.');
        }
        const actorId = actor?._id ?? actor?.id;
        return this.mfaService.setPolicy(body.requireForAll, actorId ? String(actorId) : undefined);
    }
};
exports.MfaController = MfaController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('status'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MfaController.prototype, "status", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, main_source_guard_1.MainSourceGuard),
    (0, common_1.Post)('setup'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MfaController.prototype, "setup", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, main_source_guard_1.MainSourceGuard),
    (0, common_1.Post)('confirm'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mfa_request_dto_1.MfaTokenDto]),
    __metadata("design:returntype", Promise)
], MfaController.prototype, "confirm", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, main_source_guard_1.MainSourceGuard),
    (0, common_1.Post)('disable'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mfa_request_dto_1.MfaTokenDto]),
    __metadata("design:returntype", Promise)
], MfaController.prototype, "disable", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, main_source_guard_1.MainSourceGuard),
    (0, common_1.Post)('backup-codes'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MfaController.prototype, "regenerateBackupCodes", null);
__decorate([
    (0, common_1.Post)('verify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mfa_request_dto_1.VerifyMfaChallengeDto]),
    __metadata("design:returntype", void 0)
], MfaController.prototype, "verify", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('admin/require/:userId'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MfaController.prototype, "adminRequire", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('admin/unrequire/:userId'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MfaController.prototype, "adminUnrequire", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('admin/reset/:userId'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MfaController.prototype, "adminReset", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('admin/users'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('entity')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], MfaController.prototype, "adminListUsers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('admin/policy'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MfaController.prototype, "adminGetPolicy", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('admin/policy'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mfa_request_dto_1.SetMfaPolicyDto]),
    __metadata("design:returntype", void 0)
], MfaController.prototype, "adminSetPolicy", null);
exports.MfaController = MfaController = __decorate([
    (0, common_1.Controller)('auth/mfa'),
    (0, common_1.UsePipes)(validation_pipe_1.authValidationPipe),
    __metadata("design:paramtypes", [mfa_service_1.MfaService,
        auth_service_1.AuthService])
], MfaController);
//# sourceMappingURL=mfa.controller.js.map