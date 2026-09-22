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
var WorkflowNotifier_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowNotifier = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notice_service_1 = require("./notice.service");
const mail_service_1 = require("./mail.service");
const user_schema_1 = require("../../schemas/user.schema");
const subsidiary_schema_1 = require("../../schemas/subsidiary.schema");
const STAGE_BY_EVENT = {
    submitted: 'reviewer',
    reviewed: 'approver',
    approved: 'poster',
    posted: null,
    rejected: null,
};
let WorkflowNotifier = WorkflowNotifier_1 = class WorkflowNotifier {
    constructor(noticeService, mailService, userModel, subsidiaryModel) {
        this.noticeService = noticeService;
        this.mailService = mailService;
        this.userModel = userModel;
        this.subsidiaryModel = subsidiaryModel;
        this.logger = new common_1.Logger(WorkflowNotifier_1.name);
    }
    async dispatch(input) {
        try {
            const ctx = await this.resolveContext(input.module, input.event, input.doc);
            const recipients = new Set();
            if (!input.skipStageRecipients) {
                ctx.nextStageRecipients.forEach((id) => id && recipients.add(id));
            }
            (input.extraRecipients ?? []).forEach((id) => id && recipients.add(String(id)));
            if (ctx.initiatorId) {
                recipients.add(ctx.initiatorId);
            }
            if (!recipients.size)
                return;
            const initiatorId = ctx.initiatorId;
            const stageMessage = ctx.inAppMessageStage;
            const initiatorMessage = ctx.inAppMessageInitiator;
            await Promise.allSettled(Array.from(recipients).map(async (userId) => {
                const message = userId === initiatorId ? initiatorMessage : stageMessage;
                await this.noticeService
                    .createNotice({
                    userId,
                    message,
                    link: ctx.url,
                    type: ctx.noticeType,
                    sendEmail: false,
                })
                    .catch((error) => {
                    this.logger.warn(`Failed to create notice for ${userId}: ${error?.message ?? error}`);
                });
            }));
            await this.sendEmails(Array.from(recipients), ctx);
        }
        catch (error) {
            this.logger.error(`WorkflowNotifier.dispatch failed (${input.module}/${input.event}): ${error?.message ?? error}`);
        }
    }
    async sendEmails(userIds, ctx) {
        if (!this.mailService || !this.userModel)
            return;
        const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
        if (!uniqueIds.length)
            return;
        const users = await this.userModel
            .find({
            _id: {
                $in: uniqueIds.filter((id) => mongoose_2.default.Types.ObjectId.isValid(id)),
            },
        })
            .select('_id email')
            .lean()
            .exec();
        const emails = users
            .map((u) => (typeof u?.email === 'string' ? u.email.trim() : ''))
            .filter(Boolean);
        if (!emails.length)
            return;
        const templateVariables = {
            subject: ctx.subject,
            workflowLabel: ctx.workflowLabel,
            periodLabel: ctx.periodLabel,
            entityName: ctx.entityName,
            approvalLink: ctx.url,
            message: ctx.inAppMessageStage,
        };
        await Promise.allSettled(emails.map((to) => this.mailService.sendMail({
            to,
            templateType: ctx.emailTemplateType,
            templateVariables,
        }).catch((error) => {
            this.logger.warn(`Failed to send workflow email to ${to}: ${error?.message ?? error}`);
        })));
    }
    async resolveContext(module, event, doc) {
        switch (module) {
            case 'payroll':
                return this.resolvePayrollContext(event, doc);
            case 'leave_allowance':
                return this.resolveLeaveAllowanceContext(event, doc);
            case 'transport_allowance':
                return this.resolveTransportContext(event, doc);
            case 'inconvenience_allowance':
                return this.resolveInconvenienceContext(event, doc);
            case 'procurement':
                return this.resolveProcurementContext(event, doc);
            case 'others':
                return this.resolveOthersContext(event, doc);
        }
    }
    async resolvePayrollContext(event, doc) {
        const id = String(doc?._id ?? '');
        const url = `/payroll/approvals/${id}`;
        const entityName = await this.lookupEntityName(doc?.entity);
        const periodLabel = this.formatMonthLabel(doc?.processedAt ?? doc?.createdAt ?? new Date());
        const workflowLabel = this.formatPayrollLabel(doc?.types);
        const noticeType = this.payrollNoticeType(doc?.types, event);
        return {
            subject: `${workflowLabel} ${this.eventVerb(event)} — ${entityName} (${periodLabel})`,
            inAppMessageStage: this.stageMessage(workflowLabel, entityName, periodLabel, event),
            inAppMessageInitiator: this.initiatorMessage(workflowLabel, entityName, periodLabel, event, doc?.rejectionReason),
            url,
            noticeType,
            emailTemplateType: `workflow.payroll.${event}`,
            initiatorId: this.normalizeId(doc?.initiatorId ?? doc?.requestedBy),
            nextStageRecipients: this.recipientsFromArrayDoc(doc, event),
            periodLabel,
            entityName,
            workflowLabel,
        };
    }
    async resolveLeaveAllowanceContext(event, doc) {
        const id = String(doc?._id ?? '');
        const url = `/payroll-leave-approvals/${id}`;
        const entityName = await this.lookupEntityName(doc?.entity);
        const periodLabel = this.formatMonthLabelFromYearMonth(doc?.year, doc?.month, doc);
        const workflowLabel = 'Leave Allowance';
        return {
            subject: `${workflowLabel} ${this.eventVerb(event)} — ${entityName} (${periodLabel})`,
            inAppMessageStage: this.stageMessage(workflowLabel, entityName, periodLabel, event),
            inAppMessageInitiator: this.initiatorMessage(workflowLabel, entityName, periodLabel, event, doc?.rejectionReason),
            url,
            noticeType: 'leave-allowance-approval',
            emailTemplateType: `workflow.leave-allowance.${event}`,
            initiatorId: this.normalizeId(doc?.initiatorId ?? doc?.requestedBy),
            nextStageRecipients: this.recipientsFromArrayDoc(doc, event),
            periodLabel,
            entityName,
            workflowLabel,
        };
    }
    async resolveProcurementContext(event, doc) {
        const id = String(doc?._id ?? '');
        const url = `/procurement/${id}`;
        const entityName = await this.lookupEntityName(doc?.entity);
        const reference = typeof doc?.reference === 'string' ? doc.reference : '';
        const title = typeof doc?.title === 'string' ? doc.title.trim() : '';
        const periodLabel = [reference, title].filter(Boolean).join(' · ') || 'Requisition';
        const workflowLabel = 'Procurement';
        return {
            subject: `${workflowLabel} ${this.eventVerb(event)} — ${entityName} (${periodLabel})`,
            inAppMessageStage: this.stageMessage(workflowLabel, entityName, periodLabel, event),
            inAppMessageInitiator: this.initiatorMessage(workflowLabel, entityName, periodLabel, event, doc?.rejectionReason),
            url,
            noticeType: 'procurement-requisition',
            emailTemplateType: `workflow.procurement.${event}`,
            initiatorId: this.normalizeId(doc?.requestedBy),
            nextStageRecipients: this.procurementRecipients(doc),
            periodLabel,
            entityName,
            workflowLabel,
        };
    }
    procurementRecipients(doc) {
        const stage = String(doc?.currentStage ?? '');
        if (stage === 'APPROVER') {
            const approver = this.normalizeId(doc?.assignedApprover);
            return approver ? [approver] : [];
        }
        if (stage === 'REVIEWER') {
            const requester = this.normalizeId(doc?.requestedBy);
            return requester ? [requester] : [];
        }
        return [];
    }
    async resolveInconvenienceContext(event, doc) {
        const id = String(doc?._id ?? '');
        const url = `/payroll-inconvenience-approvals/${id}`;
        const entityName = await this.lookupEntityName(doc?.entity);
        const monthLabel = this.formatMonthLabelFromYearMonth(doc?.year, doc?.month, doc);
        const week = Number.isFinite(doc?.weekOfMonth) ? Number(doc.weekOfMonth) : null;
        const periodLabel = week ? `Week ${week}, ${monthLabel}` : monthLabel;
        const workflowLabel = 'Inconvenience Allowance';
        return {
            subject: `${workflowLabel} ${this.eventVerb(event)} — ${entityName} (${periodLabel})`,
            inAppMessageStage: this.stageMessage(workflowLabel, entityName, periodLabel, event),
            inAppMessageInitiator: this.initiatorMessage(workflowLabel, entityName, periodLabel, event, doc?.rejectionReason),
            url,
            noticeType: 'inconvenience-allowance-approval',
            emailTemplateType: `workflow.inconvenience-allowance.${event}`,
            initiatorId: this.normalizeId(doc?.requestedBy),
            nextStageRecipients: this.recipientsFromArrayDoc(doc, event),
            periodLabel,
            entityName,
            workflowLabel,
        };
    }
    async resolveTransportContext(event, doc) {
        const id = String(doc?._id ?? '');
        const url = `/payroll-transport-approvals/${id}`;
        const entityName = await this.lookupEntityName(doc?.entity);
        const monthLabel = this.formatMonthLabelFromYearMonth(doc?.year, doc?.month, doc);
        const week = Number.isFinite(doc?.weekOfMonth) ? Number(doc.weekOfMonth) : null;
        const periodLabel = week ? `Week ${week}, ${monthLabel}` : monthLabel;
        const workflowLabel = 'Transport Allowance';
        return {
            subject: `${workflowLabel} ${this.eventVerb(event)} — ${entityName} (${periodLabel})`,
            inAppMessageStage: this.stageMessage(workflowLabel, entityName, periodLabel, event),
            inAppMessageInitiator: this.initiatorMessage(workflowLabel, entityName, periodLabel, event, doc?.rejectionReason),
            url,
            noticeType: 'transport-allowance-approval',
            emailTemplateType: `workflow.transport-allowance.${event}`,
            initiatorId: this.normalizeId(doc?.requestedBy),
            nextStageRecipients: this.recipientsFromArrayDoc(doc, event),
            periodLabel,
            entityName,
            workflowLabel,
        };
    }
    async resolveOthersContext(event, doc) {
        const id = String(doc?._id ?? '');
        const url = `/compensation-others-approval/${id}`;
        const entityName = await this.lookupEntityName(doc?.entity);
        const periodLabel = this.formatMonthOnlyLabel(doc?.month);
        const title = (typeof doc?.title === 'string' && doc.title.trim()) || 'Compensation';
        const workflowLabel = title;
        return {
            subject: `${workflowLabel} ${this.eventVerb(event)} — ${entityName} (${periodLabel})`,
            inAppMessageStage: this.stageMessage(workflowLabel, entityName, periodLabel, event),
            inAppMessageInitiator: this.initiatorMessage(workflowLabel, entityName, periodLabel, event, null),
            url,
            noticeType: 'compensation-others-approval',
            emailTemplateType: `workflow.others.${event}`,
            initiatorId: this.normalizeId(doc?.createdBy),
            nextStageRecipients: this.recipientsFromOthersDoc(doc, event),
            periodLabel,
            entityName,
            workflowLabel,
        };
    }
    recipientsFromArrayDoc(doc, event) {
        const stage = STAGE_BY_EVENT[event];
        if (!stage)
            return [];
        const field = stage === 'reviewer'
            ? 'reviewerIds'
            : stage === 'approver'
                ? 'approverIds'
                : 'postingIds';
        return this.normalizeIdList(doc?.[field]);
    }
    recipientsFromOthersDoc(doc, event) {
        const stage = STAGE_BY_EVENT[event];
        if (!stage)
            return [];
        const field = stage === 'reviewer'
            ? 'reviewerId'
            : stage === 'approver'
                ? 'approverId'
                : 'posterId';
        const id = doc?.workflow?.[field];
        const normalized = this.normalizeId(id);
        return normalized ? [normalized] : [];
    }
    normalizeId(value) {
        if (value == null)
            return null;
        if (typeof value === 'string') {
            const trimmed = value.trim();
            return trimmed && trimmed !== 'undefined' && trimmed !== 'null' ? trimmed : null;
        }
        if (typeof value === 'object') {
            const candidate = value?._id ?? value?.id ?? value;
            if (typeof candidate?.toString === 'function') {
                const str = candidate.toString();
                return str && str !== '[object Object]' ? str : null;
            }
        }
        return null;
    }
    normalizeIdList(values) {
        if (!Array.isArray(values))
            return [];
        const result = [];
        for (const value of values) {
            const id = this.normalizeId(value);
            if (id)
                result.push(id);
        }
        return result;
    }
    formatPayrollLabel(types) {
        const list = Array.isArray(types) ? types.filter(Boolean) : [];
        if (!list.length)
            return 'Payroll';
        if (list.length === 1) {
            switch (list[0]) {
                case 'salary':
                    return 'Salary Payroll';
                case 'variable':
                    return 'Variable Pay';
                case 'reimbursable':
                    return 'Reimbursement';
                default:
                    return `Payroll (${this.titleCase(String(list[0]))})`;
            }
        }
        const labelled = list
            .map((t) => this.titleCase(String(t)))
            .join(', ');
        return `Payroll (${labelled})`;
    }
    payrollNoticeType(types, event) {
        const list = Array.isArray(types) ? types.filter(Boolean) : [];
        if (list.length === 1) {
            switch (list[0]) {
                case 'salary':
                    return event === 'rejected'
                        ? 'payroll-approval-rejected'
                        : event === 'approved' || event === 'posted'
                            ? 'payroll-approval-approved'
                            : 'payroll-approval';
                case 'variable':
                    return 'payroll-approval-variable';
                case 'reimbursable':
                    return 'payroll-approval-reimbursable';
            }
        }
        return event === 'rejected'
            ? 'payroll-approval-rejected'
            : event === 'approved' || event === 'posted'
                ? 'payroll-approval-approved'
                : 'payroll-approval';
    }
    eventVerb(event) {
        switch (event) {
            case 'submitted':
                return 'submitted for review';
            case 'reviewed':
                return 'awaiting approval';
            case 'approved':
                return 'awaiting posting';
            case 'posted':
                return 'posted';
            case 'rejected':
                return 'rejected';
        }
    }
    stageMessage(workflowLabel, entityName, periodLabel, event) {
        switch (event) {
            case 'submitted':
                return `${workflowLabel} (${periodLabel}) for ${entityName} requires your review.`;
            case 'reviewed':
                return `${workflowLabel} (${periodLabel}) for ${entityName} requires your approval.`;
            case 'approved':
                return `${workflowLabel} (${periodLabel}) for ${entityName} requires your posting.`;
            case 'posted':
                return `${workflowLabel} (${periodLabel}) for ${entityName} has been posted.`;
            case 'rejected':
                return `${workflowLabel} (${periodLabel}) for ${entityName} was rejected.`;
        }
    }
    initiatorMessage(workflowLabel, entityName, periodLabel, event, rejectionReason) {
        switch (event) {
            case 'submitted':
                return `Your ${workflowLabel.toLowerCase()} (${periodLabel}) for ${entityName} was submitted and is awaiting review.`;
            case 'reviewed':
                return `Your ${workflowLabel.toLowerCase()} (${periodLabel}) for ${entityName} was reviewed and is awaiting approval.`;
            case 'approved':
                return `Your ${workflowLabel.toLowerCase()} (${periodLabel}) for ${entityName} was approved and is awaiting posting.`;
            case 'posted':
                return `Your ${workflowLabel.toLowerCase()} (${periodLabel}) for ${entityName} has been posted.`;
            case 'rejected': {
                const reason = typeof rejectionReason === 'string' && rejectionReason.trim()
                    ? ` Reason: ${rejectionReason.trim()}`
                    : '';
                return `Your ${workflowLabel.toLowerCase()} (${periodLabel}) for ${entityName} was rejected.${reason}`;
            }
        }
    }
    titleCase(value) {
        return value
            .split(/[\s_-]+/)
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');
    }
    formatMonthLabel(value) {
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime()))
            return '';
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    }
    formatMonthLabelFromYearMonth(year, month, doc) {
        const y = Number(year);
        const m = Number(month);
        if (Number.isFinite(y) && Number.isFinite(m) && m >= 1 && m <= 12) {
            return new Date(y, m - 1, 1).toLocaleString('default', {
                month: 'long',
                year: 'numeric',
            });
        }
        return this.formatMonthLabel(doc?.processedAt ?? doc?.createdAt ?? new Date());
    }
    formatMonthOnlyLabel(value) {
        if (typeof value !== 'string')
            return '';
        const trimmed = value.trim();
        if (!trimmed)
            return '';
        const ymMatch = /^(\d{4})-(\d{1,2})$/.exec(trimmed);
        if (ymMatch) {
            const y = Number(ymMatch[1]);
            const m = Number(ymMatch[2]);
            if (m >= 1 && m <= 12) {
                return new Date(y, m - 1, 1).toLocaleString('default', {
                    month: 'long',
                    year: 'numeric',
                });
            }
        }
        return trimmed;
    }
    async lookupEntityName(entity) {
        if (!entity)
            return 'Entity';
        if (typeof entity === 'object' && entity?.name) {
            return String(entity.name);
        }
        if (!this.subsidiaryModel)
            return 'Entity';
        const id = this.normalizeId(entity);
        if (!id || !mongoose_2.default.Types.ObjectId.isValid(id))
            return 'Entity';
        const sub = (await this.subsidiaryModel.findById(id).select('name short').lean().exec());
        return (sub?.name ?? sub?.short ?? 'Entity');
    }
};
exports.WorkflowNotifier = WorkflowNotifier;
exports.WorkflowNotifier = WorkflowNotifier = WorkflowNotifier_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __param(2, (0, common_1.Optional)()),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(3, (0, common_1.Optional)()),
    __param(3, (0, mongoose_1.InjectModel)(subsidiary_schema_1.Subsidiary.name)),
    __metadata("design:paramtypes", [notice_service_1.NoticeService,
        mail_service_1.MailService,
        mongoose_2.Model,
        mongoose_2.Model])
], WorkflowNotifier);
//# sourceMappingURL=workflow-notifier.service.js.map