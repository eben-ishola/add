import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { MailService } from 'src/services/comms/mail.service';
import { MfaService } from './mfa.service';
import { ExitClearanceDocument } from 'src/schemas/exit-clearance.schema';
export declare class AuthService {
    private readonly staffModel;
    private readonly jwtService;
    private readonly mailService?;
    private readonly mfaService?;
    private readonly clearanceModel?;
    constructor(staffModel: Model<User>, jwtService: JwtService, mailService?: MailService, mfaService?: MfaService, clearanceModel?: Model<ExitClearanceDocument>);
    validateUser(identifier: string, password: string): Promise<any>;
    private buildIdentifierQuery;
    private getAuthCollation;
    private isDefaultPassword;
    private hasLeft;
    hasOpenClearance(userId: any): Promise<boolean>;
    private latestClearanceStatus;
    private hasExitDatePassed;
    private assertUserCanSignIn;
    private createAccessToken;
    private createExitClearanceToken;
    private createMfaSetupToken;
    signIn(rawIdentifier: string, password: string, mfaTrustToken?: string, rawSource?: unknown): Promise<{
        accessToken: string;
        access_token: string;
        user: any;
        default: boolean;
        exitClearanceOnly: boolean;
        mfaTrusted?: undefined;
        mfaRequired?: undefined;
        mfaChallengeToken?: undefined;
        mfaSetupRequired?: undefined;
    } | {
        accessToken: string;
        access_token: string;
        user: any;
        default: boolean;
        mfaTrusted: boolean;
        exitClearanceOnly?: undefined;
        mfaRequired?: undefined;
        mfaChallengeToken?: undefined;
        mfaSetupRequired?: undefined;
    } | {
        mfaRequired: boolean;
        mfaChallengeToken: string;
        accessToken?: undefined;
        access_token?: undefined;
        user?: undefined;
        default?: undefined;
        exitClearanceOnly?: undefined;
        mfaTrusted?: undefined;
        mfaSetupRequired?: undefined;
    } | {
        mfaSetupRequired: boolean;
        accessToken: string;
        access_token: string;
        user: any;
        default: boolean;
        exitClearanceOnly?: undefined;
        mfaTrusted?: undefined;
        mfaRequired?: undefined;
        mfaChallengeToken?: undefined;
    } | {
        accessToken: string;
        access_token: string;
        user: any;
        default: boolean;
        exitClearanceOnly?: undefined;
        mfaTrusted?: undefined;
        mfaRequired?: undefined;
        mfaChallengeToken?: undefined;
        mfaSetupRequired?: undefined;
    }>;
    verifyMfaChallenge(challengeToken: string, code: string, rawSource?: unknown): Promise<{
        accessToken: string;
        access_token: string;
        user: any;
        default: boolean;
        mfaTrustToken: string;
        mfaTrustDays: number;
    }>;
    issueAccessTokenAfterMfaSetup(userId: string, rawSource?: unknown): Promise<string>;
    changePassword(userId: string | undefined, currentPassword?: string, newPassword?: string, mfaSetupPending?: boolean, rawSource?: unknown, mfaVerified?: boolean): Promise<{
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
