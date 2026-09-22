import mongoose, { Document } from 'mongoose';
export declare const ROLE_ACCESS_SCOPES: readonly ["group", "entity", "department", "self", "finance"];
export type RoleAccessScope = typeof ROLE_ACCESS_SCOPES[number];
export declare const ROLE_PROFILE_KEYS: readonly ["profile", "supervisor", "admin", "super-admin"];
export type RoleProfileKey = typeof ROLE_PROFILE_KEYS[number];
export declare class Role {
    name: string;
    entity: string;
    app: string;
    description?: string;
    permissions: string[];
    scopes: RoleAccessScope[];
    profileKey: RoleProfileKey;
}
export type RoleDocument = Role & Document;
export declare const RoleSchema: mongoose.Schema<Role, mongoose.Model<Role, any, any, any, mongoose.Document<unknown, any, Role, any, {}> & Role & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Role, mongoose.Document<unknown, {}, mongoose.FlatRecord<Role>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<Role> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
