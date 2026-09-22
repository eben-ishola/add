"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminGuard = void 0;
const common_1 = require("@nestjs/common");
const access_control_util_1 = require("../../utils/shared/access-control.util");
let SuperAdminGuard = class SuperAdminGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request?.user;
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        if ((0, access_control_util_1.userIsSuperAdmin)(user))
            return true;
        throw new common_1.ForbiddenException('Only a super admin can change the approval workflow configuration.');
    }
};
exports.SuperAdminGuard = SuperAdminGuard;
exports.SuperAdminGuard = SuperAdminGuard = __decorate([
    (0, common_1.Injectable)()
], SuperAdminGuard);
//# sourceMappingURL=super-admin.guard.js.map