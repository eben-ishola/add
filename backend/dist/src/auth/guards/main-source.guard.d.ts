import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class MainSourceGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
