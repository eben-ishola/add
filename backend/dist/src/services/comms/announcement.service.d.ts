import { Model } from "mongoose";
import { Announcement, AnnouncementDocument } from "src/schemas/announcement.schema";
type CreateAnnouncementInput = {
    title: string;
    content?: string;
    contentType?: "text" | "image" | null;
    imageUrl?: string | null;
    type?: string | null;
    pinned?: boolean;
    date?: string | Date | null;
    expiresAt?: string | Date | null;
    audienceScope?: "ALL" | "SELECTED" | null;
    entityIds?: string[] | null;
};
type FindAnnouncementsOptions = {
    limit?: number;
    pinned?: boolean;
    includeExpired?: boolean;
    search?: string;
    entityId?: string | null;
    includeAllAudiences?: boolean;
    excludeReadByUserId?: string | null;
};
export declare class AnnouncementService {
    private readonly announcementModel;
    constructor(announcementModel: Model<AnnouncementDocument>);
    create(input: CreateAnnouncementInput): Promise<import("mongoose").Document<unknown, {}, AnnouncementDocument, {}, {}> & Announcement & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    update(id: string, input: CreateAnnouncementInput): Promise<import("mongoose").Document<unknown, {}, AnnouncementDocument, {}, {}> & Announcement & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    markRead(announcementId: string, userId: string): Promise<{
        success: boolean;
    }>;
    findAll(options?: FindAnnouncementsOptions): Promise<(import("mongoose").FlattenMaps<AnnouncementDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
}
export {};
