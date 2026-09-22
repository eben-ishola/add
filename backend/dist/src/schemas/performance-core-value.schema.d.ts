import mongoose, { Document } from 'mongoose';
export type PerformanceCoreValueDocument = PerformanceCoreValue & Document;
export declare class PerformanceCoreValue {
    entity: mongoose.Schema.Types.ObjectId;
    title: string;
    description?: string;
    weight?: number;
    raters?: string[];
    isActive?: boolean;
}
export declare const PerformanceCoreValueSchema: mongoose.Schema<PerformanceCoreValue, mongoose.Model<PerformanceCoreValue, any, any, any, mongoose.Document<unknown, any, PerformanceCoreValue, any, {}> & PerformanceCoreValue & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, PerformanceCoreValue, mongoose.Document<unknown, {}, mongoose.FlatRecord<PerformanceCoreValue>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<PerformanceCoreValue> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
