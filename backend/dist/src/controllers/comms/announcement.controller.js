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
exports.AnnouncementController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const user_decorator_1 = require("../../auth/decorators/user.decorator");
const announcement_service_1 = require("../../services/comms/announcement.service");
const access_control_util_1 = require("../../utils/shared/access-control.util");
const ANNOUNCEMENT_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);
const imageUploadOptions = {
    storage: (0, multer_1.diskStorage)({
        destination: "uploads/announcements",
        filename: (_req, file, cb) => {
            const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            cb(null, `announcement-${unique}${(0, path_1.extname)(file.originalname)}`);
        },
    }),
    fileFilter: (_req, file, cb) => {
        const mimeOk = /^image\/(jpeg|pjpeg|png|x-png|gif|webp|jpg)$/.test(String(file?.mimetype ?? "").toLowerCase());
        const extOk = ANNOUNCEMENT_IMAGE_EXTENSIONS.has(String((0, path_1.extname)(file?.originalname ?? "")).toLowerCase());
        if (mimeOk || extOk) {
            cb(null, true);
        }
        else {
            cb(new common_1.BadRequestException("Only image files (JPEG, PNG, GIF, WEBP) are allowed"), false);
        }
    },
    limits: { fileSize: 15 * 1024 * 1024 },
};
function parseBody(body, file) {
    let entityIds;
    if (typeof body.entityIds === "string") {
        try {
            entityIds = JSON.parse(body.entityIds);
        }
        catch {
            entityIds = [body.entityIds];
        }
    }
    else {
        entityIds = body.entityIds;
    }
    const pinned = body.pinned === true || body.pinned === "true";
    return {
        ...body,
        pinned,
        entityIds: entityIds,
        contentType: (body.contentType === "image" ? "image" : "text"),
        imageUrl: file ? `/uploads/announcements/${file.filename}` : undefined,
    };
}
let AnnouncementController = class AnnouncementController {
    constructor(announcementService) {
        this.announcementService = announcementService;
    }
    assertCanManageAnnouncements(user) {
        const allowed = (0, access_control_util_1.userIsSuperAdmin)(user) ||
            (0, access_control_util_1.userHasPermission)(user, ["publish announcements", "manage announcements"]) ||
            (0, access_control_util_1.userHasScope)(user, ["group", "entity"]);
        if (!allowed) {
            throw new common_1.ForbiddenException("You do not have permission to manage announcements.");
        }
    }
    async findAll(req, user, limit, pinned, includeExpired, search, includeAllAudiences, excludeRead) {
        const entityRef = req?.user?.entity;
        const entityId = typeof entityRef === "object" && entityRef?._id ? String(entityRef._id) :
            entityRef ? String(entityRef) :
                undefined;
        return this.announcementService.findAll({
            limit: limit ? Number(limit) : undefined,
            pinned: pinned != null ? pinned === "true" : undefined,
            includeExpired: includeExpired === "true",
            search: search?.trim() || undefined,
            entityId,
            includeAllAudiences: includeAllAudiences === "true",
            excludeReadByUserId: excludeRead === "true" ? String(user?._id ?? user?.id) : undefined,
        });
    }
    async create(body, user, file) {
        this.assertCanManageAnnouncements(user);
        return this.announcementService.create(parseBody(body, file));
    }
    async update(id, body, user, file) {
        this.assertCanManageAnnouncements(user);
        return this.announcementService.update(id, parseBody(body, file));
    }
    async markRead(id, user) {
        const userId = user?._id ?? user?.id;
        return this.announcementService.markRead(id, userId);
    }
};
exports.AnnouncementController = AnnouncementController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, user_decorator_1.UserOne)()),
    __param(2, (0, common_1.Query)("limit")),
    __param(3, (0, common_1.Query)("pinned")),
    __param(4, (0, common_1.Query)("includeExpired")),
    __param(5, (0, common_1.Query)("search")),
    __param(6, (0, common_1.Query)("includeAllAudiences")),
    __param(7, (0, common_1.Query)("excludeRead")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AnnouncementController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("image", imageUploadOptions)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.UserOne)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AnnouncementController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(":id"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("image", imageUploadOptions)),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.UserOne)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AnnouncementController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(":id/mark-read"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AnnouncementController.prototype, "markRead", null);
exports.AnnouncementController = AnnouncementController = __decorate([
    (0, common_1.Controller)("announcements"),
    __metadata("design:paramtypes", [announcement_service_1.AnnouncementService])
], AnnouncementController);
//# sourceMappingURL=announcement.controller.js.map