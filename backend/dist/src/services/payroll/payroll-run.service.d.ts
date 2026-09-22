import { Model } from 'mongoose';
import { LeaveAllowanceApproval } from 'src/schemas/leave-allowance-approval.schema';
import { PayrollApproval } from 'src/schemas/payrollApproval.schema';
import { StaffService } from 'src/services/user/user.service';
import { SubsidiaryService } from 'src/services/org/subsidiary.service';
import { WorkflowNotifier } from 'src/services/comms/workflow-notifier.service';
export type PayrollRunHandlers = {
    getTemplates: (payload: any, type: any, entity: any, periodInput?: any) => Promise<any>;
    normalizeEntityIdStrict: (value: any) => Promise<string>;
    resolveWorkflowType: (value: any) => 'payroll' | 'leave-allowance';
    assertPayrollRowsHaveAccountAndLevel: (rows: any[]) => void;
    validateWorkflowInitiation: (entityId: string, initiator: any, workflowType: 'payroll' | 'leave-allowance') => Promise<{
        workflow: any;
        reviewerIds: string[];
        approverIds: string[];
        auditViewerIds: string[];
        postingIds: string[];
        initiatorId: string | null;
        entityId: string;
    }>;
    loadEntityPayrollSettings: (entityId: string) => Promise<{
        workingDays: number;
        performanceBrackets: any[];
    }>;
    assertPayrollRowsRespectWorkingDays: (rows: any[], defaultWorkingDays: number) => void;
    resolvePayrollPeriodDate: (value?: any) => Date;
    resolveAttendanceOverride: (payload: any, user: any) => boolean;
    resolveAttendanceHandledOnClient: (payload: any) => boolean;
    normalizePayrollData: (data: any[], options?: {
        workingDays?: number;
        performanceBrackets?: any[];
    }) => any[];
    detectRowType: (row: any) => string;
    resolveAttendanceIdentifierAliases: (rows: any[], entityId?: string) => Promise<Map<string, Set<string>>>;
    resolveLateDeductionEmployees: (rows: any[], periodDate: Date, identifierAliases?: Map<string, Set<string>>) => Promise<Set<string>>;
    applyLateAttendanceDeduction: (rows: any[], deductionIds: Set<string>, defaultWorkingDays: number) => any[];
    resolveAttendanceSummaryByEmployee: (rows: any[], periodDate: Date, identifierAliases?: Map<string, Set<string>>) => Promise<Map<string, {
        absentDays: number;
    }>>;
    applyAbsenceDeduction: (rows: any[], attendanceSummary: Map<string, {
        absentDays: number;
    }>, defaultWorkingDays: number, periodDate: Date) => any[];
    applyProrationForDisplay: (rows: any[], workingDays: number, performanceBrackets?: any[], periodDate?: Date) => any[];
    applyGrossAdjustments?: (rows: any[], entityId: string, periodDate?: Date) => Promise<any[]>;
    hydratePayrollRowIdentifiers: (rows: any[], entityId: string) => Promise<{
        rows: any[];
        changed: boolean;
    }>;
    syncLeaveAllowanceApprovalRecord: (approval: any, options?: {
        forceCreate?: boolean;
    }) => Promise<void>;
    composeUserName: (user: any) => string | undefined;
    resolveEntityName: (entityRef: any) => Promise<string>;
    resolveApprovalMonthLabel: (approval: any) => string;
    notifyStageAssignees: (userIds: string[] | undefined, approvalId: string, entityName: string, monthLabel: string, stage: 'REVIEWER' | 'APPROVER' | 'POSTING') => Promise<void>;
    notifyAuditViewers: (userIds: string[] | undefined, approvalId: string, entityName: string, monthLabel: string) => Promise<void>;
    computeSectionTotals: (rows: any[]) => Record<string, Record<string, number>>;
    toSafeNumber: (value: any, fallback?: number) => number;
    normalizePercent: (value: any, fallback?: number) => number;
    resolvePerformancePercent: (score: number | undefined, brackets?: any[]) => number | undefined;
    round: (value: number, precision?: number) => number;
};
export declare class PayrollRunService {
    private readonly staffService;
    private readonly entityService;
    private readonly payrollApprovalModel;
    private readonly leaveAllowanceApprovalModel;
    private readonly workflowNotifier?;
    constructor(staffService: StaffService, entityService: SubsidiaryService, payrollApprovalModel: Model<PayrollApproval>, leaveAllowanceApprovalModel: Model<LeaveAllowanceApproval>, workflowNotifier?: WorkflowNotifier);
    generatePayroll(payload: any, initiatorOrHandlers: any, maybeHandlers?: PayrollRunHandlers): Promise<any>;
    processPayroll(payload: any, initiator: any, handlers: PayrollRunHandlers): Promise<any>;
    previewPayroll(payload: any, initiator: any, handlers: PayrollRunHandlers): Promise<any>;
    private applyGrossAdjustments;
    private prepareAdjustedRows;
    private expandPreviewRows;
}
