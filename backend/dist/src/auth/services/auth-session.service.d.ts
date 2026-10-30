import { Model } from 'mongoose';
import { AuthSessionDocument, AuthSessionScope } from 'src/schemas/auth-session.schema';
export declare const ACCESS_TOKEN_TTL_SECONDS: number;
export declare const SESSION_IDLE_TTL_MS: number;
export declare const DEFAULT_SESSION_MAX_HOURS = 12;
export declare const REFRESH_REUSE_GRACE_MS: number;
export declare const resolveSessionMaxMs: (hours: unknown) => number;
export declare const SESSION_ENDED_MESSAGE = "Your session has ended. Sign in again.";
export type SessionGrant = {
    sessionId: string;
    refreshToken: string;
    expiresAt: Date;
};
export type SessionHandle = Pick<SessionGrant, 'sessionId' | 'expiresAt'>;
export type RotatedSession = SessionGrant & {
    userId: string;
    accessScope: AuthSessionScope;
    mfaVerified: boolean;
    source: string;
};
export declare const hashRefreshToken: (raw: string) => string;
export declare const accessTokenTtlSeconds: (sessionExpiresAt: Date, now?: Date) => number;
export declare class AuthSessionService {
    private readonly sessionModel;
    constructor(sessionModel: Model<AuthSessionDocument>);
    start(input: {
        userId: string;
        accessScope: AuthSessionScope;
        mfaVerified: boolean;
        source: string;
    }, now?: Date): Promise<SessionGrant>;
    rotate(rawToken: string, now?: Date): Promise<RotatedSession>;
    findActive(sessionId: string | undefined, userId: string, now?: Date): Promise<SessionHandle | null>;
    updateScope(sessionId: string, accessScope: AuthSessionScope): Promise<void>;
    revoke(rawToken: string, reason: string, now?: Date): Promise<void>;
    revokeSession(sessionId: string, reason: string, now?: Date): Promise<void>;
    revokeAllForUser(userId: string, options: {
        reason: string;
        except?: string;
    }, now?: Date): Promise<void>;
    private revokeIfReused;
}
