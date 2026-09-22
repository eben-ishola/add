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
exports.PerformanceCycleService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const moment = require("moment-timezone");
const performance_appraisal_cycle_schema_1 = require("../../schemas/performance-appraisal-cycle.schema");
const performance_access_util_1 = require("../../utils/performance/performance-access.util");
let PerformanceCycleService = class PerformanceCycleService {
    constructor(appraisalCycleModel) {
        this.appraisalCycleModel = appraisalCycleModel;
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
    normalizeCycleStatus(value) {
        const normalized = String(value ?? '').trim();
        if (!normalized)
            return 'Draft';
        const lower = normalized.toLowerCase();
        if (lower === 'active')
            return 'Active';
        if (lower === 'closed')
            return 'Closed';
        return 'Draft';
    }
    normalizeStringList(value) {
        const list = Array.isArray(value) ? value : value ? [value] : [];
        const unique = new Set();
        list.forEach((item) => {
            const trimmed = String(item ?? '').trim();
            if (trimmed) {
                unique.add(trimmed);
            }
        });
        return Array.from(unique);
    }
    normalizeRatingTags(value) {
        if (!Array.isArray(value))
            return [];
        return value
            .map((tag) => {
            if (!tag || typeof tag !== 'object')
                return null;
            return {
                lower: tag?.lower ?? '',
                upper: tag?.upper ?? '',
                tag: tag?.tag ?? '',
                avatar: tag?.avatar ?? '',
            };
        })
            .filter(Boolean);
    }
    parseCycleDate(value, label) {
        if (!value) {
            throw new common_1.BadRequestException(`${label} date is required.`);
        }
        if (value instanceof Date && !Number.isNaN(value.getTime())) {
            return value;
        }
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed) {
                throw new common_1.BadRequestException(`${label} date is required.`);
            }
            const parsed = moment(trimmed, ['DD-MM-YYYY', 'YYYY-MM-DD', moment.ISO_8601], true);
            if (parsed.isValid()) {
                return parsed.toDate();
            }
            const fallback = new Date(trimmed);
            if (!Number.isNaN(fallback.getTime())) {
                return fallback;
            }
        }
        throw new common_1.BadRequestException(`${label} date is invalid.`);
    }
    assertReviewWindowWithinCycle(reviewStartDate, reviewEndDate, cycleStartDate, cycleEndDate) {
        void cycleEndDate;
        if (reviewEndDate < reviewStartDate) {
            throw new common_1.BadRequestException('Review end date cannot be earlier than review start date.');
        }
        if (reviewStartDate < cycleStartDate) {
            throw new common_1.BadRequestException('Review start date cannot be earlier than appraisal start date.');
        }
    }
    serializeAppraisalCycle(record) {
        if (!record)
            return record;
        const raw = typeof record?.toJSON === 'function' ? record.toJSON() : record;
        const id = String(raw?._id ?? '');
        return {
            id,
            _id: id,
            entity: raw?.entity ? String(raw.entity) : undefined,
            title: raw?.title ?? '',
            description: raw?.description ?? '',
            year: raw?.year ?? '',
            startDate: raw?.startDate,
            endDate: raw?.endDate,
            reviewStartDate: raw?.reviewStartDate,
            reviewEndDate: raw?.reviewEndDate,
            status: raw?.status ?? 'Draft',
            types: Array.isArray(raw?.types) ? raw.types : [],
            scoreType: raw?.scoreType,
            scoreTypeLabel: raw?.scoreTypeLabel,
            ratingTagsEnabled: raw?.ratingTagsEnabled ?? false,
            arcEnabled: raw?.arcEnabled ?? false,
            ratingTags: Array.isArray(raw?.ratingTags) ? raw.ratingTags : [],
            formSnapshot: raw?.formSnapshot ?? raw?.form_snapshot,
            createdBy: raw?.createdBy ? String(raw.createdBy) : undefined,
            createdAt: raw?.createdAt,
            updatedAt: raw?.updatedAt,
        };
    }
    async listAppraisalCycles(user, entity, search) {
        const entityId = this.normalizeEntityIdStrict(entity ?? user?.entity);
        const query = { entity: new mongoose_2.Types.ObjectId(entityId) };
        if (search && String(search).trim()) {
            const trimmed = String(search).trim();
            const regex = new RegExp(trimmed, 'i');
            query.$or = [
                { title: regex },
                { description: regex },
                { year: regex },
                { status: regex },
                { types: regex },
            ];
        }
        const rows = await this.appraisalCycleModel
            .find(query)
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        return { status: 200, data: rows.map((row) => this.serializeAppraisalCycle(row)) };
    }
    async listActiveAppraisalCycles(user, entity) {
        const entityId = this.normalizeEntityIdStrict(entity ?? user?.entity ?? user?.selectedSubsidiary ?? user?.subsidiary);
        const query = {
            entity: new mongoose_2.Types.ObjectId(entityId),
            status: { $regex: /^active$/i },
        };
        const rows = await this.appraisalCycleModel
            .find(query)
            .sort({ startDate: -1 })
            .lean()
            .exec();
        return { status: 200, data: rows.map((row) => this.serializeAppraisalCycle(row)) };
    }
    async debugAppraisalCycleExists(user, entity) {
        const entityId = this.normalizeEntityIdStrict(entity ?? user?.entity ?? user?.selectedSubsidiary ?? user?.subsidiary);
        const query = { entity: new mongoose_2.Types.ObjectId(entityId) };
        const [total, activeTotal, latest] = await Promise.all([
            this.appraisalCycleModel.countDocuments(query),
            this.appraisalCycleModel.countDocuments({
                ...query,
                status: { $regex: /^active$/i },
            }),
            this.appraisalCycleModel
                .findOne(query)
                .sort({ startDate: -1, createdAt: -1 })
                .lean()
                .exec(),
        ]);
        return {
            status: 200,
            entity: entityId,
            total,
            activeTotal,
            latest: latest ? this.serializeAppraisalCycle(latest) : null,
        };
    }
    async getAppraisalCycle(user, id) {
        (0, performance_access_util_1.assertCanManagePerformanceWorkflow)(user);
        const record = await this.appraisalCycleModel.findById(id).lean().exec();
        if (!record) {
            throw new common_1.NotFoundException('Appraisal cycle not found.');
        }
        return { status: 200, data: this.serializeAppraisalCycle(record) };
    }
    async createAppraisalCycle(user, payload) {
        (0, performance_access_util_1.assertCanManagePerformanceWorkflow)(user);
        const entityId = this.normalizeEntityIdStrict(payload?.entity ?? user?.entity);
        const title = String(payload?.title ?? '').trim();
        if (!title) {
            throw new common_1.BadRequestException('Title is required.');
        }
        const description = String(payload?.description ?? '').trim();
        const year = String(payload?.year ?? new Date().getFullYear()).trim();
        if (!year) {
            throw new common_1.BadRequestException('Year is required.');
        }
        const startDate = this.parseCycleDate(payload?.startDate, 'Start');
        const endDate = this.parseCycleDate(payload?.endDate, 'End');
        if (endDate < startDate) {
            throw new common_1.BadRequestException('End date cannot be earlier than start date.');
        }
        const reviewStartDate = this.parseCycleDate(payload?.reviewStartDate, 'Review start');
        const reviewEndDate = this.parseCycleDate(payload?.reviewEndDate, 'Review end');
        this.assertReviewWindowWithinCycle(reviewStartDate, reviewEndDate, startDate, endDate);
        const status = this.normalizeCycleStatus(payload?.status);
        const types = this.normalizeStringList(payload?.types);
        const scoreType = payload?.scoreType ? String(payload.scoreType).trim() : undefined;
        const scoreTypeLabel = payload?.scoreTypeLabel
            ? String(payload.scoreTypeLabel).trim()
            : undefined;
        const ratingTagsEnabled = payload?.ratingTagsEnabled !== false;
        const arcEnabled = payload?.arcEnabled === true;
        const ratingTags = this.normalizeRatingTags(payload?.ratingTags);
        const formSnapshot = payload?.formSnapshot && typeof payload.formSnapshot === 'object'
            ? payload.formSnapshot
            : undefined;
        const createdBy = this.normalizeUserId(user?._id);
        const record = await this.appraisalCycleModel.create({
            entity: new mongoose_2.Types.ObjectId(entityId),
            title,
            description,
            year,
            startDate,
            endDate,
            reviewStartDate,
            reviewEndDate,
            status,
            types,
            scoreType,
            scoreTypeLabel,
            ratingTagsEnabled,
            arcEnabled,
            ratingTags,
            formSnapshot,
            createdBy: createdBy ? new mongoose_2.Types.ObjectId(createdBy) : undefined,
        });
        return { status: 200, data: this.serializeAppraisalCycle(record) };
    }
    async updateAppraisalCycle(user, id, payload) {
        (0, performance_access_util_1.assertCanManagePerformanceWorkflow)(user);
        const record = await this.appraisalCycleModel.findById(id).exec();
        if (!record) {
            throw new common_1.NotFoundException('Appraisal cycle not found.');
        }
        if (payload?.entity !== undefined) {
            const entityId = this.normalizeEntityIdStrict(payload?.entity);
            record.entity = new mongoose_2.Types.ObjectId(entityId);
        }
        if (payload?.title !== undefined) {
            const title = String(payload?.title ?? '').trim();
            if (!title) {
                throw new common_1.BadRequestException('Title is required.');
            }
            record.title = title;
        }
        if (payload?.description !== undefined) {
            record.description = String(payload?.description ?? '').trim();
        }
        if (payload?.year !== undefined) {
            const year = String(payload?.year ?? '').trim();
            if (!year) {
                throw new common_1.BadRequestException('Year is required.');
            }
            record.year = year;
        }
        if (payload?.status !== undefined) {
            record.status = this.normalizeCycleStatus(payload?.status);
        }
        if (payload?.types !== undefined) {
            record.types = this.normalizeStringList(payload?.types);
        }
        if (payload?.scoreType !== undefined) {
            record.scoreType = payload?.scoreType ? String(payload.scoreType).trim() : undefined;
        }
        if (payload?.scoreTypeLabel !== undefined) {
            record.scoreTypeLabel = payload?.scoreTypeLabel
                ? String(payload.scoreTypeLabel).trim()
                : undefined;
        }
        if (payload?.ratingTagsEnabled !== undefined) {
            record.ratingTagsEnabled = payload?.ratingTagsEnabled !== false;
        }
        if (payload?.arcEnabled !== undefined) {
            record.arcEnabled = payload?.arcEnabled === true;
        }
        if (payload?.ratingTags !== undefined) {
            record.ratingTags = this.normalizeRatingTags(payload?.ratingTags);
        }
        if (payload?.formSnapshot !== undefined) {
            record.formSnapshot =
                payload?.formSnapshot && typeof payload.formSnapshot === 'object'
                    ? payload.formSnapshot
                    : undefined;
        }
        const nextCycleStartDate = payload?.startDate !== undefined
            ? this.parseCycleDate(payload?.startDate, 'Start')
            : record.startDate;
        const nextCycleEndDate = payload?.endDate !== undefined
            ? this.parseCycleDate(payload?.endDate, 'End')
            : record.endDate;
        if (nextCycleEndDate < nextCycleStartDate) {
            throw new common_1.BadRequestException('End date cannot be earlier than start date.');
        }
        const toValidDate = (value) => {
            if (!value)
                return undefined;
            if (value instanceof Date && !Number.isNaN(value.getTime()))
                return value;
            const parsed = new Date(value);
            return Number.isNaN(parsed.getTime()) ? undefined : parsed;
        };
        const existingReviewStartDate = toValidDate(record.reviewStartDate);
        const existingReviewEndDate = toValidDate(record.reviewEndDate);
        const nextReviewStartDate = payload?.reviewStartDate !== undefined
            ? this.parseCycleDate(payload?.reviewStartDate, 'Review start')
            : existingReviewStartDate;
        const nextReviewEndDate = payload?.reviewEndDate !== undefined
            ? this.parseCycleDate(payload?.reviewEndDate, 'Review end')
            : existingReviewEndDate;
        const reviewWindowUpdated = payload?.reviewStartDate !== undefined ||
            payload?.reviewEndDate !== undefined ||
            payload?.startDate !== undefined ||
            payload?.endDate !== undefined;
        if (reviewWindowUpdated &&
            ((nextReviewStartDate && !nextReviewEndDate) ||
                (!nextReviewStartDate && nextReviewEndDate))) {
            throw new common_1.BadRequestException('Both review start date and review end date are required.');
        }
        if (reviewWindowUpdated && nextReviewStartDate && nextReviewEndDate) {
            this.assertReviewWindowWithinCycle(nextReviewStartDate, nextReviewEndDate, nextCycleStartDate, nextCycleEndDate);
        }
        record.startDate = nextCycleStartDate;
        record.endDate = nextCycleEndDate;
        record.reviewStartDate = nextReviewStartDate;
        record.reviewEndDate = nextReviewEndDate;
        const saved = await record.save();
        return { status: 200, data: this.serializeAppraisalCycle(saved) };
    }
    async deleteAppraisalCycle(user, id) {
        (0, performance_access_util_1.assertCanManagePerformanceWorkflow)(user);
        const record = await this.appraisalCycleModel.findByIdAndDelete(id).lean().exec();
        if (!record) {
            throw new common_1.NotFoundException('Appraisal cycle not found.');
        }
        return { status: 200, deleted: true };
    }
};
exports.PerformanceCycleService = PerformanceCycleService;
exports.PerformanceCycleService = PerformanceCycleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(performance_appraisal_cycle_schema_1.PerformanceAppraisalCycle.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PerformanceCycleService);
//# sourceMappingURL=performance-cycle.service.js.map