import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuditLogService } from 'src/services/system/audit-log.service';
export declare class AuditLogInterceptor implements NestInterceptor {
    private readonly auditLogService;
    constructor(auditLogService: AuditLogService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private resolvePath;
    private resolveResponseChanges;
    private extractPendingChanges;
    private shouldSkipPath;
    private resolveAction;
    private matchPostActionVerb;
    private hasIdParam;
    private resolveEntity;
    private resolveEntityId;
    private resolveScopeEntityId;
    private resolveHeaderEntityId;
    private normalizeId;
    private resolveIp;
    private resolveUserAgent;
    private normalizePayload;
    private isEmptyPayload;
    private sanitizePayload;
    private shouldRedactKey;
    private resolveErrorMessage;
}
