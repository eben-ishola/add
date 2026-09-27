export type PayrollCalloverComparisonStatus = 'matched' | 'mismatch' | 'missing' | 'unexpected';
export type PayrollCalloverComparisonRow = {
    account: string;
    payrollAmount: number;
    calloverAmount: number;
    difference: number;
    status: PayrollCalloverComparisonStatus;
    flag: boolean;
};
export type PayrollCalloverComparisonSummary = {
    calloverCount: number;
    payrollCount: number;
    matched: number;
    mismatched: number;
    missing: number;
    unexpected: number;
    hasIssues: boolean;
    comparisonSkipped: false;
};
type GenericPayrollRow = Record<string, any> | null | undefined;
export declare const normalizePayrollAccount: (value: unknown) => string | null;
export declare const parsePayrollAmount: (value: unknown) => number;
export declare const extractCalloverAccount: (row: GenericPayrollRow) => string | null;
export declare const extractCalloverAmount: (row: GenericPayrollRow) => number;
export declare const extractPayrollAccount: (row: GenericPayrollRow) => string | null;
export declare const extractPayrollAmount: (row: GenericPayrollRow, typeOverride?: string) => number;
export declare const buildAccountTotals: <Row>(rows: Row[], extractAccount: (row: Row) => string | null, extractAmount: (row: Row) => number) => Map<string, number>;
export declare const buildPayrollCalloverComparison: (calloverRows: GenericPayrollRow[], payrollRows: GenericPayrollRow[], typeOverride?: string) => {
    comparison: PayrollCalloverComparisonRow[];
    summary: PayrollCalloverComparisonSummary;
};
export declare const calloverExitNames: (rows: GenericPayrollRow[]) => string[];
export declare const buildCalloverNarrationPattern: (narration: string, exitNames?: string[]) => string;
export declare const fetchCalloverRows: (narration: string, payrollRows: GenericPayrollRow[], fetchCallover: (narration: string) => Promise<{
    data?: any[];
} | undefined>) => Promise<any[]>;
export {};
