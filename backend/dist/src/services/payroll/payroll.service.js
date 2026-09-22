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
var PayrollService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollService = void 0;
const common_1 = require("@nestjs/common");
const access_control_util_1 = require("../../utils/shared/access-control.util");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const subsidiary_service_1 = require("../org/subsidiary.service");
const spreadsheet_util_1 = require("../../utils/shared/spreadsheet.util");
const payrollApproval_schema_1 = require("../../schemas/payrollApproval.schema");
const notice_service_1 = require("../comms/notice.service");
const access_control_util_2 = require("../../utils/shared/access-control.util");
const leave_allowance_approval_schema_1 = require("../../schemas/leave-allowance-approval.schema");
const user_service_1 = require("../user/user.service");
const workflow_notifier_service_1 = require("../comms/workflow-notifier.service");
const payroll_tax_service_1 = require("./payroll-tax.service");
const payroll_notification_service_1 = require("./payroll-notification.service");
const payroll_mapping_service_1 = require("./payroll-mapping.service");
const payroll_performance_service_1 = require("./payroll-performance.service");
const payroll_export_service_1 = require("./payroll-export.service");
const payroll_payslip_approval_service_1 = require("./payroll-payslip-approval.service");
const payroll_approval_enrichment_service_1 = require("./payroll-approval-enrichment.service");
const payroll_workflow_config_service_1 = require("./payroll-workflow-config.service");
const payroll_approval_transition_service_1 = require("./payroll-approval-transition.service");
const payroll_processed_persistence_service_1 = require("./payroll-processed-persistence.service");
const payroll_run_service_1 = require("./payroll-run.service");
const payroll_attendance_service_1 = require("./payroll-attendance.service");
const payroll_row_display_service_1 = require("./payroll-row-display.service");
const payroll_gross_adjustment_service_1 = require("./payroll-gross-adjustment.service");
const payroll_identifier_hydration_service_1 = require("./payroll-identifier-hydration.service");
const payroll_approval_read_service_1 = require("./payroll-approval-read.service");
const payroll_callover_util_1 = require("../../utils/payroll/payroll-callover.util");
const payroll_calculation_util_1 = require("../../utils/payroll/payroll-calculation.util");
const payroll_period_util_1 = require("../../utils/payroll/payroll-period.util");
const payroll_identity_util_1 = require("../../utils/payroll/payroll-identity.util");
const payroll_access_util_1 = require("../../utils/payroll/payroll-access.util");
const payroll_approval_visibility_util_1 = require("../../utils/payroll/payroll-approval-visibility.util");
const payroll_display_util_1 = require("../../utils/payroll/payroll-display.util");
const payroll_approval_data_util_1 = require("../../utils/payroll/payroll-approval-data.util");
const payroll_row_util_1 = require("../../utils/payroll/payroll-row.util");
const payroll_proration_util_1 = require("../../utils/payroll/payroll-proration.util");
const user_name_util_1 = require("../../utils/user/user-name.util");
const PAYROLL_APPROVAL_STATUS = {
    PENDING_REVIEW: 'PENDING_REVIEW',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    PENDING_POSTING: 'PENDING_POSTING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
};
let PayrollService = PayrollService_1 = class PayrollService {
    constructor(payrollModel, processedPayrollModel, payrollApprovalModel, leaveAllowanceApprovalModel, entityService, staffService, noticeService, workflowNotifier, payrollTaxService, payrollNotificationService, payrollMappingService, payrollPerformanceService, payrollExportService, payrollPayslipApprovalService, payrollApprovalEnrichmentService, payrollWorkflowConfigService, payrollApprovalTransitionService, payrollProcessedPersistenceService, payrollRunService, payrollAttendanceService, payrollRowDisplayService, payrollIdentifierHydrationService, payrollApprovalReadService, payrollGrossAdjustmentService) {
        this.payrollModel = payrollModel;
        this.processedPayrollModel = processedPayrollModel;
        this.payrollApprovalModel = payrollApprovalModel;
        this.leaveAllowanceApprovalModel = leaveAllowanceApprovalModel;
        this.entityService = entityService;
        this.staffService = staffService;
        this.noticeService = noticeService;
        this.workflowNotifier = workflowNotifier;
        this.payrollTaxService = payrollTaxService;
        this.payrollNotificationService = payrollNotificationService;
        this.payrollMappingService = payrollMappingService;
        this.payrollPerformanceService = payrollPerformanceService;
        this.payrollExportService = payrollExportService;
        this.payrollPayslipApprovalService = payrollPayslipApprovalService;
        this.payrollApprovalEnrichmentService = payrollApprovalEnrichmentService;
        this.payrollWorkflowConfigService = payrollWorkflowConfigService;
        this.payrollApprovalTransitionService = payrollApprovalTransitionService;
        this.payrollProcessedPersistenceService = payrollProcessedPersistenceService;
        this.payrollRunService = payrollRunService;
        this.payrollAttendanceService = payrollAttendanceService;
        this.payrollRowDisplayService = payrollRowDisplayService;
        this.payrollIdentifierHydrationService = payrollIdentifierHydrationService;
        this.payrollApprovalReadService = payrollApprovalReadService;
        this.payrollGrossAdjustmentService = payrollGrossAdjustmentService;
    }
    async resolveCalloverPayrollRows(payload) {
        const approvalId = String(payload?.approvalId ?? '').trim();
        const batchId = String(payload?.batchId ?? '').trim();
        const entity = String(payload?.entity ?? '').trim();
        const month = String(payload?.month ?? '').trim();
        const type = String(payload?.type ?? '').trim();
        if (approvalId) {
            const approval = await this.payrollApprovalModel.findById(approvalId).lean();
            if (!approval) {
                throw new common_1.NotFoundException('Payroll approval request not found.');
            }
            const rows = this.resolvePayrollApprovalRows(approval?.data);
            if (!rows.length) {
                return [];
            }
            if (type) {
                return rows.filter((row) => String(row?.type ?? '').toLowerCase() === type.toLowerCase());
            }
            return rows;
        }
        if (batchId) {
            const query = { batchId };
            if (type) {
                query.type = type;
            }
            return this.processedPayrollModel.find(query).lean().exec();
        }
        if (entity && month) {
            const entityId = await this.normalizeEntityIdStrict(entity);
            const [year, mon] = month.split('-').map(Number);
            if (!year || !mon) {
                throw new common_1.BadRequestException('Month must be in YYYY-MM format.');
            }
            const query = {
                entity: entityId,
                createdAt: {
                    $gte: new Date(year, mon - 1, 1),
                    $lt: new Date(year, mon, 1),
                },
            };
            if (type) {
                query.type = type;
            }
            return this.processedPayrollModel.find(query).lean().exec();
        }
        return [];
    }
    async compareCalloverWithPayroll(calloverRows, payload) {
        const hasContext = Boolean(payload?.approvalId) ||
            Boolean(payload?.batchId) ||
            (Boolean(payload?.entity) && Boolean(payload?.month));
        if (!hasContext) {
            return {
                status: 200,
                data: calloverRows,
                comparison: [],
                summary: {
                    calloverCount: calloverRows.length,
                    payrollCount: 0,
                    matched: 0,
                    mismatched: 0,
                    missing: 0,
                    unexpected: 0,
                    hasIssues: false,
                    comparisonSkipped: true,
                },
            };
        }
        const payrollRows = await this.resolveCalloverPayrollRows(payload);
        if (!payrollRows.length) {
            return {
                status: 200,
                data: calloverRows,
                comparison: [],
                summary: {
                    calloverCount: calloverRows.length,
                    payrollCount: 0,
                    matched: 0,
                    mismatched: 0,
                    missing: 0,
                    unexpected: 0,
                    hasIssues: calloverRows.length > 0,
                    comparisonSkipped: false,
                },
            };
        }
        const { comparison, summary } = (0, payroll_callover_util_1.buildPayrollCalloverComparison)(calloverRows, payrollRows, payload?.type);
        return {
            status: 200,
            data: calloverRows,
            payrollCount: payrollRows.length,
            comparison,
            summary,
        };
    }
    ensureNumber(value, fallback = 0) {
        return (0, payroll_calculation_util_1.ensurePayrollNumber)(value, fallback);
    }
    resolveEffectiveRentValue(user, asOf) {
        return (0, payroll_calculation_util_1.resolveEffectiveRentValue)(user, asOf);
    }
    resolveAddToGross(user) {
        const value = this.ensureNumber(user?.addToGross, 0);
        return value > 0 ? value : 0;
    }
    round(value, precision = 2) {
        return (0, payroll_calculation_util_1.roundPayrollAmount)(value, precision);
    }
    percentOf(amount, percent) {
        return (0, payroll_calculation_util_1.payrollPercentOf)(amount, percent);
    }
    reconcileSalaryComponents(components) {
        return (0, payroll_calculation_util_1.reconcileSalaryComponents)(components);
    }
    normalizeEntityKey(value) {
        return (0, payroll_identity_util_1.normalizePayrollEntityKey)(value);
    }
    getTaxService() {
        return this.payrollTaxService;
    }
    getNotificationService() {
        return this.payrollNotificationService;
    }
    getMappingService() {
        return this.payrollMappingService;
    }
    getPerformanceService() {
        return this.payrollPerformanceService;
    }
    getExportService() {
        return this.payrollExportService;
    }
    getPayslipApprovalService() {
        return this.payrollPayslipApprovalService;
    }
    getApprovalEnrichmentService() {
        return this.payrollApprovalEnrichmentService;
    }
    getWorkflowConfigService() {
        return this.payrollWorkflowConfigService;
    }
    getApprovalTransitionService() {
        return this.payrollApprovalTransitionService;
    }
    getProcessedPersistenceService() {
        return this.payrollProcessedPersistenceService;
    }
    getRunService() {
        return this.payrollRunService;
    }
    getAttendanceService() {
        return this.payrollAttendanceService;
    }
    getRowDisplayService() {
        return this.payrollRowDisplayService;
    }
    getGrossAdjustmentService() {
        if (this.payrollGrossAdjustmentService) {
            return this.payrollGrossAdjustmentService;
        }
        this.lazyGrossAdjustmentService ??= new payroll_gross_adjustment_service_1.PayrollGrossAdjustmentService();
        return this.lazyGrossAdjustmentService;
    }
    getIdentifierHydrationService() {
        return this.payrollIdentifierHydrationService;
    }
    getApprovalReadService() {
        return this.payrollApprovalReadService;
    }
    getApprovalReadHandlers() {
        return {
            normalizeUserId: (value) => this.normalizeUserId(value),
            collectIdentifierValues: (...values) => this.collectIdentifierValues(...values),
            userHasSuperAdminRole: (user) => this.userHasSuperAdminRole(user),
            hasFinanceScope: (user) => this.hasFinanceScope(user),
            isAuditDepartment: (user) => this.isAuditDepartment(user),
            resolveEntityId: (value) => this.resolveEntityId(value),
            normalizeEntityIdStrict: (value) => this.normalizeEntityIdStrict(value),
            canViewPayrollApproval: (user, approval) => this.canViewPayrollApproval(user, approval),
            resolvePayrollApprovalRows: (value) => this.resolvePayrollApprovalRows(value),
            buildApprovalDisplayData: (rows, entity, periodDate) => this.buildApprovalDisplayData(rows, entity, periodDate),
            computeSectionTotals: (rows) => this.computeSectionTotals(rows),
            enrichPayrollApprovals: (approvals, entityHint) => this.enrichPayrollApprovals(approvals, entityHint),
            statusSets: {
                approverViewStatuses: PayrollService_1.APPROVER_VIEW_STATUSES,
                reviewerViewStatuses: PayrollService_1.REVIEWER_VIEW_STATUSES,
                posterViewStatuses: PayrollService_1.POSTER_VIEW_STATUSES,
                financeAuditViewStatuses: PayrollService_1.FINANCE_AUDIT_VIEW_STATUSES,
                defaultApprovalViewStatuses: PayrollService_1.DEFAULT_APPROVAL_VIEW_STATUSES,
            },
        };
    }
    getApprovalTransitionHandlers() {
        return {
            syncLeaveAllowanceApprovalRecord: (approval, options) => options
                ? this.syncLeaveAllowanceApprovalRecord(approval, options)
                : this.syncLeaveAllowanceApprovalRecord(approval),
            persistProcessedPayroll: (batchId, payrollData, entity, periodDate) => this.persistProcessedPayroll(batchId, payrollData, entity, periodDate),
            notifyStageAssignees: (userIds, approvalId, entityName, monthLabel, stage) => this.notifyStageAssignees(userIds, approvalId, entityName, monthLabel, stage),
            notifyCompletion: (approval, entityName) => this.notifyCompletion(approval, entityName),
            notifyRejection: (approval, entityName) => this.notifyRejection(approval, entityName),
            resolveEntityName: (entityRef) => this.resolveEntityName(entityRef),
        };
    }
    getRunHandlers() {
        return {
            getTemplates: (payload, type, entity, periodInput) => this.getTemplates(payload, type, entity, periodInput),
            normalizeEntityIdStrict: (value) => this.normalizeEntityIdStrict(value),
            resolveWorkflowType: (value) => this.resolveWorkflowType(value),
            assertPayrollRowsHaveAccountAndLevel: (rows) => this.assertPayrollRowsHaveAccountAndLevel(rows),
            validateWorkflowInitiation: (entityId, initiator, workflowType) => this.validateWorkflowInitiation(entityId, initiator, workflowType),
            loadEntityPayrollSettings: (entityId) => this.loadEntityPayrollSettings(entityId),
            assertPayrollRowsRespectWorkingDays: (rows, defaultWorkingDays) => this.assertPayrollRowsRespectWorkingDays(rows, defaultWorkingDays),
            resolvePayrollPeriodDate: (value) => this.resolvePayrollPeriodDate(value),
            resolveAttendanceOverride: (payload, user) => this.resolveAttendanceOverride(payload, user),
            resolveAttendanceHandledOnClient: (payload) => this.resolveAttendanceHandledOnClient(payload),
            normalizePayrollData: (data, options) => this.getRowDisplayService().normalizePayrollData(data, options),
            detectRowType: (row) => this.getRowDisplayService().detectRowType(row),
            resolveAttendanceIdentifierAliases: (rows, entityId) => this.getAttendanceService().resolveAttendanceIdentifierAliases(rows, entityId),
            resolveLateDeductionEmployees: (rows, periodDate, identifierAliases) => this.getAttendanceService().resolveLateDeductionEmployees(rows, periodDate, identifierAliases),
            applyLateAttendanceDeduction: (rows, deductionIds, defaultWorkingDays) => this.getAttendanceService().applyLateAttendanceDeduction(rows, deductionIds, defaultWorkingDays),
            resolveAttendanceSummaryByEmployee: (rows, periodDate, identifierAliases) => this.getAttendanceService().resolveAttendanceSummaryByEmployee(rows, periodDate, identifierAliases),
            applyAbsenceDeduction: (rows, attendanceSummary, defaultWorkingDays, periodDate) => this.getAttendanceService().applyAbsenceDeduction(rows, attendanceSummary, defaultWorkingDays, periodDate),
            applyProrationForDisplay: (rows, workingDays, performanceBrackets, periodDate) => this.getRowDisplayService().applyProrationForDisplay(rows, workingDays, performanceBrackets, periodDate),
            applyGrossAdjustments: (rows, entityId, periodDate) => this.getGrossAdjustmentService().applyGrossAdjustments(rows, entityId, {
                loadSalaryBreakdownSettings: async (id) => {
                    const { data } = await this.findAll(id);
                    return this.sanitizePayrollConfig(data ?? {});
                },
                computeTaxForAnnualIncome: (amount) => this.computeTaxForAnnualIncome(amount),
            }, { periodDate }),
            hydratePayrollRowIdentifiers: (rows, entityId) => this.hydratePayrollRowIdentifiers(rows, entityId),
            syncLeaveAllowanceApprovalRecord: (approval, options) => options
                ? this.syncLeaveAllowanceApprovalRecord(approval, options)
                : this.syncLeaveAllowanceApprovalRecord(approval),
            composeUserName: (user) => this.composeUserName(user),
            resolveEntityName: (entityRef) => this.resolveEntityName(entityRef),
            resolveApprovalMonthLabel: (approval) => this.resolveApprovalMonthLabel(approval),
            notifyStageAssignees: (userIds, approvalId, entityName, monthLabel, stage) => this.notifyStageAssignees(userIds, approvalId, entityName, monthLabel, stage),
            notifyAuditViewers: (userIds, approvalId, entityName, monthLabel) => this.notifyAuditViewers(userIds, approvalId, entityName, monthLabel),
            computeSectionTotals: (rows) => this.getRowDisplayService().computeSectionTotals(rows),
            toSafeNumber: (value, fallback) => this.getRowDisplayService().toSafeNumber(value, fallback),
            normalizePercent: (value, fallback) => this.getRowDisplayService().normalizePercent(value, fallback),
            resolvePerformancePercent: (score, brackets) => this.getRowDisplayService().resolvePerformancePercent(score, brackets),
            round: (value, precision) => this.getRowDisplayService().round(value, precision),
        };
    }
    async loadActiveGlobalConfig() {
        return this.getTaxService().loadActiveGlobalConfig();
    }
    async computeTaxForAnnualIncome(amount, config) {
        return this.getTaxService().computeTaxForAnnualIncome(amount, config);
    }
    async computeMonthlyTax(amount, config) {
        return this.getTaxService().computeMonthlyTax(amount, config);
    }
    resolveEntityId(input) {
        return (0, payroll_identity_util_1.resolvePayrollEntityId)(input);
    }
    hasFinanceScope(user) {
        return (0, access_control_util_2.userHasScope)(user, ['finance', 'group']);
    }
    parseBooleanFlag(value) {
        return (0, payroll_identity_util_1.parsePayrollBooleanFlag)(value);
    }
    resolveAttendanceOverride(payload, user) {
        const requested = this.parseBooleanFlag(payload?.attendanceOverride ??
            payload?.ignoreAttendanceDeductions ??
            payload?.skipAttendanceDeductions ??
            payload?.overrideAttendance);
        if (!requested)
            return false;
        return (this.hasFinanceScope(user) ||
            this.userHasSuperAdminRole(user) ||
            this.userHasPermission(user, ['process payroll']));
    }
    resolveAttendanceHandledOnClient(payload) {
        return this.parseBooleanFlag(payload?.attendanceHandledOnClient ??
            payload?.attendanceAppliedOnClient ??
            payload?.attendanceApplied);
    }
    async normalizeEntityIdStrict(value) {
        const resolved = this.resolveEntityId(value);
        if (!resolved) {
            throw new common_1.BadRequestException('Entity is required');
        }
        const normalized = String(resolved).trim();
        if (mongoose_2.Types.ObjectId.isValid(normalized)) {
            return new mongoose_2.Types.ObjectId(normalized).toHexString();
        }
        const entity = await this.entityService.getSubsidiaryByShort(normalized).catch(() => null);
        if (entity?._id) {
            return String(entity._id);
        }
        throw new common_1.BadRequestException('Entity is required');
    }
    normalizeUserId(value) {
        return (0, payroll_identity_util_1.normalizePayrollUserId)(value);
    }
    normalizeUserIdList(values) {
        return (0, payroll_identity_util_1.normalizePayrollUserIdList)(values);
    }
    buildPeriodKey(date) {
        return (0, payroll_period_util_1.buildPayrollPeriodKey)(date);
    }
    resolvePayslipPeriodWindow(raw) {
        return (0, payroll_period_util_1.resolvePayslipPeriodWindow)(raw);
    }
    resolvePerformancePeriod(raw) {
        return (0, payroll_period_util_1.resolvePerformancePeriod)(raw);
    }
    collectIdentifierValues(...values) {
        return (0, payroll_identity_util_1.collectPayrollIdentifierValues)(...values);
    }
    buildPayslipStaffQuery(identifiers) {
        return (0, payroll_identity_util_1.buildPayrollStaffIdentityQuery)(identifiers);
    }
    buildPayslipPeriodQuery(periodKey, start, end) {
        return {
            $or: [
                { periodKey: periodKey },
                { periodKey: periodKey.toLowerCase() },
                { periodDate: { $gte: start, $lt: end } },
                { createdAt: { $gte: start, $lt: end } },
            ],
        };
    }
    buildProcessedPayrollEntityMatch(entityId) {
        return (0, payroll_identity_util_1.buildProcessedPayrollEntityMatch)(entityId);
    }
    async loadPerformanceScoreLookup(entityId, periodKey) {
        return this.getPerformanceService().loadPerformanceScoreLookup(entityId, periodKey);
    }
    async updateProcessedPayrollPayslipApproval(identifiers, periodWindow, entityId, status) {
        if (!identifiers.length)
            return;
        const staffQuery = this.buildPayslipStaffQuery(identifiers);
        const periodQuery = this.buildPayslipPeriodQuery(periodWindow.periodKey, periodWindow.start, periodWindow.end);
        const entityQuery = this.buildProcessedPayrollEntityMatch(entityId);
        const statusFilter = status === 'Approved' ? {} : { payslipApproval: { $ne: 'Approved' } };
        await this.processedPayrollModel.updateMany({ ...staffQuery, ...periodQuery, ...entityQuery, ...statusFilter }, { $set: { payslipApproval: status } });
    }
    sanitizePayrollConfig(raw) {
        const toPercent = (key) => this.ensureNumber(raw?.[key], 0);
        return {
            basic: toPercent('basic'),
            housing: toPercent('housing'),
            transport: toPercent('transport'),
            dress: toPercent('dress'),
            utilities: toPercent('utilities'),
            lunch: toPercent('lunch'),
            telephone: toPercent('telephone'),
            reimbursable: toPercent('reimbursable'),
            variable: toPercent('variable'),
            leave: toPercent('leave'),
            pension: toPercent('pension'),
            nhf: toPercent('nhf'),
            workingDays: Math.max(Math.round(this.ensureNumber(raw?.workingDays, 30)), 0),
            companyPension: toPercent('companyPension'),
        };
    }
    async calculatePayroll(grossPay, entity, user) {
        const derivedGross = typeof grossPay === 'object' && grossPay !== null
            ? grossPay.amount ?? grossPay.grossPay ?? grossPay.gross ?? grossPay.salary ?? grossPay.value ?? 0
            : grossPay;
        const entityRef = entity ?? (typeof grossPay === 'object' && grossPay !== null ? grossPay.entity ?? grossPay.entityId : undefined);
        const entityId = this.resolveEntityId(entityRef);
        if (!entityId) {
            throw new common_1.BadRequestException('Entity is required to calculate payroll');
        }
        const { data } = await this.findAll(entityId);
        const settings = this.sanitizePayrollConfig(data ?? {});
        const levelGross = this.ensureNumber(derivedGross, 0);
        const monthlyAddToGross = this.resolveAddToGross(user);
        const addToGross = this.round(monthlyAddToGross * 12);
        const gross = this.round(levelGross + addToGross);
        const tenable = 100 - (settings.reimbursable + settings.variable);
        const amountTendered = this.round(gross * (tenable / 100));
        const { basicAmount, housingAmount, transportAmount, dressAmount, utilitiesAmount, lunchAmount, telephoneAmount, pensionAmount, companyPensionAmount, nhfAmount, } = (0, payroll_calculation_util_1.buildAnnualSalaryBreakdown)(amountTendered, settings);
        const reimbursableAmount = this.percentOf(gross, settings.reimbursable);
        const variableAmount = this.percentOf(gross, settings.variable);
        const rentValue = this.ensureNumber(this.resolveEffectiveRentValue(user), 0);
        const rentRelief = rentValue > 0 ? Math.min(this.round(0.2 * rentValue), 500000) : 0;
        const taxRelief = this.round(pensionAmount + nhfAmount + rentRelief);
        const taxAbleIncome = Math.max(this.round(amountTendered - taxRelief), 0);
        const annualTax = await this.computeTaxForAnnualIncome(taxAbleIncome);
        const annualNet = this.round(amountTendered - pensionAmount - nhfAmount - annualTax);
        const monthlyGross = this.round(amountTendered / 12);
        const monthlyComponents = this.reconcileSalaryComponents({
            basic: this.round(basicAmount / 12),
            housing: this.round(housingAmount / 12),
            transport: this.round(transportAmount / 12),
            dress: this.round(dressAmount / 12),
            utilities: this.round(utilitiesAmount / 12),
            lunch: this.round(lunchAmount / 12),
            telephone: this.round(telephoneAmount / 12),
            gross: monthlyGross,
        });
        const monthlyPension = this.round(pensionAmount / 12);
        const monthlyNhf = this.round(nhfAmount / 12);
        const monthlyTax = this.round(annualTax / 12);
        let monthlyNet = this.round(annualNet / 12);
        const roundingGap = this.round(monthlyGross - (monthlyPension + monthlyNhf + monthlyTax + monthlyNet));
        if (roundingGap !== 0) {
            monthlyNet = this.round(monthlyNet + roundingGap);
        }
        const monthlyReimbursable = this.round(reimbursableAmount / 12);
        const monthlyVariable = this.round(variableAmount / 12);
        const leaveAllowanceAmount = this.percentOf(gross, settings.leave);
        const totalMonthlyNet = this.round(monthlyNet + monthlyReimbursable + monthlyVariable);
        const workingDays = settings.workingDays > 0 ? settings.workingDays : 30;
        const netPaymentDue = this.round((monthlyNet / 30) * workingDays);
        const grandTotal = this.round(gross + leaveAllowanceAmount);
        const monthlyCompanyPension = this.round(companyPensionAmount / 12);
        return {
            ...monthlyComponents,
            reimbursable: this.round(reimbursableAmount / 12),
            variable: this.round(variableAmount / 12),
            amountTendered,
            grandTotal,
            grossPay: this.round(gross),
            addToGross: monthlyAddToGross,
            leave: this.round(leaveAllowanceAmount / 12),
            pension: monthlyPension,
            nhf: monthlyNhf,
            taxRelief,
            taxAbleIncome,
            annualTax,
            annualNet,
            monthlyNet,
            monthlyReimbursable,
            monthlyVariable,
            totalMonthlyNet,
            monthlyGross: monthlyComponents.gross,
            netPaymentDue,
            monthlyTax,
            companyPension: this.round(companyPensionAmount / 12),
            monthlyCompanyPension,
        };
    }
    async getTaxConfigs(entity) {
        return this.getTaxService().getTaxConfigs(entity);
    }
    async saveTaxConfig(payload) {
        return this.getTaxService().saveTaxConfig(payload);
    }
    extractRoleNames(roleLike) {
        return (0, payroll_access_util_1.extractPayrollRoleNames)(roleLike);
    }
    extractPermissionNames(user) {
        return (0, payroll_access_util_1.extractPayrollPermissionNames)(user);
    }
    isAuditDepartment(user) {
        return (0, payroll_access_util_1.isPayrollAuditDepartment)(user);
    }
    userHasPermission(user, required) {
        return (0, payroll_access_util_1.payrollUserHasPermission)(user, required);
    }
    userHasSuperAdminRole(user) {
        return (0, payroll_access_util_1.payrollUserHasSuperAdminRole)(user, PayrollService_1.SUPER_ADMIN_ROLE_NAMES);
    }
    workflowRoleResponseHasAccess(response) {
        const data = response?.data ?? response ?? {};
        return Boolean(data?.isReviewer ||
            data?.isFinalApprover ||
            data?.isPoster ||
            data?.isAuditViewer ||
            data?.isInitiator ||
            Number(data?.entityCount ?? 0) > 0 ||
            (Array.isArray(data?.entities) && data.entities.length > 0));
    }
    async assertPayrollConfigReadAccess(user, entity) {
        if (this.userHasSuperAdminRole(user) ||
            this.hasFinanceScope(user) ||
            this.userHasPermission(user, [
                'view payroll',
                'view processed payroll',
                'view payroll settings',
                'process payroll',
                'approve payroll',
            ])) {
            return;
        }
        const entityId = this.resolveEntityId(entity);
        if (!entityId) {
            throw new common_1.ForbiddenException('You do not have permission to view payroll configuration.');
        }
        const workflowService = this.getWorkflowConfigService();
        const [payrollRole, leaveAllowanceRole] = await Promise.all([
            workflowService.getPayrollWorkflowRole(user, entityId, false).catch(() => null),
            workflowService.getLeaveAllowanceWorkflowRole(user, entityId, false).catch(() => null),
        ]);
        if (this.workflowRoleResponseHasAccess(payrollRole) ||
            this.workflowRoleResponseHasAccess(leaveAllowanceRole)) {
            return;
        }
        throw new common_1.ForbiddenException('You do not have permission to view payroll configuration.');
    }
    assertSuperAdmin(user) {
        if (!this.userHasSuperAdminRole(user)) {
            throw new common_1.ForbiddenException('Only super admin can modify payroll configurations.');
        }
    }
    async createPayroll(payload, user) {
        try {
            this.assertSuperAdmin(user);
            delete payload.null;
            if (!payload?.field) {
                throw new common_1.BadRequestException('Configuration field is required.');
            }
            const field = payload?.field;
            let value = payload?.value;
            if (field === 'performanceBrackets') {
                value = this.normalizePerformanceBrackets(value);
            }
            const result = await this.payrollModel.updateMany({ _id: payload?._id }, { $set: { [field]: value, entity: payload?.entity } });
            return { status: 200, ...result };
        }
        catch (error) {
            return { status: 500, message: 'Error creating payroll', error: error.message };
        }
    }
    async mapPayroll(payload) {
        return this.getMappingService().mapPayroll(payload);
    }
    async findById(id) {
        return this.payrollModel.findById(id).exec();
    }
    async findByLevel(gradeLevel, entity, user) {
        let level = await this.getMappingService().findMappingById(gradeLevel, entity);
        let payroll = await this.calculatePayroll(level?.amount, level?.entity, user);
        return { status: 200, data: payroll };
    }
    async findByLevelId(gradeLevel, entity, user) {
        let level = await this.getMappingService().findMappingByLevel(gradeLevel, entity);
        if (level)
            return await this.calculatePayroll(level?.amount, entity, user);
        return;
    }
    async findAll(entity) {
        let query = {
            $or: [
                { entity: String(entity) },
                { entity: new mongoose_2.Types.ObjectId(entity) }
            ]
        };
        let data = await this.payrollModel.findOne(query).lean().exec();
        return { data };
    }
    async findAllMap(page = 1, user, entity, limit) {
        return this.getMappingService().findAllMap(page, entity, limit);
    }
    async getInitialGrossPay(levelName, entity) {
        const mapping = await this.getMappingService().findMappingByLevel(levelName, entity);
        if (!mapping) {
            throw new common_1.NotFoundException(`No payroll mapping found for level '${levelName}'.`);
        }
        return Number(mapping.amount);
    }
    async updatePayroll(id, payload) {
        const calculatedData = await this.calculatePayroll(payload, payload?.entity, null);
        return this.payrollModel.findByIdAndUpdate(id, calculatedData, { new: true }).exec();
    }
    async deletePayroll(id) {
        return this.payrollModel.findByIdAndDelete(id).exec();
    }
    async generatePayroll(payload, initiator) {
        return this.getRunService().generatePayroll(payload, initiator, this.getRunHandlers());
    }
    async processPayroll(payload, initiator) {
        return this.getRunService().processPayroll(payload, initiator, this.getRunHandlers());
    }
    async previewPayroll(payload, initiator) {
        return this.getRunService().previewPayroll(payload, initiator, this.getRunHandlers());
    }
    async getAttendanceSummary(payload, initiator) {
        const entityId = await this.normalizeEntityIdStrict(payload?.entity);
        const payrollRows = Array.isArray(payload?.data) ? payload.data : [];
        if (!payrollRows.length) {
            throw new common_1.BadRequestException('No payroll data provided');
        }
        const { entityId: normalizedEntityId } = await this.validatePayrollInitiation(entityId, initiator);
        const { workingDays, performanceBrackets } = await this.loadEntityPayrollSettings(normalizedEntityId);
        const periodDate = this.resolvePayrollPeriodDate(payload?.periodDate ?? payload?.month ?? payload?.period ?? payload?.periodKey);
        const normalizedData = this.normalizePayrollData(payrollRows, {
            workingDays,
            performanceBrackets,
        });
        const data = await this.getAttendanceService().buildAttendanceSummary(normalizedData, periodDate, normalizedEntityId);
        return {
            status: 200,
            data,
        };
    }
    async validatePayrollInitiation(entityId, initiator) {
        return this.getWorkflowConfigService().validatePayrollInitiation(entityId, initiator);
    }
    async loadPayrollWorkflowConfig(entityId) {
        return this.getWorkflowConfigService().loadPayrollWorkflowConfig(entityId);
    }
    resolveWorkflowType(value) {
        return (0, payroll_approval_data_util_1.resolvePayrollWorkflowType)(value);
    }
    async validateLeaveAllowanceInitiation(entityId, initiator) {
        return this.getWorkflowConfigService().validateLeaveAllowanceInitiation(entityId, initiator);
    }
    async loadLeaveAllowanceWorkflowConfig(entityId) {
        return this.getWorkflowConfigService().loadLeaveAllowanceWorkflowConfig(entityId);
    }
    async validateWorkflowInitiation(entityId, initiator, workflowType) {
        return this.getWorkflowConfigService().validateWorkflowInitiation(entityId, initiator, workflowType);
    }
    isLeaveAllowanceBatchFromApproval(approval) {
        return (0, payroll_approval_data_util_1.isLeaveAllowancePayrollApproval)(approval);
    }
    async syncLeaveAllowanceApprovalRecord(approval, options) {
        if (!approval)
            return;
        const payrollApprovalId = String(approval?._id ?? '');
        if (!payrollApprovalId)
            return;
        const existing = await this.leaveAllowanceApprovalModel.exists({ payrollApprovalId });
        const shouldSync = options?.forceCreate === true || Boolean(existing);
        if (!shouldSync)
            return;
        const payload = {
            payrollApprovalId,
            batchId: String(approval?.batchId ?? ''),
            entity: String(approval?.entity ?? ''),
            status: approval?.status ?? PAYROLL_APPROVAL_STATUS.PENDING_REVIEW,
            data: this.resolvePayrollApprovalRows(approval?.data),
            types: Array.isArray(approval?.types) ? approval.types : [],
            year: Number.isFinite(Number(approval?.year)) ? Number(approval?.year) : undefined,
            month: Number.isFinite(Number(approval?.month)) ? Number(approval?.month) : undefined,
            requestedBy: approval?.requestedBy,
            requestedByName: approval?.requestedByName,
            initiatorId: approval?.initiatorId,
            initiatorName: approval?.initiatorName,
            initiatorComment: approval?.initiatorComment,
            reviewerIds: Array.isArray(approval?.reviewerIds) ? approval.reviewerIds : [],
            auditViewerIds: Array.isArray(approval?.auditViewerIds) ? approval.auditViewerIds : [],
            approverIds: Array.isArray(approval?.approverIds) ? approval.approverIds : [],
            postingIds: Array.isArray(approval?.postingIds) ? approval.postingIds : [],
            reviewerApprovedBy: approval?.reviewerApprovedBy,
            reviewerApprovedByName: approval?.reviewerApprovedByName,
            reviewerApprovedAt: approval?.reviewerApprovedAt,
            reviewerComment: approval?.reviewerComment,
            approverApprovedBy: approval?.approverApprovedBy,
            approverApprovedByName: approval?.approverApprovedByName,
            approverApprovedAt: approval?.approverApprovedAt,
            postingApprovedBy: approval?.postingApprovedBy,
            postingApprovedByName: approval?.postingApprovedByName,
            postingApprovedAt: approval?.postingApprovedAt,
            processedAt: approval?.processedAt,
            rejectionReason: approval?.rejectionReason,
            currentStage: approval?.currentStage,
        };
        if (!payload.batchId || !payload.entity)
            return;
        await this.leaveAllowanceApprovalModel.findOneAndUpdate({ payrollApprovalId: payload.payrollApprovalId }, { $set: payload }, { upsert: true, new: true, setDefaultsOnInsert: true });
    }
    async getPayrollApprovals(user, status, entity, approverOnly = false, assignedOnly = false, userIdFilter, workflowType, month, year) {
        return this.getApprovalReadService().getPayrollApprovals({
            user,
            status,
            entity,
            approverOnly,
            assignedOnly,
            userIdFilter,
            workflowType,
            month,
            year,
        }, this.getApprovalReadHandlers());
    }
    async getLeaveAllowancePaidUsers(user, entity, year) {
        if (!entity) {
            throw new common_1.BadRequestException('Entity is required.');
        }
        const entityId = await this.normalizeEntityIdStrict(entity);
        const targetYear = Number.isFinite(Number(year))
            ? Math.round(Number(year))
            : new Date().getFullYear();
        if (!Number.isFinite(targetYear) || targetYear < 1970 || targetYear > 3000) {
            throw new common_1.BadRequestException('Year is invalid.');
        }
        const resolveApprovalYear = (approval) => {
            const explicitYear = Number(approval?.year);
            const explicitMonth = Number(approval?.month);
            if (Number.isFinite(explicitYear) &&
                Number.isFinite(explicitMonth) &&
                explicitMonth >= 1 &&
                explicitMonth <= 12) {
                return explicitYear;
            }
            const fallback = approval?.postingApprovedAt ??
                approval?.approverApprovedAt ??
                approval?.reviewerApprovedAt ??
                approval?.createdAt ??
                approval?.updatedAt;
            if (!fallback)
                return null;
            const parsed = fallback instanceof Date ? fallback : new Date(fallback);
            if (Number.isNaN(parsed.getTime()))
                return null;
            return parsed.getFullYear();
        };
        const entityMatch = this.buildProcessedPayrollEntityMatch(entityId);
        const approvalQuery = {
            status: PAYROLL_APPROVAL_STATUS.APPROVED,
            ...(entityMatch?.entity ? { entity: entityMatch.entity } : { entity: entityId }),
        };
        const projection = 'entity status types data year month createdAt updatedAt reviewerApprovedAt approverApprovedAt postingApprovedAt initiatorId requestedBy reviewerIds approverIds postingIds auditViewerIds reviewerApprovedBy approverApprovedBy postingApprovedBy batchId requestedByName initiatorName initiatorComment reviewerApprovedByName approverApprovedByName postingApprovedByName reviewerComment rejectionReason currentStage processedAt';
        let approvals = await this.leaveAllowanceApprovalModel
            .find(approvalQuery)
            .select(projection)
            .lean();
        if (!approvals.length) {
            const legacyApprovals = await this.payrollApprovalModel
                .find(approvalQuery)
                .select(projection)
                .lean();
            const leaveLegacyApprovals = legacyApprovals.filter((legacyApproval) => this.isLeaveAllowanceBatchFromApproval(legacyApproval));
            if (leaveLegacyApprovals.length) {
                await Promise.all(leaveLegacyApprovals.map((legacyApproval) => this.syncLeaveAllowanceApprovalRecord(legacyApproval, { forceCreate: true })));
                approvals = await this.leaveAllowanceApprovalModel
                    .find(approvalQuery)
                    .select(projection)
                    .lean();
            }
        }
        const paidUserIds = new Set();
        approvals.forEach((approval) => {
            if (!this.isLeaveAllowanceBatchFromApproval(approval))
                return;
            if (resolveApprovalYear(approval) !== targetYear)
                return;
            const rows = this.resolvePayrollApprovalRows(approval?.data);
            rows.forEach((row) => {
                const identifiers = this.collectIdentifierValues(row, row?.staff, row?.staffId, row?.employeeId, row?.userId, row?.staffObjectId, row?.id, row?._id, row?.email, row?.employeeInformation);
                identifiers.forEach((identifier) => {
                    const normalized = String(identifier ?? '').trim().toLowerCase();
                    if (normalized) {
                        paidUserIds.add(normalized);
                    }
                });
            });
        });
        return {
            status: 200,
            data: {
                year: targetYear,
                userIds: Array.from(paidUserIds),
            },
        };
    }
    async backfillPayrollApprovalActorNames() {
        const nameMissingFilter = {
            $or: [
                { reviewerApprovedByName: { $exists: false } },
                { reviewerApprovedByName: null },
                { reviewerApprovedByName: '' },
                { approverApprovedByName: { $exists: false } },
                { approverApprovedByName: null },
                { approverApprovedByName: '' },
                { postingApprovedByName: { $exists: false } },
                { postingApprovedByName: null },
                { postingApprovedByName: '' },
            ],
        };
        const batchSize = 200;
        let lastId = null;
        let scanned = 0;
        let batches = 0;
        while (true) {
            const query = { ...nameMissingFilter };
            if (lastId) {
                query._id = mongoose_2.Types.ObjectId.isValid(lastId)
                    ? { $gt: new mongoose_2.Types.ObjectId(lastId) }
                    : { $gt: lastId };
            }
            const approvals = await this.payrollApprovalModel
                .find(query)
                .sort({ _id: 1 })
                .limit(batchSize)
                .lean();
            if (!approvals.length)
                break;
            scanned += approvals.length;
            batches += 1;
            await this.enrichPayrollApprovals(approvals);
            const lastItemId = approvals[approvals.length - 1]?._id;
            if (lastItemId) {
                lastId = String(lastItemId);
            }
        }
        return {
            status: 200,
            message: 'Payroll approval name backfill completed.',
            scanned,
            batches,
        };
    }
    async getApprovalStaff(user, approvalId) {
        return this.getApprovalReadService().getApprovalStaff(user, approvalId, this.getApprovalReadHandlers());
    }
    resolvePayrollApprovalRows(value) {
        return (0, payroll_approval_data_util_1.resolvePayrollApprovalRows)(value);
    }
    async hydratePayrollRowIdentifiers(rows, entity) {
        return this.getIdentifierHydrationService().hydratePayrollRowIdentifiers(rows, entity, {
            normalizeEntityIdStrict: (value) => this.normalizeEntityIdStrict(value),
        });
    }
    async refreshPayrollApprovalIdentifiers(approval) {
        return this.getIdentifierHydrationService().refreshPayrollApprovalIdentifiers(approval, {
            normalizeEntityIdStrict: (value) => this.normalizeEntityIdStrict(value),
        });
    }
    async getPayrollApprovalById(user, approvalId) {
        return this.getApprovalReadService().getPayrollApprovalById(user, approvalId, this.getApprovalReadHandlers());
    }
    async updatePayrollApprovalComment(approvalId, user, payload) {
        const approval = await this.payrollApprovalModel.findById(approvalId);
        if (!approval) {
            throw new common_1.NotFoundException('Payroll approval request not found');
        }
        if (this.isAuditDepartment(user)) {
            throw new common_1.ForbiddenException('Audit department has read-only access to payroll approvals.');
        }
        const initiatorComment = typeof payload?.initiatorComment === 'string' ? payload.initiatorComment.trim() : undefined;
        const reviewerComment = typeof payload?.reviewerComment === 'string' ? payload.reviewerComment.trim() : undefined;
        if (initiatorComment === undefined && reviewerComment === undefined) {
            throw new common_1.BadRequestException('No comment provided');
        }
        const hasFinanceScope = this.hasFinanceScope(user) || this.userHasSuperAdminRole(user);
        if (initiatorComment !== undefined) {
            if (!this.isInitiator(user, approval) && !hasFinanceScope) {
                throw new common_1.ForbiddenException('Only the initiator can update this comment.');
            }
            approval.initiatorComment = initiatorComment || undefined;
        }
        if (reviewerComment !== undefined) {
            if (!this.isReviewer(user, approval) && !hasFinanceScope) {
                throw new common_1.ForbiddenException('Only the reviewer can update this comment.');
            }
            approval.reviewerComment = reviewerComment || undefined;
        }
        await approval.save();
        await this.syncLeaveAllowanceApprovalRecord(approval);
        return { status: 200, message: 'Comment updated successfully.' };
    }
    assertCanLeaveFinanceComment(user, context) {
        if (this.isAuditDepartment(user)) {
            throw new common_1.ForbiddenException(`Audit department has read-only access to ${context}.`);
        }
        if (this.userHasSuperAdminRole(user))
            return;
        if (!(0, access_control_util_2.userCanLeaveFinanceComment)(user)) {
            throw new common_1.ForbiddenException('Only super admins and the finance/fincon departments can leave a finance comment.');
        }
    }
    async updatePayrollApprovalFinanceComment(approvalId, user, comment) {
        const approval = await this.payrollApprovalModel.findById(approvalId);
        if (!approval) {
            throw new common_1.NotFoundException('Payroll approval request not found');
        }
        this.assertCanLeaveFinanceComment(user, 'payroll approvals');
        const financeComment = typeof comment === 'string' ? comment.trim() : '';
        approval.financeComment = financeComment || undefined;
        approval.financeCommentBy = (this.normalizeUserId(user?._id) ?? undefined);
        approval.financeCommentByName = this.composeUserName(user) ?? undefined;
        approval.financeCommentAt = new Date();
        await approval.save();
        await this.syncLeaveAllowanceApprovalRecord(approval);
        return { status: 200, message: 'Finance comment updated successfully.' };
    }
    async switchApprovalAccount(_user, approvalId, staffId, accountType) {
        const normalizedType = String(accountType ?? '').trim().toLowerCase();
        if (normalizedType !== 'atlas' && normalizedType !== 'addosser') {
            throw new common_1.BadRequestException('accountType must be "atlas" or "addosser".');
        }
        const target = String(staffId ?? '').trim();
        if (!target) {
            throw new common_1.BadRequestException('staffId is required.');
        }
        const approval = await this.payrollApprovalModel.findById(approvalId);
        if (!approval) {
            throw new common_1.NotFoundException('Payroll approval request not found');
        }
        if (String(approval.status ?? '').toUpperCase() === 'APPROVED') {
            throw new common_1.BadRequestException('The payout account can no longer be switched after the batch has been posted.');
        }
        const rows = Array.isArray(approval.data)
            ? approval.data
            : [];
        const targetKey = target.toLowerCase();
        const idOf = (row) => String(row?.staffId ?? row?.employeeId ?? row?.userId ?? row?.id ?? '')
            .trim()
            .toLowerCase();
        const matches = rows.filter((row) => idOf(row) === targetKey);
        if (!matches.length) {
            throw new common_1.NotFoundException('Staff not found in this approval.');
        }
        const rowAccountOf = (row) => {
            const source = normalizedType === 'atlas'
                ? row?.atlasAccount ?? row?.atlas
                : row?.addosserAccount ?? row?.addosser;
            return source === null || source === undefined ? '' : String(source).trim();
        };
        let directoryAccount = '';
        if (!matches.some((row) => rowAccountOf(row))) {
            let directory = await this.staffService.resolveStaffDirectory([target], approval.entity, { includeAccounts: true });
            if (!directory?.data?.length) {
                directory = await this.staffService.resolveStaffDirectory([target], undefined, {
                    includeAccounts: true,
                });
            }
            const staffRecord = directory?.data?.[0];
            const source = normalizedType === 'atlas'
                ? staffRecord?.atlasAccount
                : staffRecord?.addosserAccount;
            directoryAccount =
                source === null || source === undefined ? '' : String(source).trim();
        }
        let resolvedAccount = '';
        for (const row of matches) {
            const account = rowAccountOf(row) || directoryAccount;
            if (!account) {
                throw new common_1.BadRequestException(`This staff has no ${normalizedType === 'atlas' ? 'Atlas' : 'Addosser'} account on file.`);
            }
            row.account = account;
            row.accountNo = account;
            row.payoutAccountType = normalizedType;
            resolvedAccount = account;
        }
        approval.markModified('data');
        await approval.save();
        const batchId = approval.batchId;
        if (batchId && resolvedAccount) {
            await this.processedPayrollModel.updateMany({ batchId, staffId: target }, {
                $set: {
                    account: resolvedAccount,
                    accountNo: resolvedAccount,
                    payoutAccountType: normalizedType,
                },
            });
        }
        return {
            status: 200,
            message: 'Payout account switched successfully.',
            accountType: normalizedType,
            account: resolvedAccount,
        };
    }
    async updateLeaveAllowanceFinanceComment(user, id, comment) {
        const approval = await this.leaveAllowanceApprovalModel.findById(id).exec();
        if (!approval) {
            throw new common_1.NotFoundException('Leave allowance approval not found.');
        }
        this.assertCanLeaveFinanceComment(user, 'leave allowance approvals');
        const financeComment = typeof comment === 'string' ? comment.trim() : '';
        approval.financeComment = financeComment || undefined;
        approval.financeCommentBy = (this.normalizeUserId(user?._id) ?? undefined);
        approval.financeCommentByName = this.composeUserName(user) ?? undefined;
        approval.financeCommentAt = new Date();
        await approval.save();
        return { status: 200, message: 'Finance comment updated successfully.' };
    }
    async approvePayroll(approvalId, user, comment) {
        return this.getApprovalTransitionService().approvePayroll(approvalId, user, comment, this.getApprovalTransitionHandlers());
    }
    async rejectPayroll(approvalId, user, reason) {
        return this.getApprovalTransitionService().rejectPayroll(approvalId, user, reason, this.getApprovalTransitionHandlers());
    }
    async getPayrollWorkflowConfigs(user, entity) {
        return this.getWorkflowConfigService().getPayrollWorkflowConfigs(user, entity);
    }
    async getPayrollWorkflowRole(user, entity, scanAll = false) {
        return this.getWorkflowConfigService().getPayrollWorkflowRole(user, entity, scanAll);
    }
    async getLeaveAllowanceWorkflowRole(user, entity, scanAll = false) {
        return this.getWorkflowConfigService().getLeaveAllowanceWorkflowRole(user, entity, scanAll);
    }
    async savePayrollWorkflowConfig(user, payload) {
        return this.getWorkflowConfigService().savePayrollWorkflowConfig(user, payload);
    }
    async getLeaveAllowanceWorkflowConfigs(user, entity) {
        return this.getWorkflowConfigService().getLeaveAllowanceWorkflowConfigs(user, entity);
    }
    async saveLeaveAllowanceWorkflowConfig(user, payload) {
        return this.getWorkflowConfigService().saveLeaveAllowanceWorkflowConfig(user, payload);
    }
    isInitiator(user, approval) {
        return (0, payroll_approval_visibility_util_1.isPayrollApprovalInitiator)(user, approval);
    }
    isReviewer(user, approval) {
        return (0, payroll_approval_visibility_util_1.isPayrollApprovalReviewer)(user, approval);
    }
    isApprover(user, approval) {
        return (0, payroll_approval_visibility_util_1.isPayrollApprovalApprover)(user, approval);
    }
    isPoster(user, approval) {
        return (0, payroll_approval_visibility_util_1.isPayrollApprovalPoster)(user, approval);
    }
    isAuditViewer(user, approval) {
        return (0, payroll_approval_visibility_util_1.isPayrollApprovalAuditViewer)(user, approval);
    }
    canViewFinanceOrAudit(user, approval) {
        return (0, payroll_approval_visibility_util_1.canViewPayrollFinanceOrAudit)(user, approval, {
            financeAuditViewStatuses: PayrollService_1.FINANCE_AUDIT_VIEW_STATUSES,
            hasFinanceScope: (candidate) => this.hasFinanceScope(candidate),
            isAuditDepartment: (candidate) => this.isAuditDepartment(candidate),
        });
    }
    canViewPayrollApproval(user, approval) {
        return (0, payroll_approval_visibility_util_1.canViewPayrollApproval)(user, approval, {
            approverViewStatuses: PayrollService_1.APPROVER_VIEW_STATUSES,
            posterViewStatuses: PayrollService_1.POSTER_VIEW_STATUSES,
            financeAuditViewStatuses: PayrollService_1.FINANCE_AUDIT_VIEW_STATUSES,
            hasFinanceScope: (candidate) => this.hasFinanceScope(candidate),
            isAuditDepartment: (candidate) => this.isAuditDepartment(candidate),
            hasSuperAdminRole: (candidate) => this.userHasSuperAdminRole(candidate),
        });
    }
    async persistProcessedPayroll(batchId, payrollData, entity, periodDate) {
        return this.getProcessedPersistenceService().persistProcessedPayroll(batchId, payrollData, entity, periodDate);
    }
    formatPayrollMonthLabel(value) {
        return (0, payroll_display_util_1.formatPayrollDisplayMonthLabel)(value);
    }
    resolveApprovalMonthLabel(approval) {
        return (0, payroll_display_util_1.resolvePayrollApprovalMonthLabel)(approval);
    }
    async isPayrollEmailEnabled() {
        return this.getNotificationService().isPayrollEmailEnabled();
    }
    buildPortalUrl(path) {
        return this.getNotificationService().buildPortalUrl(path);
    }
    normalizeEmail(value) {
        return this.getNotificationService().normalizeEmail(value);
    }
    async collectNotificationEmails(userIds) {
        return this.getNotificationService().collectNotificationEmails(userIds);
    }
    async sendPayrollApprovalEmail(userIds, templateType, templateVariables) {
        return this.getNotificationService().sendPayrollApprovalEmail(userIds, templateType, templateVariables);
    }
    async notifyCompletion(approval, entityName) {
        return this.getNotificationService().notifyCompletion(approval, entityName);
    }
    async notifyRejection(approval, entityName) {
        return this.getNotificationService().notifyRejection(approval, entityName);
    }
    collectParticipantIds(approval) {
        return this.getNotificationService().collectParticipantIds(approval);
    }
    async notifyStageAssignees(userIds, approvalId, entityName, monthLabel, stage) {
        return this.getNotificationService().notifyStageAssignees(userIds, approvalId, entityName, monthLabel, stage);
    }
    async notifyAuditViewers(userIds, approvalId, entityName, monthLabel) {
        return this.getNotificationService().notifyAuditViewers(userIds, approvalId, entityName, monthLabel);
    }
    async notifyBankingOperations(approval, entityName) {
        return this.getNotificationService().notifyBankingOperations(approval, entityName);
    }
    computeSectionTotals(rows) {
        return this.getRowDisplayService().computeSectionTotals(rows);
    }
    async buildApprovalDisplayData(rows, entity, periodDate) {
        return this.getRowDisplayService().buildApprovalDisplayData(rows, entity, periodDate, {
            normalizeEntityIdStrict: (value) => this.normalizeEntityIdStrict(value),
            loadEntityPayrollSettings: (entityId) => this.loadEntityPayrollSettings(entityId),
        });
    }
    composeUserName(user) {
        return (0, payroll_display_util_1.composePayrollUserName)(user);
    }
    async resolveEntityName(entityRef) {
        const candidate = entityRef?.data ?? entityRef;
        if (candidate && typeof candidate === 'object') {
            const label = candidate?.name ??
                candidate?.short ??
                candidate?.title ??
                candidate?.code ??
                candidate?.abbr ??
                candidate?.label ??
                candidate?.entityName ??
                candidate?.subsidiaryName;
            if (label) {
                return String(label).trim();
            }
        }
        const rawText = typeof candidate === 'string' ? candidate.trim() : '';
        if (rawText && !mongoose_2.Types.ObjectId.isValid(rawText)) {
            const entityByShort = await this.entityService
                .getSubsidiaryByShort(rawText)
                .catch(() => null);
            const shortLabel = entityByShort?.name ?? entityByShort?.short;
            if (shortLabel) {
                return String(shortLabel).trim();
            }
            return rawText;
        }
        const entityId = this.resolveEntityId(candidate ?? entityRef);
        if (!entityId)
            return 'the entity';
        try {
            const entity = await this.entityService.findSubsidiaryById(entityId);
            const resolved = entity?.data?.name || entity?.data?.short;
            return resolved ? String(resolved).trim() : 'the entity';
        }
        catch {
            return 'the entity';
        }
    }
    resolveEntityLabel(entityRef) {
        return (0, payroll_display_util_1.resolvePayrollEntityLabel)(entityRef);
    }
    resolveStaffLabel(directory, value) {
        return (0, payroll_display_util_1.resolvePayrollStaffLabel)(directory, value);
    }
    async enrichPayrollApprovals(approvals, entityHint) {
        return this.getApprovalEnrichmentService().enrichPayrollApprovals(approvals, entityHint);
    }
    normalizePayrollData(data, options) {
        return this.getRowDisplayService().normalizePayrollData(data, options);
    }
    normalizePayrollText(value) {
        return (0, payroll_row_util_1.normalizePayrollTextValue)(value);
    }
    resolvePayrollRowAccount(row) {
        return (0, payroll_row_util_1.resolvePayrollRowAccountValue)(row);
    }
    resolvePayrollRowLevel(row) {
        return (0, payroll_row_util_1.resolvePayrollRowLevelValue)(row);
    }
    assertPayrollRowsRespectWorkingDays(rows, defaultWorkingDays) {
        (0, payroll_row_util_1.assertPayrollRowsRespectWorkingDaysValue)(rows, defaultWorkingDays);
    }
    assertPayrollRowsHaveAccountAndLevel(rows) {
        (0, payroll_row_util_1.assertPayrollRowsHaveAccountAndLevelValue)(rows);
    }
    normalizePercent(value, fallback = 0) {
        return (0, payroll_calculation_util_1.normalizePayrollPercent)(value, fallback);
    }
    resolveDateValue(value) {
        return (0, payroll_period_util_1.resolveDateValue)(value);
    }
    resolvePayrollPeriodDate(value) {
        return (0, payroll_period_util_1.resolvePayrollPeriodDate)(value);
    }
    isSamePayrollMonth(left, right) {
        return (0, payroll_period_util_1.isSamePayrollMonth)(left, right);
    }
    shiftPayrollMonth(source, offset) {
        return (0, payroll_period_util_1.shiftPayrollMonth)(source, offset);
    }
    resolveProrationDetails(item, defaultBase, options) {
        return (0, payroll_proration_util_1.resolvePayrollProrationDetails)(item, defaultBase, options);
    }
    resolveProrationFactor(item, defaultBase, options) {
        return (0, payroll_proration_util_1.resolvePayrollProrationFactor)(item, defaultBase, options);
    }
    resolvePerformancePercent(score, brackets) {
        return (0, payroll_proration_util_1.resolvePayrollPerformancePercent)(score, brackets);
    }
    normalizePerformanceBrackets(data) {
        return (0, payroll_proration_util_1.normalizePayrollPerformanceBrackets)(data);
    }
    async loadEntityPayrollSettings(entityId) {
        const match = [{ entity: entityId }];
        if (mongoose_2.Types.ObjectId.isValid(entityId)) {
            match.push({ entity: new mongoose_2.Types.ObjectId(entityId) });
        }
        const config = await this.payrollModel.findOne({ $or: match }).lean();
        const workingDays = this.toSafeNumber(config?.workingDays ?? 30, 30);
        const performanceBrackets = this.normalizePerformanceBrackets(config?.performanceBrackets);
        return { workingDays, performanceBrackets };
    }
    applyProrationForDisplay(rows, workingDays, performanceBrackets, periodDate) {
        return this.getRowDisplayService().applyProrationForDisplay(rows, workingDays, performanceBrackets, periodDate);
    }
    detectRowType(row) {
        return (0, payroll_proration_util_1.detectPayrollRowType)(row);
    }
    toSafeNumber(value, fallback = 0) {
        return (0, payroll_calculation_util_1.toSafePayrollNumber)(value, fallback);
    }
    async getProcessedPayrollById(user, id) {
        return this.getApprovalReadService().getProcessedPayrollById(user, id, this.getApprovalReadHandlers());
    }
    async getPayslipsForUser(idOrUser, viewer) {
        return this.getExportService().getPayslipsForUser(idOrUser, viewer);
    }
    async getProcessedPayrollByStaffId(staffId, user) {
        return this.getExportService().getProcessedPayrollByStaffId(staffId, user);
    }
    async requestPayslipApproval(payload, requester) {
        return this.getPayslipApprovalService().requestPayslipApproval(payload, requester);
    }
    async getPayslipApprovals(user, status, entity) {
        return this.getPayslipApprovalService().getPayslipApprovals(user, status, entity);
    }
    async getPayslipApprovalById(user, approvalId) {
        return this.getPayslipApprovalService().getPayslipApprovalById(user, approvalId);
    }
    async approvePayslipApproval(approvalId, user) {
        return this.getPayslipApprovalService().approvePayslipApproval(approvalId, user);
    }
    async rejectPayslipApproval(approvalId, user, reason) {
        return this.getPayslipApprovalService().rejectPayslipApproval(approvalId, user, reason);
    }
    async getProcessedPayroll(entity, month, type) {
        return this.getExportService().getProcessedPayroll(entity, month, type);
    }
    async savePayrollPerformance(payload) {
        return this.getPerformanceService().savePayrollPerformance(payload);
    }
    async getPayrollPerformance(entity, month, staffId) {
        return this.getPerformanceService().getPayrollPerformance(entity, month, staffId);
    }
    async getTemplates(payload, type, entity, periodInput) {
        let users = await this.rearrangeUser(payload, entity);
        if (type === "variable") {
            const { periodKey } = this.resolvePerformancePeriod(periodInput);
            const entityId = this.resolveEntityId(entity);
            const performanceLookup = entityId
                ? await this.loadPerformanceScoreLookup(entityId, periodKey)
                : new Map();
            return users?.map(({ employeeId, staffId, firstName, lastName, middleName, addosserAccount, atlasAccount, levelName = null, branch = null, monthlyVariable, startDate, exitDate }) => {
                const score = performanceLookup.get(String(staffId ?? '').trim()) ??
                    performanceLookup.get(String(employeeId ?? '').trim());
                return {
                    entity,
                    employeeId,
                    staffId,
                    name: (0, user_name_util_1.toTitleCaseName)(`${lastName} ${firstName} ${middleName ? middleName : ""}`),
                    account: addosserAccount,
                    atlas: atlasAccount,
                    grade: levelName,
                    branch: branch,
                    variable: monthlyVariable,
                    performanceScore: score,
                    startDate: startDate,
                    exitDate: exitDate
                };
            });
        }
        if (type === "reimbursable") {
            return users.map(({ employeeId, staffId, firstName, lastName, middleName, addosserAccount, atlasAccount, levelName = null, branch = null, monthlyReimbursable, startDate, exitDate }) => {
                return {
                    entity,
                    employeeId,
                    staffId,
                    name: (0, user_name_util_1.toTitleCaseName)(`${lastName} ${firstName} ${middleName ? middleName : ""}`),
                    account: addosserAccount,
                    atlas: atlasAccount,
                    grade: levelName,
                    branch: branch,
                    reimbursable: monthlyReimbursable,
                    startDate: startDate,
                    exitDate: exitDate,
                };
            });
        }
        if (type === "salary") {
            return users.map(({ employeeId, staffId, firstName, lastName, middleName, addosserAccount, levelName, branch = null, pensionAccount, nhfAccount, payeAccount, pensionProvider, accountDetail, basic, housing, transport, dress, utilities, lunch, telephone, monthlyGross, addToGross, pension, nhf, monthlyTax, monthlyNet, monthlyCompanyPension, startDate, exitDate, rent, rentStartDate, rentEndDate }) => {
                const detail = accountDetail || {};
                const resolvedNhf = nhfAccount ?? detail?.nhf ?? detail?.nhfAccount;
                const resolvedPaye = payeAccount ?? detail?.payeAccount ?? detail?.taxProfileId;
                const resolvedPensionAccount = pensionAccount ?? detail?.pensionAccount ?? detail?.rsaNumber;
                const resolvedPensionProvider = pensionProvider ?? detail?.pensionProvider ?? detail?.pfa;
                return {
                    employeeId,
                    staffId,
                    name: (0, user_name_util_1.toTitleCaseName)(`${lastName} ${firstName} ${middleName ? middleName : ""}`),
                    account: addosserAccount,
                    grade: levelName,
                    branch: branch,
                    basic,
                    housing,
                    transport,
                    dress,
                    utilities,
                    lunch,
                    telephone,
                    gross: monthlyGross,
                    addToGross: addToGross ?? 0,
                    pension,
                    nhf,
                    paye: monthlyTax,
                    monthlyCompanyPension,
                    monthlyNet,
                    nhfAccount: resolvedNhf,
                    payeAccount: resolvedPaye,
                    pensionAccount: resolvedPensionAccount,
                    pensionProvider: resolvedPensionProvider,
                    startDate: startDate,
                    exitDate: exitDate,
                    entity,
                    rent,
                    rentStartDate,
                    rentEndDate
                };
            });
        }
        throw new Error(`Invalid type: ${type}`);
    }
    async rearrangeUser(payload, entity) {
        const transformedUsers = payload?.map(({ _id, id, staffId, firstName, middleName, lastName, branch, atlasAccount, addosserAccount, level, startDate, exitDate, employeeInformation, addToGross, rent, rentStartDate, rentEndDate }) => {
            const detail = employeeInformation?.accountDetail ?? {};
            return ({
                employeeId: _id ?? id ?? '',
                staffId,
                firstName,
                middleName: middleName,
                lastName,
                branch: branch?.name,
                levelId: level?._id,
                levelName: level?.name,
                atlasAccount,
                addosserAccount,
                accountDetail: detail,
                nhfAccount: detail?.nhf ?? detail?.nhfAccount ?? employeeInformation?.nhf ?? employeeInformation?.nhfAccount,
                payeAccount: detail?.payeAccount ?? detail?.taxProfileId ?? employeeInformation?.payeAccount ?? employeeInformation?.taxProfileId,
                pensionAccount: detail?.pensionAccount ?? detail?.rsaNumber ?? employeeInformation?.pensionAccount ?? employeeInformation?.rsaNumber,
                pensionProvider: detail?.pensionProvider ?? detail?.pfa ?? employeeInformation?.pensionProvider ?? employeeInformation?.pfa,
                startDate,
                exitDate,
                addToGross,
                rent,
                rentStartDate,
                rentEndDate
            });
        });
        return Promise.all(transformedUsers?.map(async (item) => ({
            ...item,
            ...await this.findByLevelId(item?.levelName, entity, {
                addToGross: item.addToGross,
                rent: item.rent,
                rentStartDate: item.rentStartDate,
                rentEndDate: item.rentEndDate,
            })
        })));
    }
    async calculateTotal() {
        const num = (field) => ({
            $convert: { input: `$${field}`, to: 'double', onError: 0, onNull: 0 },
        });
        const amountForType = (t) => ({
            $sum: { $cond: [{ $eq: ['$type', t] }, num('amount'), 0] },
        });
        return await this.processedPayrollModel.aggregate([
            {
                $group: {
                    _id: "$entity",
                    totalAmount: { $sum: num('amount') },
                    totalCount: { $sum: 1 },
                    totalPension: { $sum: num('pension') },
                    totalpaye: { $sum: num('paye') },
                    totalTax: { $sum: num('paye') },
                    totalGross: { $sum: num('gross') },
                    totalNHF: { $sum: num('nhf') },
                    totalCompanyPension: { $sum: num('companyPension') },
                    totalSalary: amountForType('salary'),
                    totalNet: amountForType('salary'),
                    totalBank: amountForType('bank'),
                    totalIndividual: amountForType('individual'),
                    totalReimbursable: amountForType('reimbursable'),
                    totalVariable: amountForType('variable'),
                }
            }
        ]);
    }
    async uploadXlsx(source, fileName) {
        try {
            const normalizedName = String(fileName ?? '').toLowerCase();
            if (normalizedName.endsWith('.xls')) {
                throw new Error('Legacy .xls files are not supported. Please save as .xlsx or .csv.');
            }
            let jsonData = [];
            if (normalizedName.endsWith('.csv')) {
                jsonData = (0, spreadsheet_util_1.csvBufferToRowArrays)(source);
            }
            else {
                try {
                    const workbook = await (0, spreadsheet_util_1.loadWorkbook)(source, fileName);
                    const sheet = (0, spreadsheet_util_1.getFirstWorksheet)(workbook);
                    if (!sheet) {
                        throw new Error('No worksheet found in uploaded file.');
                    }
                    jsonData = (0, spreadsheet_util_1.worksheetToRowArrays)(sheet);
                }
                catch (error) {
                    const fallback = (0, spreadsheet_util_1.csvBufferToRowArrays)(source);
                    if (!fallback.length) {
                        throw error;
                    }
                    jsonData = fallback;
                }
            }
            let processed = 0;
            let skipped = 0;
            for (const row of jsonData.slice(1)) {
                const rawEntity = row[0];
                const levelValue = row[1];
                const amountValue = row[2];
                const aftaValue = row[3];
                const entityShort = String(rawEntity ?? "").trim().toUpperCase();
                if (!entityShort) {
                    skipped += 1;
                    continue;
                }
                const entity = await this.entityService.getSubsidiaryByShort(entityShort);
                if (!entity) {
                    skipped += 1;
                    continue;
                }
                const level = String(levelValue ?? "").trim();
                if (!level) {
                    skipped += 1;
                    continue;
                }
                const hasAmountValue = amountValue !== undefined &&
                    amountValue !== null &&
                    String(amountValue).trim() !== "";
                const hasAftaValue = aftaValue !== undefined &&
                    aftaValue !== null &&
                    String(aftaValue).trim() !== "";
                if (!hasAmountValue && !hasAftaValue) {
                    skipped += 1;
                    continue;
                }
                const createMappingDto = {
                    entity: entity._id,
                    level: level.toUpperCase(),
                };
                if (hasAmountValue) {
                    createMappingDto.amount = this.ensureNumber(amountValue, 0);
                }
                if (hasAftaValue) {
                    createMappingDto.afta = this.ensureNumber(aftaValue, 0);
                }
                const result = await this.mapPayroll(createMappingDto);
                if (result?.status === 200) {
                    processed += 1;
                }
                else {
                    skipped += 1;
                }
            }
            return {
                status: 200,
                message: 'Updated successfully',
                processed,
                skipped,
            };
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async sendAttachmentThroughSocket(filePath, fileName) {
        const file = await fetch(filePath);
        const fileBlob = await file.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const fileBase64 = reader.result;
                const data = {
                    fileBase64,
                    fileName,
                };
                resolve(data);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsDataURL(fileBlob);
        });
    }
    async markPostingComplete(approvalId, user) {
        return this.getApprovalTransitionService().markPostingComplete(approvalId, user, {
            syncLeaveAllowanceApprovalRecord: (approval, options) => options
                ? this.syncLeaveAllowanceApprovalRecord(approval, options)
                : this.syncLeaveAllowanceApprovalRecord(approval),
        });
    }
    async getLeaveAllowanceApprovals(user, status, entity, assignedOnly = false, userIdFilter) {
        const query = {};
        const normalizedStatus = typeof status === 'string' && status.trim() ? status.trim().toUpperCase() : undefined;
        const currentUserIdentifiers = this.collectIdentifierValues(user?.id, user?._id, user?.userId, user?.email).map((v) => String(v).trim()).filter(Boolean);
        const requestedIdentifiers = userIdFilter
            ? this.collectIdentifierValues(userIdFilter).map((v) => String(v).trim()).filter(Boolean)
            : [];
        const targetIdentifiers = requestedIdentifiers.length ? requestedIdentifiers : currentUserIdentifiers;
        const isSuperAdmin = this.userHasSuperAdminRole(user);
        const isFinanceOrAudit = this.hasFinanceScope(user) || this.isAuditDepartment(user);
        if (entity) {
            const resolvedEntity = this.resolveEntityId(entity);
            if (resolvedEntity)
                query.entity = resolvedEntity;
        }
        if (normalizedStatus) {
            query.status = normalizedStatus;
        }
        else {
            query.status = { $in: ['PENDING_REVIEW', 'PENDING_APPROVAL', 'PENDING_POSTING', 'APPROVED', 'REJECTED'] };
        }
        const targetObjectIds = targetIdentifiers
            .filter((v) => mongoose_2.Types.ObjectId.isValid(v))
            .map((v) => new mongoose_2.Types.ObjectId(v));
        const roleFilters = [
            { initiatorId: { $in: targetIdentifiers } },
            { requestedBy: { $in: targetIdentifiers } },
            { reviewerIds: { $in: targetIdentifiers } },
            { approverIds: { $in: targetIdentifiers } },
            { postingIds: { $in: targetIdentifiers } },
            { auditViewerIds: { $in: targetIdentifiers } },
        ];
        if (targetObjectIds.length) {
            roleFilters.push({ initiatorId: { $in: targetObjectIds } }, { reviewerIds: { $in: targetObjectIds } }, { approverIds: { $in: targetObjectIds } }, { postingIds: { $in: targetObjectIds } });
        }
        if (assignedOnly || (!isSuperAdmin && !isFinanceOrAudit)) {
            query.$or = roleFilters;
        }
        const approvals = await this.leaveAllowanceApprovalModel
            .find(query)
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        return { status: 200, data: approvals };
    }
    async getLeaveAllowanceApprovalById(user, id) {
        if (!id || !mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid approval id.');
        }
        const approval = await this.leaveAllowanceApprovalModel
            .findById(new mongoose_2.Types.ObjectId(id))
            .lean()
            .exec();
        if (!approval) {
            throw new common_1.NotFoundException('Leave allowance approval not found.');
        }
        return { status: 200, data: approval };
    }
    buildLeaveApprovalNoticeLink(approval) {
        const rawId = String(approval?._id ?? '').trim();
        if (!rawId || rawId.toLowerCase() === 'undefined' || rawId.toLowerCase() === 'null') {
            return '/payroll-leave-approvals';
        }
        return `/payroll-leave-approvals/${rawId}`;
    }
    async resolveLeaveAllowanceNoticeLink(payrollApprovalId) {
        const id = String(payrollApprovalId ?? '').trim();
        if (!id)
            return '/payroll-leave-approvals';
        try {
            const leaveApproval = await this.leaveAllowanceApprovalModel
                .findOne({ payrollApprovalId: id })
                .select('_id')
                .lean()
                .exec();
            const leaveId = String(leaveApproval?._id ?? '').trim();
            return leaveId ? `/payroll-leave-approvals/${leaveId}` : '/payroll-leave-approvals';
        }
        catch {
            return '/payroll-leave-approvals';
        }
    }
    async notifyLeaveAllowanceAssignees(userIds, message, link = '/payroll-leave-approvals') {
        const recipients = this.normalizeUserIdList(userIds);
        if (!recipients.length)
            return;
        await Promise.allSettled(recipients.map((recipientId) => this.noticeService.createNotice({
            userId: recipientId,
            message,
            link,
            type: 'leave-allowance-approval',
        })));
    }
    async notifyLeaveAllowanceRequester(approval, message, link = '/payroll-leave-approvals') {
        const recipients = this.normalizeUserIdList([
            approval?.requestedBy,
            approval?.initiatorId,
        ]);
        if (!recipients.length)
            return;
        await Promise.allSettled(recipients.map((recipientId) => this.noticeService.createNotice({
            userId: recipientId,
            message,
            link,
            type: 'leave-allowance-approval',
        })));
    }
    isUserInApprovalList(userId, assignedIds) {
        if (!userId)
            return false;
        const normalizedList = this.normalizeUserIdList(assignedIds);
        return normalizedList.some((id) => id === userId);
    }
    async approveLeaveAllowanceApproval(user, id, comment) {
        const approval = await this.leaveAllowanceApprovalModel.findById(id).exec();
        if (!approval)
            throw new common_1.NotFoundException('Leave allowance approval not found.');
        if (approval.status === 'REJECTED')
            throw new common_1.BadRequestException('Approval has been rejected.');
        if (approval.status === 'APPROVED')
            throw new common_1.BadRequestException('Approval is already completed.');
        const userId = this.normalizeUserId(user?._id) ?? '';
        const userName = this.composeUserName(user) ?? '';
        if (approval.status === 'PENDING_REVIEW') {
            if (!this.isUserInApprovalList(userId, approval.reviewerIds)) {
                throw new common_1.ForbiddenException('You are not assigned as a reviewer for this leave allowance batch.');
            }
            approval.status = 'PENDING_APPROVAL';
            approval.currentStage = 'APPROVER';
            approval.reviewerApprovedBy = userId;
            approval.reviewerApprovedByName = userName;
            approval.reviewerApprovedAt = new Date();
            if (comment)
                approval.reviewerComment = comment;
            await approval.save();
            await this.syncPayrollApprovalFromLeave(approval);
            await this.workflowNotifier?.dispatch({
                module: 'leave_allowance',
                event: 'reviewed',
                doc: approval,
            });
            return { status: 200, message: 'Leave batch moved to approvers.' };
        }
        if (approval.status === 'PENDING_APPROVAL') {
            if (!this.isUserInApprovalList(userId, approval.approverIds)) {
                throw new common_1.ForbiddenException('You are not assigned as an approver for this leave allowance batch.');
            }
            approval.status = 'PENDING_POSTING';
            approval.currentStage = 'POSTING';
            approval.approverApprovedBy = userId;
            approval.approverApprovedByName = userName;
            approval.approverApprovedAt = new Date();
            await approval.save();
            await this.syncPayrollApprovalFromLeave(approval);
            await this.workflowNotifier?.dispatch({
                module: 'leave_allowance',
                event: 'approved',
                doc: approval,
            });
            return { status: 200, message: 'Leave batch approved and forwarded for posting.' };
        }
        throw new common_1.BadRequestException(`Cannot approve approval with status ${approval.status}.`);
    }
    async switchLeaveApprovalAccount(_user, id, staffId, accountType) {
        const normalizedType = String(accountType ?? '').trim().toLowerCase();
        if (normalizedType !== 'atlas' && normalizedType !== 'addosser') {
            throw new common_1.BadRequestException('accountType must be "atlas" or "addosser".');
        }
        const target = String(staffId ?? '').trim();
        if (!target) {
            throw new common_1.BadRequestException('staffId is required.');
        }
        const approval = await this.leaveAllowanceApprovalModel.findById(id).exec();
        if (!approval) {
            throw new common_1.NotFoundException('Leave allowance approval not found.');
        }
        if (String(approval.status ?? '').toUpperCase() === 'APPROVED') {
            throw new common_1.BadRequestException('The payout account can no longer be switched after the batch has been posted.');
        }
        const rows = Array.isArray(approval.data)
            ? approval.data
            : [];
        const targetKey = target.toLowerCase();
        const idsOf = (row) => [
            row?.staffId,
            row?.employeeId,
            row?.staffID,
            row?.userId,
            row?.staffObjectId,
            row?.staff,
            row?._id,
            row?.id,
        ]
            .map((value) => String(value ?? '').trim().toLowerCase())
            .filter(Boolean);
        const matches = rows.filter((row) => idsOf(row).includes(targetKey));
        if (!matches.length) {
            throw new common_1.NotFoundException('Staff not found in this approval.');
        }
        let directory = await this.staffService.resolveStaffDirectory([target], approval.entity, { includeAccounts: true });
        if (!directory?.data?.length) {
            directory = await this.staffService.resolveStaffDirectory([target], undefined, {
                includeAccounts: true,
            });
        }
        const staffRecord = directory?.data?.[0];
        const source = normalizedType === 'atlas'
            ? staffRecord?.atlasAccount
            : staffRecord?.addosserAccount;
        const account = source === null || source === undefined ? '' : String(source).trim();
        if (!account) {
            throw new common_1.BadRequestException(`This staff has no ${normalizedType === 'atlas' ? 'Atlas' : 'Addosser'} account on file.`);
        }
        for (const row of matches) {
            row.payoutAccount = account;
            row.payoutAccountType = normalizedType;
        }
        approval.markModified('data');
        await approval.save();
        return {
            status: 200,
            message: 'Payout account switched successfully.',
            accountType: normalizedType,
            account,
        };
    }
    async switchLeaveApprovalAccountForAll(_user, id, accountType) {
        const normalizedType = String(accountType ?? '').trim().toLowerCase();
        if (normalizedType !== 'atlas' && normalizedType !== 'addosser') {
            throw new common_1.BadRequestException('accountType must be "atlas" or "addosser".');
        }
        const approval = await this.leaveAllowanceApprovalModel.findById(id).exec();
        if (!approval) {
            throw new common_1.NotFoundException('Leave allowance approval not found.');
        }
        if (String(approval.status ?? '').toUpperCase() === 'APPROVED') {
            throw new common_1.BadRequestException('The payout account can no longer be switched after the batch has been posted.');
        }
        const rows = Array.isArray(approval.data)
            ? approval.data
            : [];
        if (!rows.length) {
            throw new common_1.NotFoundException('This approval has no rows to switch.');
        }
        const idCandidatesOf = (row) => [
            row?.staffId,
            row?.employeeId,
            row?.staffID,
            row?.userId,
            row?.staffObjectId,
            row?.staff,
            row?._id,
            row?.id,
        ]
            .map((value) => String(value ?? '').trim())
            .filter(Boolean);
        const identifiers = Array.from(new Set(rows.flatMap(idCandidatesOf)));
        let directory = await this.staffService.resolveStaffDirectory(identifiers, approval.entity, { includeAccounts: true });
        if (!directory?.data?.length) {
            directory = await this.staffService.resolveStaffDirectory(identifiers, undefined, {
                includeAccounts: true,
            });
        }
        const staffByKey = new Map();
        for (const record of directory?.data ?? []) {
            [record?._id, record?.id, record?.staffId, record?.staffID, record?.userId, record?.email]
                .map((value) => String(value ?? '').trim().toLowerCase())
                .filter(Boolean)
                .forEach((key) => {
                if (!staffByKey.has(key))
                    staffByKey.set(key, record);
            });
        }
        let switched = 0;
        let skipped = 0;
        for (const row of rows) {
            const record = idCandidatesOf(row)
                .map((candidate) => staffByKey.get(candidate.toLowerCase()))
                .find(Boolean);
            const source = normalizedType === 'atlas' ? record?.atlasAccount : record?.addosserAccount;
            const account = source === null || source === undefined ? '' : String(source).trim();
            if (!account) {
                skipped += 1;
                continue;
            }
            row.payoutAccount = account;
            row.payoutAccountType = normalizedType;
            switched += 1;
        }
        const label = normalizedType === 'atlas' ? 'Atlas' : 'Addosser';
        if (!switched) {
            throw new common_1.BadRequestException(`No staff in this approval has a ${label} account on file.`);
        }
        approval.markModified('data');
        await approval.save();
        return {
            status: 200,
            message: skipped
                ? `Payout account switched for ${switched} row(s); ${skipped} row(s) had no ${label} account on file and were left unchanged.`
                : 'Payout account switched successfully.',
            accountType: normalizedType,
            switched,
            skipped,
            appliedToAll: skipped === 0,
        };
    }
    async rejectLeaveAllowanceApproval(user, id, reason) {
        const approval = await this.leaveAllowanceApprovalModel.findById(id).exec();
        if (!approval)
            throw new common_1.NotFoundException('Leave allowance approval not found.');
        if (approval.status === 'REJECTED')
            throw new common_1.BadRequestException('Already rejected.');
        if (approval.status === 'APPROVED')
            throw new common_1.BadRequestException('Cannot reject a completed approval.');
        const userId = this.normalizeUserId(user?._id) ?? '';
        if (approval.status === 'PENDING_REVIEW' && !this.isUserInApprovalList(userId, approval.reviewerIds)) {
            throw new common_1.ForbiddenException('You are not assigned as a reviewer for this leave allowance batch.');
        }
        if (approval.status === 'PENDING_APPROVAL' && !this.isUserInApprovalList(userId, approval.approverIds)) {
            throw new common_1.ForbiddenException('You are not assigned as an approver for this leave allowance batch.');
        }
        if (approval.status === 'PENDING_POSTING' && !this.isUserInApprovalList(userId, approval.postingIds)) {
            throw new common_1.ForbiddenException('You are not assigned as a posting user for this leave allowance batch.');
        }
        approval.status = 'REJECTED';
        approval.rejectionReason = reason ?? '';
        await approval.save();
        await this.syncPayrollApprovalFromLeave(approval);
        await this.workflowNotifier?.dispatch({
            module: 'leave_allowance',
            event: 'rejected',
            doc: approval,
        });
        return { status: 200, message: 'Leave batch rejected.' };
    }
    async markLeaveAllowancePostingComplete(user, id) {
        const approval = await this.leaveAllowanceApprovalModel.findById(id).exec();
        if (!approval)
            throw new common_1.NotFoundException('Leave allowance approval not found.');
        if (approval.status !== 'PENDING_POSTING') {
            throw new common_1.BadRequestException('Approval is not in posting stage.');
        }
        const userId = this.normalizeUserId(user?._id) ?? '';
        if (!this.isUserInApprovalList(userId, approval.postingIds)) {
            throw new common_1.ForbiddenException('You are not assigned as a posting user for this leave allowance batch.');
        }
        const userName = this.composeUserName(user) ?? '';
        approval.postingApprovedBy = userId;
        approval.postingApprovedByName = userName;
        approval.postingApprovedAt = new Date();
        approval.status = 'APPROVED';
        approval.currentStage = 'POSTED';
        await approval.save();
        await this.syncPayrollApprovalFromLeave(approval);
        await this.workflowNotifier?.dispatch({
            module: 'leave_allowance',
            event: 'posted',
            doc: approval,
        });
        return { status: 200, message: 'Leave batch marked as posted.' };
    }
    async syncPayrollApprovalFromLeave(leaveApproval) {
        const payrollApprovalId = leaveApproval?.payrollApprovalId;
        if (!payrollApprovalId)
            return;
        try {
            await this.payrollApprovalModel.findByIdAndUpdate(payrollApprovalId, {
                $set: {
                    status: leaveApproval.status,
                    currentStage: leaveApproval.currentStage,
                    reviewerApprovedBy: leaveApproval.reviewerApprovedBy,
                    reviewerApprovedByName: leaveApproval.reviewerApprovedByName,
                    reviewerApprovedAt: leaveApproval.reviewerApprovedAt,
                    reviewerComment: leaveApproval.reviewerComment,
                    approverApprovedBy: leaveApproval.approverApprovedBy,
                    approverApprovedByName: leaveApproval.approverApprovedByName,
                    approverApprovedAt: leaveApproval.approverApprovedAt,
                    postingApprovedBy: leaveApproval.postingApprovedBy,
                    postingApprovedByName: leaveApproval.postingApprovedByName,
                    postingApprovedAt: leaveApproval.postingApprovedAt,
                    rejectionReason: leaveApproval.rejectionReason,
                },
            });
        }
        catch {
        }
    }
};
exports.PayrollService = PayrollService;
PayrollService.SUPER_ADMIN_ROLE_NAMES = access_control_util_1.SUPER_ADMIN_ROLE_NAME_SET;
PayrollService.APPROVER_VIEW_STATUSES = new Set([
    PAYROLL_APPROVAL_STATUS.PENDING_APPROVAL,
    PAYROLL_APPROVAL_STATUS.PENDING_POSTING,
    PAYROLL_APPROVAL_STATUS.APPROVED,
    PAYROLL_APPROVAL_STATUS.REJECTED,
]);
PayrollService.REVIEWER_VIEW_STATUSES = new Set([
    PAYROLL_APPROVAL_STATUS.PENDING_REVIEW,
    PAYROLL_APPROVAL_STATUS.PENDING_APPROVAL,
    PAYROLL_APPROVAL_STATUS.PENDING_POSTING,
    PAYROLL_APPROVAL_STATUS.APPROVED,
]);
PayrollService.POSTER_VIEW_STATUSES = new Set([
    PAYROLL_APPROVAL_STATUS.PENDING_APPROVAL,
    PAYROLL_APPROVAL_STATUS.PENDING_POSTING,
    PAYROLL_APPROVAL_STATUS.APPROVED
]);
PayrollService.FINANCE_AUDIT_VIEW_STATUSES = new Set([
    PAYROLL_APPROVAL_STATUS.PENDING_APPROVAL,
    PAYROLL_APPROVAL_STATUS.PENDING_POSTING,
    PAYROLL_APPROVAL_STATUS.APPROVED,
    PAYROLL_APPROVAL_STATUS.REJECTED,
]);
PayrollService.DEFAULT_APPROVAL_VIEW_STATUSES = new Set([
    PAYROLL_APPROVAL_STATUS.PENDING_REVIEW,
    PAYROLL_APPROVAL_STATUS.PENDING_APPROVAL,
    PAYROLL_APPROVAL_STATUS.PENDING_POSTING,
    PAYROLL_APPROVAL_STATUS.APPROVED,
    PAYROLL_APPROVAL_STATUS.REJECTED,
]);
exports.PayrollService = PayrollService = PayrollService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Payroll')),
    __param(1, (0, mongoose_1.InjectModel)('ProcessedPayroll')),
    __param(2, (0, mongoose_1.InjectModel)(payrollApproval_schema_1.PayrollApproval.name)),
    __param(3, (0, mongoose_1.InjectModel)(leave_allowance_approval_schema_1.LeaveAllowanceApproval.name)),
    __param(7, (0, common_1.Optional)()),
    __param(23, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        subsidiary_service_1.SubsidiaryService,
        user_service_1.StaffService,
        notice_service_1.NoticeService,
        workflow_notifier_service_1.WorkflowNotifier,
        payroll_tax_service_1.PayrollTaxService,
        payroll_notification_service_1.PayrollNotificationService,
        payroll_mapping_service_1.PayrollMappingService,
        payroll_performance_service_1.PayrollPerformanceService,
        payroll_export_service_1.PayrollExportService,
        payroll_payslip_approval_service_1.PayrollPayslipApprovalService,
        payroll_approval_enrichment_service_1.PayrollApprovalEnrichmentService,
        payroll_workflow_config_service_1.PayrollWorkflowConfigService,
        payroll_approval_transition_service_1.PayrollApprovalTransitionService,
        payroll_processed_persistence_service_1.PayrollProcessedPersistenceService,
        payroll_run_service_1.PayrollRunService,
        payroll_attendance_service_1.PayrollAttendanceService,
        payroll_row_display_service_1.PayrollRowDisplayService,
        payroll_identifier_hydration_service_1.PayrollIdentifierHydrationService,
        payroll_approval_read_service_1.PayrollApprovalReadService,
        payroll_gross_adjustment_service_1.PayrollGrossAdjustmentService])
], PayrollService);
//# sourceMappingURL=payroll.service.js.map