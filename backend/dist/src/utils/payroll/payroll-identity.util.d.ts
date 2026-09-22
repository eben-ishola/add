export declare const normalizePayrollEntityKey: (value: any) => string | null;
export declare const resolvePayrollEntityId: (input: any) => string | undefined;
export declare const parsePayrollBooleanFlag: (value: any) => boolean;
export declare const normalizePayrollUserId: (value: any) => string | null;
export declare const normalizePayrollUserIdList: (values?: any) => string[];
export declare const collectPayrollIdentifierValues: (...values: any[]) => string[];
export declare const buildPayrollStaffIdentityQuery: (identifiers: string[]) => Record<string, any>;
export declare const buildProcessedPayrollEntityMatch: (entityId?: string) => Record<string, any>;
