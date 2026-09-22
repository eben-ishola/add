export type PayrollTaxBracketLike = {
    minIncome?: unknown;
    maxIncome?: unknown;
    rate?: unknown;
    baseTax?: unknown;
};
export type PayrollTaxBracket = {
    minIncome: number;
    maxIncome: number | null;
    rate: number;
    baseTax: number;
};
export type PayrollTaxConfigLike = {
    exemptLimit?: number | null;
    brackets?: PayrollTaxBracketLike[] | PayrollTaxBracket[];
};
export type PayrollTaxConfigUpdate = {
    configName: string;
    currency: string;
    isActive: boolean;
    useProgressiveTaxCalculation: boolean;
    brackets: PayrollTaxBracket[];
    exemptLimit?: number | null;
    effectiveFrom?: Date | null;
    effectiveTo?: Date | null;
    yearPassed?: number | null;
};
export declare const sanitizePayrollTaxBracket: (raw: PayrollTaxBracketLike) => PayrollTaxBracket;
export declare const sanitizePayrollTaxBrackets: (brackets?: PayrollTaxBracketLike[] | PayrollTaxBracket[] | null) => PayrollTaxBracket[];
export declare const computeAnnualPayrollTax: (amount: number, config?: PayrollTaxConfigLike | null) => number;
export declare const computeMonthlyPayrollTax: (amount: number, config?: PayrollTaxConfigLike | null) => number;
export declare const sanitizePayrollTaxConfigUpdate: (payload: any) => PayrollTaxConfigUpdate;
