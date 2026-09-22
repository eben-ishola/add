import { Document } from 'mongoose';
export declare class ProcessedPayroll extends Document {
    name: string;
    staffId: string;
    account: string;
    accountNo: string;
    narration?: string;
    exitRedirected?: boolean;
    userId?: string;
    staffObjectId?: string;
    employeeId?: string;
    periodKey?: string;
    period?: string;
    periodDate?: Date;
    grade: string;
    basic: string;
    housing: string;
    transport: string;
    dress: string;
    utilities: string;
    lunch: string;
    telephone: string;
    gross: string;
    nhf: string;
    pension: string;
    companyPension: string;
    paye: string;
    payeAccount: string;
    nhfAccount: string;
    pensionAccount: string;
    pensionProvider: string;
    amount: string;
    type: string;
    entity: string;
    batchId: string;
    branch: string;
    status: string;
    payslipApproval?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const ProcessedPayrollSchema: import("mongoose").Schema<ProcessedPayroll, import("mongoose").Model<ProcessedPayroll, any, any, any, Document<unknown, any, ProcessedPayroll, any, {}> & ProcessedPayroll & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProcessedPayroll, Document<unknown, {}, import("mongoose").FlatRecord<ProcessedPayroll>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ProcessedPayroll> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
