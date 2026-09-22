import mongoose, { Document } from 'mongoose';
export declare class LevelCategory {
    name: string;
}
export type LevelCategoryDocument = LevelCategory & Document;
export declare const LevelCategorySchema: mongoose.Schema<LevelCategory, mongoose.Model<LevelCategory, any, any, any, mongoose.Document<unknown, any, LevelCategory, any, {}> & LevelCategory & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, LevelCategory, mongoose.Document<unknown, {}, mongoose.FlatRecord<LevelCategory>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<LevelCategory> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
