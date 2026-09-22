import { Document } from 'mongoose';
export declare class LevelCategory {
    name: string;
}
export type LevelCategoryDocument = LevelCategory & Document;
export declare const LevelCategorySchema: import("mongoose").Schema<LevelCategory, import("mongoose").Model<LevelCategory, any, any, any, Document<unknown, any, LevelCategory, any, {}> & LevelCategory & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LevelCategory, Document<unknown, {}, import("mongoose").FlatRecord<LevelCategory>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<LevelCategory> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
