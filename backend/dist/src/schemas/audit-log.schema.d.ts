import { Document } from 'mongoose';
export type AuditLogDocument = AuditLog & Document;
export declare class AuditLog {
    action: string;
    method?: string;
    path?: string;
    entity?: string;
    entityId?: string;
    scopeEntityId?: string;
    actor?: {
        id?: string;
        name?: string;
        email?: string;
        roles?: string[];
        profileKey?: string;
    };
    changes?: Record<string, any>;
    params?: Record<string, any>;
    query?: Record<string, any>;
    metadata?: Record<string, any>;
    statusCode?: number;
    success?: boolean;
    error?: string;
    ip?: string;
    userAgent?: string;
    durationMs?: number;
}
export declare const AuditLogSchema: import("mongoose").Schema<AuditLog, import("mongoose").Model<AuditLog, any, any, any, Document<unknown, any, AuditLog, any, {}> & AuditLog & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AuditLog, Document<unknown, {}, import("mongoose").FlatRecord<AuditLog>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<AuditLog> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
