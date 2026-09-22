export type PayrollPerformanceBracketLike = {
    minScore: number;
    maxScore?: number | null;
    percent: number;
};
export type PayrollProrationDetails = {
    workedDays: number;
    baseDays: number;
    factor: number;
};
export type PayrollProrationOptions = {
    type?: string;
    periodDate?: Date;
    includeAttendance?: boolean;
    respectProvided?: boolean;
};
export declare const detectPayrollRowType: (row: any) => string;
export declare const resolvePayrollProrationDetails: (item: any, defaultBase: number, options?: PayrollProrationOptions) => PayrollProrationDetails;
export declare const resolvePayrollProrationFactor: (item: any, defaultBase: number, options?: PayrollProrationOptions) => number;
export declare const resolvePayrollPerformancePercent: (score: number | undefined, brackets?: PayrollPerformanceBracketLike[]) => number | undefined;
export declare const normalizePayrollPerformanceBrackets: (data: any) => PayrollPerformanceBracketLike[];
