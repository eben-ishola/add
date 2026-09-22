import mongoose, { Document } from 'mongoose';
export declare class Level {
    name: string;
    category?: mongoose.Types.ObjectId | null;
}
export type LevelDocument = Level & Document;
export declare const LevelSchema: mongoose.Schema<Level, mongoose.Model<Level, any, any, any, mongoose.Document<unknown, any, Level, any, {}> & Level & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Level, mongoose.Document<unknown, {}, mongoose.FlatRecord<Level>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<Level> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
