"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const requestPath = (context) => {
    const request = context.switchToHttp().getRequest();
    return {
        method: String(request.method ?? '').toUpperCase(),
        path: String(request.originalUrl ?? request.path ?? '')
            .split('?')[0]
            .replace(/^\/+|\/+$/g, ''),
    };
};
const isAllowedDuringExitClearance = (context) => {
    const { method, path } = requestPath(context);
    if (method === 'GET') {
        return path === 'users/profile' || path.startsWith('exit/');
    }
    return method === 'POST' && path.startsWith('exit/');
};
const isAllowedDuringMfaSetup = (context) => {
    const request = context.switchToHttp().getRequest();
    const method = String(request.method ?? '').toUpperCase();
    const path = String(request.originalUrl ?? request.path ?? '')
        .split('?')[0]
        .replace(/^\/+|\/+$/g, '');
    if (method === 'GET') {
        return path === 'auth/mfa/status';
    }
    return method === 'POST' && (path === 'auth/mfa/setup' ||
        path === 'auth/mfa/confirm' ||
        path === 'auth/change-password');
};
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    handleRequest(error, user, info, context) {
        if (error || !user) {
            if (error) {
                throw error;
            }
            const infoMessage = info && typeof info === 'object' && 'message' in info
                ? info.message
                : undefined;
            const message = typeof infoMessage === 'string' && infoMessage.trim().length
                ? infoMessage
                : undefined;
            throw new common_1.UnauthorizedException(message);
        }
        const jwtUser = user;
        if (jwtUser.accessScope === 'exit-clearance') {
            if (!context || !isAllowedDuringExitClearance(context)) {
                throw new common_1.UnauthorizedException('This account can only complete its exit clearance.');
            }
            return user;
        }
        if (jwtUser.mfaSetupPending === true) {
            if (!context || !isAllowedDuringMfaSetup(context)) {
                throw new common_1.UnauthorizedException('MFA enrollment is required before accessing this resource.');
            }
            return user;
        }
        if (jwtUser.accessScope !== 'full') {
            throw new common_1.UnauthorizedException('Invalid authentication scope. Sign in again.');
        }
        return user;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map