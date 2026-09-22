import { NoticeService } from 'src/services/comms/notice.service';
export declare class NoticeController {
    private readonly noticeService;
    constructor(noticeService: NoticeService);
    getRecent(user: any, limit?: string): Promise<import("../../schemas/notice.schema").Notice[]>;
    markRead(id: string): Promise<{
        updated: boolean;
    }>;
    createNotice(payload: {
        userId: string;
        message: string;
        link?: string;
        type?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/notice.schema").NoticeDocument, {}, {}> & import("../../schemas/notice.schema").Notice & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
