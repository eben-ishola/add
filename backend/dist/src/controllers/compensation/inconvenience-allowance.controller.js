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
exports.InconvenienceAllowanceController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const super_admin_guard_1 = require("../../auth/guards/super-admin.guard");
const authorization_decorator_1 = require("../../auth/decorators/authorization.decorator");
const user_decorator_1 = require("../../auth/decorators/user.decorator");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const inconvenience_allowance_approval_dto_1 = require("../../dto/inconvenience-allowance-approval.dto");
const payroll_approval_dto_1 = require("../../dto/payroll-approval.dto");
const request_validation_pipe_1 = require("../../dto/request-validation.pipe");
const inconvenience_allowance_service_1 = require("../../services/compensation/inconvenience-allowance.service");
const spreadsheet_util_1 = require("../../utils/shared/spreadsheet.util");
const access_control_util_1 = require("../../utils/shared/access-control.util");
const INCONVENIENCE_ALLOWANCE_VIEW_PERMISSIONS = [
    'view inconvenience allowance',
    'view payroll',
    'view payroll settings',
];
let InconvenienceAllowanceController = class InconvenienceAllowanceController {
    constructor(inconvenienceAllowanceService) {
        this.inconvenienceAllowanceService = inconvenienceAllowanceService;
    }
    list(user, entity, department, staff, year, month, weekOfMonth) {
        return this.inconvenienceAllowanceService.list({
            entity,
            department,
            staff,
            year,
            month,
            weekOfMonth,
        }, user);
    }
    listSettings(user, entity, inconvenienceLevel, page, limit) {
        return this.inconvenienceAllowanceService.listSettings({
            entity,
            inconvenienceLevel,
            page,
            limit,
        }, user);
    }
    upsertSetting(payload) {
        return this.inconvenienceAllowanceService.upsertSetting(payload);
    }
    async bulkUpsertSettings(file, entity) {
        if (!file?.buffer?.length) {
            throw new common_1.BadRequestException('Upload a valid spreadsheet file.');
        }
        const normalizedName = String(file?.originalname ?? '').toLowerCase();
        if (normalizedName.endsWith('.xls')) {
            throw new common_1.BadRequestException('Legacy .xls files are not supported. Please save as .xlsx or .csv.');
        }
        let parsedRows = [];
        if (normalizedName.endsWith('.csv')) {
            parsedRows = (0, spreadsheet_util_1.csvBufferToObjects)(file.buffer, {
                defval: '',
                trim: true,
            }).rows;
        }
        else {
            try {
                const workbook = await (0, spreadsheet_util_1.loadWorkbook)(file.buffer, file.originalname);
                const sheet = (0, spreadsheet_util_1.getFirstWorksheet)(workbook);
                if (!sheet) {
                    throw new common_1.BadRequestException('No worksheet found in uploaded file.');
                }
                parsedRows = (0, spreadsheet_util_1.worksheetToObjects)(sheet, {
                    defval: '',
                    useText: true,
                }).rows;
            }
            catch (error) {
                const fallback = (0, spreadsheet_util_1.csvBufferToObjects)(file.buffer, {
                    defval: '',
                    trim: true,
                }).rows;
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
                const header = String(key ?? '')
                    .trim()
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '_')
                    .replace(/^_+|_+$/g, '');
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
        return this.inconvenienceAllowanceService.bulkUpsertSettings(rows, { entity });
    }
    deleteSetting(id) {
        return this.inconvenienceAllowanceService.deleteSetting(id);
    }
    getWorkflowConfigs(user, entity) {
        return this.inconvenienceAllowanceService.getWorkflowConfigs(entity, user);
    }
    saveWorkflowConfig(payload) {
        return this.inconvenienceAllowanceService.saveWorkflowConfig(payload);
    }
    upsert(payload, user) {
        return this.inconvenienceAllowanceService.upsert(payload, user);
    }
    preview(payload, user) {
        return this.inconvenienceAllowanceService.preview(payload, user);
    }
    generate(payload, user) {
        return this.inconvenienceAllowanceService.generate(payload, user);
    }
    submit(payload, user) {
        return this.inconvenienceAllowanceService.submitForReview(payload, user);
    }
    approvals(user, status, entity, assignedOnly, userId, assignedId) {
        const assignedOnlyFlag = typeof assignedOnly === 'string' &&
            ['1', 'true', 'yes'].includes(assignedOnly.toLowerCase());
        return this.inconvenienceAllowanceService.getApprovals(user, {
            status,
            entity,
            assignedOnly: assignedOnlyFlag,
            assignedId: userId ?? assignedId,
        });
    }
    getApprovalById(id, user) {
        return this.inconvenienceAllowanceService.getApprovalById(id, user);
    }
    approveApproval(id, body, user) {
        return this.inconvenienceAllowanceService.approveApproval(id, user, body?.comment);
    }
    rejectApproval(id, body, user) {
        return this.inconvenienceAllowanceService.rejectApproval(id, user, body?.reason);
    }
    markPosted(id, user) {
        return this.inconvenienceAllowanceService.markPostingComplete(id, user);
    }
    switchAccount(id, body, user) {
        if (!(0, access_control_util_1.userIsSuperAdmin)(user)) {
            throw new common_1.ForbiddenException('Only a super admin can switch the payout account.');
        }
        const applyToAll = body?.applyToAll === true || String(body?.applyToAll ?? '') === 'true';
        if (applyToAll) {
            return this.inconvenienceAllowanceService.switchApprovalAccountForAll(user, id, body?.accountType ?? '');
        }
        return this.inconvenienceAllowanceService.switchApprovalAccount(user, id, body?.staffId ?? body?.employeeId ?? '', body?.accountType ?? '');
    }
    updateFinanceComment(id, body, user) {
        return this.inconvenienceAllowanceService.updateFinanceComment(id, user, body?.comment);
    }
    getWorkflowRole(user, entity, scanAll) {
        const scanAllFlag = typeof scanAll === 'string' &&
            ['1', 'true', 'yes'].includes(scanAll.toLowerCase());
        return this.inconvenienceAllowanceService.getWorkflowRole(user, {
            entity,
            scanAll: scanAllFlag,
        });
    }
};
exports.InconvenienceAllowanceController = InconvenienceAllowanceController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('entity')),
    __param(2, (0, common_1.Query)('department')),
    __param(3, (0, common_1.Query)('staff')),
    __param(4, (0, common_1.Query)('year')),
    __param(5, (0, common_1.Query)('month')),
    __param(6, (0, common_1.Query)('weekOfMonth')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], InconvenienceAllowanceController.prototype, "list", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('settings'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('entity')),
    __param(2, (0, common_1.Query)('inconvenienceLevel')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], InconvenienceAllowanceController.prototype, "listSettings", null);
__decorate([
    (0, authorization_decorator_1.RequirePermissions)(INCONVENIENCE_ALLOWANCE_VIEW_PERMISSIONS),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Post)('settings'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InconvenienceAllowanceController.prototype, "upsertSetting", null);
__decorate([
    (0, authorization_decorator_1.RequirePermissions)(INCONVENIENCE_ALLOWANCE_VIEW_PERMISSIONS),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Post)('settings/bulk'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InconvenienceAllowanceController.prototype, "bulkUpsertSettings", null);
__decorate([
    (0, authorization_decorator_1.RequirePermissions)(INCONVENIENCE_ALLOWANCE_VIEW_PERMISSIONS),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Delete)('settings/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InconvenienceAllowanceController.prototype, "deleteSetting", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('workflow-configs'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InconvenienceAllowanceController.prototype, "getWorkflowConfigs", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, super_admin_guard_1.SuperAdminGuard),
    (0, common_1.Post)('workflow-configs'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InconvenienceAllowanceController.prototype, "saveWorkflowConfig", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], InconvenienceAllowanceController.prototype, "upsert", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('preview'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], InconvenienceAllowanceController.prototype, "preview", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], InconvenienceAllowanceController.prototype, "generate", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('submit'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], InconvenienceAllowanceController.prototype, "submit", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('approvals'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('entity')),
    __param(3, (0, common_1.Query)('assignedOnly')),
    __param(4, (0, common_1.Query)('userId')),
    __param(5, (0, common_1.Query)('assignedId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], InconvenienceAllowanceController.prototype, "approvals", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('approvals/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InconvenienceAllowanceController.prototype, "getApprovalById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('approvals/:id/approve'),
    (0, common_1.UsePipes)(request_validation_pipe_1.requestValidationPipe),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, inconvenience_allowance_approval_dto_1.InconvenienceApprovalApproveDto, Object]),
    __metadata("design:returntype", void 0)
], InconvenienceAllowanceController.prototype, "approveApproval", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('approvals/:id/reject'),
    (0, common_1.UsePipes)(request_validation_pipe_1.requestValidationPipe),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, inconvenience_allowance_approval_dto_1.InconvenienceApprovalRejectDto, Object]),
    __metadata("design:returntype", void 0)
], InconvenienceAllowanceController.prototype, "rejectApproval", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('approvals/:id/mark-posted'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InconvenienceAllowanceController.prototype, "markPosted", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('approvals/:id/switch-account'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], InconvenienceAllowanceController.prototype, "switchAccount", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('approvals/:id/finance-comment'),
    (0, common_1.UsePipes)(request_validation_pipe_1.requestValidationPipe),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, payroll_approval_dto_1.FinanceCommentDto, Object]),
    __metadata("design:returntype", void 0)
], InconvenienceAllowanceController.prototype, "updateFinanceComment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('workflow-role'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('entity')),
    __param(2, (0, common_1.Query)('scanAll')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], InconvenienceAllowanceController.prototype, "getWorkflowRole", null);
exports.InconvenienceAllowanceController = InconvenienceAllowanceController = __decorate([
    (0, common_1.Controller)('inconvenience-allowance'),
    __metadata("design:paramtypes", [inconvenience_allowance_service_1.InconvenienceAllowanceService])
], InconvenienceAllowanceController);
//# sourceMappingURL=inconvenience-allowance.controller.js.map