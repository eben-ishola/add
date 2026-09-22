import mongoose, { Document } from 'mongoose';
export type TransportAllowanceDocument = TransportAllowance & Document;
export declare class TransportAllowance {
    entity: mongoose.Types.ObjectId;
    department: mongoose.Types.ObjectId;
    staff: mongoose.Types.ObjectId;
    staffId?: string;
    staffName?: string;
    addosserAccount?: string;
    year: number;
    month: number;
    weekOfMonth: number;
    baseDays: number;
    days: number;
    baseAmount: number;
    proratedAmount: number;
    branch?: mongoose.Types.ObjectId;
    branchName?: string;
    branchGL?: string;
}
export declare const TransportAllowanceSchema: mongoose.Schema<TransportAllowance, mongoose.Model<TransportAllowance, any, any, any, mongoose.Document<unknown, any, TransportAllowance, any, {}> & TransportAllowance & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, TransportAllowance, mongoose.Document<unknown, {}, mongoose.FlatRecord<TransportAllowance>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<TransportAllowance> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
