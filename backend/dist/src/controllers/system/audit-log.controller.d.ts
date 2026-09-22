import { AuditLogService } from 'src/services/system/audit-log.service';
export declare class AuditLogController {
    private readonly auditLogService;
    constructor(auditLogService: AuditLogService);
    findAll(user: any, query: any): Promise<{
        data: (import("mongoose").FlattenMaps<import("../../schemas/audit-log.schema").AuditLogDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findOne(user: any, id: string): Promise<import("mongoose").FlattenMaps<import("../../schemas/audit-log.schema").AuditLogDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
}
