import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { MailService } from 'src/services/comms/mail.service';
import { MfaService } from './mfa.service';
import { ExitClearanceDocument } from 'src/schemas/exit-clearance.schema';
import { AuthSessionService } from './auth-session.service';
export declare class AuthService {
    private readonly staffModel;
    private readonly jwtService;
    private readonly mailService?;
    private readonly mfaService?;
    private readonly clearanceModel?;
    private readonly sessionService?;
    constructor(staffModel: Model<User>, jwtService: JwtService, mailService?: MailService, mfaService?: MfaService, clearanceModel?: Model<ExitClearanceDocument>, sessionService?: AuthSessionService);
    validateUser(identifier: string, password: string): Promise<any>;
    private buildIdentifierQuery;
    private getAuthCollation;
    private isDefaultPassword;
    private hasLeft;
    hasOpenClearance(userId: any): Promise<boolean>;
    private latestClearanceStatus;
    private hasExitDatePassed;
    private assertUserCanSignIn;
    private signSessionToken;
    private createAccessToken;
    private createExitClearanceToken;
    private startSession;
    private refreshTokenFields;
    private isMfaEffectivelyRequired;
    private createMfaSetupToken;
    signIn(rawIdentifier: string, password: string, mfaTrustToken?: string, rawSource?: unknown): Promise<{
        user: any;
        default: boolean;
        exitClearanceOnly: boolean;
        refreshToken: string;
        refresh_token: string;
        accessToken: string;
        access_token: string;
        mfaRequired?: undefined;
        mfaChallengeToken?: undefined;
        mfaSetupRequired?: undefined;
    } | {
        user: any;
        default: boolean;
        exitClearanceOnly: boolean;
        refreshToken?: undefined;
        refresh_token?: undefined;
        accessToken: string;
        access_token: string;
        mfaRequired?: undefined;
        mfaChallengeToken?: undefined;
        mfaSetupRequired?: undefined;
    } | {
        user: any;
        default: boolean;
        mfaTrusted: boolean;
        refreshToken: string;
        refresh_token: string;
        accessToken: string;
        access_token: string;
        mfaRequired?: undefined;
        mfaChallengeToken?: undefined;
        mfaSetupRequired?: undefined;
    } | {
        user: any;
        default: boolean;
        mfaTrusted: boolean;
        refreshToken?: undefined;
        refresh_token?: undefined;
        accessToken: string;
        access_token: string;
        mfaRequired?: undefined;
        mfaChallengeToken?: undefined;
        mfaSetupRequired?: undefined;
    } | {
        mfaRequired: boolean;
        mfaChallengeToken: string;
        mfaSetupRequired?: undefined;
        accessToken?: undefined;
        access_token?: undefined;
        user?: undefined;
        default?: undefined;
    } | {
        mfaSetupRequired: boolean;
        accessToken: string;
        access_token: string;
        user: any;
        default: boolean;
        mfaRequired?: undefined;
        mfaChallengeToken?: undefined;
    } | {
        user: any;
        default: boolean;
        refreshToken: string;
        refresh_token: string;
        accessToken: string;
        access_token: string;
        mfaRequired?: undefined;
        mfaChallengeToken?: undefined;
        mfaSetupRequired?: undefined;
    } | {
        user: any;
        default: boolean;
        refreshToken?: undefined;
        refresh_token?: undefined;
        accessToken: string;
        access_token: string;
        mfaRequired?: undefined;
        mfaChallengeToken?: undefined;
        mfaSetupRequired?: undefined;
    }>;
    verifyMfaChallenge(challengeToken: string, code: string, rawSource?: unknown): Promise<{
        user: any;
        default: boolean;
        mfaTrustToken: string;
        mfaTrustDays: number;
        refreshToken: string;
        refresh_token: string;
        accessToken: string;
        access_token: string;
    } | {
        user: any;
        default: boolean;
        mfaTrustToken: string;
        mfaTrustDays: number;
        refreshToken?: undefined;
        refresh_token?: undefined;
        accessToken: string;
        access_token: string;
    }>;
    issueSessionAfterMfaSetup(userId: string, rawSource?: unknown): Promise<{
        refreshToken: string;
        refresh_token: string;
        accessToken: string;
        access_token: string;
    } | {
        refreshToken?: undefined;
        refresh_token?: undefined;
        accessToken: string;
        access_token: string;
    }>;
    refreshSession(refreshToken: string): Promise<{
        exitClearanceOnly?: boolean;
        refreshToken: string;
        refresh_token: string;
        accessToken: string;
        access_token: string;
    } | {
        exitClearanceOnly?: boolean;
        refreshToken?: undefined;
        refresh_token?: undefined;
        accessToken: string;
        access_token: string;
    }>;
    endSession(refreshToken: string): Promise<{
        signedOut: boolean;
    }>;
    changePassword(userId: string | undefined, currentPassword?: string, newPassword?: string, mfaSetupPending?: boolean, rawSource?: unknown, mfaVerified?: boolean, sessionId?: string): Promise<{
        message: string;
        accessToken: string;
        access_token: string;
        mfaSetupRequired: boolean;
    } | {
        message: string;
        accessToken: string;
        access_token: string;
        mfaSetupRequired?: undefined;
    }>;
    private buildEmailQuery;
    private getPortalBaseUrl;
    requestPasswordReset(email?: string): Promise<{
        sent: boolean;
    }>;
    private getResetUser;
    verifyPasswordReset(email?: string, token?: string): Promise<{
        valid: boolean;
        email: string;
        expiresAt: string;
    }>;
    resetPasswordWithToken(email?: string, token?: string, newPassword?: string): Promise<{
        message: string;
    }>;
    sanitizeUser(user: any): any;
    private extractObjectIdCandidate;
    private normalizeObjectId;
    private normalizeAdditionalRoleEntry;
    private normalizeAndPopulateAdditionalRoles;
}
