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
exports.PerformanceKpiResultService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const kpi_schema_1 = require("../../schemas/kpi.schema");
const performance_kpi_result_schema_1 = require("../../schemas/performance-kpi-result.schema");
const performance_review_schema_1 = require("../../schemas/performance-review.schema");
const performance_service_1 = require("./performance.service");
const DEFAULT_COLLECTION_SOURCES = ['manual', 'mixed'];
const normalizeString = (value) => {
    if (value === null || value === undefined)
        return undefined;
    const trimmed = String(value).trim();
    return trimmed ? trimmed : undefined;
};
const parseNumber = (value) => {
    if (value === null || value === undefined)
        return null;
    const cleaned = String(value).replace(/,/g, '').trim();
    if (!cleaned)
        return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
};
const formatPeriod = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};
const normalizePeriod = (value) => {
    if (!value)
        return formatPeriod(new Date());
    if (value instanceof Date)
        return formatPeriod(value);
    const trimmed = String(value).trim();
    if (/^\d{4}-\d{2}$/.test(trimmed))
        return trimmed;
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
        throw new common_1.BadRequestException(`Invalid period '${value}'. Use YYYY-MM.`);
    }
    return formatPeriod(parsed);
};
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let PerformanceKpiResultService = class PerformanceKpiResultService {
    constructor(resultModel, kpiModel, reviewModel, performanceService) {
        this.resultModel = resultModel;
        this.kpiModel = kpiModel;
        this.reviewModel = reviewModel;
        this.performanceService = performanceService;
    }
    buildScopeKey(input) {
        if (input.employeeId) {
            return {
                scopeKey: `employee:${input.employeeId}`,
                scopeType: 'employee',
                scopeId: input.employeeId,
                scopeName: input.scopeName,
            };
        }
        const scopeType = normalizeString(input.scopeType);
        const scopeId = normalizeString(input.scopeId);
        const scopeName = normalizeString(input.scopeName);
        const scopeValue = scopeId ?? scopeName;
        if (!scopeType || !scopeValue) {
            throw new common_1.BadRequestException('Scope information is required.');
        }
        return {
            scopeKey: `${scopeType}:${scopeValue}`,
            scopeType,
            scopeId,
            scopeName,
        };
    }
    computeScore(actualValue, kpi) {
        const actual = parseNumber(actualValue);
        const target = parseNumber(kpi?.targetValue);
        if (actual === null || target === null || target === 0) {
            return { achievement: null, score: null };
        }
        const method = normalizeString(kpi?.scoringMethod)?.toLowerCase() ?? 'ratio';
        const direction = normalizeString(kpi?.scoreDirection)?.toLowerCase() ?? 'higher';
        let ratio = 0;
        if (method === 'binary') {
            if (direction === 'lower') {
                ratio = actual <= target ? 1 : 0;
            }
            else {
                ratio = actual >= target ? 1 : 0;
            }
        }
        else if (direction === 'lower') {
            ratio = actual === 0 ? 0 : target / actual;
        }
        else {
            ratio = target === 0 ? 0 : actual / target;
        }
        const achievement = Math.max(0, Math.min(1, ratio));
        const weight = Number.isFinite(Number(kpi?.weight)) ? Number(kpi.weight) : 1;
        const score = achievement * weight;
        return { achievement, score };
    }
    hasActualValue(value) {
        return value !== null && value !== undefined && String(value).trim() !== '';
    }
    normalizeKpiTitle(value) {
        return String(value ?? '')
            .toLowerCase()
            .replace(/\s*\(copy\)/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
    resolveDisplayStatus(rawStatus, source) {
        if (source === 'none')
            return 'not-submitted';
        if (source === 'snapshot')
            return 'snapshot';
        if (source === 'catalog')
            return 'result';
        const normalized = normalizeString(rawStatus)?.toLowerCase();
        if (!normalized || normalized === 'not-submitted')
            return 'submitted';
        return normalized;
    }
    withResolvedActualValue(row, fallbacks) {
        let resolvedActualValue = null;
        let actualValueSource = 'none';
        if (this.hasActualValue(row?.actualValue)) {
            resolvedActualValue = row.actualValue;
            actualValueSource = 'result';
        }
        else if (this.hasActualValue(fallbacks?.catalogActualValue)) {
            resolvedActualValue = fallbacks?.catalogActualValue;
            actualValueSource = 'catalog';
        }
        else if (this.hasActualValue(fallbacks?.snapshotActualValue)) {
            resolvedActualValue = fallbacks?.snapshotActualValue;
            actualValueSource = 'snapshot';
        }
        const normalizedStatus = normalizeString(row?.status)?.toLowerCase();
        const approvedLegacyValue = this.hasActualValue(row?.actualValue) &&
            (normalizedStatus === 'approved' ||
                normalizedStatus === 'completed' ||
                normalizedStatus === 'reviewed');
        const employeeActualValue = this.hasActualValue(row?.employeeActualValue)
            ? row.employeeActualValue
            : approvedLegacyValue
                ? row.actualValue
                : undefined;
        const reviewerActualValue = this.hasActualValue(row?.reviewerActualValue)
            ? row.reviewerActualValue
            : approvedLegacyValue
                ? row.actualValue
                : undefined;
        return {
            ...row,
            actualValue: actualValueSource === 'none' ? (row?.actualValue ?? null) : resolvedActualValue,
            employeeActualValue,
            reviewerActualValue,
            resolvedActualValue: actualValueSource === 'none' ? null : resolvedActualValue,
            actualValueSource,
            displayStatus: this.resolveDisplayStatus(row?.status, actualValueSource),
        };
    }
    async syncReviewSnapshotActualValue(input) {
        if (!this.hasActualValue(input.actualValue))
            return;
        const kpiId = String(input.kpiId ?? '').trim();
        const hasValidKpiId = mongoose_2.Types.ObjectId.isValid(kpiId);
        const reviewId = String(input.reviewId ?? '').trim();
        const baseQuery = {};
        if (mongoose_2.Types.ObjectId.isValid(reviewId)) {
            baseQuery._id = new mongoose_2.Types.ObjectId(reviewId);
        }
        const employeeId = normalizeString(input.employeeId);
        if (employeeId) {
            baseQuery.employeeId = employeeId;
        }
        const appraisalCycleId = String(input.appraisalCycleId ?? '').trim();
        if (mongoose_2.Types.ObjectId.isValid(appraisalCycleId)) {
            baseQuery.appraisalCycleId = new mongoose_2.Types.ObjectId(appraisalCycleId);
        }
        if (hasValidKpiId) {
            const oid = new mongoose_2.Types.ObjectId(kpiId);
            const result = await this.reviewModel
                .updateMany({
                ...baseQuery,
                'kpiSnapshot.kpiId': oid,
            }, {
                $set: {
                    'kpiSnapshot.$[snapshot].actualValue': input.actualValue,
                    kpiSnapshotAt: new Date(),
                },
            }, { arrayFilters: [{ 'snapshot.kpiId': oid }] })
                .exec();
            if ((result.matchedCount ?? 0) > 0)
                return;
        }
        const normalizedTitle = this.normalizeKpiTitle(input.title);
        if (!normalizedTitle)
            return;
        const reviews = await this.reviewModel
            .find({
            ...baseQuery,
            'kpiSnapshot.title': { $regex: new RegExp(escapeRegExp(normalizedTitle), 'i') },
        })
            .exec();
        for (const review of reviews) {
            const snapshot = Array.isArray(review?.kpiSnapshot) ? review.kpiSnapshot : [];
            let changed = false;
            for (const entry of snapshot) {
                if (this.normalizeKpiTitle(entry?.title) !== normalizedTitle)
                    continue;
                entry.actualValue = input.actualValue;
                changed = true;
            }
            if (!changed)
                continue;
            review.kpiSnapshotAt = new Date();
            await review.save();
        }
    }
    async listResults(filters, page = 1, limit = 20) {
        const safePage = Math.max(Number(page) || 1, 1);
        const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
        const skip = (safePage - 1) * safeLimit;
        const query = {};
        if (filters?.appraisalCycleId && mongoose_2.Types.ObjectId.isValid(filters.appraisalCycleId)) {
            const cycleKpis = await this.kpiModel
                .find({ appraisalCycleId: new mongoose_2.Types.ObjectId(filters.appraisalCycleId) })
                .select('_id')
                .lean()
                .exec();
            const kpiIds = cycleKpis.map((k) => k._id);
            if (!kpiIds.length) {
                return { data: [], total: 0, page: safePage, limit: safeLimit, totalPages: 1 };
            }
            query.kpiId = { $in: kpiIds };
        }
        else {
            const rangeStart = filters?.periodStart ? normalizePeriod(filters.periodStart) : undefined;
            const rangeEnd = filters?.periodEnd ? normalizePeriod(filters.periodEnd) : undefined;
            if (rangeStart || rangeEnd) {
                let start = rangeStart;
                let end = rangeEnd;
                if (start && end && start > end) {
                    const swap = start;
                    start = end;
                    end = swap;
                }
                query.period = {};
                if (start)
                    query.period.$gte = start;
                if (end)
                    query.period.$lte = end;
            }
            else if (filters?.period) {
                query.period = normalizePeriod(filters.period);
            }
        }
        if (filters?.entity)
            query.entity = filters.entity;
        if (filters?.status)
            query.status = filters.status;
        if (filters?.source)
            query.source = filters.source;
        if (filters?.kpiId)
            query.kpiId = new mongoose_2.Types.ObjectId(filters.kpiId);
        if (filters?.employeeId) {
            const ids = new Set();
            String(filters.employeeId)
                .split(',')
                .map((segment) => segment.trim())
                .filter(Boolean)
                .forEach((id) => ids.add(id));
            if (ids.size) {
                query.employeeId = { $in: Array.from(ids) };
            }
        }
        if (filters?.search) {
            const regex = new RegExp(filters.search, 'i');
            query.$or = [
                { employeeName: regex },
                { employeeId: regex },
                { scopeKey: regex },
                { scopeName: regex },
            ];
        }
        const shouldMergeSnapshot = Boolean(filters?.appraisalCycleId &&
            mongoose_2.Types.ObjectId.isValid(filters.appraisalCycleId) &&
            filters?.employeeId &&
            !filters?.kpiId &&
            !filters?.search &&
            !filters?.status);
        if (shouldMergeSnapshot) {
            const employeeIds = String(filters.employeeId)
                .split(',')
                .map((segment) => segment.trim())
                .filter(Boolean);
            const reviews = await this.reviewModel
                .find({
                appraisalCycleId: new mongoose_2.Types.ObjectId(filters.appraisalCycleId),
                employeeId: { $in: employeeIds },
                ...(filters?.entity ? { entity: filters.entity } : {}),
            })
                .lean()
                .exec();
            const employeeMatchValues = new Set();
            const roleMatchValues = new Set();
            for (const id of employeeIds) {
                employeeMatchValues.add(id);
                employeeMatchValues.add(`employee:${id}`);
            }
            const reviewKpiIdSet = new Set();
            for (const review of reviews) {
                const reviewEmployeeId = normalizeString(review?.employeeId);
                const reviewEmployeeName = normalizeString(review?.employeeName);
                if (reviewEmployeeId) {
                    employeeMatchValues.add(reviewEmployeeId);
                    employeeMatchValues.add(`employee:${reviewEmployeeId}`);
                }
                if (reviewEmployeeName)
                    employeeMatchValues.add(reviewEmployeeName);
                const reviewKpiIds = [
                    ...(Array.isArray(review?.kpiIds) ? review.kpiIds : []),
                    ...(Array.isArray(review?.kpiSnapshot)
                        ? review.kpiSnapshot.map((entry) => entry?.kpiId)
                        : []),
                ];
                for (const value of reviewKpiIds) {
                    const id = String(value ?? '').trim();
                    if (mongoose_2.Types.ObjectId.isValid(id))
                        reviewKpiIdSet.add(id);
                }
            }
            if (reviewKpiIdSet.size) {
                const reviewKpis = await this.kpiModel
                    .find({
                    _id: {
                        $in: Array.from(reviewKpiIdSet).map((id) => new mongoose_2.Types.ObjectId(id)),
                    },
                })
                    .select('roleId roleName')
                    .lean()
                    .exec();
                for (const kpi of reviewKpis) {
                    const roleId = normalizeString(kpi?.roleId);
                    const roleName = normalizeString(kpi?.roleName);
                    if (roleId) {
                        roleMatchValues.add(roleId);
                        roleMatchValues.add(`role:${roleId}`);
                    }
                    if (roleName)
                        roleMatchValues.add(roleName);
                }
            }
            const resultQuery = { ...query };
            delete resultQuery.employeeId;
            const employeeMatchList = Array.from(employeeMatchValues);
            const roleMatchList = Array.from(roleMatchValues);
            if (employeeMatchList.length || roleMatchList.length) {
                resultQuery.$or = [
                    ...(employeeMatchList.length
                        ? [
                            { employeeId: { $in: employeeMatchList } },
                            { employeeName: { $in: employeeMatchList } },
                            { scopeId: { $in: employeeMatchList } },
                            { scopeName: { $in: employeeMatchList } },
                            { scopeKey: { $in: employeeMatchList } },
                        ]
                        : []),
                    ...(roleMatchList.length
                        ? [
                            { roleId: { $in: roleMatchList } },
                            { roleName: { $in: roleMatchList } },
                            { scopeId: { $in: roleMatchList } },
                            { scopeName: { $in: roleMatchList } },
                            { scopeKey: { $in: roleMatchList } },
                        ]
                        : []),
                ];
            }
            const data = await this.resultModel
                .find(resultQuery)
                .sort({ updatedAt: -1 })
                .populate({
                path: 'kpiId',
                select: 'title description targetValue measurementUnit weight type kpa collectionSource externalKey scoringMethod scoreDirection actualValue scoredBy appraisalCycleId',
            })
                .lean()
                .exec();
            const normalizeTitle = (value) => this.normalizeKpiTitle(value);
            const resultRank = (row) => {
                const status = normalizeString(row?.status)?.toLowerCase();
                const hasAnyValue = this.hasActualValue(row?.actualValue) ||
                    this.hasActualValue(row?.employeeActualValue) ||
                    this.hasActualValue(row?.reviewerActualValue) ||
                    this.hasActualValue(row?.resolvedActualValue);
                if (status === 'approved' || status === 'completed' || status === 'reviewed') {
                    return hasAnyValue ? 5 : 4;
                }
                if (status === 'submitted')
                    return hasAnyValue ? 4 : 3;
                if (hasAnyValue)
                    return 2;
                if (status === 'draft')
                    return 0;
                return 1;
            };
            const rankedData = [...data].sort((a, b) => {
                const rankDelta = resultRank(b) - resultRank(a);
                if (rankDelta !== 0)
                    return rankDelta;
                const aUpdated = new Date(a?.updatedAt ?? a?.createdAt ?? 0).getTime();
                const bUpdated = new Date(b?.updatedAt ?? b?.createdAt ?? 0).getTime();
                return bUpdated - aUpdated;
            });
            const dedupedData = [];
            const resolvedByKey = new Set();
            const resolvedByTitle = new Set();
            for (const row of rankedData) {
                const kpiIdValue = String((row?.kpiId && typeof row.kpiId === 'object' ? row.kpiId?._id : row?.kpiId) ?? '');
                const empIdValue = String(row?.employeeId ?? '');
                const titleValue = row?.kpiId && typeof row.kpiId === 'object'
                    ? normalizeTitle(row.kpiId.title)
                    : '';
                if (!kpiIdValue || !empIdValue) {
                    dedupedData.push(row);
                    continue;
                }
                const key = `${kpiIdValue}|${empIdValue}`;
                const titleKey = titleValue ? `${titleValue}|${empIdValue}` : '';
                if (resolvedByKey.has(key))
                    continue;
                if (titleKey && resolvedByTitle.has(titleKey))
                    continue;
                resolvedByKey.add(key);
                if (titleKey)
                    resolvedByTitle.add(titleKey);
                dedupedData.push(row);
            }
            for (const row of dedupedData) {
                if (!this.hasActualValue(row?.actualValue))
                    continue;
                const kpiIdValue = String((row?.kpiId && typeof row.kpiId === 'object' ? row.kpiId?._id : row?.kpiId) ?? '');
                await this.syncReviewSnapshotActualValue({
                    kpiId: kpiIdValue,
                    actualValue: row.actualValue,
                    employeeId: String(row?.employeeId ?? ''),
                    appraisalCycleId: filters.appraisalCycleId,
                    title: row?.kpiId && typeof row.kpiId === 'object'
                        ? row.kpiId.title
                        : row?.kpiTitle,
                });
            }
            const snapshotActualByKey = new Map();
            const snapshotActualByTitle = new Map();
            const virtualRows = [];
            for (const review of reviews) {
                const period = normalizeString(review?.reviewPeriod);
                const empId = String(review?.employeeId ?? '');
                if (!empId)
                    continue;
                const storedSnapshot = Array.isArray(review?.kpiSnapshot)
                    ? review.kpiSnapshot
                    : [];
                const storedKpiIdSet = new Set(storedSnapshot
                    .map((entry) => String(entry?.kpiId ?? ''))
                    .filter(Boolean));
                let effectiveSnapshot = storedSnapshot;
                if (this.performanceService) {
                    try {
                        const reviewDate = review?.reviewDate
                            ? new Date(review.reviewDate)
                            : new Date();
                        const refreshed = await this.performanceService.resolveInitialKpis({
                            employeeId: empId,
                            employeeName: review?.employeeName,
                            reviewStartDate: review?.reviewStartDate
                                ? new Date(review.reviewStartDate)
                                : undefined,
                            reviewEndDate: review?.reviewEndDate
                                ? new Date(review.reviewEndDate)
                                : undefined,
                            reviewDate,
                            appraisalCycleId: review?.appraisalCycleId
                                ? String(review.appraisalCycleId)
                                : undefined,
                        });
                        const refreshedSnapshot = Array.isArray(refreshed?.kpiSnapshot)
                            ? refreshed.kpiSnapshot
                            : [];
                        if (refreshedSnapshot.length) {
                            const refreshedKpiIdSet = new Set(refreshedSnapshot
                                .map((entry) => String(entry?.kpiId ?? ''))
                                .filter(Boolean));
                            const idsMatch = storedKpiIdSet.size === refreshedKpiIdSet.size &&
                                Array.from(storedKpiIdSet).every((id) => refreshedKpiIdSet.has(id));
                            if (!idsMatch) {
                                const newKpiIdsArray = Array.from(refreshedKpiIdSet).map((id) => new mongoose_2.Types.ObjectId(id));
                                await this.performanceService
                                    .reconcileReviewSnapshot(String(review._id), {
                                    kpiIds: newKpiIdsArray,
                                    kpiSnapshot: refreshedSnapshot,
                                })
                                    .catch(() => undefined);
                            }
                            effectiveSnapshot = refreshedSnapshot;
                        }
                    }
                    catch {
                        effectiveSnapshot = storedSnapshot;
                    }
                }
                const snapshotKpiIds = effectiveSnapshot
                    .map((entry) => String(entry?.kpiId ?? ''))
                    .filter((id) => mongoose_2.Types.ObjectId.isValid(id));
                const snapshotKpis = snapshotKpiIds.length
                    ? await this.kpiModel
                        .find({ _id: { $in: snapshotKpiIds.map((id) => new mongoose_2.Types.ObjectId(id)) } })
                        .select('actualValue')
                        .lean()
                        .exec()
                    : [];
                const actualValueByKpiId = new Map(snapshotKpis.map((kpi) => [String(kpi?._id ?? ''), kpi?.actualValue]));
                for (const entry of effectiveSnapshot) {
                    const kpiIdValue = String(entry?.kpiId ?? '');
                    if (!kpiIdValue)
                        continue;
                    const snapshotActualValue = entry?.actualValue ?? null;
                    const catalogActualValue = actualValueByKpiId.get(kpiIdValue) ?? null;
                    const effectiveActualValue = this.hasActualValue(catalogActualValue)
                        ? catalogActualValue
                        : snapshotActualValue;
                    const hasSnapshotActualValue = this.hasActualValue(snapshotActualValue);
                    const titleValue = normalizeTitle(entry?.title);
                    const key = `${kpiIdValue}|${empId}`;
                    const titleKey = titleValue ? `${titleValue}|${empId}` : '';
                    if (hasSnapshotActualValue) {
                        snapshotActualByKey.set(key, snapshotActualValue);
                        if (titleKey)
                            snapshotActualByTitle.set(titleKey, snapshotActualValue);
                    }
                    if (this.hasActualValue(effectiveActualValue) &&
                        String(entry?.actualValue ?? '').trim() !==
                            String(effectiveActualValue).trim()) {
                        await this.syncReviewSnapshotActualValue({
                            reviewId: review?._id,
                            kpiId: kpiIdValue,
                            actualValue: effectiveActualValue,
                        });
                    }
                    if (resolvedByKey.has(key))
                        continue;
                    if (titleKey && resolvedByTitle.has(titleKey))
                        continue;
                    resolvedByKey.add(key);
                    if (titleKey)
                        resolvedByTitle.add(titleKey);
                    virtualRows.push(this.withResolvedActualValue({
                        _id: `virtual:${kpiIdValue}:${empId}:${period ?? ''}`,
                        kpiId: {
                            _id: entry.kpiId,
                            title: entry?.title,
                            description: entry?.description,
                            targetValue: entry?.targetValue,
                            actualValue: effectiveActualValue,
                            measurementUnit: entry?.measurementUnit,
                            weight: entry?.weight,
                            type: entry?.type,
                            kpa: entry?.kpa,
                        },
                        kpiActualValue: effectiveActualValue,
                        presetActualValue: snapshotActualValue,
                        period: period ?? '',
                        scopeKey: `employee:${empId}`,
                        scopeType: 'employee',
                        scopeId: empId,
                        employeeId: empId,
                        employeeName: review?.employeeName,
                        entity: review?.entity,
                        status: 'not-submitted',
                        actualValue: null,
                        achievement: null,
                        score: null,
                        source: null,
                        isVirtual: true,
                    }, { catalogActualValue, snapshotActualValue }));
                }
            }
            const resolvedData = dedupedData.map((row) => {
                const kpiIdValue = String((row?.kpiId && typeof row.kpiId === 'object' ? row.kpiId?._id : row?.kpiId) ?? '');
                const empIdValue = String(row?.employeeId ?? '');
                const titleValue = row?.kpiId && typeof row.kpiId === 'object'
                    ? normalizeTitle(row.kpiId.title)
                    : normalizeTitle(row?.kpiTitle);
                const key = `${kpiIdValue}|${empIdValue}`;
                const titleKey = titleValue ? `${titleValue}|${empIdValue}` : '';
                const snapshotActualValue = snapshotActualByKey.get(key) ??
                    (titleKey ? snapshotActualByTitle.get(titleKey) : undefined);
                const catalogActualValue = row?.kpiId && typeof row.kpiId === 'object'
                    ? row.kpiId.actualValue
                    : undefined;
                return this.withResolvedActualValue(row, {
                    snapshotActualValue,
                    catalogActualValue,
                });
            });
            const merged = [...resolvedData, ...virtualRows];
            const total = merged.length;
            const paged = merged.slice(skip, skip + safeLimit);
            return {
                data: paged,
                total,
                page: safePage,
                limit: safeLimit,
                totalPages: Math.max(Math.ceil(total / safeLimit), 1),
            };
        }
        const [data, total] = await Promise.all([
            this.resultModel
                .find(query)
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(safeLimit)
                .populate({
                path: 'kpiId',
                select: 'title description targetValue measurementUnit weight type kpa collectionSource externalKey scoringMethod scoreDirection actualValue scoredBy appraisalCycleId',
            })
                .lean()
                .exec(),
            this.resultModel.countDocuments(query).exec(),
        ]);
        const resolvedData = data.map((row) => {
            const catalogActualValue = row?.kpiId && typeof row.kpiId === 'object'
                ? row.kpiId.actualValue
                : undefined;
            return this.withResolvedActualValue(row, { catalogActualValue });
        });
        return {
            data: resolvedData,
            total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.ceil(total / safeLimit) || 1,
        };
    }
    async submitManualResult(payload, actorId) {
        const kpi = await this.kpiModel.findById(payload.kpiId).lean().exec();
        if (!kpi) {
            throw new common_1.NotFoundException('KPI not found');
        }
        const source = normalizeString(kpi.collectionSource)?.toLowerCase();
        if (source === 'api') {
            throw new common_1.BadRequestException('This KPI is API-driven and cannot be submitted manually.');
        }
        const period = normalizePeriod(payload.period);
        const employeeId = normalizeString(payload.employeeId) ?? normalizeString(kpi.employeeId);
        const employeeName = normalizeString(payload.employeeName) ?? normalizeString(kpi.employeeName);
        if (!employeeId) {
            throw new common_1.BadRequestException('Employee ID is required for manual KPI submission.');
        }
        const actualValue = normalizeString(payload.actualValue);
        if (!actualValue) {
            throw new common_1.BadRequestException('Actual value is required.');
        }
        const scope = this.buildScopeKey({ employeeId });
        const score = this.computeScore(actualValue, kpi);
        const entity = normalizeString(payload.entity) ?? normalizeString(kpi.entity);
        const update = {
            kpiId: kpi._id,
            period,
            employeeId,
            employeeName,
            ...scope,
            actualValue,
            source: 'employee',
            status: 'submitted',
            submittedBy: actorId,
            submittedAt: new Date(),
            achievement: score.achievement,
            score: score.score,
            ...(entity ? { entity } : {}),
        };
        const saved = await this.resultModel.findOneAndUpdate({ kpiId: kpi._id, period, scopeKey: scope.scopeKey, source: 'employee' }, { $set: update, $setOnInsert: { createdAt: new Date() } }, { upsert: true, new: true });
        await this.syncReviewSnapshotActualValue({
            kpiId: kpi._id,
            actualValue,
            employeeId,
            appraisalCycleId: kpi?.appraisalCycleId,
            title: kpi?.title,
        });
        return saved;
    }
    async approveResult(id, updates, actorId) {
        const sourceResult = await this.resultModel.findById(id).exec();
        if (!sourceResult) {
            throw new common_1.NotFoundException('KPI result not found');
        }
        const kpi = await this.kpiModel.findById(sourceResult.kpiId).lean().exec();
        if (!kpi) {
            throw new common_1.NotFoundException('KPI not found');
        }
        const source = normalizeString(sourceResult.source)?.toLowerCase();
        let result = sourceResult;
        if (source !== 'reviewer' && source !== 'supervisor') {
            result =
                (await this.resultModel
                    .findOne({
                    kpiId: sourceResult.kpiId,
                    period: sourceResult.period,
                    scopeKey: sourceResult.scopeKey,
                    source: 'reviewer',
                })
                    .exec()) ??
                    new this.resultModel({
                        kpiId: sourceResult.kpiId,
                        period: sourceResult.period,
                        scopeKey: sourceResult.scopeKey,
                        scopeType: sourceResult.scopeType,
                        scopeId: sourceResult.scopeId,
                        scopeName: sourceResult.scopeName,
                        employeeId: sourceResult.employeeId,
                        employeeName: sourceResult.employeeName,
                        entity: sourceResult.entity,
                        source: 'reviewer',
                    });
        }
        if (updates.actualValue !== undefined) {
            const actualValue = normalizeString(updates.actualValue);
            const parsedActual = parseNumber(actualValue);
            const targetStatus = (updates.status ?? 'approved').toLowerCase();
            const employeeValue = sourceResult.actualValue;
            let resolvedValue;
            if (parsedActual !== null) {
                resolvedValue = parsedActual;
            }
            else if (targetStatus === 'completed' && employeeValue !== undefined && employeeValue !== null) {
                resolvedValue = employeeValue;
            }
            else {
                resolvedValue = actualValue;
            }
            result.actualValue = resolvedValue;
            const scoreInput = parsedActual !== null
                ? actualValue
                : typeof resolvedValue === 'number' || typeof resolvedValue === 'string'
                    ? String(resolvedValue)
                    : undefined;
            const score = this.computeScore(scoreInput, kpi);
            result.achievement = score.achievement;
            result.score = score.score;
            result.source = 'reviewer';
            if (resolvedValue !== undefined &&
                resolvedValue !== kpi.actualValue) {
                await this.kpiModel.updateOne({ _id: kpi._id }, { $set: { actualValue: resolvedValue } });
            }
        }
        if (updates.isActualValueLocked !== undefined) {
            result.isActualValueLocked = Boolean(updates.isActualValueLocked);
            if (updates.isActualValueLocked) {
                result.lockedBy = actorId;
                result.lockedAt = new Date();
            }
            else {
                result.lockedBy = undefined;
                result.lockedAt = undefined;
            }
        }
        if (updates.status) {
            result.status = updates.status;
        }
        else {
            result.status = 'approved';
        }
        result.reviewedBy = actorId;
        result.reviewerName = normalizeString(updates.reviewerName) ?? result.reviewerName;
        result.reviewedAt = new Date();
        const saved = await result.save();
        await this.syncReviewSnapshotActualValue({
            kpiId: result.kpiId,
            actualValue: result.actualValue,
            employeeId: result.employeeId,
            appraisalCycleId: kpi?.appraisalCycleId,
            title: kpi?.title,
        });
        return saved;
    }
    async openMonthlyResults(periodInput) {
        const period = normalizePeriod(periodInput);
        const sourceFilter = {
            $or: [
                { collectionSource: { $exists: false } },
                { collectionSource: null },
                { collectionSource: '' },
                { collectionSource: { $in: DEFAULT_COLLECTION_SOURCES } },
            ],
        };
        const kpis = await this.kpiModel.find(sourceFilter).lean().exec();
        if (!kpis.length) {
            return { created: 0, skipped: 0 };
        }
        const ops = [];
        let skipped = 0;
        for (const kpi of kpis) {
            const employeeId = normalizeString(kpi.employeeId);
            if (!employeeId) {
                skipped += 1;
                continue;
            }
            const scope = this.buildScopeKey({ employeeId });
            const kpiEntity = normalizeString(kpi.entity);
            ops.push({
                updateOne: {
                    filter: { kpiId: kpi._id, period, scopeKey: scope.scopeKey, source: 'system' },
                    update: {
                        $setOnInsert: {
                            kpiId: kpi._id,
                            period,
                            ...scope,
                            employeeId,
                            employeeName: normalizeString(kpi.employeeName),
                            ...(kpiEntity ? { entity: kpiEntity } : {}),
                            status: 'draft',
                            source: 'system',
                        },
                    },
                    upsert: true,
                },
            });
        }
        if (!ops.length) {
            return { created: 0, skipped };
        }
        const result = await this.resultModel.bulkWrite(ops, { ordered: false });
        return {
            created: result.upsertedCount ?? 0,
            skipped,
        };
    }
    async importApiResults(payload) {
        const period = normalizePeriod(payload.period);
        const results = Array.isArray(payload.results) ? payload.results : [];
        if (!results.length) {
            return { updated: 0, skipped: 0 };
        }
        let updated = 0;
        let skipped = 0;
        for (const item of results) {
            const kpiId = normalizeString(item.kpiId ?? item.kpi_id ?? item.kpi);
            const externalKey = normalizeString(item.externalKey ?? item.external_key ?? item.metric);
            const kpi = kpiId
                ? await this.kpiModel.findById(kpiId).lean().exec()
                : externalKey
                    ? await this.kpiModel.findOne({ externalKey }).lean().exec()
                    : null;
            if (!kpi) {
                skipped += 1;
                continue;
            }
            const entryPeriod = normalizePeriod(item.period ?? period);
            const employeeId = normalizeString(item.employeeId ?? item.employee_id);
            const scopeKey = normalizeString(item.scopeKey ?? item.scope_key);
            const scopeType = normalizeString(item.scopeType ?? item.scope_type);
            const scopeId = normalizeString(item.scopeId ?? item.scope_id);
            const scopeName = normalizeString(item.scopeName ?? item.scope_name);
            let scope;
            try {
                scope = this.buildScopeKey({ employeeId, scopeType, scopeId, scopeName });
            }
            catch (error) {
                skipped += 1;
                continue;
            }
            const actualValue = normalizeString(item.actualValue ?? item.actual_value ?? item.value);
            if (!actualValue) {
                skipped += 1;
                continue;
            }
            const score = this.computeScore(actualValue, kpi);
            await this.resultModel.findOneAndUpdate({ kpiId: kpi._id, period: entryPeriod, scopeKey: scope.scopeKey, source: 'api' }, {
                $set: {
                    kpiId: kpi._id,
                    period: entryPeriod,
                    ...scope,
                    employeeId,
                    actualValue,
                    source: 'api',
                    status: 'approved',
                    achievement: score.achievement,
                    score: score.score,
                    reviewedAt: new Date(),
                },
                $setOnInsert: { createdAt: new Date() },
            }, { upsert: true, new: true });
            await this.syncReviewSnapshotActualValue({
                kpiId: kpi._id,
                actualValue,
                employeeId,
                appraisalCycleId: kpi?.appraisalCycleId,
                title: kpi?.title,
            });
            updated += 1;
        }
        return { updated, skipped };
    }
};
exports.PerformanceKpiResultService = PerformanceKpiResultService;
exports.PerformanceKpiResultService = PerformanceKpiResultService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(performance_kpi_result_schema_1.PerformanceKpiResult.name)),
    __param(1, (0, mongoose_1.InjectModel)(kpi_schema_1.PerformanceKpi.name)),
    __param(2, (0, mongoose_1.InjectModel)(performance_review_schema_1.PerformanceReview.name)),
    __param(3, (0, common_1.Optional)()),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => performance_service_1.PerformanceService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        performance_service_1.PerformanceService])
], PerformanceKpiResultService);
//# sourceMappingURL=performance-kpi-result.service.js.map