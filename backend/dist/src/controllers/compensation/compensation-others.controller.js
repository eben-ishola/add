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
exports.CompensationOthersController = void 0;
const common_1 = require("@nestjs/common");
const authorization_decorator_1 = require("../../auth/decorators/authorization.decorator");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const compensation_others_service_1 = require("../../services/compensation/compensation-others.service");
const access_control_util_1 = require("../../utils/shared/access-control.util");
const COMPENSATION_OTHERS_GENERATE_PERMISSIONS = [
    'process payroll',
    'view payroll',
];
let CompensationOthersController = class CompensationOthersController {
    constructor(service) {
        this.service = service;
    }
    async generate(body, req) {
        const createdBy = req?.user?._id ?? req?.user?.id ?? req?.user?.userId;
        return this.service.generate({ ...body, createdBy });
    }
    async myAssignments(req) {
        return this.service.hasAssignmentsFor(req?.user);
    }
    async list(req, entity, month, status, assignedOnly, assignedId, userId) {
        return this.service.list({
            entity,
            month,
            status,
            assignedOnly: String(assignedOnly ?? '').toLowerCase() === 'true' ||
                assignedOnly === '1',
            assignedId: assignedId ?? userId,
        }, req?.user);
    }
    async findById(id) {
        return this.service.findById(id);
    }
    async act(id, body, req) {
        const userId = req?.user?._id ?? req?.user?.id ?? req?.user?.userId;
        return this.service.act(id, body?.stage, body?.action, userId);
    }
    async switchAccount(id, body, req) {
        const user = req?.user;
        if (!(0, access_control_util_1.userIsSuperAdmin)(user)) {
            throw new common_1.ForbiddenException('Only a super admin can switch the payout account.');
        }
        const applyToAll = body?.applyToAll === true || String(body?.applyToAll ?? '') === 'true';
        if (applyToAll) {
            return this.service.switchApprovalAccountForAll(user, id, body?.accountType ?? '');
        }
        return this.service.switchApprovalAccount(user, id, body?.staffId ?? body?.employeeId ?? '', body?.accountType ?? '');
    }
    async financeComment(id, body, req) {
        return this.service.updateFinanceComment(id, req?.user, body?.comment);
    }
};
exports.CompensationOthersController = CompensationOthersController;
__decorate([
    (0, authorization_decorator_1.RequirePermissions)(COMPENSATION_OTHERS_GENERATE_PERMISSIONS),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CompensationOthersController.prototype, "generate", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('my-assignments'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CompensationOthersController.prototype, "myAssignments", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('entity')),
    __param(2, (0, common_1.Query)('month')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('assignedOnly')),
    __param(5, (0, common_1.Query)('assignedId')),
    __param(6, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CompensationOthersController.prototype, "list", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompensationOthersController.prototype, "findById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/act'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CompensationOthersController.prototype, "act", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/switch-account'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CompensationOthersController.prototype, "switchAccount", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/finance-comment'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CompensationOthersController.prototype, "financeComment", null);
exports.CompensationOthersController = CompensationOthersController = __decorate([
    (0, common_1.Controller)('compensation/others'),
    __metadata("design:paramtypes", [compensation_others_service_1.CompensationOthersService])
], CompensationOthersController);
//# sourceMappingURL=compensation-others.controller.js.map