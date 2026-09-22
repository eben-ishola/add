import { Document, Types } from 'mongoose';
export type DocumentReadDocument = DocumentRead & Document;
export declare class DocumentRead {
    documentId: Types.ObjectId;
    userId: Types.ObjectId;
    version: number;
    readAt: Date;
}
export declare const DocumentReadSchema: import("mongoose").Schema<DocumentRead, import("mongoose").Model<DocumentRead, any, any, any, Document<unknown, any, DocumentRead, any, {}> & DocumentRead & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DocumentRead, Document<unknown, {}, import("mongoose").FlatRecord<DocumentRead>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<DocumentRead> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
