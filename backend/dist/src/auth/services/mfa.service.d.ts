import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { MfaPolicyDocument } from 'src/schemas/mfa-policy.schema';
export declare class MfaService {
    private readonly userModel;
    private readonly policyModel;
    constructor(userModel: Model<User>, policyModel: Model<MfaPolicyDocument>);
    getPolicy(): Promise<{
        requireForAll: boolean;
    }>;
    setPolicy(requireForAll: boolean, actorId?: string): Promise<{
        requireForAll: boolean;
    }>;
    isMfaEffectivelyRequired(userOrId: any): Promise<boolean>;
    startSetup(userId: string): Promise<{
        otpauthUrl: string;
        qrDataUrl: string;
        secret: string;
    }>;
    confirmSetup(userId: string, token: string): Promise<{
        backupCodes: string[];
        mfaTrustToken: string | null;
        mfaTrustDays: number;
    }>;
    verifyToken(userId: string, token: string): Promise<boolean>;
    isDeviceTrusted(userId: string, trustToken?: string | null): Promise<boolean>;
    issueDeviceTrust(userId: string): Promise<string | null>;
    disable(userId: string, opts?: {
        adminOverride?: boolean;
    }): Promise<void>;
    setRequired(targetUserId: string, required: boolean): Promise<void>;
    listUsers(opts: {
        entity?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
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
    regenerateBackupCodes(userId: string): Promise<{
        backupCodes: string[];
    }>;
    getStatus(userId: string): Promise<{
        enabled: boolean;
        required: boolean;
        requiredByOrg: boolean;
        requiredByUser: boolean;
        exempt: boolean;
        setupAt: Date | null;
        verifiedAt: Date | null;
        backupCodesRemaining: number;
    }>;
    private generateBackupCodes;
}
