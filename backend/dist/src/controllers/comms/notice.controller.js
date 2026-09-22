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
exports.NoticeController = void 0;
const common_1 = require("@nestjs/common");
const notice_service_1 = require("../../services/comms/notice.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const user_decorator_1 = require("../../auth/decorators/user.decorator");
let NoticeController = class NoticeController {
    constructor(noticeService) {
        this.noticeService = noticeService;
    }
    async getRecent(user, limit) {
        const userId = String(user?._id ?? user?.id ?? user?.userId ?? '');
        if (!userId) {
            return [];
        }
        const notices = await this.noticeService.getRecentNotices(userId);
        if (limit) {
            const take = Math.max(Number(limit) || 0, 0);
            return notices.slice(0, take);
        }
        return notices;
    }
    async markRead(id) {
        await this.noticeService.markAsRead(id);
        return { updated: true };
    }
    async createNotice(payload) {
        return this.noticeService.createNotice(payload);
    }
    async remove(id) {
        await this.noticeService.deleteNotice(id);
        return { deleted: true };
    }
};
exports.NoticeController = NoticeController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NoticeController.prototype, "getRecent", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NoticeController.prototype, "markRead", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NoticeController.prototype, "createNotice", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NoticeController.prototype, "remove", null);
exports.NoticeController = NoticeController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notice_service_1.NoticeService])
], NoticeController);
//# sourceMappingURL=notice.controller.js.map