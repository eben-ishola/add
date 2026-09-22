import mongoose, { Document } from 'mongoose';
export type InconvenienceAllowanceSettingDocument = InconvenienceAllowanceSetting & Document;
export declare class InconvenienceAllowanceSetting {
    entity: mongoose.Types.ObjectId;
    inconvenienceLevel: string;
    amount: number;
}
export declare const InconvenienceAllowanceSettingSchema: mongoose.Schema<InconvenienceAllowanceSetting, mongoose.Model<InconvenienceAllowanceSetting, any, any, any, mongoose.Document<unknown, any, InconvenienceAllowanceSetting, any, {}> & InconvenienceAllowanceSetting & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, InconvenienceAllowanceSetting, mongoose.Document<unknown, {}, mongoose.FlatRecord<InconvenienceAllowanceSetting>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<InconvenienceAllowanceSetting> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
