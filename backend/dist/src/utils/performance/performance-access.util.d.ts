export declare const userHasPerformancePermission: (user: any, required: string | string[]) => boolean;
export declare const userHasPerformanceSuperAdminRole: (user: any) => boolean;
export declare const userHasPerformanceAdminRole: (user: any) => boolean;
export declare const userHasPerformanceWorkflowRole: (user: any) => boolean;
export declare const canManagePerformanceWorkflow: (user: any) => boolean;
export declare const assertCanManagePerformanceWorkflow: (user: any) => void;
