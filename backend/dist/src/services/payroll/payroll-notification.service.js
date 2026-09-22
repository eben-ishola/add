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
exports.PayrollNotificationService = void 0;
const common_1 = require("@nestjs/common");
const mail_service_1 = require("../comms/mail.service");
const notice_service_1 = require("../comms/notice.service");
const smtp_config_service_1 = require("../comms/smtp-config.service");
const user_service_1 = require("../user/user.service");
const payroll_display_util_1 = require("../../utils/payroll/payroll-display.util");
let PayrollNotificationService = class PayrollNotificationService {
    constructor(staffService, noticeService, mailService, smtpConfigService) {
        this.staffService = staffService;
        this.noticeService = noticeService;
        this.mailService = mailService;
        this.smtpConfigService = smtpConfigService;
    }
    async isPayrollEmailEnabled() {
        const config = await this.smtpConfigService?.getConfig();
        if (config && config.payrollEmailEnabled === false) {
            return false;
        }
        return true;
    }
    buildPortalUrl(path) {
        return (0, payroll_display_util_1.buildPayrollPortalUrl)(path);
    }
    normalizeEmail(value) {
        return (0, payroll_display_util_1.normalizePayrollEmail)(value);
    }
    async collectNotificationEmails(userIds) {
        const recipients = new Set();
        const uniqueIds = Array.from(new Set((userIds ?? []).map((value) => String(value)).filter(Boolean)));
        await Promise.all(uniqueIds.map(async (userId) => {
            const staff = await this.staffService.getById(userId).catch(() => null);
            if (!staff)
                return;
            const email = this.normalizeEmail(staff?.email);
            if (email)
                recipients.add(email);
            const deptEmail = this.normalizeEmail(typeof staff?.department === 'object'
                ? staff.department?.groupEmail
                : null);
            if (deptEmail)
                recipients.add(deptEmail);
        }));
        return Array.from(recipients);
    }
    async sendPayrollApprovalEmail(userIds, templateType, templateVariables) {
        if (!this.mailService || !userIds?.length)
            return;
        if (!(await this.isPayrollEmailEnabled()))
            return;
        const recipients = await this.collectNotificationEmails(userIds);
        if (!recipients.length)
            return;
        const results = await Promise.allSettled(recipients.map((to) => this.mailService.sendMail({ to, templateType, templateVariables })));
        results.forEach((result) => {
            if (result.status === 'rejected') {
                console.error('Failed to send payroll approval email', result.reason);
            }
        });
    }
    collectParticipantIds(approval) {
        return (0, payroll_display_util_1.collectPayrollParticipantIds)(approval);
    }
    async notifyCompletion(approval, entityName) {
        const recipients = this.collectParticipantIds(approval);
        if (!recipients.length)
            return;
        const link = `/payroll/approvals/${approval._id.toString()}`;
        const monthLabel = (0, payroll_display_util_1.resolvePayrollApprovalMonthLabel)(approval);
        const approvalLink = this.buildPortalUrl('/payroll-approval');
        const message = `Payroll (${monthLabel}) for ${entityName} has been approved.`;
        await Promise.all(recipients.map((userId) => this.noticeService.createNotice({
            userId,
            message,
            link,
            type: 'payroll-approval-approved',
        })));
        await this.sendPayrollApprovalEmail(recipients, 'payroll-approval-approved', {
            entityName,
            periodLabel: monthLabel,
            approvalLink,
        });
        await this.notifyBankingOperations(approval, entityName);
    }
    async notifyRejection(approval, entityName) {
        const recipients = this.collectParticipantIds(approval);
        if (!recipients.length)
            return;
        const link = `/payroll/approvals/${approval._id.toString()}`;
        const monthLabel = (0, payroll_display_util_1.resolvePayrollApprovalMonthLabel)(approval);
        const approvalLink = this.buildPortalUrl('/payroll-approval');
        const message = `Payroll (${monthLabel}) for ${entityName} was rejected.`;
        await Promise.all(recipients.map((userId) => this.noticeService.createNotice({
            userId,
            message,
            link,
            type: 'payroll-approval-rejected',
        })));
        await this.sendPayrollApprovalEmail(recipients, 'payroll-approval-rejected', {
            entityName,
            periodLabel: monthLabel,
            approvalLink,
        });
    }
    async notifyStageAssignees(userIds, approvalId, entityName, monthLabel, stage) {
        if (!userIds?.length)
            return;
        const message = `Payroll (${monthLabel}) for ${entityName} requires your approval (${stage}).`;
        const link = `/payroll/approvals/${approvalId}`;
        const approvalLink = this.buildPortalUrl('/payroll-approval');
        await Promise.all(userIds.map((userId) => this.noticeService.createNotice({
            userId,
            message,
            link,
            type: 'payroll-approval',
        })));
        await this.sendPayrollApprovalEmail(userIds, 'payroll-approval', {
            entityName,
            periodLabel: monthLabel,
            stage,
            approvalLink,
        });
    }
    async notifyAuditViewers(userIds, approvalId, entityName, monthLabel) {
        if (!userIds?.length)
            return;
        const message = `Payroll (${monthLabel}) for ${entityName} is ready for audit/finance viewing.`;
        const link = `/payroll/approvals/${approvalId}`;
        const approvalLink = this.buildPortalUrl('/payroll-approval');
        await Promise.all(userIds.map((userId) => this.noticeService.createNotice({
            userId,
            message,
            link,
            type: 'payroll-approval-view',
        })));
        await this.sendPayrollApprovalEmail(userIds, 'payroll-approval-view', {
            entityName,
            periodLabel: monthLabel,
            approvalLink,
        });
    }
    async notifyBankingOperations(approval, entityName) {
        try {
            const keywords = [
                'head of banking operations',
                'banking operations',
                'hbo',
                'head of operations',
                'operations head',
            ];
            const candidates = await this.staffService.getStaffByRoleKeywords(keywords, approval.entity);
            const recipients = (candidates ?? [])
                .map((staff) => String(staff?._id ?? staff?.id ?? ''))
                .filter((value) => value && value !== 'undefined');
            if (!recipients.length)
                return;
            const link = `/payroll/approvals/${approval._id.toString()}`;
            const monthLabel = (0, payroll_display_util_1.resolvePayrollApprovalMonthLabel)(approval);
            const approvalLink = this.buildPortalUrl('/payroll-approval');
            const message = `Payroll (${monthLabel}) for ${entityName} has been approved and awaits banking operations funding.`;
            await Promise.all(recipients.map((userId) => this.noticeService.createNotice({
                userId,
                message,
                link,
                type: 'payroll-approval-banking',
            })));
            await this.sendPayrollApprovalEmail(recipients, 'payroll-approval-banking', {
                entityName,
                periodLabel: monthLabel,
                approvalLink,
            });
        }
        catch {
        }
    }
};
exports.PayrollNotificationService = PayrollNotificationService;
exports.PayrollNotificationService = PayrollNotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Optional)()),
    __param(3, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [user_service_1.StaffService,
        notice_service_1.NoticeService,
        mail_service_1.MailService,
        smtp_config_service_1.SmtpConfigService])
], PayrollNotificationService);
//# sourceMappingURL=payroll-notification.service.js.map