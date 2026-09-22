import { MailService } from 'src/services/comms/mail.service';
import { NoticeService } from 'src/services/comms/notice.service';
import { SmtpConfigService } from 'src/services/comms/smtp-config.service';
import { StaffService } from 'src/services/user/user.service';
export type PayrollApprovalStage = 'REVIEWER' | 'APPROVER' | 'POSTING';
export declare class PayrollNotificationService {
    private readonly staffService;
    private readonly noticeService;
    private readonly mailService?;
    private readonly smtpConfigService?;
    constructor(staffService: StaffService, noticeService: NoticeService, mailService?: MailService, smtpConfigService?: SmtpConfigService);
    isPayrollEmailEnabled(): Promise<boolean>;
    buildPortalUrl(path: string): string;
    normalizeEmail(value: any): string | null;
    collectNotificationEmails(userIds: string[]): Promise<string[]>;
    sendPayrollApprovalEmail(userIds: string[] | undefined, templateType: string, templateVariables: Record<string, any>): Promise<void>;
    collectParticipantIds(approval: any): string[];
    notifyCompletion(approval: any, entityName: string): Promise<void>;
    notifyRejection(approval: any, entityName: string): Promise<void>;
    notifyStageAssignees(userIds: string[] | undefined, approvalId: string, entityName: string, monthLabel: string, stage: PayrollApprovalStage): Promise<void>;
    notifyAuditViewers(userIds: string[] | undefined, approvalId: string, entityName: string, monthLabel: string): Promise<void>;
    notifyBankingOperations(approval: any, entityName: string): Promise<void>;
}
