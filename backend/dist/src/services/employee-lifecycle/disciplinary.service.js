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
exports.DisciplinaryService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const disciplinary_case_schema_1 = require("../../schemas/disciplinary-case.schema");
const user_service_1 = require("../user/user.service");
const mail_service_1 = require("../comms/mail.service");
const calendar_date_util_1 = require("../../utils/shared/calendar-date.util");
let DisciplinaryService = class DisciplinaryService {
    constructor(caseModel, staffService, mailService) {
        this.caseModel = caseModel;
        this.staffService = staffService;
        this.mailService = mailService;
    }
    normalizeDate(value) {
        if (!value)
            return undefined;
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? undefined : parsed;
    }
    normalizeEmail(value) {
        if (typeof value !== 'string')
            return null;
        const trimmed = value.trim();
        return trimmed ? trimmed : null;
    }
    buildStaffDisplayName(staff, fallback) {
        if (!staff) {
            return fallback ?? 'Employee';
        }
        const segments = [staff?.firstName, staff?.middleName, staff?.lastName]
            .filter((value) => typeof value === 'string' && value.trim().length > 0)
            .map((value) => value.trim());
        if (segments.length) {
            return segments.join(' ');
        }
        if (typeof staff?.fullName === 'string' && staff.fullName.trim()) {
            return staff.fullName.trim();
        }
        if (typeof staff?.email === 'string' && staff.email.trim()) {
            return staff.email.trim();
        }
        return fallback ?? 'Employee';
    }
    formatIncidentDate(value) {
        return (0, calendar_date_util_1.formatCalendarDate)(value, 'N/A') || 'N/A';
    }
    resolveCaseSubject(record) {
        const category = typeof record.category === 'string' && record.category.trim().length
            ? record.category.trim()
            : 'Disciplinary';
        return `Disciplinary Notice: ${category}`;
    }
    buildCaseMessage(record, employeeName) {
        const summary = typeof record.summary === 'string' ? record.summary.trim() : '';
        const nextSteps = typeof record.nextSteps === 'string' ? record.nextSteps.trim() : '';
        const lines = [
            `Hello ${employeeName},`,
            '',
            'A disciplinary case has been logged against you.',
            `Category: ${record.category ?? 'Disciplinary'}`,
            `Severity: ${record.severity ?? 'Unspecified'}`,
            `Status: ${record.status ?? 'Open'}`,
            `Incident Date: ${this.formatIncidentDate(record.incidentDate)}`,
        ];
        if (summary) {
            lines.push(`Summary: ${summary}`);
        }
        if (nextSteps) {
            lines.push(`Next Steps: ${nextSteps}`);
        }
        return lines.join('\n');
    }
    async notifyCaseCreated(record) {
        if (!this.mailService || !this.staffService)
            return;
        try {
            const staff = await this.staffService
                .getById(String(record.employeeId))
                .catch(() => null);
            const employeeEmail = this.normalizeEmail(staff?.email);
            const departmentEmail = this.normalizeEmail(staff?.department?.groupEmail);
            const recipients = employeeEmail
                ? [employeeEmail]
                : departmentEmail
                    ? [departmentEmail]
                    : [];
            if (!recipients.length)
                return;
            const employeeName = this.buildStaffDisplayName(staff, record.employeeName ?? 'Employee');
            const subject = this.resolveCaseSubject(record);
            const message = this.buildCaseMessage(record, employeeName);
            for (const to of recipients) {
                await this.mailService.sendMail({ to, subject, text: message });
            }
        }
        catch (error) {
            console.error('Failed to send disciplinary email', error);
        }
    }
    buildFilters(query) {
        const filters = {};
        if (query.entity)
            filters.entity = query.entity;
        if (query.status)
            filters.status = query.status;
        if (query.severity)
            filters.severity = query.severity;
        if (query.category)
            filters.category = query.category;
        if (query.department)
            filters.department = query.department;
        const search = typeof query.search === 'string' ? query.search.trim() : '';
        if (search) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escaped, 'i');
            filters.$or = [
                { employeeName: regex },
                { summary: regex },
                { department: regex },
                { category: regex },
            ];
        }
        return filters;
    }
    async listCases(query, page = 1, limit = 10) {
        const safePage = Math.max(Number(page) || 1, 1);
        const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
        const skip = (safePage - 1) * safeLimit;
        const filters = this.buildFilters(query);
        const [data, total] = await Promise.all([
            this.caseModel
                .find(filters)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(safeLimit)
                .lean()
                .exec(),
            this.caseModel.countDocuments(filters).exec(),
        ]);
        return {
            data,
            total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.ceil(total / safeLimit) || 1,
        };
    }
    async getCase(id) {
        const record = await this.caseModel.findById(id).lean().exec();
        if (!record) {
            throw new common_1.NotFoundException('Case not found');
        }
        return record;
    }
    async createCase(payload) {
        if (!payload?.employeeId) {
            throw new common_1.BadRequestException('Employee ID is required');
        }
        const { sendEmail, ...persisted } = payload ?? {};
        const record = new this.caseModel({
            ...persisted,
            incidentDate: this.normalizeDate(payload.incidentDate) ?? new Date(),
            salaryDeductionAppliedAt: this.normalizeDate(payload.salaryDeductionAppliedAt),
            attachments: payload.attachments ?? [],
        });
        const saved = await record.save();
        if (sendEmail !== false) {
            await this.notifyCaseCreated(saved);
        }
        return saved;
    }
    async updateCase(id, updates) {
        const record = await this.caseModel.findById(id).exec();
        if (!record) {
            throw new common_1.NotFoundException('Case not found');
        }
        if (updates.incidentDate !== undefined) {
            record.incidentDate = this.normalizeDate(updates.incidentDate);
        }
        if (updates.salaryDeductionAppliedAt !== undefined) {
            record.salaryDeductionAppliedAt = this.normalizeDate(updates.salaryDeductionAppliedAt);
        }
        if (updates.attachments) {
            record.attachments = updates.attachments;
        }
        const mergeable = { ...updates };
        delete mergeable.attachments;
        delete mergeable.incidentDate;
        delete mergeable.sendEmail;
        Object.assign(record, mergeable);
        return record.save();
    }
    async applySalaryDeduction(id, appliedBy) {
        const record = await this.caseModel.findById(id).exec();
        if (!record) {
            throw new common_1.NotFoundException('Case not found');
        }
        record.salaryDeductionRequired = true;
        if (!record.salaryDeductionApplied) {
            record.salaryDeductionApplied = true;
            record.salaryDeductionAppliedAt = new Date();
        }
        else if (!record.salaryDeductionAppliedAt) {
            record.salaryDeductionAppliedAt = new Date();
        }
        if (!record.salaryDeductionAppliedBy && appliedBy) {
            record.salaryDeductionAppliedBy = appliedBy;
        }
        return record.save();
    }
    async deleteCase(id) {
        const result = await this.caseModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException('Case not found');
        }
        return { deleted: true };
    }
    async getSummary(query) {
        const filters = this.buildFilters(query);
        const pipeline = [
            { $match: filters },
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    byStatus: [
                        { $group: { _id: '$status', count: { $sum: 1 } } },
                    ],
                    bySeverity: [
                        { $group: { _id: '$severity', count: { $sum: 1 } } },
                    ],
                    byCategory: [
                        { $group: { _id: '$category', count: { $sum: 1 } } },
                    ],
                },
            },
        ];
        const [result] = await this.caseModel.aggregate(pipeline).exec();
        return {
            total: result?.total?.[0]?.count ?? 0,
            byStatus: result?.byStatus ?? [],
            bySeverity: result?.bySeverity ?? [],
            byCategory: result?.byCategory ?? [],
        };
    }
    serializeCsvValue(value) {
        if (value === null || value === undefined)
            return '';
        const str = String(value);
        if (/[",\n]/.test(str)) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }
    async exportCases(query) {
        const filters = this.buildFilters(query);
        const records = await this.caseModel.find(filters).sort({ createdAt: -1 }).lean().exec();
        const headers = [
            'employee_id',
            'employee_name',
            'department',
            'category',
            'status',
            'severity',
            'incident_date',
            'reviewer',
            'summary',
            'next_steps',
            'created_at',
            'updated_at',
        ];
        const rows = records.map((item) => [
            item.employeeId ?? '',
            item.employeeName ?? '',
            item.department ?? '',
            item.category ?? '',
            item.status ?? '',
            item.severity ?? '',
            item.incidentDate ? new Date(item.incidentDate).toISOString() : '',
            item.reviewerName ?? item.reviewerId ?? '',
            item.summary ?? '',
            item.nextSteps ?? '',
            item.createdAt ? new Date(item.createdAt).toISOString() : '',
            item.updatedAt ? new Date(item.updatedAt).toISOString() : '',
        ]);
        const csv = [
            headers.join(','),
            ...rows.map((row) => row.map((value) => this.serializeCsvValue(value)).join(',')),
        ].join('\n');
        return csv;
    }
};
exports.DisciplinaryService = DisciplinaryService;
exports.DisciplinaryService = DisciplinaryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(disciplinary_case_schema_1.DisciplinaryCase.name)),
    __param(1, (0, common_1.Optional)()),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        user_service_1.StaffService,
        mail_service_1.MailService])
], DisciplinaryService);
//# sourceMappingURL=disciplinary.service.js.map