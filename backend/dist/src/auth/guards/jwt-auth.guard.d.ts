import { ExecutionContext } from '@nestjs/common';
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    handleRequest<TUser = unknown>(error: unknown, user: TUser | null | false | undefined, info?: unknown, context?: ExecutionContext): TUser;
}
export {};
