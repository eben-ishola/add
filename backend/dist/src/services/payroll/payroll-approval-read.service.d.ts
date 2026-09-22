import { Model } from 'mongoose';
import { PayrollApproval } from 'src/schemas/payrollApproval.schema';
import { User } from 'src/schemas/user.schema';
import { StaffService } from 'src/services/user/user.service';
export type PayrollApprovalReadStatusSets = {
    approverViewStatuses: Set<string>;
    reviewerViewStatuses: Set<string>;
    posterViewStatuses: Set<string>;
    financeAuditViewStatuses: Set<string>;
    defaultApprovalViewStatuses: Set<string>;
};
export type PayrollApprovalReadHandlers = {
    normalizeUserId: (value: any) => string | null;
    collectIdentifierValues: (...values: any[]) => string[];
    userHasSuperAdminRole: (user: any) => boolean;
    hasFinanceScope: (user: any) => boolean;
    isAuditDepartment: (user: any) => boolean;
    resolveEntityId: (value: any) => string | undefined;
    normalizeEntityIdStrict: (value: any) => Promise<string>;
    canViewPayrollApproval: (user: any, approval: PayrollApproval) => boolean;
    resolvePayrollApprovalRows: (value: any) => any[];
    buildApprovalDisplayData: (rows: any[], entity: any, periodDate?: Date) => Promise<{
        rows: any[];
        types: string[];
    }>;
    computeSectionTotals: (rows: any[]) => Record<string, Record<string, number>>;
    enrichPayrollApprovals: (approvals: any[], entityHint?: any) => Promise<any[]>;
    statusSets: PayrollApprovalReadStatusSets;
};
type GetPayrollApprovalsParams = {
    user: any;
    status?: string;
    entity?: string;
    approverOnly?: boolean;
    assignedOnly?: boolean;
    userIdFilter?: string;
    workflowType?: string;
    month?: number;
    year?: number;
};
export declare class PayrollApprovalReadService {
    private readonly payrollApprovalModel;
    private readonly staffModel;
    private readonly staffService;
    constructor(payrollApprovalModel: Model<PayrollApproval>, staffModel: Model<User>, staffService: StaffService);
    getPayrollApprovals(params: GetPayrollApprovalsParams, handlers: PayrollApprovalReadHandlers): Promise<any>;
    getApprovalStaff(user: any, approvalId: string, handlers: PayrollApprovalReadHandlers): Promise<any>;
    getPayrollApprovalById(user: any, approvalId: string, handlers: PayrollApprovalReadHandlers): Promise<any>;
    getProcessedPayrollById(user: any, id: string, handlers: PayrollApprovalReadHandlers): Promise<any>;
    private normalizeIdentifierList;
    private applyFinanceEntityScope;
    private applyRoleStatusScope;
    private buildParticipantRoleFilters;
    private getApprovalActorPopulate;
    private withApprovalDisplayBreakdown;
    private buildApprovalDetailPayload;
    private resolveApprovalPeriodDate;
}
export {};
