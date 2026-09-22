import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { MailService } from 'src/services/comms/mail.service';
import { NoticeService } from 'src/services/comms/notice.service';
export declare class UserCredentialService {
    private readonly staffModel;
    private readonly notificationService;
    private readonly noticeService;
    constructor(staffModel: Model<User>, notificationService: MailService, noticeService: NoticeService);
    private createNotice;
    private getPortalBaseUrl;
    private generateRandomPassword;
    resetPassword(userId: string, preferredPassword?: string, actingUserId?: string): Promise<{
        emailed: boolean;
        expiresAt: string;
        generatedPassword?: undefined;
    } | {
        emailed: boolean;
        generatedPassword: string;
        expiresAt?: undefined;
    }>;
}
