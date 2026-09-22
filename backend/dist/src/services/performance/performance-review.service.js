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
var PerformanceReviewService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceReviewService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const kpi_schema_1 = require("../../schemas/kpi.schema");
const performance_kpi_result_schema_1 = require("../../schemas/performance-kpi-result.schema");
const performance_review_schema_1 = require("../../schemas/performance-review.schema");
const performance_workflow_schema_1 = require("../../schemas/performance-workflow.schema");
const user_schema_1 = require("../../schemas/user.schema");
const performance_access_util_1 = require("../../utils/performance/performance-access.util");
const mongo_1 = require("../../utils/shared/mongo");
const performance_review_util_1 = require("../../utils/performance/performance-review.util");
const performance_kpi_snapshot_service_1 = require("./performance-kpi-snapshot.service");
const performance_notification_service_1 = require("./performance-notification.service");
const performance_scoring_service_1 = require("./performance-scoring.service");
let PerformanceReviewService = PerformanceReviewService_1 = class PerformanceReviewService {
    constructor(reviewModel, userModel, kpiModel, kpiResultModel, workflowModel, performanceKpiSnapshotService, performanceNotificationService, performanceScoringService) {
        this.reviewModel = reviewModel;
        this.userModel = userModel;
        this.kpiModel = kpiModel;
        this.kpiResultModel = kpiResultModel;
        this.workflowModel = workflowModel;
        this.performanceKpiSnapshotService = performanceKpiSnapshotService;
        this.performanceNotificationService = performanceNotificationService;
        this.performanceScoringService = performanceScoringService;
    }
    isPrivilegedUser(user) {
        return (0, performance_access_util_1.canManagePerformanceWorkflow)(user);
    }
    normalizeMatchKey(value) {
        if (value === null || value === undefined)
            return undefined;
        const trimmed = String(value).trim();
        return trimmed ? trimmed.toLowerCase() : undefined;
    }
    collectUserIdentifiers(user) {
        const candidates = [
            user?._id,
            user?.id,
            user?.userId,
            user?.staffId,
            user?.employeeId,
            user?.email,
        ];
        const ids = new Set();
        candidates.forEach((candidate) => {
            const key = this.normalizeMatchKey(candidate);
            if (key) {
                ids.add(key);
            }
        });
        return ids;
    }
    normalizeSubordinateScope(value) {
        const v = String(value ?? '').trim().toLowerCase();
        if (v === 'direct' || v === 'directs')
            return 'direct';
        if (v === 'indirect' || v === 'skip-level' || v === 'skip_level')
            return 'indirect';
        return 'all';
    }
    buildSupervisorScopeFilter(scope, subordinateEmployeeIds, subordinateScope = 'all', directSubordinateIds) {
        const normalized = this.normalizeIdentifier(scope);
        if (!normalized)
            return null;
        const objectId = this.normalizeUserId(normalized);
        const scopeValue = objectId ?? normalized;
        if (subordinateScope === 'direct') {
            if (!directSubordinateIds?.length)
                return { _id: { $exists: false } };
            return { employeeId: { $in: directSubordinateIds } };
        }
        if (subordinateScope === 'indirect') {
            const directs = new Set(directSubordinateIds ?? []);
            const indirects = (subordinateEmployeeIds ?? []).filter((id) => !directs.has(id));
            if (!indirects.length)
                return { _id: { $exists: false } };
            return { employeeId: { $in: indirects } };
        }
        const conditions = [
            { reviewerId: scopeValue },
            {
                reviewer2Id: scopeValue,
                reviewStage: { $in: ['supervisor2', 'hr', 'completed'] },
            },
        ];
        if (objectId) {
            conditions.push({
                hrReviewerIds: objectId,
                reviewStage: { $in: ['hr', 'completed'] },
            });
        }
        if (subordinateEmployeeIds?.length) {
            conditions.push({ employeeId: { $in: subordinateEmployeeIds } });
        }
        return conditions.length ? { $or: conditions } : null;
    }
    async getDirectSubordinateIds(supervisorId) {
        const objectId = this.normalizeUserId(supervisorId);
        if (!objectId)
            return [];
        const subs = await this.userModel
            .find({
            $or: [
                { supervisorId: new mongoose_2.Types.ObjectId(objectId) },
                { supervisor2Id: new mongoose_2.Types.ObjectId(objectId) },
            ],
        })
            .select('_id staffId')
            .lean()
            .exec();
        const ids = new Set();
        for (const sub of subs) {
            ids.add(String(sub._id));
            if (sub.staffId)
                ids.add(String(sub.staffId));
        }
        return Array.from(ids);
    }
    async getSubordinateChainIds(supervisorId, maxDepth = 5) {
        const objectId = this.normalizeUserId(supervisorId);
        if (!objectId)
            return [];
        const allSubordinateIds = new Set();
        let currentLevelIds = [objectId];
        for (let depth = 0; depth < maxDepth; depth++) {
            if (!currentLevelIds.length)
                break;
            const subordinates = await this.userModel
                .find({
                $or: [
                    { supervisorId: { $in: currentLevelIds } },
                    { supervisor2Id: { $in: currentLevelIds } },
                ],
            })
                .select('_id staffId')
                .lean()
                .exec();
            if (!subordinates.length)
                break;
            const nextLevelIds = [];
            for (const sub of subordinates) {
                const id = String(sub._id);
                if (!allSubordinateIds.has(id)) {
                    allSubordinateIds.add(id);
                    if (sub.staffId)
                        allSubordinateIds.add(String(sub.staffId));
                    nextLevelIds.push(sub._id);
                }
            }
            currentLevelIds = nextLevelIds;
        }
        return Array.from(allSubordinateIds);
    }
    buildUserAccessFilter(user) {
        const identifiers = this.collectUserIdentifiers(user);
        const actorId = this.normalizeUserId(user?._id ?? user?.id ?? user?.userId ?? user?.staffId) ??
            this.normalizeIdentifier(user?._id ?? user?.id ?? user?.userId ?? user?.staffId);
        const conditions = [];
        if (identifiers.size) {
            conditions.push({ employeeId: { $in: Array.from(identifiers) } });
        }
        if (actorId) {
            conditions.push({ reviewerId: actorId });
            conditions.push({
                reviewer2Id: actorId,
                reviewStage: { $in: ['supervisor2', 'hr', 'completed'] },
            });
            conditions.push({
                hrReviewerIds: actorId,
                reviewStage: { $in: ['hr', 'completed'] },
            });
        }
        return conditions.length ? { $or: conditions } : null;
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
        if (!mongoose_2.Types.ObjectId.isValid(normalized)) {
            return null;
        }
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
    normalizeIdentifier(value) {
        if (value === null || value === undefined)
            return undefined;
        const trimmed = String(value).trim();
        if (!trimmed)
            return undefined;
        const lower = trimmed.toLowerCase();
        if (lower === 'undefined' || lower === 'null')
            return undefined;
        return trimmed;
    }
    normalizeRating(value) {
        if (value === null || value === undefined || value === '')
            return null;
        const numeric = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(numeric))
            return null;
        return Math.min(5, Math.max(0, numeric));
    }
    normalizeCoreValueRatings(values) {
        if (!Array.isArray(values))
            return [];
        return values
            .map((entry) => {
            if (!entry || typeof entry !== 'object')
                return null;
            const coreValueId = entry.coreValueId ?? entry.id ?? entry._id ?? undefined;
            return {
                coreValueId,
                title: entry.title,
                description: entry.description,
                weight: entry.weight === undefined || entry.weight === null || entry.weight === ''
                    ? undefined
                    : Number(entry.weight),
                rating: this.normalizeRating(entry.rating),
            };
        })
            .filter(Boolean);
    }
    validateReviewPeriod(value) {
        const raw = (value ?? '').trim();
        if (!raw) {
            throw new common_1.BadRequestException('Review period is required');
        }
        const normalized = raw.toLowerCase();
        if (PerformanceReviewService_1.REVIEW_PERIOD_LABELS.has(normalized)) {
            return;
        }
        const patterns = [
            /^\d{4}-(0[1-9]|1[0-2])$/,
            /^\d{4}\s*Q[1-4]$/i,
            /^\d{4}\s*H[1-2]$/i,
            /^\d{4}\s*HY[1-2]$/i,
            /^FY\s?\d{4}$/i,
        ];
        if (patterns.some((pattern) => pattern.test(raw))) {
            return;
        }
        throw new common_1.BadRequestException('Review period must be Monthly, Quarterly, Bi-Annual, Annual, or a period like YYYY-MM, YYYY Q1, YYYY H1, or FY2026.');
    }
    buildRegex(value) {
        if (!value)
            return undefined;
        const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`^${escaped}$`, 'i');
    }
    resolveRefValue(value, nameKeys = ['name', 'title', 'label']) {
        if (!value)
            return undefined;
        if (typeof value === 'string' || typeof value === 'number') {
            return { id: String(value), name: undefined };
        }
        const id = value?._id ?? value?.id ?? value?.value;
        const nameKey = nameKeys.find((key) => typeof value?.[key] === 'string');
        const name = nameKey ? value[nameKey] : undefined;
        return {
            id: id ? String(id) : undefined,
            name,
        };
    }
    formatEmployeeName(profile, fallbackName, fallbackId) {
        const candidate = fallbackName?.trim?.();
        if (candidate)
            return candidate;
        const name = (profile?.fullName ??
            [profile?.firstName, profile?.lastName].filter(Boolean).join(' '))?.trim?.() ?? '';
        if (name)
            return name;
        return (profile?.email ??
            profile?.staffId ??
            fallbackId ??
            'Unknown employee');
    }
    async resolveEmployeeProfile(employeeId) {
        const normalized = this.normalizeIdentifier(employeeId);
        if (!normalized)
            return null;
        const objectId = this.normalizeUserId(normalized);
        const or = [
            { staffId: this.buildRegex(normalized) },
            { employeeId: this.buildRegex(normalized) },
            { email: this.buildRegex(normalized) },
        ];
        if (objectId) {
            or.unshift({ _id: new mongoose_2.Types.ObjectId(objectId) });
        }
        return this.userModel.findOne({ $or: or }).lean().exec();
    }
    async resolveReviewerName(reviewerId) {
        const trimmed = this.normalizeIdentifier(reviewerId);
        if (!trimmed)
            return undefined;
        const profile = await this.resolveEmployeeProfile(trimmed);
        return this.formatEmployeeName(profile, undefined, trimmed);
    }
    async resolveEmployeeUserId(employeeId) {
        const direct = this.normalizeUserId(employeeId);
        if (direct)
            return direct;
        const profile = await this.resolveEmployeeProfile(employeeId);
        return this.normalizeUserId(profile?._id ?? profile?.id);
    }
    normalizeEntityId(value) {
        const candidate = value?._id ??
            value?.id ??
            value?.entityId ??
            value?.value ??
            (typeof value === 'string' || typeof value === 'number' ? value : undefined);
        if (!candidate) {
            return null;
        }
        const normalized = String(candidate).trim();
        if (!normalized || !mongoose_2.Types.ObjectId.isValid(normalized)) {
            return null;
        }
        return new mongoose_2.Types.ObjectId(normalized).toHexString();
    }
    resetReviewScores(review, mode) {
        const moveToEmployeeStage = () => {
            review.reviewStage = 'employee';
            review.reviewStageUpdatedAt = new Date();
            review.status = 'Pending Employee Review';
        };
        switch (mode) {
            case 'staff':
                review.employeeScore = null;
                review.coreValueRatings = [];
                review.coreValueSnapshotAt = undefined;
                moveToEmployeeStage();
                return { didResetStage: true, shouldDeleteKpiResults: true };
            case 'all':
                review.rating = null;
                review.reviewer2Rating = null;
                review.employeeScore = null;
                review.reviewerScore = null;
                review.finalScore = null;
                review.coreValueRatings = [];
                review.coreValueSnapshotAt = undefined;
                review.reviewerCoreValueRatings = [];
                review.reviewerCoreValueSnapshotAt = undefined;
                moveToEmployeeStage();
                return { didResetStage: true, shouldDeleteKpiResults: true };
            case 'supervisor':
                review.rating = null;
                review.reviewerScore = null;
                review.finalScore = null;
                review.status = 'In Progress';
                review.reviewStage = 'supervisor';
                review.reviewStageUpdatedAt = new Date();
                return { didResetStage: true, shouldDeleteKpiResults: false };
            case 'individual':
                review.reviewerCoreValueRatings = [];
                review.reviewerCoreValueSnapshotAt = undefined;
                review.reviewerScore = null;
                review.finalScore = null;
                review.status = 'In Progress';
                review.reviewStage = 'supervisor';
                review.reviewStageUpdatedAt = new Date();
                return { didResetStage: true, shouldDeleteKpiResults: false };
            default:
                return { didResetStage: false, shouldDeleteKpiResults: false };
        }
    }
    collectReviewKpiObjectIds(review, extraKpiIds) {
        const ids = new Set();
        const register = (value) => {
            const candidate = value?._id ??
                value?.id ??
                value?.kpiId ??
                value?.kpi ??
                value;
            const normalized = String(candidate ?? '').trim();
            if (mongoose_2.Types.ObjectId.isValid(normalized)) {
                ids.add(new mongoose_2.Types.ObjectId(normalized).toHexString());
            }
        };
        (Array.isArray(review?.kpiIds) ? review.kpiIds : []).forEach(register);
        (Array.isArray(review?.kpiSnapshot)
            ? review.kpiSnapshot
            : []).forEach(register);
        (extraKpiIds ?? []).forEach(register);
        return Array.from(ids).map((id) => new mongoose_2.Types.ObjectId(id));
    }
    async deleteKpiResultsForReview(review, options) {
        const employeeId = this.normalizeIdentifier(review?.employeeId);
        const employeeName = this.normalizeIdentifier(review?.employeeName);
        const matchValues = new Set();
        if (employeeId) {
            matchValues.add(employeeId);
            matchValues.add(`employee:${employeeId}`);
        }
        if (employeeName)
            matchValues.add(employeeName);
        const kpiIds = this.collectReviewKpiObjectIds(review, options?.extraKpiIds);
        const cycleId = this.normalizeIdentifier(review?.appraisalCycleId);
        if (cycleId && mongoose_2.Types.ObjectId.isValid(cycleId)) {
            const cycleKpis = await this.kpiModel
                .find({ appraisalCycleId: new mongoose_2.Types.ObjectId(cycleId) })
                .select('_id')
                .lean()
                .exec();
            cycleKpis.forEach((kpi) => {
                const id = String(kpi?._id ?? '').trim();
                if (mongoose_2.Types.ObjectId.isValid(id)) {
                    kpiIds.push(new mongoose_2.Types.ObjectId(id));
                }
            });
        }
        const uniqueKpiIds = Array.from(new Set(kpiIds.map((id) => id.toHexString()))).map((id) => new mongoose_2.Types.ObjectId(id));
        if (!uniqueKpiIds.length || !matchValues.size) {
            return { deletedResults: 0, clearedKpis: 0 };
        }
        const matchList = Array.from(matchValues);
        const deleteResult = await this.kpiResultModel
            .deleteMany({
            kpiId: { $in: uniqueKpiIds },
            $or: [
                { employeeId: { $in: matchList } },
                { employeeName: { $in: matchList } },
                { scopeId: { $in: matchList } },
                { scopeName: { $in: matchList } },
                { scopeKey: { $in: matchList } },
            ],
        })
            .exec();
        let clearedKpis = 0;
        if (options?.clearKpiActualValue !== false) {
            const updateResult = await this.kpiModel
                .updateMany({ _id: { $in: uniqueKpiIds } }, {
                $set: { actualValue: null, isActualValueLocked: false },
                $unset: { lockedBy: 1, lockedAt: 1 },
            })
                .exec();
            clearedKpis = updateResult.modifiedCount ?? 0;
        }
        return {
            deletedResults: deleteResult.deletedCount ?? 0,
            clearedKpis,
        };
    }
    buildFilters(query) {
        const filters = {};
        const orConditions = [];
        const collectIds = (value) => {
            const ids = new Set();
            const normalized = (value ?? '').trim();
            if (!normalized)
                return ids;
            normalized.split(',').forEach((segment) => {
                const trimmed = segment.trim();
                if (!trimmed)
                    return;
                ids.add(trimmed);
                ids.add(trimmed.toLowerCase());
            });
            return ids;
        };
        if (query.entity) {
            filters.entity = query.entity;
        }
        if (query.appraisalCycleId) {
            const appraisalCycleObjectId = (0, mongo_1.toObjectId)(query.appraisalCycleId);
            if (appraisalCycleObjectId) {
                filters.appraisalCycleId = appraisalCycleObjectId;
            }
        }
        if (query.status) {
            filters.status = query.status;
        }
        if (query.department) {
            filters.department = query.department;
        }
        if (query.reviewer) {
            orConditions.push({ reviewerName: new RegExp(query.reviewer, 'i') }, { reviewerId: query.reviewer });
        }
        if (query.employeeId) {
            const ids = Array.from(collectIds(query.employeeId));
            if (ids.length) {
                orConditions.push({ employeeId: { $in: ids } }, { staffId: { $in: ids } }, { userId: { $in: ids } });
            }
        }
        if (query.search) {
            const regex = new RegExp(query.search, 'i');
            orConditions.push({ employeeName: regex }, { department: regex }, { position: regex }, { reviewType: regex }, { reviewPeriod: regex }, { status: regex }, { reviewerName: regex });
        }
        if (orConditions.length) {
            filters.$or = orConditions;
        }
        return filters;
    }
    resolveInitialReviewStage(input) {
        if (input.reviewerId)
            return 'supervisor';
        if (input.reviewer2Id)
            return 'supervisor2';
        if (input.hrReviewerIds?.length)
            return 'hr';
        return 'completed';
    }
    async assertCanAccessReview(user, review) {
        if (this.isPrivilegedUser(user))
            return;
        const identifiers = this.collectUserIdentifiers(user);
        const employeeKey = this.normalizeMatchKey(review?.employeeId);
        if (employeeKey && identifiers.has(employeeKey)) {
            return;
        }
        const actorId = this.normalizeUserId(user?._id ?? user?.id ?? user?.userId ?? user?.staffId) ??
            this.normalizeIdentifier(user?._id ?? user?.id ?? user?.userId ?? user?.staffId);
        if (!actorId) {
            throw new common_1.ForbiddenException('You do not have permission to access this performance review.');
        }
        const reviewerId = this.normalizeIdentifier(review?.reviewerId);
        const reviewer2Id = this.normalizeIdentifier(review?.reviewer2Id);
        const hrReviewerIds = this.normalizeUserIdList(review?.hrReviewerIds);
        const stage = (0, performance_review_util_1.normalizePerformanceReviewStage)(review?.reviewStage ??
            this.resolveInitialReviewStage({
                reviewerId,
                reviewer2Id,
                hrReviewerIds,
            }));
        if (reviewerId && reviewerId === actorId) {
            return;
        }
        if (reviewer2Id &&
            reviewer2Id === actorId &&
            (stage === 'supervisor2' || stage === 'hr' || stage === 'completed')) {
            return;
        }
        if (hrReviewerIds.includes(actorId) && (stage === 'hr' || stage === 'completed')) {
            return;
        }
        const subordinateIds = await this.getSubordinateChainIds(actorId);
        if (subordinateIds.length && employeeKey) {
            const employeeIdNorm = employeeKey.toLowerCase();
            const isSubordinate = subordinateIds.some((id) => id.toLowerCase() === employeeIdNorm);
            if (isSubordinate)
                return;
        }
        throw new common_1.ForbiddenException('You do not have permission to access this performance review.');
    }
    async applyAccessFilter(user, query, filters, exportMode = false) {
        const supervisorScope = this.normalizeIdentifier(query.supervisorScope);
        const subordinateScope = this.normalizeSubordinateScope(query.subordinateScope);
        const isPrivileged = this.isPrivilegedUser(user);
        if (!isPrivileged && exportMode && !supervisorScope) {
            throw new common_1.ForbiddenException('Only HR, finance, or supervisors with a defined scope may export reviews.');
        }
        if (supervisorScope && !isPrivileged) {
            const actorId = this.normalizeUserId(user?._id ?? user?.id ?? user?.userId ?? user?.staffId) ??
                this.normalizeIdentifier(user?._id ?? user?.id ?? user?.userId ?? user?.staffId);
            if (!actorId || actorId !== supervisorScope) {
                throw new common_1.ForbiddenException(exportMode
                    ? 'You do not have permission to export these reviews.'
                    : 'You do not have permission to access these reviews.');
            }
        }
        const directIds = supervisorScope
            ? await this.getDirectSubordinateIds(supervisorScope)
            : [];
        const subordinateIds = supervisorScope
            ? await this.getSubordinateChainIds(supervisorScope)
            : [];
        const scopeFilter = supervisorScope
            ? this.buildSupervisorScopeFilter(supervisorScope, subordinateIds, subordinateScope, directIds)
            : null;
        const accessFilter = !isPrivileged && !scopeFilter
            ? this.buildUserAccessFilter(user)
            : scopeFilter;
        if (accessFilter) {
            filters.$and = [...(filters.$and ?? []), accessFilter];
        }
        return { supervisorScope, subordinateScope, directIds };
    }
    async listReviews(user, query, page = 1, limit = 10) {
        const safePage = Math.max(Number(page) || 1, 1);
        const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
        const skip = (safePage - 1) * safeLimit;
        const filters = this.buildFilters(query);
        const { supervisorScope, subordinateScope, directIds } = await this.applyAccessFilter(user, query, filters);
        const useTierSort = !!supervisorScope && directIds.length > 0 && subordinateScope === 'all';
        const [data, total] = await Promise.all([
            useTierSort
                ? this.reviewModel
                    .aggregate([
                    { $match: filters },
                    {
                        $addFields: {
                            _directTier: {
                                $cond: [{ $in: ['$employeeId', directIds] }, 0, 1],
                            },
                        },
                    },
                    { $sort: { _directTier: 1, employeeName: 1, reviewDate: 1 } },
                    { $skip: skip },
                    { $limit: safeLimit },
                    { $project: { _directTier: 0 } },
                ])
                    .exec()
                : this.reviewModel
                    .find(filters)
                    .sort({ employeeName: 1, reviewDate: 1 })
                    .skip(skip)
                    .limit(safeLimit)
                    .lean()
                    .exec(),
            this.reviewModel.countDocuments(filters),
        ]);
        return {
            data,
            total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.ceil(total / safeLimit) || 1,
        };
    }
    async getReviewStats(user, query) {
        const filters = this.buildFilters(query);
        await this.applyAccessFilter(user, query, filters);
        const aggregation = await this.reviewModel.aggregate([
            { $match: filters },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    completed: {
                        $sum: {
                            $cond: [
                                {
                                    $regexMatch: {
                                        input: { $ifNull: ['$status', ''] },
                                        regex: /^completed$/i,
                                    },
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    ratedCount: {
                        $sum: { $cond: [{ $gt: ['$rating', 0] }, 1, 0] },
                    },
                    ratingSum: {
                        $sum: { $ifNull: ['$rating', 0] },
                    },
                },
            },
        ]);
        const row = aggregation[0] ?? {};
        const total = Number(row.total) || 0;
        const completed = Number(row.completed) || 0;
        const ratedCount = Number(row.ratedCount) || 0;
        const ratingSum = Number(row.ratingSum) || 0;
        return {
            total,
            completed,
            pending: Math.max(total - completed, 0),
            ratedCount,
            average: ratedCount > 0 ? ratingSum / ratedCount : null,
        };
    }
    async exportReviews(user, query) {
        const filters = this.buildFilters(query);
        await this.applyAccessFilter(user, query, filters, true);
        const data = await this.reviewModel
            .find(filters)
            .sort({ employeeName: 1, reviewDate: 1 })
            .lean()
            .exec();
        const employeeIds = Array.from(new Set(data
            .map((r) => (r?.employeeId ? String(r.employeeId) : ''))
            .filter((id) => id && mongoose_2.Types.ObjectId.isValid(id))));
        if (employeeIds.length) {
            const employeeObjectIds = (0, mongo_1.toObjectIds)(employeeIds);
            const users = await this.userModel
                .find({ _id: { $in: employeeObjectIds } })
                .select('_id staffId')
                .lean()
                .exec();
            const staffIdById = new Map();
            for (const u of users) {
                if (u?.staffId)
                    staffIdById.set(String(u._id), String(u.staffId));
            }
            for (const r of data) {
                const staffId = staffIdById.get(String(r?.employeeId));
                if (staffId)
                    r.staffId = staffId;
            }
        }
        return { data, total: data.length };
    }
    async getReview(id, user) {
        const review = await this.reviewModel.findById(id).lean().exec();
        if (!review) {
            throw new common_1.NotFoundException('Performance review not found');
        }
        if (user) {
            await this.assertCanAccessReview(user, review);
        }
        return review;
    }
    async createReview(payload) {
        if (!payload.employeeId) {
            throw new common_1.BadRequestException('Employee ID is required');
        }
        const reviewType = String(payload.reviewType ?? '').trim();
        const reviewPeriod = String(payload.reviewPeriod ?? '').trim();
        if (!reviewType || !reviewPeriod) {
            throw new common_1.BadRequestException('Review type and period are required');
        }
        this.validateReviewPeriod(reviewPeriod);
        const reviewStartDate = new Date(payload.reviewStartDate);
        if (Number.isNaN(reviewStartDate.getTime())) {
            throw new common_1.BadRequestException('Review start date is invalid');
        }
        const reviewEndDate = new Date(payload.reviewEndDate);
        if (Number.isNaN(reviewEndDate.getTime())) {
            throw new common_1.BadRequestException('Review end date is invalid');
        }
        if (reviewEndDate < reviewStartDate) {
            throw new common_1.BadRequestException('Review end date cannot be earlier than start date');
        }
        const reviewDate = payload.reviewDate !== undefined
            ? new Date(payload.reviewDate)
            : reviewEndDate;
        if (Number.isNaN(reviewDate.getTime())) {
            throw new common_1.BadRequestException('Review date is invalid');
        }
        const employeeId = payload.employeeId.trim();
        const dupQuery = { employeeId };
        if (payload.appraisalCycleId) {
            const cycleVariants = [String(payload.appraisalCycleId)];
            if (mongoose_2.Types.ObjectId.isValid(String(payload.appraisalCycleId))) {
                cycleVariants.push(new mongoose_2.Types.ObjectId(String(payload.appraisalCycleId)));
            }
            dupQuery.appraisalCycleId = { $in: cycleVariants };
        }
        else {
            dupQuery.reviewPeriod = reviewPeriod;
        }
        const existingReview = await this.reviewModel
            .findOne(dupQuery)
            .lean()
            .exec();
        if (existingReview && existingReview.reviewStage !== 'employee') {
            throw new common_1.BadRequestException(`An appraisal for ${reviewPeriod} has already been submitted.`);
        }
        const isResubmission = Boolean(existingReview && existingReview.reviewStage === 'employee');
        const profile = await this.resolveEmployeeProfile(employeeId);
        const role = this.resolveRefValue(profile?.role, ['name', 'title', 'roleName']);
        const department = this.resolveRefValue(profile?.department, [
            'name',
            'title',
            'departmentName',
        ]);
        const employeeName = this.formatEmployeeName(profile, undefined, employeeId);
        const departmentName = department?.name;
        const positionName = role?.name;
        const payloadReviewerId = this.normalizeIdentifier(payload.reviewerId);
        const payloadReviewer2Id = this.normalizeIdentifier(payload.reviewer2Id);
        const shouldAutoAssign = !payloadReviewerId && !payloadReviewer2Id;
        const supervisorIdRaw = this.normalizeUserId(profile?.supervisorId) ??
            this.normalizeIdentifier(profile?.supervisorId);
        const supervisor2IdRaw = this.normalizeUserId(profile?.supervisor2Id) ??
            this.normalizeIdentifier(profile?.supervisor2Id);
        const employeeRecordId = this.normalizeUserId(profile?._id ?? profile?.id) ??
            this.normalizeIdentifier(profile?._id ?? profile?.id);
        const supervisorId = supervisorIdRaw && supervisorIdRaw !== employeeRecordId ? supervisorIdRaw : undefined;
        const supervisor2Id = shouldAutoAssign &&
            supervisor2IdRaw &&
            supervisor2IdRaw !== employeeRecordId &&
            supervisor2IdRaw !== supervisorId
            ? supervisor2IdRaw
            : undefined;
        const entityId = this.normalizeEntityId(profile?.entity);
        let hrReviewerIds = [];
        if (entityId) {
            const workflowConfig = await this.workflowModel
                .findOne({ entity: new mongoose_2.Types.ObjectId(entityId), enabled: true })
                .lean()
                .exec();
            hrReviewerIds = this.normalizeUserIdList(workflowConfig?.hrReviewerIds);
        }
        let reviewerId = payloadReviewerId ?? (shouldAutoAssign ? supervisorId : undefined);
        let reviewer2Id = payloadReviewer2Id ?? (shouldAutoAssign ? supervisor2Id : undefined);
        if (shouldAutoAssign && !reviewerId && hrReviewerIds.length) {
            reviewerId = hrReviewerIds[0];
        }
        if (shouldAutoAssign && !reviewer2Id && hrReviewerIds.length) {
            reviewer2Id = hrReviewerIds.find((id) => id !== reviewerId);
        }
        if (reviewer2Id && reviewer2Id === reviewerId) {
            reviewer2Id = undefined;
        }
        const reviewerName = await this.resolveReviewerName(reviewerId);
        const reviewer2Name = await this.resolveReviewerName(reviewer2Id);
        const { kpiIds, kpiSnapshot } = await this.performanceKpiSnapshotService.resolveInitialKpis({
            employeeId,
            employeeName,
            reviewStartDate,
            reviewEndDate,
            reviewDate,
            appraisalCycleId: payload.appraisalCycleId
                ? String(payload.appraisalCycleId)
                : undefined,
        });
        const coreValueRatings = this.performanceKpiSnapshotService.allocateBehaviouralWeights(this.normalizeCoreValueRatings(payload.coreValueRatings), kpiSnapshot);
        const reviewerCoreValueRatings = this.performanceKpiSnapshotService.allocateBehaviouralWeights(this.normalizeCoreValueRatings(payload.reviewerCoreValueRatings), kpiSnapshot);
        const reviewStage = this.resolveInitialReviewStage({
            reviewerId,
            reviewer2Id,
            hrReviewerIds,
        });
        let saved;
        if (isResubmission) {
            const record = await this.reviewModel.findById(existingReview._id).exec();
            if (!record) {
                throw new common_1.BadRequestException('Review record not found.');
            }
            record.employeeName = employeeName;
            record.department = departmentName;
            record.entity = entityId ?? undefined;
            if (payload.appraisalCycleId) {
                record.appraisalCycleId = new mongoose_2.Types.ObjectId(String(payload.appraisalCycleId));
                record.appraisalCycleName = payload.appraisalCycleName;
            }
            record.position = positionName;
            record.reviewType = reviewType;
            record.reviewDate = reviewDate;
            record.reviewStartDate = reviewStartDate;
            record.reviewEndDate = reviewEndDate;
            record.status = payload.status ?? 'Pending';
            record.rating = this.normalizeRating(payload.rating);
            record.reviewerId = reviewerId;
            record.reviewerName = reviewerName;
            record.reviewer2Id = reviewer2Id;
            record.reviewer2Name = reviewer2Name;
            record.hrReviewerIds = hrReviewerIds;
            record.summary = payload.summary;
            record.recommendation = payload.recommendation;
            record.exceptionalAchievement = payload.exceptionalAchievement;
            record.trainingRecommendation = payload.trainingRecommendation;
            record.kpiIds = kpiIds;
            record.kpiSnapshot = kpiSnapshot;
            record.kpiSnapshotAt = new Date();
            record.coreValueRatings = coreValueRatings;
            record.coreValueSnapshotAt = coreValueRatings.length ? new Date() : undefined;
            record.reviewerCoreValueRatings = reviewerCoreValueRatings;
            record.reviewerCoreValueSnapshotAt = reviewerCoreValueRatings.length
                ? new Date()
                : undefined;
            record.reviewStage = reviewStage;
            record.reviewStageUpdatedAt = new Date();
            await this.performanceScoringService.applyComputedScores(record);
            saved = await record.save();
        }
        else {
            const record = new this.reviewModel({
                employeeId,
                employeeName,
                department: departmentName,
                entity: entityId ?? undefined,
                ...(payload.appraisalCycleId
                    ? {
                        appraisalCycleId: new mongoose_2.Types.ObjectId(String(payload.appraisalCycleId)),
                        appraisalCycleName: payload.appraisalCycleName,
                    }
                    : {}),
                position: positionName,
                reviewType,
                reviewPeriod,
                reviewDate,
                reviewStartDate,
                reviewEndDate,
                status: payload.status ?? 'Pending',
                rating: this.normalizeRating(payload.rating),
                reviewerId,
                reviewerName,
                reviewer2Id,
                reviewer2Name,
                hrReviewerIds,
                summary: payload.summary,
                recommendation: payload.recommendation,
                exceptionalAchievement: payload.exceptionalAchievement,
                trainingRecommendation: payload.trainingRecommendation,
                kpiIds,
                kpiSnapshot,
                kpiSnapshotAt: new Date(),
                coreValueRatings,
                coreValueSnapshotAt: coreValueRatings.length ? new Date() : undefined,
                reviewerCoreValueRatings,
                reviewerCoreValueSnapshotAt: reviewerCoreValueRatings.length
                    ? new Date()
                    : undefined,
                reviewStage,
                reviewStageUpdatedAt: new Date(),
            });
            await this.performanceScoringService.applyComputedScores(record);
            saved = await record.save();
        }
        const reviewId = saved._id?.toString?.() ?? '';
        const reviewerLink = '/performance-management';
        const employeeLink = reviewId ? `/my-performance/reviews/${reviewId}` : '/my-performance';
        const [employeeUserId, resolvedReviewerId, resolvedReviewer2Id] = await Promise.all([
            employeeRecordId ? Promise.resolve(employeeRecordId) : this.resolveEmployeeUserId(employeeId),
            reviewerId ? this.resolveEmployeeUserId(reviewerId) : Promise.resolve(null),
            reviewer2Id ? this.resolveEmployeeUserId(reviewer2Id) : Promise.resolve(null),
        ]);
        const stageRecipients = reviewStage === 'supervisor'
            ? [resolvedReviewerId].filter(Boolean)
            : reviewStage === 'supervisor2'
                ? [resolvedReviewer2Id].filter(Boolean)
                : reviewStage === 'hr'
                    ? hrReviewerIds
                    : [];
        if (stageRecipients.length) {
            await this.performanceNotificationService.notifyUsers({
                userIds: stageRecipients,
                message: `New appraisal submitted by ${employeeName} for ${reviewPeriod}.`,
                link: reviewerLink,
                type: 'performance-review',
                emailSubject: `Appraisal review required: ${employeeName}`,
                emailText: `Hello,\n\n${employeeName} has submitted a self appraisal for ${reviewPeriod}.\n` +
                    `Please review the submission in the HR portal.\n\nView: ${this.performanceNotificationService.buildPortalUrl(reviewerLink)}`,
            });
        }
        if (employeeUserId) {
            await this.performanceNotificationService.notifyUsers({
                userIds: [employeeUserId],
                message: `Your appraisal for ${reviewPeriod} has been submitted for review.`,
                link: employeeLink,
                type: 'performance-review',
                emailSubject: 'Your appraisal was submitted',
                emailText: `Hi ${employeeName},\n\nYour appraisal for ${reviewPeriod} has been submitted and is awaiting review.\n\n` +
                    `View: ${this.performanceNotificationService.buildPortalUrl(employeeLink)}`,
            });
        }
        return saved;
    }
    async updateReview(id, updates, actor) {
        const review = await this.reviewModel.findById(id).exec();
        if (!review) {
            throw new common_1.NotFoundException('Performance review not found');
        }
        const previousStatus = String(review.status ?? 'Pending');
        const previousStatusNormalized = (0, performance_review_util_1.normalizePerformanceReviewStatus)(previousStatus);
        const previousStage = review.reviewStage ??
            this.resolveInitialReviewStage({
                reviewerId: this.normalizeIdentifier(review.reviewerId),
                reviewer2Id: this.normalizeIdentifier(review.reviewer2Id),
                hrReviewerIds: this.normalizeUserIdList(review.hrReviewerIds),
            });
        const actorId = this.normalizeUserId(actor?._id ?? actor?.id ?? actor?.userId ?? actor?.staffId) ??
            this.normalizeIdentifier(actor?._id ?? actor?.id ?? actor?.userId ?? actor?.staffId);
        const reviewerId = this.normalizeIdentifier(review.reviewerId);
        const reviewer2Id = this.normalizeIdentifier(review.reviewer2Id);
        const hrReviewerIds = this.normalizeUserIdList(review.hrReviewerIds);
        const actorKey = this.normalizeIdentifier(actorId);
        const isReviewer1 = Boolean(actorKey && reviewerId && actorKey === reviewerId);
        const isReviewer2 = Boolean(actorKey && reviewer2Id && actorKey === reviewer2Id);
        const isHrReviewer = Boolean(actorKey && hrReviewerIds.includes(actorKey));
        const isSecondReviewer = isReviewer2 && !isReviewer1;
        const isDraft = updates.draft === true;
        delete updates.draft;
        const hasReviewerUpdates = !isDraft &&
            (Object.prototype.hasOwnProperty.call(updates, 'reviewerCoreValueRatings') ||
                Object.prototype.hasOwnProperty.call(updates, 'rating') ||
                Object.prototype.hasOwnProperty.call(updates, 'summary') ||
                Object.prototype.hasOwnProperty.call(updates, 'recommendation') ||
                Object.prototype.hasOwnProperty.call(updates, 'trainingRecommendation'));
        if (!this.isPrivilegedUser(actor)) {
            if (!actorKey) {
                throw new common_1.ForbiddenException('You do not have permission to update this review.');
            }
            if (isReviewer1) {
                if (previousStage !== 'supervisor') {
                    throw new common_1.ForbiddenException('This review is not ready for supervisor scoring.');
                }
            }
            else if (isReviewer2) {
                if (previousStage !== 'supervisor2') {
                    throw new common_1.ForbiddenException('This review is not ready for second-level scoring.');
                }
            }
            else if (isHrReviewer) {
                if (previousStage !== 'hr') {
                    throw new common_1.ForbiddenException('This review is not ready for HR scoring.');
                }
            }
            else {
                throw new common_1.ForbiddenException('You do not have permission to update this review.');
            }
        }
        if (Object.prototype.hasOwnProperty.call(updates, 'reviewPeriod')) {
            this.validateReviewPeriod(updates.reviewPeriod);
        }
        const mutableUpdates = updates;
        const isActorPrivileged = this.isPrivilegedUser(actor);
        let didResetStage = false;
        let shouldDeleteKpiResults = false;
        const resetMode = isActorPrivileged && mutableUpdates.resetAllScores
            ? 'all'
            : isActorPrivileged && mutableUpdates.resetStaffScores
                ? 'staff'
                : isActorPrivileged && mutableUpdates.resetIndividualScores
                    ? 'individual'
                    : isActorPrivileged &&
                        Object.prototype.hasOwnProperty.call(mutableUpdates, 'rating') &&
                        mutableUpdates.rating === null
                        ? 'supervisor'
                        : null;
        if (resetMode) {
            const resetResult = this.resetReviewScores(review, resetMode);
            didResetStage = resetResult.didResetStage;
            shouldDeleteKpiResults = resetResult.shouldDeleteKpiResults;
            delete mutableUpdates.rating;
            delete mutableUpdates.reviewerCoreValueRatings;
        }
        delete mutableUpdates.resetStaffScores;
        delete mutableUpdates.resetAllScores;
        delete mutableUpdates.resetIndividualScores;
        [
            'status',
            'reviewStage',
            'reviewStageUpdatedAt',
            'employeeScore',
            'reviewerScore',
            'finalScore',
        ].forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(mutableUpdates, field)) {
                delete mutableUpdates[field];
            }
        });
        if (updates.reviewDate) {
            review.reviewDate = new Date(updates.reviewDate);
            delete updates.reviewDate;
        }
        if (updates.reviewStartDate) {
            review.reviewStartDate = new Date(updates.reviewStartDate);
            delete updates.reviewStartDate;
        }
        if (updates.reviewEndDate) {
            review.reviewEndDate = new Date(updates.reviewEndDate);
            delete updates.reviewEndDate;
        }
        if (Object.prototype.hasOwnProperty.call(updates, 'rating')) {
            const normalizedRating = this.normalizeRating(updates.rating);
            if (isSecondReviewer) {
                review.reviewer2Rating = normalizedRating;
            }
            else {
                review.rating = normalizedRating;
            }
            delete updates.rating;
        }
        if (Object.prototype.hasOwnProperty.call(updates, 'summary')) {
            const summaryValue = updates.summary;
            if (isSecondReviewer) {
                review.reviewer2Summary =
                    summaryValue !== undefined && summaryValue !== null
                        ? String(summaryValue)
                        : undefined;
            }
            else {
                review.summary =
                    summaryValue !== undefined && summaryValue !== null
                        ? String(summaryValue)
                        : undefined;
            }
            delete updates.summary;
        }
        if (Object.prototype.hasOwnProperty.call(updates, 'recommendation')) {
            const recommendationValue = updates.recommendation;
            if (isSecondReviewer) {
                review.reviewer2Recommendation =
                    recommendationValue !== undefined && recommendationValue !== null
                        ? String(recommendationValue)
                        : undefined;
            }
            else {
                review.recommendation =
                    recommendationValue !== undefined && recommendationValue !== null
                        ? String(recommendationValue)
                        : undefined;
            }
            delete updates.recommendation;
        }
        if (Object.prototype.hasOwnProperty.call(updates, 'trainingRecommendation')) {
            const trainingValue = updates.trainingRecommendation;
            if (isSecondReviewer) {
                review.reviewer2TrainingRecommendation =
                    trainingValue !== undefined && trainingValue !== null
                        ? String(trainingValue)
                        : undefined;
            }
            else {
                review.reviewerTrainingRecommendation =
                    trainingValue !== undefined && trainingValue !== null
                        ? String(trainingValue)
                        : undefined;
            }
            delete updates.trainingRecommendation;
        }
        if (Object.prototype.hasOwnProperty.call(updates, 'reviewerId')) {
            review.reviewerId = updates.reviewerId;
            review.reviewerName = await this.resolveReviewerName(updates.reviewerId);
            delete updates.reviewerId;
            delete updates.reviewerName;
        }
        if (Object.prototype.hasOwnProperty.call(updates, 'reviewer2Id')) {
            review.reviewer2Id = updates.reviewer2Id;
            review.reviewer2Name = await this.resolveReviewerName(updates.reviewer2Id);
            delete updates.reviewer2Id;
            delete updates.reviewer2Name;
        }
        if (Object.prototype.hasOwnProperty.call(updates, 'coreValueRatings')) {
            const normalizedCoreValueRatings = this.normalizeCoreValueRatings(updates.coreValueRatings);
            review.coreValueRatings =
                this.performanceKpiSnapshotService.allocateBehaviouralWeights(normalizedCoreValueRatings, review.kpiSnapshot);
            review.coreValueSnapshotAt = review.coreValueRatings?.length
                ? new Date()
                : undefined;
            delete updates.coreValueRatings;
        }
        if (Object.prototype.hasOwnProperty.call(updates, 'reviewerCoreValueRatings')) {
            const normalizedReviewerCoreValueRatings = this.normalizeCoreValueRatings(updates.reviewerCoreValueRatings);
            review.reviewerCoreValueRatings =
                this.performanceKpiSnapshotService.allocateBehaviouralWeights(normalizedReviewerCoreValueRatings, review.kpiSnapshot);
            review.reviewerCoreValueSnapshotAt = review.reviewerCoreValueRatings?.length
                ? new Date()
                : undefined;
            delete updates.reviewerCoreValueRatings;
        }
        let nextStage = null;
        if (hasReviewerUpdates && !didResetStage) {
            if (previousStage === 'supervisor' && isReviewer1) {
                if (reviewer2Id) {
                    nextStage = 'supervisor2';
                }
                else if (hrReviewerIds.length) {
                    nextStage = 'hr';
                }
                else {
                    nextStage = 'completed';
                }
            }
            else if (previousStage === 'supervisor2' && isReviewer2) {
                nextStage = hrReviewerIds.length ? 'hr' : 'completed';
            }
            else if (previousStage === 'hr' && isHrReviewer) {
                nextStage = 'completed';
            }
        }
        if (nextStage && nextStage !== previousStage) {
            review.reviewStage = nextStage;
            review.reviewStageUpdatedAt = new Date();
            if (nextStage === 'completed') {
                review.status = 'Completed';
            }
        }
        else if (!review.reviewStage) {
            review.reviewStage = previousStage;
            review.reviewStageUpdatedAt = new Date();
        }
        Object.assign(review, updates);
        const willBeCompleted = nextStage === 'completed' ||
            (0, performance_review_util_1.normalizePerformanceReviewStatus)(review.status) === 'completed';
        const wasAlreadyCompleted = previousStatusNormalized === 'completed';
        if (willBeCompleted && !wasAlreadyCompleted && !didResetStage) {
            await this.performanceScoringService.backfillSupervisorKpiResults(review, actorId);
        }
        if (!didResetStage) {
            await this.performanceScoringService.applyComputedScores(review);
        }
        const saved = await review.save();
        if (shouldDeleteKpiResults) {
            await this.deleteKpiResultsForReview(saved);
        }
        const stageChanged = Boolean(nextStage && nextStage !== previousStage);
        const statusChangedToCompleted = previousStatusNormalized !== 'completed' &&
            (0, performance_review_util_1.normalizePerformanceReviewStatus)(saved.status) === 'completed';
        if (stageChanged || statusChangedToCompleted) {
            const reviewId = saved._id?.toString?.() ?? '';
            const employeeName = saved.employeeName ?? 'the employee';
            const period = saved.reviewPeriod ?? 'this cycle';
            const reviewerLink = '/performance-management';
            const employeeLink = reviewId ? `/my-performance/reviews/${reviewId}` : '/my-performance';
            const nextStageLabel = (0, performance_review_util_1.getPerformanceReviewStageReviewLabel)((0, performance_review_util_1.normalizePerformanceReviewStage)(nextStage ?? saved.reviewStage));
            const [employeeUserId, resolvedReviewerId, resolvedReviewer2Id] = await Promise.all([
                this.resolveEmployeeUserId(saved.employeeId),
                reviewerId ? this.resolveEmployeeUserId(reviewerId) : Promise.resolve(null),
                reviewer2Id ? this.resolveEmployeeUserId(reviewer2Id) : Promise.resolve(null),
            ]);
            if (employeeUserId) {
                const employeeMessage = nextStage === 'completed' || statusChangedToCompleted
                    ? `Your appraisal for ${period} has been completed.`
                    : `Your appraisal for ${period} has moved to ${nextStageLabel}.`;
                await this.performanceNotificationService.notifyUsers({
                    userIds: [employeeUserId],
                    message: employeeMessage,
                    link: employeeLink,
                    type: 'performance-review',
                    emailSubject: nextStage === 'completed' || statusChangedToCompleted
                        ? 'Your appraisal is complete'
                        : 'Your appraisal moved to the next stage',
                    emailText: `Hi ${employeeName},\n\n${employeeMessage}\n\nView: ${this.performanceNotificationService.buildPortalUrl(employeeLink)}`,
                });
            }
            const stageRecipients = nextStage === 'supervisor2'
                ? [resolvedReviewer2Id].filter(Boolean)
                : nextStage === 'hr'
                    ? hrReviewerIds
                    : [];
            if (stageRecipients.length) {
                await this.performanceNotificationService.notifyUsers({
                    userIds: stageRecipients,
                    message: `Appraisal for ${employeeName} (${period}) is ready for your review.`,
                    link: reviewerLink,
                    type: 'performance-review',
                    emailSubject: `Appraisal review required: ${employeeName}`,
                    emailText: `Hello,\n\nAn appraisal for ${employeeName} (${period}) is ready for your review.\n\n` +
                        `View: ${this.performanceNotificationService.buildPortalUrl(reviewerLink)}`,
                });
            }
            if (nextStage === 'completed' || statusChangedToCompleted) {
                const completionRecipients = [resolvedReviewerId, resolvedReviewer2Id].filter(Boolean);
                if (completionRecipients.length) {
                    await this.performanceNotificationService.notifyUsers({
                        userIds: completionRecipients,
                        message: `The performance review for ${employeeName} (${period}) has been completed.`,
                        link: reviewerLink,
                        type: 'performance-review',
                        emailSubject: `Appraisal completed: ${employeeName}`,
                        emailText: `Hello,\n\nThe performance review for ${employeeName} (${period}) has been completed.\n\n` +
                            `View: ${this.performanceNotificationService.buildPortalUrl(reviewerLink)}`,
                    });
                }
            }
        }
        return saved;
    }
    async bulkCreateFromCsv(rows) {
        if (!rows.length) {
            throw new common_1.BadRequestException('CSV file is empty');
        }
        const normalized = rows.map((row) => {
            const read = (key) => (row?.[key] ?? '').trim();
            return {
                employeeId: read('employee_id') ||
                    read('staff_id') ||
                    read('employeeid') ||
                    read('staffid'),
                reviewerId: read('reviewer_id') || read('reviewerid'),
                reviewer2Id: read('reviewer2_id') ||
                    read('reviewer2id') ||
                    read('reviewer_2_id'),
                reviewType: read('review_type') || read('reviewtype') || read('type'),
                reviewPeriod: read('review_period') || read('reviewperiod') || read('period'),
                reviewStartDate: read('review_start_date') ||
                    read('reviewstartdate') ||
                    read('start_date'),
                reviewEndDate: read('review_end_date') ||
                    read('reviewenddate') ||
                    read('end_date'),
                reviewDate: read('review_date') || read('reviewdate'),
                status: read('status'),
                rating: read('rating'),
                summary: read('summary'),
            };
        });
        const candidates = normalized.filter((row) => row.employeeId &&
            row.reviewType &&
            row.reviewPeriod &&
            row.reviewStartDate &&
            row.reviewEndDate);
        if (!candidates.length) {
            return { created: 0, skipped: rows.length };
        }
        let created = 0;
        for (const row of candidates) {
            try {
                await this.createReview({
                    employeeId: row.employeeId,
                    reviewType: row.reviewType,
                    reviewPeriod: row.reviewPeriod,
                    reviewStartDate: row.reviewStartDate,
                    reviewEndDate: row.reviewEndDate,
                    reviewDate: row.reviewDate || row.reviewEndDate,
                    status: row.status || undefined,
                    rating: row.rating ? Number(row.rating) : undefined,
                    reviewerId: row.reviewerId || undefined,
                    reviewer2Id: row.reviewer2Id || undefined,
                    summary: row.summary || undefined,
                });
                created += 1;
            }
            catch {
            }
        }
        return { created, skipped: rows.length - created };
    }
    async deleteReview(id) {
        const result = await this.reviewModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException('Performance review not found');
        }
        return { deleted: true };
    }
};
exports.PerformanceReviewService = PerformanceReviewService;
PerformanceReviewService.REVIEW_PERIOD_LABELS = new Set([
    'monthly',
    'quarterly',
    'bi-annual',
    'biannual',
    'bi annual',
    'annual',
    'yearly',
]);
exports.PerformanceReviewService = PerformanceReviewService = PerformanceReviewService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(performance_review_schema_1.PerformanceReview.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(kpi_schema_1.PerformanceKpi.name)),
    __param(3, (0, mongoose_1.InjectModel)(performance_kpi_result_schema_1.PerformanceKpiResult.name)),
    __param(4, (0, mongoose_1.InjectModel)(performance_workflow_schema_1.PerformanceWorkflowConfig.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        performance_kpi_snapshot_service_1.PerformanceKpiSnapshotService,
        performance_notification_service_1.PerformanceNotificationService,
        performance_scoring_service_1.PerformanceScoringService])
], PerformanceReviewService);
//# sourceMappingURL=performance-review.service.js.map