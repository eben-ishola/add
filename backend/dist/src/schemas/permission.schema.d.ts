import { Document } from 'mongoose';
export declare class Permission {
    name: string;
    description: string;
    domain?: string;
    action?: string;
}
export type PermissionDocument = Permission & Document;
export declare const PermissionSchema: import("mongoose").Schema<Permission, import("mongoose").Model<Permission, any, any, any, Document<unknown, any, Permission, any, {}> & Permission & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Permission, Document<unknown, {}, import("mongoose").FlatRecord<Permission>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Permission> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
