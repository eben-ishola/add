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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMilestoneService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const moment = require("moment-timezone");
const mail_service_1 = require("../comms/mail.service");
const notification_dispatch_service_1 = require("../comms/notification-dispatch.service");
const calendar_date_util_1 = require("../../utils/shared/calendar-date.util");
const user_directory_service_1 = require("./user-directory.service");
let UserMilestoneService = class UserMilestoneService {
    constructor(userDirectoryService, notificationService, dispatchService) {
        this.userDirectoryService = userDirectoryService;
        this.notificationService = notificationService;
        this.dispatchService = dispatchService;
    }
    formatDateValue(input) {
        if (!input)
            return '';
        if (typeof input === 'string')
            return input;
        return (0, calendar_date_util_1.formatCalendarDate)(input);
    }
    resolveRecipientKey(staff) {
        const id = staff?._id ?? staff?.id;
        if (id)
            return String(id);
        const email = typeof staff?.email === 'string' ? staff.email.trim().toLowerCase() : '';
        return email;
    }
    today() {
        return moment().tz('Africa/Lagos').format('YYYY-MM-DD');
    }
    async handleBirthdayTodayCron() {
        if (!(await this.dispatchService.claimScheduledRun('birthday-greetings')))
            return;
        const birthdays = await this.userDirectoryService.getBirthdaysToday();
        const dateKey = this.today();
        for (const staff of birthdays) {
            const formattedDob = this.formatDateValue(staff?.dateOfBirth);
            if (!formattedDob) {
                continue;
            }
            const recipientKey = this.resolveRecipientKey(staff);
            if (!recipientKey || !staff?.email) {
                continue;
            }
            const claimKey = this.dispatchService.buildKey('birthday', recipientKey, dateKey);
            const claimed = await this.dispatchService.claim(claimKey, {
                channel: 'email',
                context: { email: staff.email, dateOfBirth: formattedDob },
            });
            if (!claimed) {
                continue;
            }
            try {
                const result = await this.notificationService.sendMail({
                    to: staff.email,
                    templateType: 'birthday-message',
                    templateVariables: {
                        firstName: staff.firstName,
                        lastName: staff.lastName,
                        dateOfBirth: formattedDob,
                        logo: 'https://intranet.addosser.com/img/logo.png',
                    },
                });
                if (!result?.success) {
                    await this.dispatchService.release(claimKey);
                }
            }
            catch (error) {
                await this.dispatchService.release(claimKey);
                console.error('Birthday greeting failed', { email: staff.email, error });
            }
        }
    }
    async handleWorkAnniversaryCron() {
        if (!(await this.dispatchService.claimScheduledRun('work-anniversary-greetings')))
            return;
        const anniversaries = await this.userDirectoryService.getWorkAnniversaryToday();
        const dateKey = this.today();
        for (const staff of anniversaries) {
            const formattedStart = this.formatDateValue(staff?.startDate);
            if (!formattedStart) {
                continue;
            }
            const recipientKey = this.resolveRecipientKey(staff);
            if (!recipientKey || !staff?.email) {
                continue;
            }
            const claimKey = this.dispatchService.buildKey('work-anniversary', recipientKey, dateKey);
            const claimed = await this.dispatchService.claim(claimKey, {
                channel: 'email',
                context: { email: staff.email, startDate: formattedStart },
            });
            if (!claimed) {
                continue;
            }
            try {
                const result = await this.notificationService.sendMail({
                    to: staff.email,
                    templateType: 'anniversary-message',
                    templateVariables: {
                        firstName: staff.firstName,
                        lastName: staff.lastName,
                        startDate: formattedStart,
                        logo: 'https://intranet.addosser.com/img/logo.png',
                    },
                });
                if (!result?.success) {
                    await this.dispatchService.release(claimKey);
                }
            }
            catch (error) {
                await this.dispatchService.release(claimKey);
                console.error('Work anniversary greeting failed', { email: staff.email, error });
            }
        }
    }
};
exports.UserMilestoneService = UserMilestoneService;
__decorate([
    (0, schedule_1.Cron)('30 0 * * *', {
        timeZone: 'Africa/Lagos',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserMilestoneService.prototype, "handleBirthdayTodayCron", null);
__decorate([
    (0, schedule_1.Cron)('0 8 * * *', {
        timeZone: 'Africa/Lagos',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserMilestoneService.prototype, "handleWorkAnniversaryCron", null);
exports.UserMilestoneService = UserMilestoneService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_directory_service_1.UserDirectoryService,
        mail_service_1.MailService,
        notification_dispatch_service_1.NotificationDispatchService])
], UserMilestoneService);
//# sourceMappingURL=user-milestone.service.js.map