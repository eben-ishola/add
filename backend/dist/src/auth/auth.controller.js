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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./services/auth.service");
const sign_in_dto_1 = require("./dto/sign-in.dto");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const user_decorator_1 = require("./decorators/user.decorator");
const auth_request_dto_1 = require("./dto/auth-request.dto");
const validation_pipe_1 = require("./dto/validation.pipe");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async login(payload) {
        const identifier = (payload.identifier ?? payload.username ?? '').toString().trim();
        return await this.authService.signIn(identifier, payload.password, payload.mfaTrustToken, payload.source);
    }
    async changePassword(body, user) {
        const userId = user?._id ?? user?.id;
        return this.authService.changePassword(userId ? String(userId) : undefined, body?.currentPassword, body?.newPassword, user?.mfaSetupPending === true, body?.source ?? user?.requestSource, user?.mfaVerified === true);
    }
    async verifyResetPassword(body) {
        return this.authService.verifyPasswordReset(body.email, body.token);
    }
    async requestPasswordReset(body) {
        return this.authService.requestPasswordReset(body.email);
    }
    async resetPassword(body) {
        return this.authService.resetPasswordWithToken(body.email, body.token, body.newPassword);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sign_in_dto_1.SignInDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('change-password'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_request_dto_1.ChangePasswordDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('reset-password/verify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_request_dto_1.VerifyPasswordResetDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyResetPassword", null);
__decorate([
    (0, common_1.Post)('reset-password/request'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_request_dto_1.RequestPasswordResetDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestPasswordReset", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_request_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    (0, common_1.UsePipes)(validation_pipe_1.authValidationPipe),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map