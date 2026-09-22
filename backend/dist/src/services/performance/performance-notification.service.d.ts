import { Model } from 'mongoose';
import { NoticeService } from 'src/services/comms/notice.service';
import { MailService } from 'src/services/comms/mail.service';
import { UserDocument } from '../../schemas/user.schema';
import { PerformanceReviewDocument } from '../../schemas/performance-review.schema';
import { PerformanceAppraisalCycleDocument } from '../../schemas/performance-appraisal-cycle.schema';
export type PerformanceNoticePayload = {
    message: string;
    link: string;
    type: string;
    emailSubject: string;
    emailText: string;
};
export declare class PerformanceNotificationService {
    private readonly userModel;
    private readonly reviewModel;
    private readonly appraisalCycleModel;
    private readonly noticeService;
    private readonly mailService?;
    constructor(userModel: Model<UserDocument>, reviewModel: Model<PerformanceReviewDocument>, appraisalCycleModel: Model<PerformanceAppraisalCycleDocument>, noticeService: NoticeService, mailService?: MailService);
    private normalizeEmail;
    getPortalBaseUrl(): string;
    buildPortalUrl(path: string): string;
    buildOutstandingReviewReminder(input: {
        firstName: string;
        cycleLabel: string;
        reviewLink: string;
        hasReview: boolean;
    }): PerformanceNoticePayload;
    buildPerformanceReviewReminder(review: any, stage: string, reviewLink: string): PerformanceNoticePayload;
    private collectNotificationEmails;
    private normalizeUserId;
    private normalizeUserIdList;
    private normalizeEntityIdStrict;
    private asValidDate;
    private prefetchReviewStartDates;
    private isReviewEmployeeLateForCycle;
    private getPerformanceReviewReminderStageLabel;
    notifyUsers(options: {
        userIds: string[];
        message: string;
        link?: string;
        type?: string;
        emailSubject?: string;
        emailText?: string;
        dedupKey?: {
            type: string;
            link: string;
        };
    }): Promise<{
        notified: number;
        skipped: number;
    }>;
    notifyOutstandingReviews(opts?: {
        actor?: any;
        entity?: string;
        cycleId?: string;
        dryRun?: boolean;
    }): Promise<{
        cycles: number;
        employeesScanned: number;
        outstanding: number;
        notified: number;
        failed: number;
        skippedNoUserId: number;
    }>;
    nudgeAllPendingSupervisors(filters: {
        entity?: string;
        appraisalCycleId?: string;
    } | undefined, actor: any): Promise<{
        status: number;
        message: string;
        sent: number;
        skipped: number;
        total: number;
    }>;
    nudgeReviewSupervisor(id: string, actor: any): Promise<{
        status: number;
        message: string;
    }>;
}
