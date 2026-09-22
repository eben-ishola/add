import { AnnouncementService } from "src/services/comms/announcement.service";
type AnnouncementBody = {
    title: string;
    content?: string;
    contentType?: "text" | "image";
    type?: string;
    pinned?: boolean | string;
    date?: string;
    expiresAt?: string;
    audienceScope?: "ALL" | "SELECTED";
    entityIds?: string[] | string;
};
export declare class AnnouncementController {
    private readonly announcementService;
    constructor(announcementService: AnnouncementService);
    private assertCanManageAnnouncements;
    findAll(req: any, user: any, limit?: string, pinned?: string, includeExpired?: string, search?: string, includeAllAudiences?: string, excludeRead?: string): Promise<(import("mongoose").FlattenMaps<import("../../schemas/announcement.schema").AnnouncementDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    create(body: AnnouncementBody, user?: any, file?: Express.Multer.File): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/announcement.schema").AnnouncementDocument, {}, {}> & import("../../schemas/announcement.schema").Announcement & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    update(id: string, body: AnnouncementBody, user?: any, file?: Express.Multer.File): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/announcement.schema").AnnouncementDocument, {}, {}> & import("../../schemas/announcement.schema").Announcement & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    markRead(id: string, user: any): Promise<{
        success: boolean;
    }>;
}
export {};
