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
exports.NoticeService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notice_gateway_1 = require("../../events/notice.gateway");
const notice_schema_1 = require("../../schemas/notice.schema");
const user_schema_1 = require("../../schemas/user.schema");
const department_schema_1 = require("../../schemas/department.schema");
const mail_service_1 = require("./mail.service");
let NoticeService = class NoticeService {
    constructor(noticeModel, noticeGateway, mailService, userModel, deptModel) {
        this.noticeModel = noticeModel;
        this.noticeGateway = noticeGateway;
        this.mailService = mailService;
        this.userModel = userModel;
        this.deptModel = deptModel;
    }
    async getRecentNotices(userId) {
        return this.noticeModel.find({
            $or: [
                { userId: userId },
                ...(mongoose_2.default.Types.ObjectId.isValid(userId)
                    ? [{ userId: new mongoose_2.default.Types.ObjectId(userId) }]
                    : []),
            ]
        })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean()
            .exec();
    }
    async markAsRead(id) {
        await this.noticeModel.findByIdAndUpdate(id, { read: true });
    }
    async hasUnreadNotice(filter) {
        const normalizedUserId = this.normalizeUserId(filter.userId);
        if (!normalizedUserId)
            return false;
        const userIdOr = [{ userId: normalizedUserId }];
        if (mongoose_2.default.Types.ObjectId.isValid(normalizedUserId)) {
            userIdOr.push({ userId: new mongoose_2.default.Types.ObjectId(normalizedUserId) });
        }
        const query = { read: false, $or: userIdOr };
        if (filter.type !== undefined)
            query.type = filter.type;
        if (filter.link !== undefined)
            query.link = filter.link;
        const existing = await this.noticeModel.exists(query);
        return Boolean(existing);
    }
    async deleteNotice(id) {
        await this.noticeModel.findByIdAndDelete(id);
    }
    async createNotice(data) {
        const normalizedUserId = this.normalizeUserId(data?.userId);
        if (!normalizedUserId) {
            throw new Error("Cannot create notice: invalid userId");
        }
        if (!mongoose_2.default.Types.ObjectId.isValid(normalizedUserId)) {
            throw new Error("Cannot create notice: userId must be a valid ObjectId");
        }
        const payload = {
            ...data,
            userId: new mongoose_2.default.Types.ObjectId(normalizedUserId),
        };
        const notice = await this.noticeModel.create(payload);
        this.noticeGateway.sendNotice(normalizedUserId, notice);
        const shouldSendEmail = data.sendEmail ?? true;
        return notice;
    }
    async sendEmailForNotice(userId, message, link) {
        if (!this.mailService || !this.userModel || !this.deptModel)
            return;
        try {
            const user = await this.userModel.findById(userId).populate('department').lean();
            const email = user?.email;
            const deptEmail = user?.department?.groupEmail;
            const to = email || deptEmail;
            if (!to)
                return;
            const subject = "Notification";
            const body = `${message}${link ? `\n\nView: ${link}` : ""}`;
            await this.mailService.sendMail({ to, subject, text: body });
        }
        catch (error) {
            console.error("Failed to send notice email", error);
        }
    }
    normalizeUserId(userId) {
        if (!userId)
            return null;
        if (typeof userId === "string" && userId.trim()) {
            return userId.trim();
        }
        if (typeof userId?.toString === "function") {
            const value = userId.toString();
            return value && value !== "[object Object]" ? value : null;
        }
        return null;
    }
};
exports.NoticeService = NoticeService;
exports.NoticeService = NoticeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notice_schema_1.Notice.name)),
    __param(2, (0, common_1.Optional)()),
    __param(3, (0, common_1.Optional)()),
    __param(3, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(4, (0, common_1.Optional)()),
    __param(4, (0, mongoose_1.InjectModel)(department_schema_1.Department.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        notice_gateway_1.NoticeGateway,
        mail_service_1.MailService,
        mongoose_2.Model,
        mongoose_2.Model])
], NoticeService);
//# sourceMappingURL=notice.service.js.map