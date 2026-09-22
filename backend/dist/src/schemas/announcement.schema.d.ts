import { Document, Types } from 'mongoose';
export type AnnouncementDocument = Announcement & Document;
export declare class Announcement {
    title: string;
    content: string;
    contentType: 'text' | 'image';
    imageUrl?: string;
    type: string;
    date: Date;
    pinned: boolean;
    expiresAt?: Date;
    audienceScope: 'ALL' | 'SELECTED';
    targetEntities: Types.ObjectId[];
    readBy: Types.ObjectId[];
}
export declare const AnnouncementSchema: import("mongoose").Schema<Announcement, import("mongoose").Model<Announcement, any, any, any, Document<unknown, any, Announcement, any, {}> & Announcement & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Announcement, Document<unknown, {}, import("mongoose").FlatRecord<Announcement>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Announcement> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
