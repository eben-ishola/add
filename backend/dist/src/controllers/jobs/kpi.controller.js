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
exports.KpiController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const kpi_service_1 = require("../../services/jobs/kpi.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const spreadsheet_util_1 = require("../../utils/shared/spreadsheet.util");
let KpiController = class KpiController {
    constructor(kpiService) {
        this.kpiService = kpiService;
    }
    async list(page, limit, search, title, type, employeeId, roleId, roleName, levelId, departmentId, departmentName, branchId, branchName, category, kpa, expandRelated, relatedRoleId, relatedDepartmentId, relatedBranchId, relatedBusinessUnitId, entity, appraisalCycleId) {
        return this.kpiService.listKpis(Number(page), Number(limit), {
            search,
            title,
            type,
            employeeId,
            roleId,
            roleName,
            levelId,
            departmentId,
            departmentName,
            branchId,
            branchName,
            category,
            kpa,
            entity,
            appraisalCycleId,
            expandRelated: expandRelated === 'true',
            relatedRoleId,
            relatedDepartmentId,
            relatedBranchId,
            relatedBusinessUnitId,
        });
    }
    async create(body) {
        return this.kpiService.createKpi(body);
    }
    async categoriesAlias() {
        return this.kpiService.listCategories();
    }
    async categories() {
        return this.kpiService.listCategories();
    }
    async groupedByScope(groupBy, entity, appraisalCycleId, scopeId, title, weightFilter) {
        const validGroups = ['role', 'department', 'level', 'branch', 'business_unit'];
        if (!groupBy || !validGroups.includes(groupBy)) {
            throw new common_1.BadRequestException(`groupBy must be one of: ${validGroups.join(', ')}`);
        }
        const parsedWeight = weightFilter ? Number(weightFilter) : undefined;
        return this.kpiService.listKpisGroupedByScope({
            groupBy: groupBy,
            entity,
            appraisalCycleId,
            scopeId,
            title,
            weightFilter: Number.isFinite(parsedWeight) ? parsedWeight : undefined,
        });
    }
    async groupedByStaff(entity, appraisalCycleId, employeeId, title, search, page, limit, weightFilter) {
        const parsedWeight = weightFilter ? Number(weightFilter) : undefined;
        return this.kpiService.listKpisGroupedByStaff({
            entity,
            appraisalCycleId,
            employeeId,
            title,
            search,
            page: Number(page) || 1,
            limit: Number(limit) || 20,
            weightFilter: Number.isFinite(parsedWeight) ? parsedWeight : undefined,
        });
    }
    async export(search, title, type, employeeId, roleId, levelId, departmentId, departmentName, branchId, branchName, category, entity, appraisalCycleId, res) {
        const csv = await this.kpiService.exportKpis({
            search,
            title,
            type,
            employeeId,
            roleId,
            levelId,
            departmentId,
            departmentName,
            branchId,
            branchName,
            category,
            entity,
            appraisalCycleId,
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="performance-kpis.csv"');
        res.send(csv);
    }
    async createCategory(body) {
        return this.kpiService.createCategory(body?.name, body?.description);
    }
    async similarCheck(body) {
        const matches = await this.kpiService.findSimilarKpisByDescription(body || {});
        return { matches };
    }
    async getOne(id) {
        return this.kpiService.getKpi(id);
    }
    async duplicate(id, body) {
        return this.kpiService.duplicateKpi(id, body?.appraisalCycleId, body?.appraisalCycleName);
    }
    async update(id, body) {
        return this.kpiService.updateKpi(id, body);
    }
    async remove(id) {
        return this.kpiService.deleteKpi(id);
    }
    async bulkUpload(file, entity, appraisalCycleId, appraisalCycleName) {
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
        return this.kpiService.bulkCreateFromCsv(rows, entity, appraisalCycleId, appraisalCycleName);
    }
};
exports.KpiController = KpiController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('title')),
    __param(4, (0, common_1.Query)('type')),
    __param(5, (0, common_1.Query)('employeeId')),
    __param(6, (0, common_1.Query)('roleId')),
    __param(7, (0, common_1.Query)('roleName')),
    __param(8, (0, common_1.Query)('levelId')),
    __param(9, (0, common_1.Query)('departmentId')),
    __param(10, (0, common_1.Query)('departmentName')),
    __param(11, (0, common_1.Query)('branchId')),
    __param(12, (0, common_1.Query)('branchName')),
    __param(13, (0, common_1.Query)('category')),
    __param(14, (0, common_1.Query)('kpa')),
    __param(15, (0, common_1.Query)('expandRelated')),
    __param(16, (0, common_1.Query)('relatedRoleId')),
    __param(17, (0, common_1.Query)('relatedDepartmentId')),
    __param(18, (0, common_1.Query)('relatedBranchId')),
    __param(19, (0, common_1.Query)('relatedBusinessUnitId')),
    __param(20, (0, common_1.Query)('entity')),
    __param(21, (0, common_1.Query)('appraisalCycleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('categories/list/all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "categoriesAlias", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "categories", null);
__decorate([
    (0, common_1.Get)('grouped/scope'),
    __param(0, (0, common_1.Query)('groupBy')),
    __param(1, (0, common_1.Query)('entity')),
    __param(2, (0, common_1.Query)('appraisalCycleId')),
    __param(3, (0, common_1.Query)('scopeId')),
    __param(4, (0, common_1.Query)('title')),
    __param(5, (0, common_1.Query)('weightFilter')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "groupedByScope", null);
__decorate([
    (0, common_1.Get)('grouped/staff'),
    __param(0, (0, common_1.Query)('entity')),
    __param(1, (0, common_1.Query)('appraisalCycleId')),
    __param(2, (0, common_1.Query)('employeeId')),
    __param(3, (0, common_1.Query)('title')),
    __param(4, (0, common_1.Query)('search')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __param(7, (0, common_1.Query)('weightFilter')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "groupedByStaff", null);
__decorate([
    (0, common_1.Get)('export'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('title')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('employeeId')),
    __param(4, (0, common_1.Query)('roleId')),
    __param(5, (0, common_1.Query)('levelId')),
    __param(6, (0, common_1.Query)('departmentId')),
    __param(7, (0, common_1.Query)('departmentName')),
    __param(8, (0, common_1.Query)('branchId')),
    __param(9, (0, common_1.Query)('branchName')),
    __param(10, (0, common_1.Query)('category')),
    __param(11, (0, common_1.Query)('entity')),
    __param(12, (0, common_1.Query)('appraisalCycleId')),
    __param(13, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "export", null);
__decorate([
    (0, common_1.Post)('categories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Post)('similar-check'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "similarCheck", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(':id/duplicate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "duplicate", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('entity')),
    __param(2, (0, common_1.Body)('appraisalCycleId')),
    __param(3, (0, common_1.Body)('appraisalCycleName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], KpiController.prototype, "bulkUpload", null);
exports.KpiController = KpiController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('kpi'),
    __metadata("design:paramtypes", [kpi_service_1.KpiService])
], KpiController);
//# sourceMappingURL=kpi.controller.js.map