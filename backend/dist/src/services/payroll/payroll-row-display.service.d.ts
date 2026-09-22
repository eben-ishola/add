import { PayrollPerformanceBracketLike } from 'src/utils/payroll/payroll-proration.util';
export type PayrollRowDisplayHandlers = {
    normalizeEntityIdStrict: (value: any) => Promise<string>;
    loadEntityPayrollSettings: (entityId: string) => Promise<{
        workingDays: number;
        performanceBrackets: PayrollPerformanceBracketLike[];
    }>;
};
export declare class PayrollRowDisplayService {
    buildApprovalDisplayData(rows: any[], entity: any, periodDate: Date | undefined, handlers: PayrollRowDisplayHandlers): Promise<{
        rows: any[];
        types: string[];
    }>;
    normalizePayrollData(data: any[], options?: {
        workingDays?: number;
        performanceBrackets?: PayrollPerformanceBracketLike[];
    }): any[];
    private resolveNetAdjustment;
    private isNetAdjustmentApplied;
    applyProrationForDisplay(rows: any[], workingDays: number, performanceBrackets?: PayrollPerformanceBracketLike[], periodDate?: Date): any[];
    computeSectionTotals(rows: any[]): Record<string, Record<string, number>>;
    detectRowType(row: any): string;
    toSafeNumber(value: any, fallback?: number): number;
    normalizePercent(value: any, fallback?: number): number;
    resolvePerformancePercent(score: number | undefined, brackets?: PayrollPerformanceBracketLike[]): number | undefined;
    round(value: number, precision?: number): number;
    private normalizePayrollText;
    private withoutVariablePerformanceFields;
    private expandApprovalDisplayRows;
    private expandSalaryDisplayRow;
    private expandVariableDisplayRow;
}
