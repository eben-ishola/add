import mongoose, { Document } from 'mongoose';
export type TransportAllowanceSettingDocument = TransportAllowanceSetting & Document;
export declare class TransportAllowanceSetting {
    entity: mongoose.Types.ObjectId;
    transportLevel: string;
    amount: number;
}
export declare const TransportAllowanceSettingSchema: mongoose.Schema<TransportAllowanceSetting, mongoose.Model<TransportAllowanceSetting, any, any, any, mongoose.Document<unknown, any, TransportAllowanceSetting, any, {}> & TransportAllowanceSetting & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, TransportAllowanceSetting, mongoose.Document<unknown, {}, mongoose.FlatRecord<TransportAllowanceSetting>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<TransportAllowanceSetting> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
