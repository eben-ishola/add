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
exports.DisciplinaryController = void 0;
const common_1 = require("@nestjs/common");
const disciplinary_service_1 = require("../../services/employee-lifecycle/disciplinary.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const authorization_decorator_1 = require("../../auth/decorators/authorization.decorator");
let DisciplinaryController = class DisciplinaryController {
    constructor(disciplinaryService) {
        this.disciplinaryService = disciplinaryService;
    }
    async listCases(search, status, severity, category, department, entity, subsidiaryId, page, limit) {
        return this.disciplinaryService.listCases({ search, status, severity, category, department, entity: entity ?? subsidiaryId }, Number(page), Number(limit));
    }
    async summary(status, severity, category, department, entity, subsidiaryId) {
        return this.disciplinaryService.getSummary({
            status,
            severity,
            category,
            department,
            entity: entity ?? subsidiaryId,
        });
    }
    async exportCases(res, search, status, severity, category, department, entity, subsidiaryId) {
        const csv = await this.disciplinaryService.exportCases({
            search,
            status,
            severity,
            category,
            department,
            entity: entity ?? subsidiaryId,
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="disciplinary-cases.csv"');
        res.send(csv);
    }
    async getCase(id) {
        return this.disciplinaryService.getCase(id);
    }
    async createCase(body) {
        return this.disciplinaryService.createCase(body);
    }
    async updateCase(id, body) {
        return this.disciplinaryService.updateCase(id, body);
    }
    async applySalaryDeduction(id, req) {
        const appliedBy = req?.user?._id ?? req?.user?.id ?? req?.user?.userId;
        return this.disciplinaryService.applySalaryDeduction(id, appliedBy ? String(appliedBy) : undefined);
    }
    async deleteCase(id) {
        return this.disciplinaryService.deleteCase(id);
    }
};
exports.DisciplinaryController = DisciplinaryController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('severity')),
    __param(3, (0, common_1.Query)('category')),
    __param(4, (0, common_1.Query)('department')),
    __param(5, (0, common_1.Query)('entity')),
    __param(6, (0, common_1.Query)('subsidiaryId')),
    __param(7, (0, common_1.Query)('page')),
    __param(8, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], DisciplinaryController.prototype, "listCases", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('severity')),
    __param(2, (0, common_1.Query)('category')),
    __param(3, (0, common_1.Query)('department')),
    __param(4, (0, common_1.Query)('entity')),
    __param(5, (0, common_1.Query)('subsidiaryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], DisciplinaryController.prototype, "summary", null);
__decorate([
    (0, common_1.Get)('export'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('severity')),
    __param(4, (0, common_1.Query)('category')),
    __param(5, (0, common_1.Query)('department')),
    __param(6, (0, common_1.Query)('entity')),
    __param(7, (0, common_1.Query)('subsidiaryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], DisciplinaryController.prototype, "exportCases", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DisciplinaryController.prototype, "getCase", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DisciplinaryController.prototype, "createCase", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DisciplinaryController.prototype, "updateCase", null);
__decorate([
    (0, common_1.Patch)(':id/salary-deduction'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DisciplinaryController.prototype, "applySalaryDeduction", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DisciplinaryController.prototype, "deleteCase", null);
exports.DisciplinaryController = DisciplinaryController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, authorization_decorator_1.RequirePermissions)(['disciplinary tracking', 'manage disciplinary cases', 'supervisor'], {
        mode: 'any',
    }),
    (0, common_1.Controller)('disciplinary'),
    __metadata("design:paramtypes", [disciplinary_service_1.DisciplinaryService])
], DisciplinaryController);
//# sourceMappingURL=disciplinary.controller.js.map