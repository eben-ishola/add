"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const announcement_schema_1 = require("../../schemas/announcement.schema");
let AnnouncementService = class AnnouncementService {
    constructor(announcementModel) {
        this.announcementModel = announcementModel;
    }
    async create(input) {
        const { title, content, contentType, imageUrl, type, pinned, date, expiresAt, audienceScope, entityIds, } = input;
        const payload = {
            title: title.trim(),
            content: (content ?? "").trim(),
            contentType: contentType === "image" ? "image" : "text",
            type: type?.trim() || "General",
            pinned: Boolean(pinned),
        };
        if (contentType === "image" && imageUrl) {
            payload.imageUrl = imageUrl;
        }
        if (date) {
            payload.date = new Date(date);
        }
        if (expiresAt) {
            payload.expiresAt = new Date(expiresAt);
        }
        const scope = (audienceScope ?? "ALL").toUpperCase();
        payload.audienceScope = scope;
        if (scope === "SELECTED") {
            if (!entityIds?.length) {
                throw new common_1.BadRequestException("Select at least one entity for the targeted announcement.");
            }
            const sanitized = entityIds
                .filter((id) => id && mongoose_2.Types.ObjectId.isValid(id))
                .map((id) => new mongoose_2.Types.ObjectId(id));
            if (!sanitized.length) {
                throw new common_1.BadRequestException("Select at least one valid entity for the targeted announcement.");
            }
            payload.targetEntities = sanitized;
        }
        else {
            payload.targetEntities = [];
        }
        return this.announcementModel.create(payload);
    }
    async update(id, input) {
        const existing = await this.announcementModel.findById(id);
        if (!existing) {
            throw new common_1.NotFoundException("Announcement not found.");
        }
        const { title, content, contentType, imageUrl, type, pinned, date, expiresAt, audienceScope, entityIds, } = input;
        existing.title = title.trim();
        existing.content = (content ?? "").trim();
        existing.contentType = contentType === "image" ? "image" : "text";
        existing.type = type?.trim() || "General";
        existing.pinned = Boolean(pinned);
        if (contentType === "image" && imageUrl) {
            existing.imageUrl = imageUrl;
        }
        else if (contentType === "text") {
            existing.imageUrl = undefined;
        }
        if (date) {
            existing.date = new Date(date);
        }
        existing.expiresAt = expiresAt ? new Date(expiresAt) : undefined;
        const scope = (audienceScope ?? "ALL").toUpperCase();
        existing.audienceScope = scope;
        if (scope === "SELECTED") {
            if (!entityIds?.length) {
                throw new common_1.BadRequestException("Select at least one entity for the targeted announcement.");
            }
            const sanitized = entityIds
                .filter((eid) => eid && mongoose_2.Types.ObjectId.isValid(eid))
                .map((eid) => new mongoose_2.Types.ObjectId(eid));
            if (!sanitized.length) {
                throw new common_1.BadRequestException("Select at least one valid entity for the targeted announcement.");
            }
            existing.targetEntities = sanitized;
        }
        else {
            existing.targetEntities = [];
        }
        return existing.save();
    }
    async markRead(announcementId, userId) {
        if (!userId || !mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new common_1.BadRequestException("Invalid user.");
        }
        if (!announcementId || !mongoose_2.Types.ObjectId.isValid(announcementId)) {
            throw new common_1.NotFoundException("Announcement not found.");
        }
        await this.announcementModel.updateOne({ _id: new mongoose_2.Types.ObjectId(announcementId) }, { $addToSet: { readBy: new mongoose_2.Types.ObjectId(userId) } });
        return { success: true };
    }
    async findAll(options = {}) {
        const { limit = 20, pinned, includeExpired, search, entityId, includeAllAudiences, excludeReadByUserId, } = options;
        const filters = {};
        const andConditions = [];
        if (typeof pinned === "boolean") {
            filters.pinned = pinned;
        }
        if (!includeExpired) {
            andConditions.push({
                $or: [
                    { expiresAt: { $exists: false } },
                    { expiresAt: null },
                    { expiresAt: { $gte: new Date() } },
                ],
            });
        }
        if (search) {
            const regex = new RegExp(search, "i");
            andConditions.push({
                $or: [
                    { title: regex },
                    { content: regex },
                    { type: regex },
                ],
            });
        }
        if (excludeReadByUserId && mongoose_2.Types.ObjectId.isValid(excludeReadByUserId)) {
            filters.readBy = { $ne: new mongoose_2.Types.ObjectId(excludeReadByUserId) };
        }
        if (!includeAllAudiences && entityId && mongoose_2.Types.ObjectId.isValid(entityId)) {
            const entityObjectId = new mongoose_2.Types.ObjectId(entityId);
            andConditions.push({
                $or: [
                    { audienceScope: { $exists: false } },
                    { audienceScope: "ALL" },
                    {
                        audienceScope: "SELECTED",
                        targetEntities: { $in: [entityObjectId] },
                    },
                ],
            });
        }
        if (andConditions.length) {
            filters.$and = andConditions;
        }
        const safeLimit = Math.min(Math.max(limit, 1), 100);
        return this.announcementModel
            .find(filters)
            .sort({ pinned: -1, date: -1, createdAt: -1 })
            .limit(safeLimit)
            .lean()
            .exec();
    }
};
exports.AnnouncementService = AnnouncementService;
exports.AnnouncementService = AnnouncementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(announcement_schema_1.Announcement.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AnnouncementService);
//# sourceMappingURL=announcement.service.js.map