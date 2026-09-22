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
exports.PerformanceKpiResultController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const performance_kpi_result_service_1 = require("../../services/performance/performance-kpi-result.service");
const resolveActorId = (req) => {
    return (req?.user?._id ??
        req?.user?.id ??
        req?.user?.userId ??
        req?.user?.staffId);
};
let PerformanceKpiResultController = class PerformanceKpiResultController {
    constructor(performanceKpiResultService) {
        this.performanceKpiResultService = performanceKpiResultService;
    }
    listResults(period, periodStart, periodEnd, employeeId, status, source, kpiId, search, entity, appraisalCycleId, page = '1', limit = '20') {
        return this.performanceKpiResultService.listResults({ period, periodStart, periodEnd, employeeId, status, source, kpiId, search, entity, appraisalCycleId }, parseInt(page, 10), parseInt(limit, 10));
    }
    submitManual(payload, req) {
        const actorId = resolveActorId(req);
        return this.performanceKpiResultService.submitManualResult(payload, actorId);
    }
    approveResult(id, payload, req) {
        const actorId = resolveActorId(req);
        return this.performanceKpiResultService.approveResult(id, payload, actorId);
    }
    importApiResults(payload) {
        return this.performanceKpiResultService.importApiResults(payload);
    }
    openMonthly(period) {
        return this.performanceKpiResultService.openMonthlyResults(period);
    }
};
exports.PerformanceKpiResultController = PerformanceKpiResultController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Query)('periodStart')),
    __param(2, (0, common_1.Query)('periodEnd')),
    __param(3, (0, common_1.Query)('employeeId')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('source')),
    __param(6, (0, common_1.Query)('kpiId')),
    __param(7, (0, common_1.Query)('search')),
    __param(8, (0, common_1.Query)('entity')),
    __param(9, (0, common_1.Query)('appraisalCycleId')),
    __param(10, (0, common_1.Query)('page')),
    __param(11, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], PerformanceKpiResultController.prototype, "listResults", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('submit'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PerformanceKpiResultController.prototype, "submitManual", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PerformanceKpiResultController.prototype, "approveResult", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('import'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PerformanceKpiResultController.prototype, "importApiResults", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('open'),
    __param(0, (0, common_1.Body)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PerformanceKpiResultController.prototype, "openMonthly", null);
exports.PerformanceKpiResultController = PerformanceKpiResultController = __decorate([
    (0, common_1.Controller)('performance/kpi-results'),
    __metadata("design:paramtypes", [performance_kpi_result_service_1.PerformanceKpiResultService])
], PerformanceKpiResultController);
//# sourceMappingURL=performance-kpi-result.controller.js.map