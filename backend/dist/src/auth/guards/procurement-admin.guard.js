"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcurementAdminGuard = exports.PROCUREMENT_SETTINGS_PERMISSION = void 0;
const common_1 = require("@nestjs/common");
const access_control_util_1 = require("../../utils/shared/access-control.util");
exports.PROCUREMENT_SETTINGS_PERMISSION = 'manage procurement settings';
let ProcurementAdminGuard = class ProcurementAdminGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request?.user;
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        if ((0, access_control_util_1.userIsItStaff)(user))
            return true;
        if ((0, access_control_util_1.userHasPermission)(user, [exports.PROCUREMENT_SETTINGS_PERMISSION]))
            return true;
        throw new common_1.ForbiddenException('Only IT or the Head of Procurement can manage expense accounts and budgets.');
    }
};
exports.ProcurementAdminGuard = ProcurementAdminGuard;
exports.ProcurementAdminGuard = ProcurementAdminGuard = __decorate([
    (0, common_1.Injectable)()
], ProcurementAdminGuard);
//# sourceMappingURL=procurement-admin.guard.js.map