import mongoose, { Document } from 'mongoose';
export type InconvenienceAllowanceDocument = InconvenienceAllowance & Document;
export declare class InconvenienceAllowance {
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
export declare const InconvenienceAllowanceSchema: mongoose.Schema<InconvenienceAllowance, mongoose.Model<InconvenienceAllowance, any, any, any, mongoose.Document<unknown, any, InconvenienceAllowance, any, {}> & InconvenienceAllowance & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, InconvenienceAllowance, mongoose.Document<unknown, {}, mongoose.FlatRecord<InconvenienceAllowance>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<InconvenienceAllowance> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
