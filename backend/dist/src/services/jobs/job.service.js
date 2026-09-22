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
exports.JobService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const job_schema_1 = require("../../schemas/job.schema");
const application_schema_1 = require("../../schemas/application.schema");
const mail_service_1 = require("../comms/mail.service");
let JobService = class JobService {
    constructor(jobModel, applicationModel, notificationService) {
        this.jobModel = jobModel;
        this.applicationModel = applicationModel;
        this.notificationService = notificationService;
    }
    buildActionBy(user) {
        if (!user)
            return undefined;
        const id = user?._id ?? user?.id ?? user?.userId;
        const firstName = typeof user?.firstName === 'string' ? user.firstName.trim() : '';
        const lastName = typeof user?.lastName === 'string' ? user.lastName.trim() : '';
        const name = `${firstName} ${lastName}`.trim();
        const email = typeof user?.email === 'string' ? user.email.trim() : '';
        if (!id && !name && !email)
            return undefined;
        return {
            id: id ? String(id) : undefined,
            name: name || undefined,
            email: email || undefined,
        };
    }
    async createJob(data) {
        const payload = { ...data };
        if (payload.entity) {
            payload.entity = new mongoose_2.default.Types.ObjectId(String(payload.entity));
        }
        return this.jobModel.create(payload);
    }
    async updateJob(id, data) {
        const payload = { ...data };
        if (payload.entity) {
            payload.entity = new mongoose_2.default.Types.ObjectId(String(payload.entity));
        }
        return this.jobModel.findByIdAndUpdate(id, payload, { new: true });
    }
    async deleteJob(id) {
        const deleted = await this.jobModel.findByIdAndDelete(id);
        if (!deleted) {
            throw new common_1.NotFoundException('Vacancy not found.');
        }
        return { deleted: true };
    }
    async listVacancies(filter, page = 1, limit = 10) {
        const query = {};
        if (filter.status)
            query.status = filter.status;
        if (filter.location)
            query.location = filter.location;
        if (filter.search) {
            query.title = { $regex: new RegExp(filter.search, 'i') };
        }
        if (filter.entity && mongoose_2.default.Types.ObjectId.isValid(filter.entity)) {
            query.entity = new mongoose_2.default.Types.ObjectId(filter.entity);
        }
        const total = await this.jobModel.countDocuments(query);
        const data = await this.jobModel
            .find(query)
            .populate('entity', 'name short')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }
    async getJob(id) {
        return this.jobModel
            .findOne({ _id: new mongoose_2.default.Types.ObjectId(id) })
            .populate('entity', 'name short');
    }
    async applyToJob(data) {
        try {
            if (!data.job) {
                throw new Error('Job reference is required');
            }
            const jobId = new mongoose_2.default.Types.ObjectId(data.job);
            const job = await this.jobModel
                .findById(jobId)
                .select('entity')
                .lean()
                .exec();
            if (!job) {
                throw new Error('Job not found');
            }
            const initialStatus = typeof data.status === 'string' && data.status.trim().length
                ? data.status.trim().toLowerCase()
                : 'submitted';
            const applicantName = `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim();
            const applicantEmail = typeof data.email === 'string' ? data.email.trim() : '';
            const applicantActionBy = applicantName || applicantEmail
                ? {
                    name: applicantName || undefined,
                    email: applicantEmail || undefined,
                }
                : undefined;
            const payload = {
                ...data,
                job: jobId,
                entity: data.entity && mongoose_2.default.Types.ObjectId.isValid(String(data.entity))
                    ? new mongoose_2.default.Types.ObjectId(String(data.entity))
                    : job.entity,
                status: initialStatus,
                history: [
                    {
                        status: initialStatus,
                        date: new Date(),
                        actionBy: applicantActionBy,
                    },
                ],
            };
            return this.applicationModel.create(payload);
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async listApplications(filter, page = 1, limit = 10) {
        const query = {};
        if (filter.status)
            query.status = filter.status;
        if (filter.entity && mongoose_2.default.Types.ObjectId.isValid(filter.entity)) {
            query.entity = new mongoose_2.default.Types.ObjectId(filter.entity);
        }
        if (filter.search) {
            const regex = new RegExp(filter.search, 'i');
            query.$or = [
                { firstName: { $regex: regex } },
                { lastName: { $regex: regex } },
                { email: { $regex: regex } },
            ];
        }
        const total = await this.applicationModel.countDocuments(query);
        const data = await this.applicationModel
            .find(query)
            .populate('job')
            .populate('entity', 'name short')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        return {
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getApplication(id) {
        return this.applicationModel
            .findOne({ _id: new mongoose_2.default.Types.ObjectId(id) })
            .populate('job')
            .populate('entity', 'name short');
    }
    async updateApplicationStatus(id, status, date, note, user) {
        try {
            const normalizedStatus = typeof status === 'string' && status.trim().length
                ? status.trim().toLowerCase()
                : '';
            if (!normalizedStatus) {
                throw new Error('Status is required');
            }
            const application = await this.applicationModel
                .findById(id)
                .populate('job')
                .exec();
            if (!application) {
                throw new Error('Application not found');
            }
            const previousStatus = application.status;
            application.status = normalizedStatus;
            const parsedDate = date ? new Date(date) : new Date();
            const historyDate = Number.isNaN(parsedDate.getTime())
                ? new Date()
                : parsedDate;
            const trimmedNote = typeof note === 'string' && note.trim().length ? note.trim() : undefined;
            if (!Array.isArray(application.history)) {
                application.history = [];
            }
            application.history.push({
                status: normalizedStatus,
                previousStatus: previousStatus ?? undefined,
                date: historyDate,
                note: trimmedNote,
                actionBy: this.buildActionBy(user),
            });
            await application.save();
            if (normalizedStatus !== 'hired') {
                const jobTitle = application?.job?.title;
                await this.notificationService.sendMail({
                    to: `${application.email}`,
                    templateType: application.status,
                    templateVariables: {
                        firstName: application?.firstName,
                        title: jobTitle,
                        type: application.status,
                        companyName: 'Addosser',
                        date: date !== undefined ? date : '',
                        logo: 'https://intranet.addosser.com/img/logo.png',
                    },
                });
            }
            return { status: 200, message: 'Update successful' };
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
};
exports.JobService = JobService;
exports.JobService = JobService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(job_schema_1.Job.name)),
    __param(1, (0, mongoose_1.InjectModel)(application_schema_1.Application.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mail_service_1.MailService])
], JobService);
//# sourceMappingURL=job.service.js.map