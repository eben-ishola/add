import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare const PROCUREMENT_SETTINGS_PERMISSION = "manage procurement settings";
export declare class ProcurementAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
