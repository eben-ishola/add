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
exports.PayrollRunService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const uuid_1 = require("uuid");
const leave_allowance_approval_schema_1 = require("../../schemas/leave-allowance-approval.schema");
const payrollApproval_schema_1 = require("../../schemas/payrollApproval.schema");
const user_service_1 = require("../user/user.service");
const subsidiary_service_1 = require("../org/subsidiary.service");
const workflow_notifier_service_1 = require("../comms/workflow-notifier.service");
const exit_service_1 = require("../employee-lifecycle/exit.service");
const PAYROLL_APPROVAL_STATUS = {
    PENDING_REVIEW: 'PENDING_REVIEW',
};
let PayrollRunService = class PayrollRunService {
    constructor(staffService, entityService, payrollApprovalModel, leaveAllowanceApprovalModel, workflowNotifier, exitService) {
        this.staffService = staffService;
        this.entityService = entityService;
        this.payrollApprovalModel = payrollApprovalModel;
        this.leaveAllowanceApprovalModel = leaveAllowanceApprovalModel;
        this.workflowNotifier = workflowNotifier;
        this.exitService = exitService;
    }
    async generatePayroll(payload, initiatorOrHandlers, maybeHandlers) {
        const handlers = maybeHandlers ?? initiatorOrHandlers;
        const initiator = maybeHandlers ? initiatorOrHandlers : null;
        const entityId = await handlers.normalizeEntityIdStrict(payload?.entity);
        if (initiator) {
            await handlers.validateWorkflowInitiation(entityId, initiator, 'payroll');
        }
        const periodInput = payload?.month ?? payload?.period ?? payload?.periodKey ?? new Date();
        const response = await this.staffService.getStaffList(entityId, {
            includeExitedInMonth: periodInput,
        });
        const result = await handlers.getTemplates(response, payload.type, entityId, periodInput);
        return { status: 200, data: result };
    }
    async processPayroll(payload, initiator, handlers) {
        try {
            const entityId = await handlers.normalizeEntityIdStrict(payload?.entity);
            const payrollRows = Array.isArray(payload?.data) ? payload.data : [];
            const workflowType = handlers.resolveWorkflowType(payload?.workflowType);
            if (!payrollRows.length) {
                throw new common_1.BadRequestException('No payroll data provided');
            }
            handlers.assertPayrollRowsHaveAccountAndLevel(payrollRows);
            const { reviewerIds, approverIds, auditViewerIds, postingIds, initiatorId, entityId: normalizedEntityId, } = await handlers.validateWorkflowInitiation(entityId, initiator, workflowType);
            const { workingDays: defaultWorkingDays, performanceBrackets } = await handlers.loadEntityPayrollSettings(normalizedEntityId);
            handlers.assertPayrollRowsRespectWorkingDays(payrollRows, defaultWorkingDays);
            const periodDate = handlers.resolvePayrollPeriodDate(payload?.periodDate ?? payload?.month ?? payload?.period ?? payload?.periodKey);
            const adjustedData = await this.prepareAdjustedRows(payload, initiator, payrollRows, normalizedEntityId, defaultWorkingDays, performanceBrackets, periodDate, handlers);
            let proratedData = handlers.applyProrationForDisplay(adjustedData, defaultWorkingDays, performanceBrackets, periodDate).map((row) => ({ ...row, prorationApplied: true }));
            proratedData = await this.applyGrossAdjustments(proratedData, normalizedEntityId, periodDate, handlers);
            const hydrated = await handlers.hydratePayrollRowIdentifiers(proratedData, normalizedEntityId);
            if (hydrated.changed) {
                proratedData = hydrated.rows;
            }
            if (workflowType === 'payroll' && this.exitService) {
                proratedData = await this.exitService.applyExitPayouts(proratedData, {
                    entity: normalizedEntityId,
                    runDate: new Date(),
                });
            }
            const types = [...new Set(proratedData.map((item) => item.type))];
            const batchId = (0, uuid_1.v4)();
            const entityDetails = await this.entityService
                .findSubsidiaryById(normalizedEntityId)
                .catch(() => null);
            const initiatorComment = typeof payload?.initiatorComment === 'string'
                ? payload.initiatorComment.trim()
                : typeof payload?.comment === 'string'
                    ? payload.comment.trim()
                    : typeof payload?.notes === 'string'
                        ? payload.notes.trim()
                        : '';
            const approval = await this.payrollApprovalModel.create({
                batchId,
                entity: entityId,
                workflowType,
                status: PAYROLL_APPROVAL_STATUS.PENDING_REVIEW,
                currentStage: 'REVIEWER',
                data: proratedData,
                types,
                requestedBy: initiatorId ?? undefined,
                requestedByName: handlers.composeUserName(initiator),
                initiatorId: initiatorId ?? undefined,
                initiatorName: handlers.composeUserName(initiator),
                initiatorComment: initiatorComment || undefined,
                reviewerIds,
                auditViewerIds,
                approverIds,
                postingIds,
            });
            if (workflowType === 'leave-allowance') {
                await handlers.syncLeaveAllowanceApprovalRecord(approval, { forceCreate: true });
            }
            const entityName = await handlers.resolveEntityName(entityDetails?.data ?? entityDetails ?? normalizedEntityId);
            const monthLabel = handlers.resolveApprovalMonthLabel(approval);
            const approvalId = approval._id.toString();
            if (workflowType === 'leave-allowance') {
                const leaveApproval = await this.leaveAllowanceApprovalModel
                    .findOne({ payrollApprovalId: approvalId })
                    .exec();
                if (leaveApproval) {
                    await this.workflowNotifier?.dispatch({
                        module: 'leave_allowance',
                        event: 'submitted',
                        doc: leaveApproval,
                    });
                }
            }
            else {
                await handlers.notifyStageAssignees(reviewerIds, approvalId, entityName, monthLabel, 'REVIEWER');
                await handlers.notifyAuditViewers(auditViewerIds, approvalId, entityName, monthLabel);
                await this.workflowNotifier?.dispatch({
                    module: 'payroll',
                    event: 'submitted',
                    doc: approval,
                    skipStageRecipients: true,
                });
            }
            return {
                status: 200,
                message: workflowType === 'leave-allowance'
                    ? 'Leave allowance submitted for reviewer approval.'
                    : 'Payroll submitted for reviewer approval.',
                batchId,
                approvalId: approval._id,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException(error?.message || 'Failed to submit payroll for approval');
        }
    }
    async previewPayroll(payload, initiator, handlers) {
        const entityId = await handlers.normalizeEntityIdStrict(payload?.entity);
        const payrollRows = Array.isArray(payload?.data) ? payload.data : [];
        const workflowType = handlers.resolveWorkflowType(payload?.workflowType);
        if (!payrollRows.length) {
            throw new common_1.BadRequestException('No payroll data provided');
        }
        const { entityId: normalizedEntityId } = await handlers.validateWorkflowInitiation(entityId, initiator, workflowType);
        const { workingDays: defaultWorkingDays, performanceBrackets } = await handlers.loadEntityPayrollSettings(normalizedEntityId);
        handlers.assertPayrollRowsRespectWorkingDays(payrollRows, defaultWorkingDays);
        const periodDate = handlers.resolvePayrollPeriodDate(payload?.periodDate ?? payload?.month ?? payload?.period ?? payload?.periodKey);
        const adjustedData = await this.prepareAdjustedRows(payload, initiator, payrollRows, normalizedEntityId, defaultWorkingDays, performanceBrackets, periodDate, handlers);
        const proratedData = await this.applyGrossAdjustments(handlers.applyProrationForDisplay(adjustedData, defaultWorkingDays, performanceBrackets, periodDate), normalizedEntityId, periodDate, handlers);
        const expanded = this.expandPreviewRows(proratedData, defaultWorkingDays, performanceBrackets, handlers);
        const totals = handlers.computeSectionTotals(expanded);
        const types = [...new Set(expanded.map((item) => item.type).filter(Boolean))];
        return {
            status: 200,
            message: workflowType === 'leave-allowance'
                ? 'Leave allowance preview generated.'
                : 'Payroll preview generated.',
            data: expanded,
            totals,
            types,
        };
    }
    async applyGrossAdjustments(rows, entityId, periodDate, handlers) {
        if (!handlers.applyGrossAdjustments) {
            return rows;
        }
        return handlers.applyGrossAdjustments(rows, entityId, periodDate);
    }
    async prepareAdjustedRows(payload, initiator, payrollRows, normalizedEntityId, defaultWorkingDays, performanceBrackets, periodDate, handlers) {
        const attendanceOverride = handlers.resolveAttendanceOverride(payload, initiator);
        const attendanceHandledOnClient = handlers.resolveAttendanceHandledOnClient(payload);
        const normalizedData = handlers.normalizePayrollData(payrollRows, {
            workingDays: defaultWorkingDays,
            performanceBrackets,
        });
        const baseData = attendanceHandledOnClient
            ? normalizedData.map((row) => ({ ...row, prorationHandledOnClient: true }))
            : normalizedData;
        let adjustedData = baseData;
        if (!attendanceOverride && !attendanceHandledOnClient) {
            const salaryRows = normalizedData.filter((row) => (row?.type ?? handlers.detectRowType(row)) === 'salary');
            const attendanceRows = normalizedData.filter((row) => ['salary', 'variable', 'reimbursable'].includes(row?.type ?? handlers.detectRowType(row)));
            const attendanceIdentifierAliases = attendanceRows.length
                ? await handlers.resolveAttendanceIdentifierAliases(attendanceRows, normalizedEntityId)
                : new Map();
            const lateDeductionIds = salaryRows.length
                ? await handlers.resolveLateDeductionEmployees(salaryRows, periodDate, attendanceIdentifierAliases)
                : new Set();
            adjustedData = handlers.applyLateAttendanceDeduction(normalizedData, lateDeductionIds, defaultWorkingDays);
            const attendanceSummary = attendanceRows.length
                ? await handlers.resolveAttendanceSummaryByEmployee(attendanceRows, periodDate, attendanceIdentifierAliases)
                : new Map();
            adjustedData = handlers.applyAbsenceDeduction(adjustedData, attendanceSummary, defaultWorkingDays, periodDate);
        }
        return adjustedData;
    }
    expandPreviewRows(proratedData, defaultWorkingDays, performanceBrackets, handlers) {
        const expanded = [];
        proratedData.forEach((row) => {
            if (!row || typeof row !== 'object')
                return;
            if (row.type !== 'variable') {
                expanded.push(row);
                return;
            }
            const workedDays = handlers.toSafeNumber(row?.prorateValues, defaultWorkingDays);
            const baseDays = handlers.toSafeNumber(row?.prorateBase ?? row?.totalDays ?? row?.workingDays ?? defaultWorkingDays, defaultWorkingDays);
            const variableBase = handlers.toSafeNumber(row.variable, 0);
            const performancePercent = handlers.normalizePercent(row.proratePercent ??
                row.performancePercent ??
                handlers.resolvePerformancePercent(row.performanceScore, performanceBrackets) ??
                100, 100);
            const bankAmount = handlers.round(variableBase / 2, 2);
            const netAdjustment = handlers.round(handlers.toSafeNumber(row?.netAdjustment, 0), 2);
            const individualAmount = handlers.round(handlers.round((variableBase - bankAmount) * (performancePercent / 100), 2) +
                netAdjustment, 2);
            expanded.push({
                ...row,
                type: 'bank',
                variable: variableBase,
                amount: bankAmount,
                bankAmount,
                baseVariable: handlers.toSafeNumber(row.variable, 0),
                prorateValues: workedDays,
                prorateBase: baseDays,
                proratePercent: undefined,
                performancePercent: undefined,
                netAdjustment: undefined,
            });
            expanded.push({
                ...row,
                type: 'individual',
                ...(netAdjustment ? { netAdjustment, netAdjustmentApplied: true } : {}),
                variable: variableBase,
                amount: individualAmount,
                bankAmount,
                individualAmount,
                baseVariable: handlers.toSafeNumber(row.variable, 0),
                prorateValues: workedDays,
                prorateBase: baseDays,
                proratePercent: performancePercent,
                performancePercent,
            });
        });
        return expanded;
    }
};
exports.PayrollRunService = PayrollRunService;
exports.PayrollRunService = PayrollRunService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, mongoose_1.InjectModel)(payrollApproval_schema_1.PayrollApproval.name)),
    __param(3, (0, mongoose_1.InjectModel)(leave_allowance_approval_schema_1.LeaveAllowanceApproval.name)),
    __param(4, (0, common_1.Optional)()),
    __param(5, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [user_service_1.StaffService,
        subsidiary_service_1.SubsidiaryService,
        mongoose_2.Model,
        mongoose_2.Model,
        workflow_notifier_service_1.WorkflowNotifier,
        exit_service_1.ExitService])
], PayrollRunService);
//# sourceMappingURL=payroll-run.service.js.map