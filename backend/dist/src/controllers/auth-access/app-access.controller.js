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
exports.AppAccessController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const app_access_service_1 = require("../../services/auth-access/app-access.service");
const audit_write_guard_1 = require("../../auth/guards/audit-write.guard");
const it_staff_guard_1 = require("../../auth/guards/it-staff.guard");
let AppAccessController = class AppAccessController {
    constructor(appAccessService) {
        this.appAccessService = appAccessService;
    }
    async listCatalog(entity) {
        const data = await this.appAccessService.listCatalog(entity);
        return { data };
    }
    async addToCatalog(body) {
        const app = await this.appAccessService.addToCatalog(body?.name, body?.entity);
        return { data: app };
    }
    async listEnrollments(search, entity, page, limit) {
        const result = await this.appAccessService.listEnrollments(search, entity, page ? Number(page) : undefined, limit ? Number(limit) : undefined);
        return result;
    }
    async updateEnrollment(userId, body) {
        return this.appAccessService.updateEnrollment(userId, body?.apps ?? []);
    }
};
exports.AppAccessController = AppAccessController;
__decorate([
    (0, common_1.Get)('catalog'),
    __param(0, (0, common_1.Query)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppAccessController.prototype, "listCatalog", null);
__decorate([
    (0, common_1.Post)('catalog'),
    (0, common_1.UseGuards)(it_staff_guard_1.ItStaffGuard, audit_write_guard_1.AuditWriteGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppAccessController.prototype, "addToCatalog", null);
__decorate([
    (0, common_1.UseGuards)(it_staff_guard_1.ItStaffGuard),
    (0, common_1.Get)('enrollments'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('entity')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AppAccessController.prototype, "listEnrollments", null);
__decorate([
    (0, common_1.Put)('enrollments/:userId'),
    (0, common_1.UseGuards)(it_staff_guard_1.ItStaffGuard, audit_write_guard_1.AuditWriteGuard),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AppAccessController.prototype, "updateEnrollment", null);
exports.AppAccessController = AppAccessController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('apps'),
    __metadata("design:paramtypes", [app_access_service_1.AppAccessService])
], AppAccessController);
//# sourceMappingURL=app-access.controller.js.map