import { Document, Types } from 'mongoose';
export declare class Territory {
    name: string;
    subsidiary: Types.ObjectId;
    type: string;
}
export type TerritoryDocument = Territory & Document;
export declare const TerritorySchema: import("mongoose").Schema<Territory, import("mongoose").Model<Territory, any, any, any, Document<unknown, any, Territory, any, {}> & Territory & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Territory, Document<unknown, {}, import("mongoose").FlatRecord<Territory>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Territory> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
