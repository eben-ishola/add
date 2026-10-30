import { AuthService } from './services/auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { ChangePasswordDto, RefreshTokenDto, RequestPasswordResetDto, ResetPasswordDto, VerifyPasswordResetDto } from './dto/auth-request.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(payload: SignInDto): Promise<{
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
    refresh(body: RefreshTokenDto): Promise<{
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
    logout(body: RefreshTokenDto): Promise<{
        signedOut: boolean;
    }>;
    changePassword(body: ChangePasswordDto, user: any): Promise<{
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
    verifyResetPassword(body: VerifyPasswordResetDto): Promise<{
        valid: boolean;
        email: string;
        expiresAt: string;
    }>;
    requestPasswordReset(body: RequestPasswordResetDto): Promise<{
        sent: boolean;
    }>;
    resetPassword(body: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
