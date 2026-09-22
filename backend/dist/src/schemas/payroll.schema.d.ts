import { Document, Types } from 'mongoose';
export type PayrollPerformanceBracket = {
    minScore: number;
    maxScore?: number | null;
    percent: number;
};
export declare const DEFAULT_PERFORMANCE_BRACKETS: PayrollPerformanceBracket[];
export declare class Payroll extends Document {
    basic: number;
    housing: number;
    transport: number;
    dress: number;
    utilities: number;
    lunch: number;
    telephone: number;
    reimbursable: number;
    variable: number;
    leave: number;
    pension: number;
    companyPension: number;
    nhf: number;
    craRelief: number;
    fixedCra: number;
    workingDays: number;
    entity: Types.ObjectId;
    autoPayroll: boolean;
    payrollProvider: string;
    payrollEmail: string;
    salaryAccount: string;
    payeAccount: string;
    nhfAccount: string;
    staffPensionAccount: string;
    companyPensionAccount: string;
    companyGL: string;
    reimbursableAccount: string;
    bankPartAccount: string;
    individualAccount: string;
    exitAccount: string;
    enableSplit: boolean;
    splitPayments: any[];
    performanceBrackets: PayrollPerformanceBracket[];
    pensionAmount: number;
    nhfAmount: number;
    cra: number;
    craReliefAmount: number;
    taxRelief: number;
    taxAbleIncome: number;
    annualTax: number;
    annualNet: number;
    monthlyNet: number;
    monthlyReimbursable: number;
    monthlyVariable: number;
    totalMonthlyNet: number;
    monthlyGross: number;
    dailyPayment: number;
}
export declare const PayrollSchema: import("mongoose").Schema<Payroll, import("mongoose").Model<Payroll, any, any, any, Document<unknown, any, Payroll, any, {}> & Payroll & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Payroll, Document<unknown, {}, import("mongoose").FlatRecord<Payroll>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Payroll> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
