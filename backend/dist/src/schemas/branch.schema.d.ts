import { Document, Types } from 'mongoose';
export declare class Branch {
    name: string;
    gl: string;
    entity?: Types.ObjectId | null;
    latitude?: number;
    longitude?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export type BranchDocument = Document & Branch;
export declare const BranchSchema: import("mongoose").Schema<Branch, import("mongoose").Model<Branch, any, any, any, Document<unknown, any, Branch, any, {}> & Branch & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Branch, Document<unknown, {}, import("mongoose").FlatRecord<Branch>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Branch> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
