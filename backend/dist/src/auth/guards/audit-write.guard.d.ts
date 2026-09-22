import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class AuditWriteGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
    private isAuditUser;
    private collectRoleNames;
}
