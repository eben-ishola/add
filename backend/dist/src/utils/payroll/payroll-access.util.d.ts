export declare const PAYROLL_AUDIT_READ_PERMISSIONS: Set<string>;
export declare const extractPayrollRoleNames: (roleLike: any) => string[];
export declare const extractPayrollPermissionNames: (user: any) => Set<string>;
export declare const isPayrollAuditDepartment: (user: any) => boolean;
export declare const payrollUserHasPermission: (user: any, required: string | string[]) => boolean;
export declare const payrollUserHasSuperAdminRole: (user: any, superAdminRoleNames: ReadonlySet<string>) => boolean;
