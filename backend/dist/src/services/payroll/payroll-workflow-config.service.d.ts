import { Model } from 'mongoose';
import { LeaveAllowanceWorkflowConfig } from 'src/schemas/leave-allowance-workflow.schema';
import { PayrollWorkflowConfig } from 'src/schemas/payroll-workflow.schema';
import { SubsidiaryService } from 'src/services/org/subsidiary.service';
export type PayrollWorkflowConfigLoad = {
    workflow: PayrollWorkflowConfig;
    reviewerIds: string[];
    approverIds: string[];
    auditViewerIds: string[];
    postingIds: string[];
    entityId: string;
};
export type LeaveAllowanceWorkflowConfigLoad = {
    workflow: LeaveAllowanceWorkflowConfig;
    reviewerIds: string[];
    approverIds: string[];
    auditViewerIds: string[];
    postingIds: string[];
    entityId: string;
};
type WorkflowInitiationLoad = (PayrollWorkflowConfigLoad & {
    initiatorId: string | null;
}) | (LeaveAllowanceWorkflowConfigLoad & {
    initiatorId: string | null;
});
export declare class PayrollWorkflowConfigService {
    private readonly payrollWorkflowModel;
    private readonly leaveAllowanceWorkflowModel;
    private readonly entityService;
    constructor(payrollWorkflowModel: Model<PayrollWorkflowConfig>, leaveAllowanceWorkflowModel: Model<LeaveAllowanceWorkflowConfig>, entityService: SubsidiaryService);
    private hasFinanceScope;
    private userHasSuperAdminRole;
    private buildWorkflowMemberQuery;
    private assertSuperAdmin;
    private normalizeEntityIdStrict;
    loadPayrollWorkflowConfig(entityId: string): Promise<PayrollWorkflowConfigLoad>;
    validatePayrollInitiation(entityId: string, initiator: any): Promise<PayrollWorkflowConfigLoad & {
        initiatorId: string | null;
    }>;
    loadLeaveAllowanceWorkflowConfig(entityId: string): Promise<LeaveAllowanceWorkflowConfigLoad>;
    validateLeaveAllowanceInitiation(entityId: string, initiator: any): Promise<LeaveAllowanceWorkflowConfigLoad & {
        initiatorId: string | null;
    }>;
    validateWorkflowInitiation(entityId: string, initiator: any, workflowType: 'payroll' | 'leave-allowance'): Promise<WorkflowInitiationLoad>;
    getPayrollWorkflowConfigs(user: any, entity?: string): Promise<any>;
    savePayrollWorkflowConfig(user: any, payload: any): Promise<any>;
    getLeaveAllowanceWorkflowConfigs(user: any, entity?: string): Promise<any>;
    saveLeaveAllowanceWorkflowConfig(user: any, payload: any): Promise<any>;
    getPayrollWorkflowRole(user: any, entity?: string, scanAll?: boolean): Promise<any>;
    getLeaveAllowanceWorkflowRole(user: any, entity?: string, scanAll?: boolean): Promise<any>;
    private assertWorkflowCanInitiate;
    private assertWorkflowSelections;
    private getWorkflowRoleFromModel;
    private emptyWorkflowRole;
}
export {};
