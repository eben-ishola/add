import mongoose, { Model } from "mongoose";
import { NoticeGateway } from "src/events/notice.gateway";
import { Notice, NoticeDocument } from "src/schemas/notice.schema";
import { User } from "src/schemas/user.schema";
import { Department } from "src/schemas/department.schema";
import { MailService } from "src/services/comms/mail.service";
export declare class NoticeService {
    private noticeModel;
    private readonly noticeGateway;
    private readonly mailService?;
    private userModel?;
    private deptModel?;
    constructor(noticeModel: Model<NoticeDocument>, noticeGateway: NoticeGateway, mailService?: MailService, userModel?: Model<User>, deptModel?: Model<Department>);
    getRecentNotices(userId: string): Promise<Notice[]>;
    markAsRead(id: string): Promise<void>;
    hasUnreadNotice(filter: {
        userId: string;
        type?: string;
        link?: string;
    }): Promise<boolean>;
    deleteNotice(id: string): Promise<void>;
    createNotice(data: {
        userId: string;
        message: string;
        link?: string;
        type?: string;
        sendEmail?: boolean;
    }): Promise<mongoose.Document<unknown, {}, NoticeDocument, {}, {}> & Notice & mongoose.Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    private sendEmailForNotice;
    private normalizeUserId;
}
