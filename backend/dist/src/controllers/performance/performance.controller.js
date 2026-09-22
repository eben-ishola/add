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
exports.PerformanceController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const user_decorator_1 = require("../../auth/decorators/user.decorator");
const performance_service_1 = require("../../services/performance/performance.service");
const performance_review_dto_1 = require("../../dto/performance-review.dto");
const request_validation_pipe_1 = require("../../dto/request-validation.pipe");
const spreadsheet_util_1 = require("../../utils/shared/spreadsheet.util");
let PerformanceController = class PerformanceController {
    constructor(performanceService) {
        this.performanceService = performanceService;
    }
    listReviews(user, status, department, reviewer, employeeId, search, supervisorScope, subordinateScope, entity, appraisalCycleId, page = '1', limit = '10') {
        return this.performanceService.listReviews(user, { status, department, reviewer, employeeId, search, supervisorScope, subordinateScope, entity, appraisalCycleId }, parseInt(page, 10), parseInt(limit, 10));
    }
    reviewStats(user, status, department, reviewer, employeeId, search, supervisorScope, subordinateScope, entity, appraisalCycleId) {
        return this.performanceService.getReviewStats(user, {
            status, department, reviewer, employeeId, search, supervisorScope, subordinateScope, entity, appraisalCycleId,
        });
    }
    exportReviews(user, status, department, reviewer, employeeId, search, supervisorScope, subordinateScope, entity, appraisalCycleId) {
        return this.performanceService.exportReviews(user, {
            status, department, reviewer, employeeId, search, supervisorScope, subordinateScope, entity, appraisalCycleId,
        });
    }
    getReview(id, user) {
        return this.performanceService.getReview(id, user);
    }
    createReview(payload) {
        return this.performanceService.createReview(payload);
    }
    recomputeAllReviews() {
        return this.performanceService.recomputeAllReviewScores();
    }
    backfillSupervisorKpiResults(id) {
        return this.performanceService.backfillSupervisorKpiResultsForReview(id);
    }
    refreshReview(id, user) {
        return this.performanceService.refreshReview(id, user);
    }
    debugKpiResolution(id) {
        return this.performanceService.debugKpiResolutionForReview(id);
    }
    nudgeReviewSupervisor(id, user) {
        return this.performanceService.nudgeReviewSupervisor(id, user);
    }
    nudgeAllPendingSupervisors(body, user) {
        return this.performanceService.nudgeAllPendingSupervisors(body ?? {}, user);
    }
    nudgeOutstandingEmployees(body, user) {
        return this.performanceService.notifyOutstandingReviews({
            actor: user,
            entity: body?.entity,
            cycleId: body?.cycleId,
            dryRun: body?.dryRun,
        });
    }
    async bulkUploadReviews(file) {
        if (!file?.buffer?.length) {
            throw new common_1.BadRequestException('Upload a valid spreadsheet file.');
        }
        const normalizedName = String(file?.originalname ?? '').toLowerCase();
        if (normalizedName.endsWith('.xls')) {
            throw new common_1.BadRequestException('Legacy .xls files are not supported. Please save as .xlsx or .csv.');
        }
        let parsedRows = [];
        if (normalizedName.endsWith('.csv')) {
            parsedRows = (0, spreadsheet_util_1.csvBufferToObjects)(file.buffer, { defval: '', trim: true }).rows;
        }
        else {
            try {
                const workbook = await (0, spreadsheet_util_1.loadWorkbook)(file.buffer, file.originalname);
                const sheet = (0, spreadsheet_util_1.getFirstWorksheet)(workbook);
                if (!sheet) {
                    throw new common_1.BadRequestException('No worksheet found in uploaded file.');
                }
                parsedRows = (0, spreadsheet_util_1.worksheetToObjects)(sheet, { defval: '', useText: true }).rows;
            }
            catch (error) {
                const fallback = (0, spreadsheet_util_1.csvBufferToObjects)(file.buffer, { defval: '', trim: true }).rows;
                if (!fallback.length) {
                    throw error;
                }
                parsedRows = fallback;
            }
        }
        const rows = parsedRows
            .map((row) => {
            const normalized = {};
            Object.entries(row ?? {}).forEach(([key, value]) => {
                const header = String(key ?? '').trim().toLowerCase();
                if (!header)
                    return;
                normalized[header] = String(value ?? '').trim();
            });
            return normalized;
        })
            .filter((row) => Object.keys(row).length > 0);
        if (!rows.length) {
            throw new common_1.BadRequestException('Spreadsheet must include headers and at least one row.');
        }
        return this.performanceService.bulkCreateFromCsv(rows);
    }
    updateReview(id, payload, user) {
        return this.performanceService.updateReview(id, payload, user);
    }
    deleteReview(id) {
        return this.performanceService.deleteReview(id);
    }
    getWorkflowConfigs(user, entity) {
        return this.performanceService.getWorkflowConfigs(user, entity);
    }
    saveWorkflowConfig(user, payload) {
        return this.performanceService.saveWorkflowConfig(user, payload);
    }
    listCoreValues(user, entity) {
        return this.performanceService.listCoreValues(user, entity);
    }
    createCoreValue(user, payload) {
        return this.performanceService.createCoreValue(user, payload);
    }
    updateCoreValue(user, id, payload) {
        return this.performanceService.updateCoreValue(user, id, payload);
    }
    deleteCoreValue(user, id) {
        return this.performanceService.deleteCoreValue(user, id);
    }
    listAppraisalCycles(user, entity, search) {
        return this.performanceService.listAppraisalCycles(user, entity, search);
    }
    listActiveAppraisalCycles(user, entity) {
        return this.performanceService.listActiveAppraisalCycles(user, entity);
    }
    debugAppraisalCycleExists(user, entity) {
        return this.performanceService.debugAppraisalCycleExists(user, entity);
    }
    getAppraisalCycle(user, id) {
        return this.performanceService.getAppraisalCycle(user, id);
    }
    createAppraisalCycle(user, payload) {
        return this.performanceService.createAppraisalCycle(user, payload);
    }
    updateAppraisalCycle(user, id, payload) {
        return this.performanceService.updateAppraisalCycle(user, id, payload);
    }
    deleteAppraisalCycle(user, id) {
        return this.performanceService.deleteAppraisalCycle(user, id);
    }
};
exports.PerformanceController = PerformanceController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('reviews'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('department')),
    __param(3, (0, common_1.Query)('reviewer')),
    __param(4, (0, common_1.Query)('employeeId')),
    __param(5, (0, common_1.Query)('search')),
    __param(6, (0, common_1.Query)('supervisorScope')),
    __param(7, (0, common_1.Query)('subordinateScope')),
    __param(8, (0, common_1.Query)('entity')),
    __param(9, (0, common_1.Query)('appraisalCycleId')),
    __param(10, (0, common_1.Query)('page')),
    __param(11, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "listReviews", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('reviews/stats'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('department')),
    __param(3, (0, common_1.Query)('reviewer')),
    __param(4, (0, common_1.Query)('employeeId')),
    __param(5, (0, common_1.Query)('search')),
    __param(6, (0, common_1.Query)('supervisorScope')),
    __param(7, (0, common_1.Query)('subordinateScope')),
    __param(8, (0, common_1.Query)('entity')),
    __param(9, (0, common_1.Query)('appraisalCycleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "reviewStats", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('reviews/export'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('department')),
    __param(3, (0, common_1.Query)('reviewer')),
    __param(4, (0, common_1.Query)('employeeId')),
    __param(5, (0, common_1.Query)('search')),
    __param(6, (0, common_1.Query)('supervisorScope')),
    __param(7, (0, common_1.Query)('subordinateScope')),
    __param(8, (0, common_1.Query)('entity')),
    __param(9, (0, common_1.Query)('appraisalCycleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "exportReviews", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('reviews/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getReview", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('reviews'),
    (0, common_1.UsePipes)(request_validation_pipe_1.requestValidationPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [performance_review_dto_1.CreatePerformanceReviewDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "createReview", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('reviews/recompute-all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "recomputeAllReviews", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('reviews/:id/backfill-supervisor'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "backfillSupervisorKpiResults", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('reviews/:id/refresh'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "refreshReview", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('reviews/:id/kpi-resolution-debug'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "debugKpiResolution", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('reviews/:id/nudge'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "nudgeReviewSupervisor", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('reviews/nudge-all'),
    (0, common_1.UsePipes)(request_validation_pipe_1.requestValidationPipe),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [performance_review_dto_1.NudgePerformanceReviewsDto, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "nudgeAllPendingSupervisors", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('reviews/nudge-outstanding-employees'),
    (0, common_1.UsePipes)(request_validation_pipe_1.requestValidationPipe),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [performance_review_dto_1.NudgeOutstandingPerformanceReviewsDto, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "nudgeOutstandingEmployees", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('reviews/bulk'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "bulkUploadReviews", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('reviews/:id'),
    (0, common_1.UsePipes)(request_validation_pipe_1.requestValidationPipe),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, performance_review_dto_1.UpdatePerformanceReviewDto, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "updateReview", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('reviews/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "deleteReview", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('workflow-configs'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getWorkflowConfigs", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('workflow-configs'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "saveWorkflowConfig", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('core-values'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "listCoreValues", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('core-values'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "createCoreValue", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('core-values/:id'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "updateCoreValue", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('core-values/:id'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "deleteCoreValue", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('appraisal-cycles'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('entity')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "listAppraisalCycles", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('appraisal-cycles/active'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "listActiveAppraisalCycles", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('appraisal-cycles/debug/exists'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "debugAppraisalCycleExists", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('appraisal-cycles/:id'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getAppraisalCycle", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('appraisal-cycles'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "createAppraisalCycle", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('appraisal-cycles/:id'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "updateAppraisalCycle", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('appraisal-cycles/:id'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "deleteAppraisalCycle", null);
exports.PerformanceController = PerformanceController = __decorate([
    (0, common_1.Controller)('performance'),
    __metadata("design:paramtypes", [performance_service_1.PerformanceService])
], PerformanceController);
//# sourceMappingURL=performance.controller.js.map