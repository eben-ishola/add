import { Document } from 'mongoose';
export declare class PayrollPerformance extends Document {
    staffId: string;
    employeeId?: string;
    userId?: string;
    periodKey: string;
    periodLabel?: string;
    periodDate?: Date;
    score: number;
    entity?: string;
}
export type PayrollPerformanceDocument = PayrollPerformance & Document;
export declare const PayrollPerformanceSchema: import("mongoose").Schema<PayrollPerformance, import("mongoose").Model<PayrollPerformance, any, any, any, Document<unknown, any, PayrollPerformance, any, {}> & PayrollPerformance & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PayrollPerformance, Document<unknown, {}, import("mongoose").FlatRecord<PayrollPerformance>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PayrollPerformance> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
