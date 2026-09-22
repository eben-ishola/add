import { Document, Types } from 'mongoose';
export type NoticeDocument = Notice & Document;
export declare class Notice {
    userId: Types.ObjectId;
    message: string;
    read: boolean;
    link?: string;
    type?: string;
}
export declare const NoticeSchema: import("mongoose").Schema<Notice, import("mongoose").Model<Notice, any, any, any, Document<unknown, any, Notice, any, {}> & Notice & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Notice, Document<unknown, {}, import("mongoose").FlatRecord<Notice>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Notice> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
