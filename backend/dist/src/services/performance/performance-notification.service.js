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
exports.PerformanceNotificationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notice_service_1 = require("../comms/notice.service");
const mail_service_1 = require("../comms/mail.service");
const user_schema_1 = require("../../schemas/user.schema");
const performance_review_schema_1 = require("../../schemas/performance-review.schema");
const performance_appraisal_cycle_schema_1 = require("../../schemas/performance-appraisal-cycle.schema");
const performance_access_util_1 = require("../../utils/performance/performance-access.util");
const mongo_1 = require("../../utils/shared/mongo");
const performance_review_util_1 = require("../../utils/performance/performance-review.util");
const config_1 = require("../../config");
let PerformanceNotificationService = class PerformanceNotificationService {
    constructor(userModel, reviewModel, appraisalCycleModel, noticeService, mailService) {
        this.userModel = userModel;
        this.reviewModel = reviewModel;
        this.appraisalCycleModel = appraisalCycleModel;
        this.noticeService = noticeService;
        this.mailService = mailService;
    }
    normalizeEmail(value) {
        if (typeof value !== 'string')
            return null;
        const trimmed = value.trim();
        return trimmed ? trimmed : null;
    }
    getPortalBaseUrl() {
        const candidates = [
            process.env.FRONTEND_BASE_URL,
            process.env.FRONTEND_URL,
        ];
        const fallback = config_1.config.frontendUrl;
        const base = candidates.find((value) => typeof value === 'string' && value.trim().length > 0) ?? fallback;
        return base.replace(/\/+$/, '');
    }
    buildPortalUrl(path) {
        const base = this.getPortalBaseUrl();
        if (!path)
            return base;
        if (/^https?:\/\//i.test(path)) {
            return path;
        }
        return `${base}${path.startsWith('/') ? path : `/${path}`}`;
    }
    buildOutstandingReviewReminder(input) {
        const message = input.hasReview
            ? `Reminder: your appraisal for ${input.cycleLabel} is still open. Complete and submit it before the cycle closes.`
            : `Reminder: you haven't started your appraisal for ${input.cycleLabel}. Please complete and submit it before the cycle closes.`;
        return {
            message,
            link: input.reviewLink,
            type: 'performance-review-reminder',
            emailSubject: `Appraisal reminder \u2014 ${input.cycleLabel}`,
            emailText: `Hi ${input.firstName},\n\n${message}\n\nView: ${this.buildPortalUrl(input.reviewLink)}`,
        };
    }
    buildPerformanceReviewReminder(review, stage, reviewLink) {
        const employeeName = review?.employeeName ?? review?.employeeId ?? 'Employee';
        const stageLabel = (0, performance_review_util_1.getPerformanceReviewStageLabel)((0, performance_review_util_1.normalizePerformanceReviewStage)(stage));
        const reviewPeriod = review?.reviewPeriod;
        return {
            message: `Reminder: Performance review for ${employeeName} is awaiting your review.`,
            link: reviewLink,
            type: 'performance-review-reminder',
            emailSubject: `ATTN: ${employeeName} - Performance Review`,
            emailText: `Hi,\n\n` +
                `A performance review is awaiting your action as ${stageLabel}.\n` +
                `Employee: ${employeeName}\n` +
                (reviewPeriod ? `Review period: ${reviewPeriod}\n` : '') +
                `\nView: ${this.buildPortalUrl(reviewLink)}`,
        };
    }
    async collectNotificationEmails(userIds) {
        const recipients = new Set();
        const uniqueIds = Array.from(new Set((userIds ?? []).map((value) => String(value)).filter(Boolean)));
        const objectIds = (0, mongo_1.toObjectIds)(uniqueIds);
        if (!objectIds.length)
            return [];
        const users = await this.userModel
            .find({ _id: { $in: objectIds } })
            .select('email')
            .lean()
            .exec();
        users.forEach((user) => {
            const email = this.normalizeEmail(user?.email);
            if (email)
                recipients.add(email);
        });
        return Array.from(recipients);
    }
    normalizeUserId(value) {
        if (value == null)
            return null;
        const candidate = typeof value === 'object'
            ? value?._id ?? value?.id ?? value?.userId ?? value
            : value;
        const normalized = String(candidate ?? '').trim();
        if (!normalized ||
            normalized.toLowerCase() === 'undefined' ||
            normalized.toLowerCase() === 'null') {
            return null;
        }
        if (!mongoose_2.Types.ObjectId.isValid(normalized))
            return null;
        return normalized;
    }
    normalizeUserIdList(values) {
        const list = Array.isArray(values) ? values : values ? [values] : [];
        const unique = new Set();
        list.forEach((value) => {
            const normalized = this.normalizeUserId(value);
            if (normalized) {
                unique.add(normalized);
            }
        });
        return Array.from(unique);
    }
    normalizeEntityIdStrict(value) {
        const candidate = value?._id ??
            value?.id ??
            value?.entityId ??
            value?.value ??
            (typeof value === 'string' || typeof value === 'number' ? value : undefined);
        if (!candidate) {
            throw new common_1.BadRequestException('Entity is required.');
        }
        const normalized = String(candidate).trim();
        if (!mongoose_2.Types.ObjectId.isValid(normalized)) {
            throw new common_1.BadRequestException('Entity is invalid.');
        }
        return new mongoose_2.Types.ObjectId(normalized).toHexString();
    }
    asValidDate(value) {
        if (!value)
            return null;
        const date = value instanceof Date ? value : new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }
    async prefetchReviewStartDates(reviews) {
        const cycleIds = Array.from(new Set((reviews ?? [])
            .map((review) => (review?.appraisalCycleId ? String(review.appraisalCycleId) : ''))
            .filter(Boolean)));
        const cycleStartById = new Map();
        const cycleObjectIds = (0, mongo_1.toObjectIds)(cycleIds);
        if (cycleObjectIds.length) {
            const cycleDocs = await this.appraisalCycleModel
                .find({ _id: { $in: cycleObjectIds } })
                .select('_id startDate')
                .lean()
                .exec();
            for (const cycle of cycleDocs) {
                cycleStartById.set(String(cycle._id), this.asValidDate(cycle?.startDate));
            }
        }
        const employeeIds = Array.from(new Set((reviews ?? [])
            .map((review) => (review?.employeeId ? String(review.employeeId) : ''))
            .filter(Boolean)));
        const employeeStartById = new Map();
        const employeeObjectIds = (0, mongo_1.toObjectIds)(employeeIds);
        if (employeeObjectIds.length) {
            const employeeDocs = await this.userModel
                .find({ _id: { $in: employeeObjectIds } })
                .select('_id startDate')
                .lean()
                .exec();
            for (const employee of employeeDocs) {
                employeeStartById.set(String(employee._id), this.asValidDate(employee?.startDate));
            }
        }
        return { cycleStartById, employeeStartById };
    }
    isReviewEmployeeLateForCycle(review, startDates) {
        const cycleId = review?.appraisalCycleId ? String(review.appraisalCycleId) : '';
        const employeeId = review?.employeeId ? String(review.employeeId) : '';
        return (0, performance_review_util_1.isLateHireForCycle)(employeeId ? startDates.employeeStartById.get(employeeId) : null, cycleId ? startDates.cycleStartById.get(cycleId) : null);
    }
    getPerformanceReviewReminderStageLabel(stage) {
        return (0, performance_review_util_1.getPerformanceReviewStageLabel)((0, performance_review_util_1.normalizePerformanceReviewStage)(stage));
    }
    async notifyUsers(options) {
        const normalizedIds = this.normalizeUserIdList(options.userIds);
        if (!normalizedIds.length)
            return { notified: 0, skipped: 0 };
        let skipped = 0;
        const targetIds = [];
        for (const userId of normalizedIds) {
            const alreadyNotified = options.dedupKey &&
                typeof this.noticeService.hasUnreadNotice === 'function'
                ? await this.noticeService.hasUnreadNotice({
                    userId,
                    type: options.dedupKey.type,
                    link: options.dedupKey.link,
                })
                : false;
            if (alreadyNotified) {
                skipped += 1;
            }
            else {
                targetIds.push(userId);
            }
        }
        if (!targetIds.length)
            return { notified: 0, skipped };
        await Promise.all(targetIds.map((userId) => this.noticeService.createNotice({
            userId,
            message: options.message,
            link: options.link,
            type: options.type,
        })));
        if (!this.mailService)
            return { notified: targetIds.length, skipped };
        const recipients = await this.collectNotificationEmails(targetIds);
        if (!recipients.length)
            return { notified: targetIds.length, skipped };
        const subject = options.emailSubject ?? 'Performance appraisal notification';
        const link = options.link ? this.buildPortalUrl(options.link) : undefined;
        const text = options.emailText ??
            `${options.message}${link ? `\n\nView: ${link}` : ''}`;
        const results = await Promise.allSettled(recipients.map((to) => this.mailService.sendMail({
            to,
            subject,
            text,
        })));
        results.forEach((result) => {
            if (result.status === 'rejected') {
                console.error('Failed to send performance email', result.reason);
            }
        });
        return { notified: targetIds.length, skipped };
    }
    async notifyOutstandingReviews(opts) {
        if (opts?.actor &&
            !(0, performance_access_util_1.userHasPerformanceAdminRole)(opts.actor) &&
            !(0, performance_access_util_1.userHasPerformanceSuperAdminRole)(opts.actor)) {
            throw new common_1.ForbiddenException('Only an admin or super admin can send appraisal nudges.');
        }
        const cycleQuery = { status: { $regex: /^active$/i } };
        if (opts?.entity) {
            const entityId = this.normalizeEntityIdStrict(opts.entity);
            cycleQuery.entity = new mongoose_2.Types.ObjectId(entityId);
        }
        const cycleFilterId = (0, mongo_1.toObjectId)(opts?.cycleId);
        if (cycleFilterId) {
            cycleQuery._id = cycleFilterId;
        }
        const cycles = await this.appraisalCycleModel.find(cycleQuery).lean().exec();
        const summary = {
            cycles: cycles.length,
            employeesScanned: 0,
            outstanding: 0,
            notified: 0,
            failed: 0,
            skippedNoUserId: 0,
        };
        for (const cycle of cycles) {
            const cycleIdStr = String(cycle._id);
            const cycleLabel = cycle.title ?? cycle.year ?? cycleIdStr;
            const cycleStart = cycle.startDate ? new Date(cycle.startDate) : null;
            const employeeQuery = {
                entity: cycle.entity,
                status: { $regex: /^(active|enabled)$/i },
            };
            if (cycleStart && !Number.isNaN(cycleStart.getTime())) {
                employeeQuery.$or = [
                    { startDate: { $exists: false } },
                    { startDate: null },
                    { startDate: { $lte: cycleStart } },
                ];
            }
            const employees = await this.userModel
                .find(employeeQuery)
                .select('_id firstName lastName email')
                .lean()
                .exec();
            for (const emp of employees) {
                summary.employeesScanned += 1;
                const employeeId = String(emp._id);
                const review = await this.reviewModel
                    .findOne({
                    employeeId,
                    $or: [
                        { appraisalCycleId: cycleIdStr },
                        { appraisalCycleId: cycle._id },
                    ],
                })
                    .select('_id status reviewStage')
                    .lean()
                    .exec();
                const stage = (0, performance_review_util_1.normalizePerformanceReviewStage)(review?.reviewStage);
                const status = (0, performance_review_util_1.normalizePerformanceReviewStatus)(review?.status);
                const outstanding = !review ||
                    stage === 'employee' ||
                    status === 'pending employee review';
                if (!outstanding)
                    continue;
                summary.outstanding += 1;
                if (opts?.dryRun)
                    continue;
                const reviewLink = review?._id
                    ? `/my-performance/reviews/${String(review._id)}`
                    : '/start-appraisal';
                const reminder = this.buildOutstandingReviewReminder({
                    firstName: emp.firstName ? String(emp.firstName) : 'there',
                    cycleLabel,
                    reviewLink,
                    hasReview: Boolean(review),
                });
                try {
                    const notifyResult = await this.notifyUsers({
                        userIds: [employeeId],
                        message: reminder.message,
                        link: reminder.link,
                        type: reminder.type,
                        emailSubject: `Appraisal reminder \u2014 ${cycleLabel}`,
                        emailText: reminder.emailText,
                        dedupKey: {
                            type: reminder.type,
                            link: reminder.link,
                        },
                    });
                    summary.notified += notifyResult.notified;
                }
                catch (error) {
                    summary.failed += 1;
                    console.error(`notifyOutstandingReviews: failed for employee ${employeeId}`, error);
                }
            }
        }
        return summary;
    }
    async nudgeAllPendingSupervisors(filters, actor) {
        if (!(0, performance_access_util_1.canManagePerformanceWorkflow)(actor)) {
            throw new common_1.ForbiddenException('You are not allowed to nudge performance review supervisors.');
        }
        const query = {
            reviewStage: { $in: ['supervisor', 'supervisor2'] },
        };
        if (filters?.entity) {
            query.entity = filters.entity;
        }
        const appraisalCycleFilterId = (0, mongo_1.toObjectId)(filters?.appraisalCycleId);
        if (appraisalCycleFilterId) {
            query.appraisalCycleId = appraisalCycleFilterId;
        }
        const reviews = await this.reviewModel.find(query).lean().exec();
        if (!reviews.length) {
            return {
                status: 200,
                message: 'No reviews are currently pending supervisor action.',
                sent: 0,
                skipped: 0,
                total: 0,
            };
        }
        const startDates = await this.prefetchReviewStartDates(reviews);
        let sent = 0;
        let skipped = 0;
        for (const review of reviews) {
            const reviewer = (0, performance_review_util_1.resolveReviewerForStage)(review);
            const stage = reviewer.stage;
            const normalizedSupervisorId = reviewer.id ?? '';
            if (!normalizedSupervisorId) {
                skipped += 1;
                continue;
            }
            if (this.isReviewEmployeeLateForCycle(review, startDates)) {
                skipped += 1;
                continue;
            }
            const reviewLink = `/performance-management/reviews/${String(review?._id)}`;
            const reminder = this.buildPerformanceReviewReminder(review, stage, reviewLink);
            try {
                const notifyResult = await this.notifyUsers({
                    userIds: [normalizedSupervisorId],
                    ...reminder,
                    dedupKey: {
                        type: reminder.type,
                        link: reminder.link,
                    },
                });
                sent += notifyResult.notified;
                skipped += notifyResult.skipped;
            }
            catch (error) {
                console.error('Failed to nudge performance reviewer', error);
                skipped += 1;
            }
        }
        return {
            status: 200,
            message: `Reminders sent to ${sent} supervisor(s).`,
            sent,
            skipped,
            total: reviews.length,
        };
    }
    async nudgeReviewSupervisor(id, actor) {
        if (!(0, performance_access_util_1.canManagePerformanceWorkflow)(actor)) {
            throw new common_1.ForbiddenException('You are not allowed to nudge performance review supervisors.');
        }
        const review = await this.reviewModel.findById(id).lean().exec();
        if (!review) {
            throw new common_1.NotFoundException('Performance review not found');
        }
        const stage = (0, performance_review_util_1.normalizePerformanceReviewStage)(review?.reviewStage);
        if (stage !== 'supervisor' && stage !== 'supervisor2') {
            throw new common_1.BadRequestException('This review is not currently pending supervisor action.');
        }
        const reviewer = (0, performance_review_util_1.resolveReviewerForStage)(review);
        const normalizedSupervisorId = reviewer.id ?? '';
        if (!normalizedSupervisorId) {
            throw new common_1.BadRequestException('No supervisor is assigned for the current review stage.');
        }
        const startDates = await this.prefetchReviewStartDates([review]);
        if (this.isReviewEmployeeLateForCycle(review, startDates)) {
            throw new common_1.BadRequestException('This employee joined after the cycle began and is not in scope.');
        }
        const reviewLink = `/performance-management/reviews/${String(review?._id ?? id)}`;
        const stageLabel = this.getPerformanceReviewReminderStageLabel(stage);
        const reminder = this.buildPerformanceReviewReminder(review, stage, reviewLink);
        const notifyResult = await this.notifyUsers({
            userIds: [normalizedSupervisorId],
            ...reminder,
            dedupKey: {
                type: reminder.type,
                link: reminder.link,
            },
        });
        return {
            status: 200,
            message: notifyResult.notified
                ? `Reminder sent to ${stageLabel.toLowerCase()}.`
                : `Reminder already pending for ${stageLabel.toLowerCase()}.`,
        };
    }
};
exports.PerformanceNotificationService = PerformanceNotificationService;
exports.PerformanceNotificationService = PerformanceNotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(performance_review_schema_1.PerformanceReview.name)),
    __param(2, (0, mongoose_1.InjectModel)(performance_appraisal_cycle_schema_1.PerformanceAppraisalCycle.name)),
    __param(4, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        notice_service_1.NoticeService,
        mail_service_1.MailService])
], PerformanceNotificationService);
//# sourceMappingURL=performance-notification.service.js.map