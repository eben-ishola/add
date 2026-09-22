import { MailService } from 'src/services/comms/mail.service';
import { NotificationDispatchService } from 'src/services/comms/notification-dispatch.service';
import { UserDirectoryService } from 'src/services/user/user-directory.service';
export declare class UserMilestoneService {
    private readonly userDirectoryService;
    private readonly notificationService;
    private readonly dispatchService;
    constructor(userDirectoryService: UserDirectoryService, notificationService: MailService, dispatchService: NotificationDispatchService);
    private formatDateValue;
    private resolveRecipientKey;
    private today;
    handleBirthdayTodayCron(): Promise<void>;
    handleWorkAnniversaryCron(): Promise<void>;
}
