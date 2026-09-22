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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const authorization_decorator_1 = require("../decorators/authorization.decorator");
const access_control_util_1 = require("../../utils/shared/access-control.util");
const SUPER_ADMIN_ROLE_TOKENS = [
    'super admin',
    'super-admin',
    'superadmin',
    'hr super admin',
    'hr-super-admin',
    'hrsuperadmin',
    'gmd',
    'group hr director',
    'group-hr-director',
    'grouphrdirector',
];
const isSuperAdminRole = (user) => {
    if ((0, access_control_util_1.userHasRole)(user, SUPER_ADMIN_ROLE_TOKENS))
        return true;
    const roleNames = (0, access_control_util_1.collectUserRoleNames)(user);
    for (const roleName of roleNames) {
        const compact = roleName.replace(/[\s_-]+/g, '');
        if (compact.includes('superadmin') ||
            compact.includes('hrsuperadmin') ||
            compact === 'gmd' ||
            compact.includes('grouphrdirector')) {
            return true;
        }
    }
    return false;
};
let PermissionsGuard = class PermissionsGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredPermissions = this.reflector.getAllAndOverride(authorization_decorator_1.REQUIRED_PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
        const requiredRoles = this.reflector.getAllAndOverride(authorization_decorator_1.REQUIRED_ROLES_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredPermissions?.values?.length && !requiredRoles?.values?.length) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request?.user;
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        if (isSuperAdminRole(user)) {
            return true;
        }
        const permissionAllowed = requiredPermissions?.values?.length
            ? (0, access_control_util_1.userHasPermission)(user, requiredPermissions.values, requiredPermissions.mode)
            : false;
        const roleAllowed = requiredRoles?.values?.length
            ? (0, access_control_util_1.userHasRole)(user, requiredRoles.values, requiredRoles.mode)
            : false;
        if (permissionAllowed || roleAllowed) {
            return true;
        }
        const message = requiredPermissions?.message ??
            requiredRoles?.message ??
            'You do not have permission to perform this action.';
        throw new common_1.ForbiddenException(message);
    }
};
exports.PermissionsGuard = PermissionsGuard;
exports.PermissionsGuard = PermissionsGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], PermissionsGuard);
//# sourceMappingURL=permissions.guard.js.map