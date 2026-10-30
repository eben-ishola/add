import { Document, Types } from 'mongoose';
export type AuthSessionDocument = AuthSession & Document;
export type AuthSessionScope = 'full' | 'exit-clearance';
export declare class AuthSession {
    user: Types.ObjectId;
    tokenHash: string;
    previousTokenHash?: string | null;
    rotatedAt?: Date | null;
    accessScope: AuthSessionScope;
    mfaVerified: boolean;
    source: string;
    idleExpiresAt: Date;
    expiresAt: Date;
    lastUsedAt: Date;
    revokedAt?: Date | null;
    revokedReason?: string | null;
}
export declare const AuthSessionSchema: import("mongoose").Schema<AuthSession, import("mongoose").Model<AuthSession, any, any, any, Document<unknown, any, AuthSession, any, {}> & AuthSession & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AuthSession, Document<unknown, {}, import("mongoose").FlatRecord<AuthSession>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<AuthSession> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
