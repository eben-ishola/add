import { Document, Types } from 'mongoose';
export declare class PayrollMap extends Document {
    level: string;
    amount: number;
    afta?: number;
    entity: Types.ObjectId;
}
export declare const PayrollMapSchema: import("mongoose").Schema<PayrollMap, import("mongoose").Model<PayrollMap, any, any, any, Document<unknown, any, PayrollMap, any, {}> & PayrollMap & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PayrollMap, Document<unknown, {}, import("mongoose").FlatRecord<PayrollMap>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PayrollMap> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
