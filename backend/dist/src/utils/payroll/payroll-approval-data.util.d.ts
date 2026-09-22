export type PayrollWorkflowType = 'payroll' | 'leave-allowance';
export declare const resolvePayrollWorkflowType: (value: any) => PayrollWorkflowType;
export declare const normalizePayrollApprovalTypeToken: (value: unknown) => string | null;
export declare const resolvePayrollApprovalRows: (value: any) => any[];
export declare const isLeaveAllowancePayrollApproval: (approval: any) => boolean;
