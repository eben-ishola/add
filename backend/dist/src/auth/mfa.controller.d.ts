import { MfaService } from './services/mfa.service';
import { AuthService } from './services/auth.service';
import { MfaTokenDto, SetMfaPolicyDto, VerifyMfaChallengeDto } from './dto/mfa-request.dto';
export declare class MfaController {
    private readonly mfaService;
    private readonly authService;
    constructor(mfaService: MfaService, authService: AuthService);
    status(user: any): Promise<{
        enabled: boolean;
        required: boolean;
        requiredByOrg: boolean;
        requiredByUser: boolean;
        exempt: boolean;
        setupAt: Date | null;
        verifiedAt: Date | null;
        backupCodesRemaining: number;
    }>;
    setup(user: any): Promise<{
        otpauthUrl: string;
        qrDataUrl: string;
        secret: string;
    }>;
    confirm(user: any, body: MfaTokenDto): Promise<{
        accessToken: string;
        access_token: string;
        backupCodes: string[];
        mfaTrustToken: string | null;
        mfaTrustDays: number;
    }>;
    disable(user: any, body: MfaTokenDto): Promise<{
        status: number;
        message: string;
    }>;
    regenerateBackupCodes(user: any): Promise<{
        backupCodes: string[];
    }>;
    verify(body: VerifyMfaChallengeDto): Promise<{
        accessToken: string;
        access_token: string;
        user: any;
        default: boolean;
        mfaTrustToken: string;
        mfaTrustDays: number;
    }>;
    adminRequire(actor: any, userId: string): Promise<{
        status: number;
        message: string;
    }>;
    adminUnrequire(actor: any, userId: string): Promise<{
        status: number;
        message: string;
    }>;
    adminReset(actor: any, userId: string): Promise<{
        status: number;
        message: string;
    }>;
    adminListUsers(actor: any, entity?: string, search?: string, page?: string, limit?: string): Promise<{
        data: Array<{
            _id: string;
            firstName?: string;
            lastName?: string;
            email?: string;
            staffId?: string;
            department?: any;
            mfaEnabled: boolean;
            mfaRequired: boolean;
            mfaExempt: boolean;
            mfaSetupAt: Date | null;
            mfaVerifiedAt: Date | null;
        }>;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    adminGetPolicy(actor: any): Promise<{
        requireForAll: boolean;
    }>;
    adminSetPolicy(actor: any, body: SetMfaPolicyDto): Promise<{
        requireForAll: boolean;
    }>;
}
