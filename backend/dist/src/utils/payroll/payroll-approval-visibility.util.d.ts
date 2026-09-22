export type PayrollApprovalVisibilityOptions = {
    approverViewStatuses: ReadonlySet<string>;
    posterViewStatuses: ReadonlySet<string>;
    financeAuditViewStatuses: ReadonlySet<string>;
    hasFinanceScope: (user: any) => boolean;
    isAuditDepartment: (user: any) => boolean;
    hasSuperAdminRole: (user: any) => boolean;
};
export declare const getPayrollUserIdentifierSet: (user: any) => Set<string>;
export declare const payrollListIncludesUserIdentifier: (values: any, identifierSet: Set<string>) => boolean;
export declare const isPayrollApprovalInitiator: (user: any, approval: any) => boolean;
export declare const isPayrollApprovalReviewer: (user: any, approval: any) => boolean;
export declare const isPayrollApprovalApprover: (user: any, approval: any) => boolean;
export declare const isPayrollApprovalPoster: (user: any, approval: any) => boolean;
export declare const isPayrollApprovalAuditViewer: (user: any, approval: any) => boolean;
export declare const canViewPayrollFinanceOrAudit: (user: any, approval: any, options: Pick<PayrollApprovalVisibilityOptions, "financeAuditViewStatuses" | "hasFinanceScope" | "isAuditDepartment">) => boolean;
export declare const canViewPayrollApproval: (user: any, approval: any, options: PayrollApprovalVisibilityOptions) => boolean;
export declare const isPayslipApprovalReviewer: (user: any, approval: any) => boolean;
export declare const isPayslipApprovalApprover: (user: any, approval: any) => boolean;
