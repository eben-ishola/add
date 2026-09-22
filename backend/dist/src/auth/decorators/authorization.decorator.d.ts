export declare const REQUIRED_PERMISSIONS_KEY = "authz:requiredPermissions";
export declare const REQUIRED_ROLES_KEY = "authz:requiredRoles";
export type AuthorizationMode = 'any' | 'all';
export type AuthorizationRequirement = {
    values: string[];
    mode: AuthorizationMode;
    message?: string;
};
type AuthorizationOptions = {
    mode?: AuthorizationMode;
    message?: string;
};
export declare const RequirePermissions: (permissions: string | string[], options?: AuthorizationOptions) => import("@nestjs/common").CustomDecorator<string>;
export declare const RequireRoles: (roles: string | string[], options?: AuthorizationOptions) => import("@nestjs/common").CustomDecorator<string>;
export {};
