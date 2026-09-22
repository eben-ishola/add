import { Document } from 'mongoose';
export type NotificationDispatchDocument = NotificationDispatch & Document;
export declare class NotificationDispatch {
    key: string;
    channel?: string;
    context?: Record<string, any>;
    sentAt: Date;
    expiresAt?: Date;
}
export declare const NotificationDispatchSchema: import("mongoose").Schema<NotificationDispatch, import("mongoose").Model<NotificationDispatch, any, any, any, Document<unknown, any, NotificationDispatch, any, {}> & NotificationDispatch & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, NotificationDispatch, Document<unknown, {}, import("mongoose").FlatRecord<NotificationDispatch>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<NotificationDispatch> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
