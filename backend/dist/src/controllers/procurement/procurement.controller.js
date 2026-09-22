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
exports.ProcurementController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const fs_1 = require("fs");
const path = require("path");
const authorization_decorator_1 = require("../../auth/decorators/authorization.decorator");
const user_decorator_1 = require("../../auth/decorators/user.decorator");
const audit_write_guard_1 = require("../../auth/guards/audit-write.guard");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const it_staff_guard_1 = require("../../auth/guards/it-staff.guard");
const procurement_admin_guard_1 = require("../../auth/guards/procurement-admin.guard");
const super_admin_guard_1 = require("../../auth/guards/super-admin.guard");
const procurement_dto_1 = require("../../dto/procurement.dto");
const request_validation_pipe_1 = require("../../dto/request-validation.pipe");
const spreadsheet_util_1 = require("../../utils/shared/spreadsheet.util");
const cba_service_1 = require("../../services/compensation/cba.service");
const procurement_service_1 = require("../../services/procurement/procurement.service");
const PROCUREMENT_VIEW_PERMISSIONS = ['view procurement'];
const procurementUploads = (0, multer_1.diskStorage)({
    destination: (req, file, cb) => {
        const dest = path.join(process.cwd(), 'uploads', 'procurement');
        if (!(0, fs_1.existsSync)(dest))
            (0, fs_1.mkdirSync)(dest, { recursive: true });
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const safe = path
            .basename(file.originalname)
            .replace(/[^A-Za-z0-9._-]+/g, '_')
            .slice(-80);
        cb(null, `${Date.now()}_${Math.round(Math.random() * 1e6)}_${safe}`);
    },
});
let ProcurementController = class ProcurementController {
    constructor(procurementService, cbaService) {
        this.procurementService = procurementService;
        this.cbaService = cbaService;
    }
    create(user, body) {
        return this.procurementService.createRequisition(body, user);
    }
    counts(user, entity, mine) {
        return this.procurementService.countRequisitionsByStatus({ entity, mine }, user);
    }
    list(user, entity, status, mine, needsAction, search, page, limit) {
        return this.procurementService.listRequisitions({ entity, status, mine, needsAction, search, page, limit }, user);
    }
    getOne(user, id) {
        return this.procurementService.getRequisition(id, user);
    }
    triage(user, id, body) {
        return this.procurementService.triage(id, body, user);
    }
    approve(user, id, body) {
        return this.procurementService.approve(id, body, user);
    }
    reject(user, id, body) {
        return this.procurementService.reject(id, body, user);
    }
    requestClarification(user, id, body) {
        return this.procurementService.requestClarification(id, body, user);
    }
    postGl(user, id, body) {
        return this.procurementService.postGl(id, body, user);
    }
    disburse(user, id, body) {
        return this.procurementService.disburse(id, body, user);
    }
    financeComment(user, id, body) {
        return this.procurementService.addFinanceComment(id, body, user);
    }
    addAttachments(user, id, files, kind) {
        return this.procurementService.addAttachments(id, kind ?? 'OTHER', files ?? [], user);
    }
    async downloadAttachment(user, id, storedName, res) {
        const attachment = await this.procurementService.resolveAttachment(id, storedName, user);
        const absolute = path.join(process.cwd(), 'uploads', 'procurement', path.basename(attachment.storedName));
        return res.download(absolute, attachment.fileName);
    }
    extendReceipt(user, id, body) {
        return this.procurementService.extendReceiptDue(id, body?.dueAt ?? '', user);
    }
    workflowRole(user, entity) {
        return this.procurementService.resolveWorkflowRole(user, entity);
    }
    getWorkflowConfig(entity) {
        return this.procurementService.getWorkflowConfig(entity);
    }
    approverPool(entity) {
        return this.procurementService.listApproverPool(entity);
    }
    resolvingDepartments(entity) {
        return this.procurementService.listResolvingDepartments(entity);
    }
    saveWorkflowConfig(user, body) {
        const actorId = user?._id ?? user?.id;
        return this.procurementService.saveWorkflowConfig(body, actorId ? String(actorId) : undefined);
    }
    expenseTypes() {
        return this.procurementService.listExpenseTypes();
    }
    expenseAccounts(type) {
        return this.procurementService.listExpenseAccounts(type);
    }
    createExpenseAccount(body) {
        return this.procurementService.createExpenseAccount(body);
    }
    glExport(user, ids, entity, status) {
        return this.procurementService.buildGlExport({ ids, entity, status }, user);
    }
    budgets(entity, year) {
        return this.procurementService.listBudgets(entity, year);
    }
    saveBudget(user, body) {
        const actorId = user?._id ?? user?.id;
        return this.procurementService.saveBudget(body, actorId ? String(actorId) : undefined);
    }
    async parseUpload(file) {
        if (!file?.buffer?.length) {
            throw new common_1.BadRequestException('Upload a valid spreadsheet file.');
        }
        const name = String(file?.originalname ?? '').toLowerCase();
        if (name.endsWith('.xls')) {
            throw new common_1.BadRequestException('Legacy .xls files are not supported. Please save as .xlsx or .csv.');
        }
        if (name.endsWith('.csv')) {
            return (0, spreadsheet_util_1.csvBufferToObjects)(file.buffer, { defval: '', trim: true }).rows;
        }
        try {
            const workbook = await (0, spreadsheet_util_1.loadWorkbook)(file.buffer, file.originalname);
            const sheet = (0, spreadsheet_util_1.getFirstWorksheet)(workbook);
            if (!sheet) {
                throw new common_1.BadRequestException('No worksheet found in uploaded file.');
            }
            return (0, spreadsheet_util_1.worksheetToObjects)(sheet, { defval: '', useText: true }).rows;
        }
        catch (error) {
            const fallback = (0, spreadsheet_util_1.csvBufferToObjects)(file.buffer, {
                defval: '',
                trim: true,
            }).rows;
            if (!fallback.length)
                throw error;
            return fallback;
        }
    }
    async importExpenseAccounts(file) {
        const rows = await this.parseUpload(file);
        return this.procurementService.importExpenseAccounts(rows);
    }
    async importBudgets(user, file, entity) {
        if (!entity) {
            throw new common_1.BadRequestException('Choose the entity these budgets belong to.');
        }
        const rows = await this.parseUpload(file);
        const actorId = user?._id ?? user?.id;
        return this.procurementService.importBudgets(rows, entity, actorId ? String(actorId) : undefined);
    }
    budgetPosition(entity, expenseAccount, year) {
        return this.procurementService.getBudgetPosition(entity, expenseAccount, year ? Number(year) : undefined);
    }
    glExpenditure(account, institution, start, end) {
        return this.cbaService.fetchGlExpenditure({ account, institution, start, end });
    }
    glSearch(name, businessUnit) {
        return this.cbaService.searchGlAccounts({ name, businessUnit });
    }
    glSelect(subLedger, businessUnit) {
        return this.cbaService.selectGlAccounts({ subLedger, businessUnit });
    }
    outstandingReceipts(user, entity) {
        return this.procurementService.listOverdueReceipts(entity, user);
    }
};
exports.ProcurementController = ProcurementController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('requisitions'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, procurement_dto_1.CreateRequisitionDto]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('requisitions/counts'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('entity')),
    __param(2, (0, common_1.Query)('mine')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "counts", null);
__decorate([
    (0, common_1.Get)('requisitions'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('entity')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('mine')),
    __param(4, (0, common_1.Query)('needsAction')),
    __param(5, (0, common_1.Query)('search')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "list", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('requisitions/:id'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "getOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('requisitions/:id/triage'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, procurement_dto_1.TriageRequisitionDto]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "triage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('requisitions/:id/approve'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, procurement_dto_1.ProcurementCommentDto]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "approve", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('requisitions/:id/reject'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, procurement_dto_1.ProcurementRejectDto]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "reject", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('requisitions/:id/request-clarification'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, procurement_dto_1.ProcurementCommentDto]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "requestClarification", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('requisitions/:id/post-gl'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, procurement_dto_1.PostGlDto]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "postGl", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('requisitions/:id/disburse'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, procurement_dto_1.DisburseDto]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "disburse", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('requisitions/:id/finance-comment'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, procurement_dto_1.ProcurementCommentDto]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "financeComment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('requisitions/:id/attachments'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, { storage: procurementUploads })),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, common_1.Body)('kind')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Array, String]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "addAttachments", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('requisitions/:id/attachments/:storedName'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('storedName')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "downloadAttachment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('requisitions/:id/extend-receipt'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "extendReceipt", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('workflow-role'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "workflowRole", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, it_staff_guard_1.ItStaffGuard),
    (0, common_1.Get)('workflow-configs'),
    __param(0, (0, common_1.Query)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "getWorkflowConfig", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('approver-pool'),
    __param(0, (0, common_1.Query)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "approverPool", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('resolving-departments'),
    __param(0, (0, common_1.Query)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "resolvingDepartments", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, super_admin_guard_1.SuperAdminGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('workflow-configs'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, procurement_dto_1.SaveProcurementWorkflowDto]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "saveWorkflowConfig", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('expense-types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "expenseTypes", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('expense-accounts'),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "expenseAccounts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, procurement_admin_guard_1.ProcurementAdminGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('expense-accounts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "createExpenseAccount", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('gl-export'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('ids')),
    __param(2, (0, common_1.Query)('entity')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "glExport", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, procurement_admin_guard_1.ProcurementAdminGuard),
    (0, common_1.Get)('budgets'),
    __param(0, (0, common_1.Query)('entity')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "budgets", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, procurement_admin_guard_1.ProcurementAdminGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('budgets'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "saveBudget", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, procurement_admin_guard_1.ProcurementAdminGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('expense-accounts/bulk'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "importExpenseAccounts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, procurement_admin_guard_1.ProcurementAdminGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('budgets/bulk'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "importBudgets", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('budget-position'),
    __param(0, (0, common_1.Query)('entity')),
    __param(1, (0, common_1.Query)('expenseAccount')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "budgetPosition", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, procurement_admin_guard_1.ProcurementAdminGuard),
    (0, common_1.Get)('gl-expenditure'),
    __param(0, (0, common_1.Query)('account')),
    __param(1, (0, common_1.Query)('institution')),
    __param(2, (0, common_1.Query)('start')),
    __param(3, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "glExpenditure", null);
__decorate([
    (0, authorization_decorator_1.RequirePermissions)(PROCUREMENT_VIEW_PERMISSIONS),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Get)('gl-search'),
    __param(0, (0, common_1.Query)('name')),
    __param(1, (0, common_1.Query)('businessUnit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "glSearch", null);
__decorate([
    (0, authorization_decorator_1.RequirePermissions)(PROCUREMENT_VIEW_PERMISSIONS),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Get)('gl-select'),
    __param(0, (0, common_1.Query)('subLedger')),
    __param(1, (0, common_1.Query)('businessUnit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "glSelect", null);
__decorate([
    (0, authorization_decorator_1.RequirePermissions)(PROCUREMENT_VIEW_PERMISSIONS),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Get)('outstanding-receipts'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProcurementController.prototype, "outstandingReceipts", null);
exports.ProcurementController = ProcurementController = __decorate([
    (0, common_1.Controller)('procurement'),
    (0, common_1.UsePipes)(request_validation_pipe_1.requestValidationPipe),
    __metadata("design:paramtypes", [procurement_service_1.ProcurementService,
        cba_service_1.CbaService])
], ProcurementController);
//# sourceMappingURL=procurement.controller.js.map