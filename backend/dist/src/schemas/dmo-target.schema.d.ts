import { Document } from 'mongoose';
export type DMOTargetDocument = DMOTarget & Document;
export declare class DMOTarget {
    lengthOfService: string;
    accountOpeningTarget: number;
    activeSavers?: number;
}
export declare const DMOTargetSchema: import("mongoose").Schema<DMOTarget, import("mongoose").Model<DMOTarget, any, any, any, Document<unknown, any, DMOTarget, any, {}> & DMOTarget & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DMOTarget, Document<unknown, {}, import("mongoose").FlatRecord<DMOTarget>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<DMOTarget> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
