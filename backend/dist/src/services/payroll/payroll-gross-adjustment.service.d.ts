import { PayrollSalaryBreakdownSettings } from 'src/utils/payroll/payroll-calculation.util';
export type PayrollGrossAdjustmentHandlers = {
    loadSalaryBreakdownSettings: (entityId: string) => Promise<PayrollSalaryBreakdownSettings>;
    computeTaxForAnnualIncome: (annualTaxableIncome: number) => Promise<number>;
};
export type PayrollGrossAdjustmentOptions = {
    periodDate?: Date;
};
export declare class PayrollGrossAdjustmentService {
    resolveGrossAdjustment(row: any): number;
    isGrossAdjustmentApplied(row: any): boolean;
    applyGrossAdjustments(rows: any[], entityId: string, handlers: PayrollGrossAdjustmentHandlers, options?: PayrollGrossAdjustmentOptions): Promise<any[]>;
    private applyToRow;
    private resolveTaxableIncome;
}
