import { AuthService } from './services/auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { ChangePasswordDto, RequestPasswordResetDto, ResetPasswordDto, VerifyPasswordResetDto } from './dto/auth-request.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(payload: SignInDto): Promise<{
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
    changePassword(body: ChangePasswordDto, user: any): Promise<{
        message: string;
        accessToken: string;
        access_token: string;
        mfaSetupRequired: boolean;
    } | {
        message: string;
        accessToken?: undefined;
        access_token?: undefined;
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
