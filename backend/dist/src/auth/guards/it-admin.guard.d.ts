import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class ItAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
