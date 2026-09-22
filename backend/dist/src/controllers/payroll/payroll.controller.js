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
exports.PayrollController = void 0;
const common_1 = require("@nestjs/common");
const payroll_service_1 = require("../../services/payroll/payroll.service");
const super_admin_guard_1 = require("../../auth/guards/super-admin.guard");
const payroll_account_switch_service_1 = require("../../services/payroll/payroll-account-switch.service");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const authorization_decorator_1 = require("../../auth/decorators/authorization.decorator");
const user_decorator_1 = require("../../auth/decorators/user.decorator");
const audit_write_guard_1 = require("../../auth/guards/audit-write.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const multer_1 = require("multer");
const path = require("path");
const platform_express_1 = require("@nestjs/platform-express");
const cba_service_1 = require("../../services/compensation/cba.service");
const fs = require("fs");
const leave_allowance_approval_dto_1 = require("../../dto/leave-allowance-approval.dto");
const payroll_approval_dto_1 = require("../../dto/payroll-approval.dto");
const request_validation_pipe_1 = require("../../dto/request-validation.pipe");
const access_control_util_1 = require("../../utils/shared/access-control.util");
const PAYROLL_VIEW_PERMISSIONS = [
    'view payroll',
    'view processed payroll',
    'view payroll settings',
    'process payroll',
    'approve payroll',
];
const PAYROLL_RUN_PERMISSIONS = ['process payroll'];
const PAYROLL_GENERATE_PERMISSIONS = [
    'view generate payroll',
    'process payroll',
];
const PAYROLL_SETTINGS_VIEW_PERMISSIONS = [
    'view payroll settings',
    'manage salary structures',
    'manage pay items',
];
const PAYROLL_SETTINGS_WRITE_PERMISSIONS = [
    'view payroll settings',
    'manage salary structures',
    'manage pay items',
];
let PayrollController = class PayrollController {
    constructor(payrollService, cbaService, payrollAccountSwitchService) {
        this.payrollService = payrollService;
        this.cbaService = cbaService;
        this.payrollAccountSwitchService = payrollAccountSwitchService;
    }
    calculatePayroll(payload) {
        return this.payrollService.calculatePayroll(payload, payload.entity);
    }
    calculateTotal() {
        return this.payrollService.calculateTotal();
    }
    async processPayroll(payload, user) {
        let processed = await this.payrollService.processPayroll(payload, user);
        return processed;
    }
    async previewPayroll(payload, user) {
        return this.payrollService.previewPayroll(payload, user);
    }
    async getAttendanceSummary(payload, user) {
        return this.payrollService.getAttendanceSummary(payload, user);
    }
    createPayroll(payload, user) {
        return this.payrollService.createPayroll(payload, user);
    }
    async getTaxConfigs(entity) {
        return this.payrollService.getTaxConfigs(entity);
    }
    async saveTaxConfig(payload) {
        return this.payrollService.saveTaxConfig(payload);
    }
    mapPayroll(payload) {
        return this.payrollService.mapPayroll(payload);
    }
    async findAll(page, limit, entity, user) {
        await this.payrollService.assertPayrollConfigReadAccess(user, entity);
        return this.payrollService.findAll(entity);
    }
    async findAllMap(page, limit, entity, user) {
        await this.payrollService.assertPayrollConfigReadAccess(user, entity);
        return this.payrollService.findAllMap(page, user, entity, limit);
    }
    async generatePayroll(payload, user) {
        let result = await this.payrollService.generatePayroll(payload, user);
        return result;
    }
    async savePayrollPerformance(payload) {
        return this.payrollService.savePayrollPerformance(payload);
    }
    async getPayrollPerformance(entity, month, staffId) {
        return this.payrollService.getPayrollPerformance(entity, month, staffId);
    }
    async getPayrollApprovals(user, status, entity, userId, assignedId, approverOnly, assignedOnly, workflowType, month, year) {
        const approverOnlyFlag = typeof approverOnly === 'string' &&
            ['1', 'true', 'yes'].includes(approverOnly.toLowerCase());
        const assignedOnlyFlag = typeof assignedOnly === 'string' &&
            ['1', 'true', 'yes'].includes(assignedOnly.toLowerCase());
        return this.payrollService.getPayrollApprovals(user, status, entity, approverOnlyFlag, assignedOnlyFlag, userId ?? assignedId, workflowType, month ? Number(month) : undefined, year ? Number(year) : undefined);
    }
    async getLeaveAllowancePaidUsers(user, entity, year) {
        return this.payrollService.getLeaveAllowancePaidUsers(user, entity, year ? Number(year) : undefined);
    }
    async getApprovalStaff(approvalId, user) {
        return this.payrollService.getApprovalStaff(user, approvalId);
    }
    async getPayrollApprovalById(approvalId, user) {
        return this.payrollService.getPayrollApprovalById(user, approvalId);
    }
    async switchPayrollApprovalAccount(approvalId, body, user) {
        if (!(0, access_control_util_1.userIsSuperAdmin)(user)) {
            throw new common_1.ForbiddenException('Only a super admin can switch the payout account.');
        }
        const applyToAll = body?.applyToAll === true || String(body?.applyToAll ?? '') === 'true';
        if (applyToAll) {
            return this.payrollAccountSwitchService.switchApprovalAccountForAll(user, approvalId, body?.accountType ?? '');
        }
        return this.payrollService.switchApprovalAccount(user, approvalId, body?.staffId ?? body?.employeeId ?? '', body?.accountType ?? '');
    }
    async fetchSalaryCallOver(user, narration, approvalId, batchId, entity, month, type) {
        const isAuditor = (0, access_control_util_1.userDepartmentIncludes)(user, 'audit') ||
            (0, access_control_util_1.userHasRole)(user, ['auditor', 'system-auditor']);
        const isSuperAdmin = (0, access_control_util_1.userIsSuperAdmin)(user);
        if (!isAuditor && !isSuperAdmin) {
            throw new common_1.ForbiddenException('You do not have permission to access callover data.');
        }
        const callover = await this.cbaService.fetchSalaryCallOver(narration ?? '');
        const comparePayload = {
            approvalId,
            batchId,
            entity,
            month,
            type,
        };
        return this.payrollService.compareCalloverWithPayroll(callover?.data ?? [], comparePayload);
    }
    async updatePayrollApprovalComment(approvalId, payload, user) {
        return this.payrollService.updatePayrollApprovalComment(approvalId, user, payload);
    }
    async updatePayrollApprovalFinanceComment(approvalId, payload, user) {
        return this.payrollService.updatePayrollApprovalFinanceComment(approvalId, user, payload?.comment);
    }
    async getMyPayslips(userId, user) {
        return this.payrollService.getPayslipsForUser(userId, user);
    }
    async requestPayslipApproval(payload, user) {
        return this.payrollService.requestPayslipApproval(payload, user);
    }
    async getPayslipApprovals(user, status, entity) {
        return this.payrollService.getPayslipApprovals(user, status, entity);
    }
    async getPayslipApprovalById(approvalId, user) {
        return this.payrollService.getPayslipApprovalById(user, approvalId);
    }
    async approvePayslipApproval(approvalId, user) {
        return this.payrollService.approvePayslipApproval(approvalId, user);
    }
    async rejectPayslipApproval(approvalId, payload, user) {
        return this.payrollService.rejectPayslipApproval(approvalId, user, payload?.reason);
    }
    async approvePayroll(approvalId, payload, user) {
        const comment = payload?.comment ?? payload?.reviewerComment;
        return this.payrollService.approvePayroll(approvalId, user, comment);
    }
    async rejectPayroll(approvalId, payload, user) {
        return this.payrollService.rejectPayroll(approvalId, user, payload?.reason);
    }
    async markPostingComplete(approvalId, user) {
        return this.payrollService.markPostingComplete(approvalId, user);
    }
    async getWorkflowConfigs(user, entity) {
        return this.payrollService.getPayrollWorkflowConfigs(user, entity);
    }
    async getWorkflowRole(user, entity, scanAll) {
        const scanAllFlag = typeof scanAll === 'string' &&
            ['1', 'true', 'yes'].includes(scanAll.toLowerCase());
        return await this.payrollService.getPayrollWorkflowRole(user, entity, scanAllFlag);
    }
    async getLeaveWorkflowRole(user, entity, scanAll) {
        const scanAllFlag = typeof scanAll === 'string' &&
            ['1', 'true', 'yes'].includes(scanAll.toLowerCase());
        return await this.payrollService.getLeaveAllowanceWorkflowRole(user, entity, scanAllFlag);
    }
    async saveWorkflowConfig(user, payload) {
        return this.payrollService.savePayrollWorkflowConfig(user, payload);
    }
    async getLeaveWorkflowConfigs(user, entity) {
        return this.payrollService.getLeaveAllowanceWorkflowConfigs(user, entity);
    }
    async saveLeaveWorkflowConfig(user, payload) {
        return this.payrollService.saveLeaveAllowanceWorkflowConfig(user, payload);
    }
    async getLeaveApprovals(user, status, entity, userId, assignedId, assignedOnly) {
        const assignedOnlyFlag = typeof assignedOnly === 'string' &&
            ['1', 'true', 'yes'].includes(assignedOnly.toLowerCase());
        return this.payrollService.getLeaveAllowanceApprovals(user, status, entity, assignedOnlyFlag, userId ?? assignedId);
    }
    async getLeaveApprovalById(id, user) {
        return this.payrollService.getLeaveAllowanceApprovalById(user, id);
    }
    async approveLeaveApproval(id, user, body) {
        return this.payrollService.approveLeaveAllowanceApproval(user, id, body?.comment);
    }
    async rejectLeaveApproval(id, user, body) {
        return this.payrollService.rejectLeaveAllowanceApproval(user, id, body?.reason ?? body?.comment);
    }
    async markLeaveApprovalPosted(id, user) {
        return this.payrollService.markLeaveAllowancePostingComplete(user, id);
    }
    async updateLeaveApprovalFinanceComment(id, body, user) {
        return this.payrollService.updateLeaveAllowanceFinanceComment(user, id, body?.comment);
    }
    async switchLeaveApprovalAccount(id, body, user) {
        if (!(0, access_control_util_1.userIsSuperAdmin)(user)) {
            throw new common_1.ForbiddenException('Only a super admin can switch the payout account.');
        }
        const applyToAll = body?.applyToAll === true || String(body?.applyToAll ?? '') === 'true';
        if (applyToAll) {
            return this.payrollService.switchLeaveApprovalAccountForAll(user, id, body?.accountType ?? '');
        }
        return this.payrollService.switchLeaveApprovalAccount(user, id, body?.staffId ?? body?.employeeId ?? '', body?.accountType ?? '');
    }
    async findByLevel(gradeLevel, entity) {
        return this.payrollService.findByLevel(gradeLevel, entity);
    }
    async fetchProcessedPayrollByStaffId(staffId, user) {
        return this.payrollService.getProcessedPayrollByStaffId(staffId, user);
    }
    async fetchProcessedPayroll(entity, month, type) {
        return this.payrollService.getProcessedPayroll(entity, month, type);
    }
    async fetchProcessedPayrollById(id, user) {
        return this.payrollService.getProcessedPayrollById(user, id);
    }
    async uploadXlsx(file) {
        if (!file?.buffer) {
            throw new common_1.BadRequestException('Upload a valid spreadsheet file.');
        }
        return await this.payrollService.uploadXlsx(file.buffer, file.originalname);
    }
    uploadCSV(file) {
        if (!file) {
            throw new common_1.BadRequestException('Upload a valid CSV file.');
        }
        console.log('File uploaded:', file);
        const filePath = path.join(process.cwd(), 'uploads', file.filename);
        const fileName = file.originalname;
        return {
            message: 'File uploaded successfully!',
            file: file.filename,
            fileName,
            filePath,
            fileUrl: `uploads/${file.filename}`,
        };
    }
    async findById(id) {
        return this.payrollService.findById(id);
    }
};
exports.PayrollController = PayrollController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate payroll' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payroll calculated successfully.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "calculatePayroll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('total'),
    (0, swagger_1.ApiOperation)({ summary: 'Total payroll' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fetch successfully.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "calculateTotal", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('process'),
    (0, swagger_1.ApiOperation)({ summary: 'Process payroll' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payroll processed successfully.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "processPayroll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('process/preview'),
    (0, swagger_1.ApiOperation)({ summary: 'Preview payroll before submission' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payroll preview generated successfully.',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "previewPayroll", null);
__decorate([
    (0, authorization_decorator_1.RequirePermissions)(PAYROLL_RUN_PERMISSIONS),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Post)('attendance-summary'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getAttendanceSummary", null);
__decorate([
    (0, authorization_decorator_1.RequirePermissions)(PAYROLL_SETTINGS_WRITE_PERMISSIONS),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('config'),
    (0, swagger_1.ApiOperation)({ summary: 'Edit payroll config' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Edit record created successfully.',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "createPayroll", null);
__decorate([
    (0, authorization_decorator_1.RequirePermissions)(PAYROLL_SETTINGS_VIEW_PERMISSIONS),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Get)('tax-configs'),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch tax configurations' }),
    __param(0, (0, common_1.Query)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getTaxConfigs", null);
__decorate([
    (0, authorization_decorator_1.RequirePermissions)(PAYROLL_SETTINGS_WRITE_PERMISSIONS),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('tax-configs'),
    (0, swagger_1.ApiOperation)({ summary: 'Create or update a tax configuration' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "saveTaxConfig", null);
__decorate([
    (0, authorization_decorator_1.RequirePermissions)(PAYROLL_SETTINGS_WRITE_PERMISSIONS),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('allMap'),
    (0, swagger_1.ApiOperation)({ summary: 'Map a new payroll record' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Map Payroll record created successfully.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "mapPayroll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('config'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all payroll config' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List Config' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('entity')),
    __param(3, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('allMap'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all payroll records' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of payroll records.' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('entity')),
    __param(3, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "findAllMap", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate payroll' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payroll generated successfully.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "generatePayroll", null);
__decorate([
    (0, authorization_decorator_1.RequirePermissions)(PAYROLL_RUN_PERMISSIONS),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Post)('performance'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "savePayrollPerformance", null);
__decorate([
    (0, authorization_decorator_1.RequirePermissions)(PAYROLL_VIEW_PERMISSIONS),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Get)('performance'),
    __param(0, (0, common_1.Query)('entity')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('staffId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayrollPerformance", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('approvals'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('entity')),
    __param(3, (0, common_1.Query)('userId')),
    __param(4, (0, common_1.Query)('assignedId')),
    __param(5, (0, common_1.Query)('approverOnly')),
    __param(6, (0, common_1.Query)('assignedOnly')),
    __param(7, (0, common_1.Query)('workflowType')),
    __param(8, (0, common_1.Query)('month')),
    __param(9, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayrollApprovals", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('approvals/leave-paid-users'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('entity')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getLeaveAllowancePaidUsers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('approvals/:id/staff'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getApprovalStaff", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('approvals/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayrollApprovalById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('approvals/:id/switch-account'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "switchPayrollApprovalAccount", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('salary-callover'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('narration')),
    __param(2, (0, common_1.Query)('approvalId')),
    __param(3, (0, common_1.Query)('batchId')),
    __param(4, (0, common_1.Query)('entity')),
    __param(5, (0, common_1.Query)('month')),
    __param(6, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "fetchSalaryCallOver", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('approvals/:id/comment'),
    (0, common_1.UsePipes)(request_validation_pipe_1.requestValidationPipe),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, payroll_approval_dto_1.PayrollApprovalCommentDto, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "updatePayrollApprovalComment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('approvals/:id/finance-comment'),
    (0, common_1.UsePipes)(request_validation_pipe_1.requestValidationPipe),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, payroll_approval_dto_1.FinanceCommentDto, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "updatePayrollApprovalFinanceComment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('payslips/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getMyPayslips", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('payslip-approvals/request'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "requestPayslipApproval", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('payslip-approvals'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayslipApprovals", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('payslip-approvals/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayslipApprovalById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('payslip-approvals/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "approvePayslipApproval", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('payslip-approvals/:id/reject'),
    (0, common_1.UsePipes)(request_validation_pipe_1.requestValidationPipe),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, payroll_approval_dto_1.PayrollApprovalRejectDto, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "rejectPayslipApproval", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('approvals/:id/approve'),
    (0, common_1.UsePipes)(request_validation_pipe_1.requestValidationPipe),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, payroll_approval_dto_1.PayrollApprovalApproveDto, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "approvePayroll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('approvals/:id/reject'),
    (0, common_1.UsePipes)(request_validation_pipe_1.requestValidationPipe),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, payroll_approval_dto_1.PayrollApprovalRejectDto, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "rejectPayroll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('approvals/:id/mark-posted'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "markPostingComplete", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('workflow-configs'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getWorkflowConfigs", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('workflow-role'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('entity')),
    __param(2, (0, common_1.Query)('scanAll')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getWorkflowRole", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('leave-workflow-role'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('entity')),
    __param(2, (0, common_1.Query)('scanAll')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getLeaveWorkflowRole", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, super_admin_guard_1.SuperAdminGuard),
    (0, common_1.Post)('workflow-configs'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "saveWorkflowConfig", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('leave-workflow-configs'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getLeaveWorkflowConfigs", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, super_admin_guard_1.SuperAdminGuard),
    (0, common_1.Post)('leave-workflow-configs'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "saveLeaveWorkflowConfig", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('leave-approvals'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('entity')),
    __param(3, (0, common_1.Query)('userId')),
    __param(4, (0, common_1.Query)('assignedId')),
    __param(5, (0, common_1.Query)('assignedOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getLeaveApprovals", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('leave-approvals/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getLeaveApprovalById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('leave-approvals/:id/approve'),
    (0, common_1.UsePipes)(request_validation_pipe_1.requestValidationPipe),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, leave_allowance_approval_dto_1.LeaveAllowanceApprovalApproveDto]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "approveLeaveApproval", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('leave-approvals/:id/reject'),
    (0, common_1.UsePipes)(request_validation_pipe_1.requestValidationPipe),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, leave_allowance_approval_dto_1.LeaveAllowanceApprovalRejectDto]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "rejectLeaveApproval", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('leave-approvals/:id/mark-posted'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "markLeaveApprovalPosted", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('leave-approvals/:id/finance-comment'),
    (0, common_1.UsePipes)(request_validation_pipe_1.requestValidationPipe),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, payroll_approval_dto_1.FinanceCommentDto, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "updateLeaveApprovalFinanceComment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('leave-approvals/:id/switch-account'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "switchLeaveApprovalAccount", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('level/:gradeLevel'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payroll by grade level' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payroll found by grade level.' }),
    __param(0, (0, common_1.Param)('gradeLevel')),
    __param(1, (0, common_1.Query)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "findByLevel", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('processed/staff/:staffId'),
    __param(0, (0, common_1.Param)('staffId')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "fetchProcessedPayrollByStaffId", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('processed/:entity/:month/:type'),
    __param(0, (0, common_1.Param)('entity')),
    __param(1, (0, common_1.Param)('month')),
    __param(2, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "fetchProcessedPayroll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('processed/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "fetchProcessedPayrollById", null);
__decorate([
    (0, authorization_decorator_1.RequirePermissions)(PAYROLL_SETTINGS_WRITE_PERMISSIONS),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('upload-xlsx'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "uploadXlsx", null);
__decorate([
    (0, authorization_decorator_1.RequirePermissions)(PAYROLL_SETTINGS_WRITE_PERMISSIONS),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('uploadCsv'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const uploadDir = path.join(process.cwd(), 'uploads');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                cb(null, uploadDir);
            },
            filename: (req, file, callback) => {
                const fileName = `${Date.now()}_${file.originalname}`;
                callback(null, fileName);
            },
        }),
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "uploadCSV", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payroll by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payroll found.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Payroll not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "findById", null);
exports.PayrollController = PayrollController = __decorate([
    (0, swagger_1.ApiTags)('payroll'),
    (0, common_1.Controller)('payroll'),
    __metadata("design:paramtypes", [payroll_service_1.PayrollService,
        cba_service_1.CbaService,
        payroll_account_switch_service_1.PayrollAccountSwitchService])
], PayrollController);
//# sourceMappingURL=payroll.controller.js.map