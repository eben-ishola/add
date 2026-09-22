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
exports.UserCredentialService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const mail_service_1 = require("../comms/mail.service");
const notice_service_1 = require("../comms/notice.service");
const config_1 = require("../../config");
const PASSWORD_RESET_TOKEN_TTL_MS = 1000 * 60 * 60;
let UserCredentialService = class UserCredentialService {
    constructor(staffModel, notificationService, noticeService) {
        this.staffModel = staffModel;
        this.notificationService = notificationService;
        this.noticeService = noticeService;
    }
    async createNotice(userId, message, link, type) {
        if (!userId)
            return;
        try {
            await this.noticeService.createNotice({
                userId: String(userId),
                message,
                link,
                type,
            });
        }
        catch {
        }
    }
    getPortalBaseUrl() {
        const candidates = [
            process.env.HR_PORTAL_WEB_URL,
            process.env.HR_PORTAL_BASE_URL,
            process.env.FRONTEND_BASE_URL,
            process.env.FRONTEND_URL,
        ];
        const fallback = config_1.config.frontendUrl;
        const base = candidates.find((value) => typeof value === 'string' && value.trim().length > 0) ?? fallback;
        return base.replace(/\/+$/, '');
    }
    generateRandomPassword(length = 12) {
        const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
        const bytes = crypto.randomBytes(length);
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset[bytes[i] % charset.length];
        }
        return password;
    }
    async resetPassword(userId, preferredPassword, actingUserId, delivery = 'email') {
        const user = await this.staffModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const email = (user.email ?? '').trim();
        const resetRequestedBy = actingUserId && mongoose_2.default.Types.ObjectId.isValid(actingUserId)
            ? new mongoose_2.default.Types.ObjectId(actingUserId)
            : null;
        if (delivery === 'email') {
            if (!email) {
                throw new Error('This user does not have an email address. Choose a temporary password instead.');
            }
            const rawToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
            user.passwordResetToken = hashedToken;
            user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);
            user.passwordResetRequestedAt = new Date();
            user.passwordResetRequestedBy = resetRequestedBy;
            await user.save();
            const resetLink = `${this.getPortalBaseUrl()}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;
            try {
                await this.notificationService.sendMail({
                    to: email,
                    templateType: 'admin-password-reset',
                    templateVariables: {
                        fullName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || email,
                        resetLink,
                        token: rawToken,
                        expiresAt: user.passwordResetExpires?.toISOString() ?? null,
                    },
                });
            }
            catch {
            }
            await this.createNotice(user._id, 'An administrator initiated a password reset for your account.');
            return {
                emailed: true,
                expiresAt: user.passwordResetExpires?.toISOString() ?? null,
            };
        }
        const finalPassword = preferredPassword && preferredPassword.trim().length >= 6
            ? preferredPassword.trim()
            : this.generateRandomPassword();
        const hashedPassword = await bcrypt.hash(finalPassword, 10);
        user.password = hashedPassword;
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        user.passwordResetRequestedAt = new Date();
        user.passwordResetRequestedBy = resetRequestedBy;
        await user.save();
        await this.createNotice(user._id, 'An administrator reset your password. Use the temporary password provided to sign in.');
        return {
            emailed: false,
            generatedPassword: finalPassword,
        };
    }
};
exports.UserCredentialService = UserCredentialService;
exports.UserCredentialService = UserCredentialService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mail_service_1.MailService,
        notice_service_1.NoticeService])
], UserCredentialService);
//# sourceMappingURL=user-credential.service.js.map