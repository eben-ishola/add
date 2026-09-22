import { Model } from 'mongoose';
import { PayrollApproval } from 'src/schemas/payrollApproval.schema';
import { SubsidiaryService } from 'src/services/org/subsidiary.service';
import { WorkflowNotifier } from 'src/services/comms/workflow-notifier.service';
export type PayrollApprovalTransitionHandlers = {
    syncLeaveAllowanceApprovalRecord: (approval: any, options?: {
        forceCreate?: boolean;
    }) => Promise<void>;
    persistProcessedPayroll: (batchId: string, payrollData: any[], entity: string, periodDate?: Date) => Promise<void>;
    notifyStageAssignees: (userIds: any[] | undefined, approvalId: string, entityName: string, monthLabel?: string, stage?: 'REVIEWER' | 'APPROVER' | 'POSTING') => Promise<void>;
    notifyCompletion: (approval: any, entityName: string) => Promise<void>;
    notifyRejection: (approval: any, entityName: string) => Promise<void>;
    resolveEntityName?: (entityRef: any) => Promise<string>;
};
export declare class PayrollApprovalTransitionService {
    private readonly payrollApprovalModel;
    private readonly entityService;
    private readonly workflowNotifier?;
    constructor(payrollApprovalModel: Model<PayrollApproval>, entityService: SubsidiaryService, workflowNotifier?: WorkflowNotifier);
    approvePayroll(approvalId: string, user: any, comment: string | undefined, handlers: PayrollApprovalTransitionHandlers): Promise<any>;
    rejectPayroll(approvalId: string, user: any, reason: string | undefined, handlers: PayrollApprovalTransitionHandlers): Promise<any>;
    markPostingComplete(approvalId: string, user: any, handlers: Pick<PayrollApprovalTransitionHandlers, 'syncLeaveAllowanceApprovalRecord'>): Promise<any>;
    private assertCanMutate;
    private hasFinanceScope;
    private userHasSuperAdminRole;
    private assertNoExistingApprovedPayroll;
    private resolveProcessingPeriodDate;
    private resolveEntityId;
    private normalizeEntityIdStrict;
    private resolveEntityName;
}
