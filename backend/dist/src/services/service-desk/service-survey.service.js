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
exports.ServiceSurveyService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const service_survey_schema_1 = require("../../schemas/service-survey.schema");
const user_service_1 = require("../user/user.service");
let ServiceSurveyService = class ServiceSurveyService {
    constructor(surveyModel, staffService) {
        this.surveyModel = surveyModel;
        this.staffService = staffService;
    }
    normalizeEntity(entity) {
        if (!entity)
            return undefined;
        const code = String(entity).trim().toUpperCase();
        const allowed = new Set(['AIL', 'AFL', 'AMFB', 'SALEKO', 'AFR']);
        return allowed.has(code) ? code : undefined;
    }
    toObjectId(value) {
        if (!mongoose_2.Types.ObjectId.isValid(value)) {
            throw new common_1.BadRequestException('Invalid identifier');
        }
        return new mongoose_2.Types.ObjectId(value);
    }
    toObjectIdOrNull(value) {
        if (!value)
            return null;
        try {
            return this.toObjectId(String(value));
        }
        catch {
            return null;
        }
    }
    buildServiceAreaCode(serviceArea) {
        if (!serviceArea)
            return '';
        const raw = serviceArea.trim();
        const bracketMatch = raw.match(/\(([^)]+)\)/);
        if (bracketMatch && bracketMatch[1]) {
            const inside = bracketMatch[1].trim();
            const words = inside.split(/\s+/).filter(Boolean);
            if (words.length === 1) {
                return words[0].slice(0, 2).toUpperCase();
            }
            if (words.length >= 2) {
                return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
            }
        }
        const prefix = raw.split(/\s+/)[0] ?? raw;
        return prefix.slice(0, 3).toUpperCase();
    }
    async createExternal(payload) {
        const entity = this.normalizeEntity(payload.entity);
        const respondent = payload.internalRespondent;
        const respondentId = this.toObjectIdOrNull(respondent ?? undefined);
        if (!respondentId) {
            throw new common_1.BadRequestException('Creator (respondent) identifier is required and must be valid.');
        }
        if (payload.referenceCode) {
            const existing = await this.surveyModel.findOne({
                referenceCode: payload.referenceCode.trim(),
                customerType: 'EXTERNAL',
            });
            if (existing) {
                return this.updateSurvey(existing, {
                    ...payload,
                    customerType: 'EXTERNAL',
                    entity: entity,
                });
            }
        }
        return this.createSurvey({
            ...payload,
            customerType: 'EXTERNAL',
            entity: entity,
            internalRespondent: respondentId.toHexString(),
        });
    }
    async createInternal(payload, respondentId) {
        return this.createSurvey({
            ...payload,
            customerType: 'INTERNAL',
            internalRespondent: respondentId ?? undefined,
        });
    }
    async createSurvey(payload) {
        if (!payload.serviceArea || !payload.serviceArea.trim()) {
            throw new common_1.BadRequestException('Service area is required');
        }
        const parsedRequestDate = this.parseDate(payload.requestSubmittedAt);
        const parsedResponseDate = this.parseDate(payload.responseReceivedAt);
        const { turnaroundActualHours, turnaroundMetTarget } = this.calculateTurnaround(parsedRequestDate, parsedResponseDate, payload.turnaroundTargetHours != null
            ? Number(payload.turnaroundTargetHours)
            : undefined);
        const internalRespondentId = this.toObjectIdOrNull(payload.internalRespondent ?? undefined);
        if (payload.internalRespondent && !internalRespondentId) {
            throw new common_1.BadRequestException('Creator (respondent) identifier is required and must be valid.');
        }
        const survey = await this.surveyModel.create({
            customerType: payload.customerType,
            entity: this.normalizeEntity(payload.entity),
            serviceArea: payload.serviceArea.trim(),
            department: payload.department?.trim(),
            unit: payload.unit?.trim(),
            satisfactionRating: this.normalizeScore(payload.satisfactionRating),
            responsivenessRating: this.normalizeScore(payload.responsivenessRating),
            turnaroundRating: this.normalizeScore(payload.turnaroundRating),
            comments: payload.comments?.trim(),
            referenceCode: payload.referenceCode?.trim(),
            requestSubmittedAt: parsedRequestDate,
            responseReceivedAt: parsedResponseDate,
            turnaroundTargetHours: payload.turnaroundTargetHours != null
                ? Number(payload.turnaroundTargetHours)
                : undefined,
            turnaroundActualHours,
            turnaroundMetTarget,
            internalRespondent: internalRespondentId ?? undefined,
        });
        return survey;
    }
    async updateSurvey(existing, payload) {
        const parsedRequestDate = this.parseDate(payload.requestSubmittedAt);
        const parsedResponseDate = this.parseDate(payload.responseReceivedAt);
        const { turnaroundActualHours, turnaroundMetTarget } = this.calculateTurnaround(parsedRequestDate ?? existing.requestSubmittedAt, parsedResponseDate ?? existing.responseReceivedAt, payload.turnaroundTargetHours != null
            ? Number(payload.turnaroundTargetHours)
            : existing.turnaroundTargetHours ?? undefined);
        existing.serviceArea = payload.serviceArea?.trim() || existing.serviceArea;
        const normalizedEntity = this.normalizeEntity(payload.entity);
        if (normalizedEntity) {
            existing.entity = normalizedEntity;
        }
        existing.department = payload.department?.trim() ?? existing.department;
        existing.unit = payload.unit?.trim() ?? existing.unit;
        existing.satisfactionRating =
            this.normalizeScore(payload.satisfactionRating) ?? existing.satisfactionRating;
        existing.responsivenessRating =
            this.normalizeScore(payload.responsivenessRating) ?? existing.responsivenessRating;
        existing.turnaroundRating =
            this.normalizeScore(payload.turnaroundRating) ?? existing.turnaroundRating;
        existing.comments = payload.comments?.trim() ?? existing.comments;
        existing.requestSubmittedAt = parsedRequestDate ?? existing.requestSubmittedAt;
        existing.responseReceivedAt = parsedResponseDate ?? existing.responseReceivedAt;
        existing.turnaroundTargetHours =
            payload.turnaroundTargetHours != null
                ? Number(payload.turnaroundTargetHours)
                : existing.turnaroundTargetHours;
        existing.turnaroundActualHours = turnaroundActualHours;
        existing.turnaroundMetTarget = turnaroundMetTarget;
        if (payload.internalRespondent) {
            try {
                existing.internalRespondent = this.toObjectId(String(payload.internalRespondent));
            }
            catch {
                existing.internalRespondent = existing.internalRespondent
                    ? this.toObjectId(String(existing.internalRespondent))
                    : undefined;
            }
        }
        await existing.save();
        return existing;
    }
    async createExternalReference(payload) {
        if (!payload.internalRespondent) {
            throw new common_1.BadRequestException('Creator (respondent) identifier is required.');
        }
        const now = new Date();
        const requestDate = this.parseDate(payload.requestSubmittedAt) ?? now;
        const startOfDay = new Date(requestDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);
        const latest = await this.surveyModel
            .findOne({
            customerType: 'EXTERNAL',
            createdAt: { $gte: startOfDay, $lt: endOfDay },
        })
            .sort({ referenceSequence: -1 })
            .lean();
        const nextSequence = (latest?.referenceSequence ?? 0) + 1;
        const year = startOfDay.getFullYear();
        const month = String(startOfDay.getMonth() + 1).padStart(2, '0');
        const day = String(startOfDay.getDate()).padStart(2, '0');
        const areaCode = this.buildServiceAreaCode(payload.serviceArea);
        const internalRespondent = this.toObjectIdOrNull(payload.internalRespondent ?? undefined);
        if (!internalRespondent) {
            throw new common_1.BadRequestException('Creator (respondent) identifier is required and must be valid.');
        }
        const respondentSuffix = internalRespondent
            ? (() => {
                const raw = internalRespondent.toHexString();
                const clean = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                return clean ? `-${clean.slice(-4)}` : '';
            })()
            : '';
        const referenceCode = `${year}${month}${day}-${nextSequence}${areaCode ? `-${areaCode}` : ''}${respondentSuffix}`;
        const survey = await this.surveyModel.create({
            customerType: 'EXTERNAL',
            entity: this.normalizeEntity(payload.entity),
            serviceArea: (payload.serviceArea ?? 'General').trim() || 'General',
            unit: payload.unit?.trim(),
            referenceCode,
            referenceSequence: nextSequence,
            requestSubmittedAt: requestDate,
            internalRespondent,
        });
        return {
            referenceCode,
            requestSubmittedAt: survey.requestSubmittedAt ?? requestDate,
            survey,
        };
    }
    async findAll(options = {}) {
        const { customerType, serviceArea, from, to, page = 1, limit = 50, sort = 'desc', assignment, currentUserId, } = options;
        const safeLimit = Math.max(1, Math.min(limit, 200));
        const safePage = Math.max(1, page);
        const skip = (safePage - 1) * safeLimit;
        const query = {};
        if (customerType) {
            query.customerType = customerType;
        }
        if (serviceArea?.trim()) {
            query.serviceArea = { $regex: new RegExp(serviceArea.trim(), 'i') };
        }
        if (assignment === 'unassigned') {
            query.$or = [
                { internalRespondent: { $exists: false } },
                { internalRespondent: null },
            ];
        }
        else if (assignment === 'self') {
            const selfId = this.toObjectIdOrNull(currentUserId);
            if (!selfId) {
                return {
                    data: [],
                    pagination: {
                        page: safePage,
                        limit: safeLimit,
                        total: 0,
                        pages: 1,
                    },
                };
            }
            query.internalRespondent = selfId;
        }
        else if (assignment === 'assigned') {
            query.internalRespondent = {
                $exists: true,
                $ne: null,
            };
        }
        if (from || to) {
            const createdAtFilter = {};
            if (from) {
                const fromDate = this.parseDate(from);
                if (fromDate) {
                    createdAtFilter.$gte = fromDate;
                }
            }
            if (to) {
                const toDate = this.parseDate(to);
                if (toDate) {
                    createdAtFilter.$lte = toDate;
                }
            }
            if (Object.keys(createdAtFilter).length > 0) {
                query.createdAt = createdAtFilter;
            }
        }
        const [data, total] = await Promise.all([
            this.surveyModel
                .find(query)
                .sort({ createdAt: sort === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(safeLimit)
                .lean(),
            this.surveyModel.countDocuments(query),
        ]);
        const hydratedData = await this.attachInternalRespondentSummaries(data);
        return {
            data: hydratedData,
            pagination: {
                page: safePage,
                limit: safeLimit,
                total,
                pages: Math.ceil(total / safeLimit) || 1,
            },
        };
    }
    async assignSurvey(surveyId, actorId, respondentId) {
        if (!actorId) {
            throw new common_1.BadRequestException('Authenticated user is required.');
        }
        const targetSurvey = await this.surveyModel.findById(this.toObjectId(surveyId));
        if (!targetSurvey || targetSurvey.customerType !== 'EXTERNAL') {
            throw new common_1.NotFoundException('Survey not found.');
        }
        const actorObjectId = this.toObjectId(String(actorId));
        const respondentObjectId = this.toObjectId(respondentId ?? actorId);
        const isSelfAssignment = actorObjectId.equals(respondentObjectId);
        const actorRecord = await this.staffService.getById(actorObjectId.toHexString());
        const actorRoles = [];
        if (actorRecord?.role) {
            actorRoles.push(actorRecord.role);
        }
        if (Array.isArray(actorRecord?.additionalRoles)) {
            actorRecord.additionalRoles.forEach((entry) => {
                if (entry?.role) {
                    actorRoles.push(entry.role);
                }
            });
        }
        const canDelegateAssignment = actorRoles.some((role) => this.roleHasKeyword(role, ['supervisor', 'admin']));
        if (!isSelfAssignment && !canDelegateAssignment) {
            throw new common_1.ForbiddenException('You are not allowed to assign this survey to another colleague.');
        }
        const targetUser = await this.staffService.getById(respondentObjectId.toHexString());
        if (!targetUser) {
            throw new common_1.NotFoundException('Selected colleague was not found.');
        }
        if (targetSurvey.internalRespondent) {
            const currentAssignee = String(targetSurvey.internalRespondent);
            if (currentAssignee === respondentObjectId.toHexString()) {
                return targetSurvey;
            }
            throw new common_1.BadRequestException('Survey has already been assigned to another colleague.');
        }
        targetSurvey.internalRespondent = respondentObjectId;
        await targetSurvey.save();
        const plainSurvey = targetSurvey.toObject();
        const [enriched] = await this.attachInternalRespondentSummaries([
            plainSurvey,
        ]);
        return enriched ?? plainSurvey;
    }
    async getSummary(customerType) {
        const match = {};
        if (customerType) {
            match.customerType = customerType;
        }
        const surveys = await this.surveyModel.find(match).lean();
        const overall = this.computeMetrics(surveys);
        const internal = this.computeMetrics(surveys.filter((survey) => survey.customerType === 'INTERNAL'));
        const external = this.computeMetrics(surveys.filter((survey) => survey.customerType === 'EXTERNAL'));
        return {
            total: surveys.length,
            updatedAt: new Date().toISOString(),
            overall,
            byType: {
                INTERNAL: internal,
                EXTERNAL: external,
            },
        };
    }
    computeMetrics(items) {
        const metrics = {
            count: items.length,
            averageSatisfaction: null,
            averageResponsiveness: null,
            averageTurnaroundRating: null,
            averageTurnaroundHours: null,
            averageTurnaroundTargetHours: null,
            percentWithinTarget: null,
        };
        if (items.length === 0) {
            return metrics;
        }
        let satisfactionTotal = 0;
        let satisfactionCount = 0;
        let responsivenessTotal = 0;
        let responsivenessCount = 0;
        let turnaroundRatingTotal = 0;
        let turnaroundRatingCount = 0;
        let actualTotal = 0;
        let actualCount = 0;
        let targetTotal = 0;
        let targetCount = 0;
        let metTargetCount = 0;
        let targetEligibleCount = 0;
        for (const item of items) {
            if (this.isScore(item.satisfactionRating)) {
                satisfactionTotal += item.satisfactionRating;
                satisfactionCount += 1;
            }
            if (this.isScore(item.responsivenessRating)) {
                responsivenessTotal += item.responsivenessRating;
                responsivenessCount += 1;
            }
            if (this.isScore(item.turnaroundRating)) {
                turnaroundRatingTotal += item.turnaroundRating;
                turnaroundRatingCount += 1;
            }
            if (this.isNumber(item.turnaroundActualHours)) {
                actualTotal += item.turnaroundActualHours;
                actualCount += 1;
            }
            if (this.isNumber(item.turnaroundTargetHours)) {
                targetTotal += item.turnaroundTargetHours;
                targetCount += 1;
            }
            if (item.turnaroundMetTarget === true) {
                metTargetCount += 1;
                targetEligibleCount += 1;
            }
            else if (item.turnaroundMetTarget === false) {
                targetEligibleCount += 1;
            }
        }
        metrics.averageSatisfaction = this.averageOrNull(satisfactionTotal, satisfactionCount);
        metrics.averageResponsiveness = this.averageOrNull(responsivenessTotal, responsivenessCount);
        metrics.averageTurnaroundRating = this.averageOrNull(turnaroundRatingTotal, turnaroundRatingCount);
        metrics.averageTurnaroundHours = this.averageOrNull(actualTotal, actualCount);
        metrics.averageTurnaroundTargetHours = this.averageOrNull(targetTotal, targetCount);
        if (targetEligibleCount > 0) {
            metrics.percentWithinTarget =
                this.roundToTwo((metTargetCount / targetEligibleCount) * 100) ?? null;
        }
        else {
            metrics.percentWithinTarget = null;
        }
        return metrics;
    }
    parseDate(input) {
        if (!input) {
            return undefined;
        }
        const date = input instanceof Date ? input : new Date(input);
        if (Number.isNaN(date.getTime())) {
            return undefined;
        }
        return date;
    }
    calculateTurnaround(requestSubmittedAt, responseReceivedAt, targetMinutes) {
        if (!requestSubmittedAt || !responseReceivedAt) {
            return { turnaroundActualHours: undefined, turnaroundMetTarget: undefined };
        }
        const diff = responseReceivedAt.getTime() - requestSubmittedAt.getTime();
        if (diff < 0) {
            return { turnaroundActualHours: undefined, turnaroundMetTarget: undefined };
        }
        const minutes = this.roundToTwo(diff / (1000 * 60));
        const metTarget = this.isNumber(targetMinutes) && minutes != null
            ? minutes <= Number(targetMinutes)
            : undefined;
        return {
            turnaroundActualHours: minutes ?? undefined,
            turnaroundMetTarget: metTarget,
        };
    }
    normalizeScore(value) {
        if (value == null) {
            return undefined;
        }
        const numericValue = Number(value);
        if (Number.isNaN(numericValue)) {
            return undefined;
        }
        return Math.min(5, Math.max(1, numericValue));
    }
    isScore(value) {
        return value != null && !Number.isNaN(Number(value));
    }
    isNumber(value) {
        return value != null && !Number.isNaN(Number(value));
    }
    averageOrNull(total, count) {
        if (!count) {
            return null;
        }
        return this.roundToTwo(total / count) ?? null;
    }
    roundToTwo(value) {
        if (value == null || Number.isNaN(Number(value))) {
            return undefined;
        }
        return Math.round(Number(value) * 100) / 100;
    }
    roleHasKeyword(role, keywords) {
        if (!role) {
            return false;
        }
        const raw = typeof role === 'object'
            ? role?.name ?? role?.role ?? role
            : role;
        if (!raw) {
            return false;
        }
        const normalized = String(raw).toLowerCase();
        return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
    }
    async attachInternalRespondentSummaries(items) {
        if (!items.length) {
            return items;
        }
        const ids = Array.from(new Set(items
            .map((item) => this.extractRespondentId(item.internalRespondent))
            .filter((id) => Boolean(id))));
        if (!ids.length) {
            return items;
        }
        const summaryMap = new Map();
        await Promise.all(ids.map(async (id) => {
            try {
                const staff = await this.staffService.getById(id);
                if (staff) {
                    summaryMap.set(id, this.toStaffSummary(staff));
                }
            }
            catch (error) {
                console.warn('Unable to load staff summary', { id, error });
            }
        }));
        return items.map((item) => {
            const id = this.extractRespondentId(item.internalRespondent);
            if (!id) {
                return item;
            }
            const summary = summaryMap.get(id);
            if (!summary) {
                return item;
            }
            return {
                ...item,
                internalRespondent: summary,
            };
        });
    }
    extractRespondentId(value) {
        if (!value) {
            return null;
        }
        if (value instanceof mongoose_2.Types.ObjectId) {
            return value.toHexString();
        }
        if (typeof value === 'string') {
            return value.trim() || null;
        }
        if (typeof value === 'object') {
            const candidate = value?._id ?? value?.id ?? value?.userId ?? value?.userID;
            if (candidate) {
                return this.extractRespondentId(candidate);
            }
        }
        return null;
    }
    toStaffSummary(user) {
        const id = String(user?._id ?? user?.id ?? '');
        const firstName = user?.firstName ?? '';
        const lastName = user?.lastName ?? '';
        const computedFullName = `${firstName} ${lastName}`.trim();
        const fullName = computedFullName || user?.fullName || '';
        return {
            _id: id,
            id,
            firstName,
            lastName,
            fullName: fullName || user?.email || user?.staffId || 'Staff member',
            email: user?.email ?? null,
            staffId: user?.staffId ?? null,
            phoneNumber: user?.phoneNumber ?? null,
        };
    }
};
exports.ServiceSurveyService = ServiceSurveyService;
exports.ServiceSurveyService = ServiceSurveyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(service_survey_schema_1.ServiceSurvey.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        user_service_1.StaffService])
], ServiceSurveyService);
//# sourceMappingURL=service-survey.service.js.map