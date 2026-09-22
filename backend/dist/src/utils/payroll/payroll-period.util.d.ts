export type PayrollPeriodWindow = {
    periodKey: string;
    periodLabel: string;
    periodDate: Date;
    start: Date;
    end: Date;
};
export type PayrollPerformancePeriod = {
    periodKey: string;
    periodLabel: string;
    periodDate: Date;
};
export declare const buildPayrollPeriodKey: (date: Date) => string;
export declare const formatPayrollMonthLabel: (value?: Date | string | null) => string;
export declare const resolvePayslipPeriodWindow: (raw: any) => PayrollPeriodWindow;
export declare const resolvePerformancePeriod: (raw?: any, now?: Date) => PayrollPerformancePeriod;
export declare const resolveDateValue: (value: any) => Date | null;
export declare const resolvePayrollPeriodDate: (value?: any, now?: Date) => Date;
export declare const isSamePayrollMonth: (left: Date | null, right: Date) => boolean;
export declare const shiftPayrollMonth: (source: Date, offset: number) => Date;
