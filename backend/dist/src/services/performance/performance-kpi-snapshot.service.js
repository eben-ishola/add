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
exports.PerformanceKpiSnapshotService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const performance_review_schema_1 = require("../../schemas/performance-review.schema");
const kpi_schema_1 = require("../../schemas/kpi.schema");
const performance_core_value_schema_1 = require("../../schemas/performance-core-value.schema");
const user_schema_1 = require("../../schemas/user.schema");
const mongo_1 = require("../../utils/shared/mongo");
const performance_access_util_1 = require("../../utils/performance/performance-access.util");
const performance_scoring_service_1 = require("./performance-scoring.service");
let PerformanceKpiSnapshotService = class PerformanceKpiSnapshotService {
    constructor(reviewModel, kpiModel, coreValueModel, userModel, performanceScoringService) {
        this.reviewModel = reviewModel;
        this.kpiModel = kpiModel;
        this.coreValueModel = coreValueModel;
        this.userModel = userModel;
        this.performanceScoringService = performanceScoringService;
    }
    normalizeKey(value) {
        if (value === null || value === undefined)
            return undefined;
        const trimmed = String(value).trim();
        return trimmed ? trimmed.toLowerCase() : undefined;
    }
    normalizeEntityId(value) {
        const candidate = value?._id ??
            value?.id ??
            value?.entityId ??
            value?.value ??
            (typeof value === 'string' || typeof value === 'number' ? value : undefined);
        if (!candidate)
            return null;
        const normalized = String(candidate).trim();
        if (!normalized || !mongoose_2.Types.ObjectId.isValid(normalized))
            return null;
        return new mongoose_2.Types.ObjectId(normalized).toHexString();
    }
    matchesDimension(kpiId, kpiName, employeeId, employeeName) {
        const kpiIdKey = this.normalizeKey(kpiId);
        const kpiNameKey = this.normalizeKey(kpiName);
        if (!kpiIdKey && !kpiNameKey) {
            return true;
        }
        const employeeIdKey = this.normalizeKey(employeeId);
        const employeeNameKey = this.normalizeKey(employeeName);
        return Boolean((kpiIdKey && employeeIdKey && kpiIdKey === employeeIdKey) ||
            (kpiNameKey && employeeNameKey && kpiNameKey === employeeNameKey));
    }
    isKpiActive(kpi, reviewStartDate, reviewEndDate) {
        const windowStart = reviewStartDate;
        const windowEnd = reviewEndDate ?? reviewStartDate;
        const start = kpi?.startDate ? new Date(kpi.startDate) : undefined;
        const end = kpi?.endDate ? new Date(kpi.endDate) : undefined;
        if (start && !Number.isNaN(start.getTime()) && start > windowEnd)
            return false;
        if (end && !Number.isNaN(end.getTime()) && end < windowStart)
            return false;
        return true;
    }
    async resolveEmployeeProfile(employeeId) {
        const query = [];
        if (employeeId) {
            query.push({ staffId: employeeId });
            const employeeObjectId = (0, mongo_1.toObjectId)(employeeId);
            if (employeeObjectId) {
                query.push({ _id: employeeObjectId });
            }
        }
        if (!query.length)
            return null;
        return this.userModel
            .findOne({ $or: query })
            .populate('role')
            .populate('level')
            .populate('department')
            .populate('businessUnit')
            .populate('branch')
            .populate('entity')
            .lean()
            .exec();
    }
    buildEntityMatchKeys(entityValue) {
        const keys = new Set();
        const register = (value) => {
            const normalized = this.normalizeKey(value);
            if (normalized)
                keys.add(normalized);
        };
        if (entityValue && typeof entityValue === 'object') {
            register(entityValue?._id);
            register(entityValue?.id);
            register(entityValue?.name);
            register(entityValue?.short);
        }
        else {
            register(entityValue);
        }
        return keys;
    }
    resolveRefValue(value, nameKeys) {
        if (!value)
            return {};
        if (typeof value === 'string' || typeof value === 'number') {
            return { id: String(value) };
        }
        if (typeof value === 'object') {
            const id = value?._id ?? value?.id ?? value?.value ?? value?.code ?? value?.key;
            const name = nameKeys
                .map((key) => value?.[key])
                .find((candidate) => Boolean(candidate));
            return {
                id: id ? String(id) : undefined,
                name: name ? String(name) : undefined,
            };
        }
        return {};
    }
    buildRegex(value) {
        if (!value)
            return undefined;
        const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`^${escaped}$`, 'i');
    }
    async debugKpiResolutionForReview(reviewId) {
        const review = await this.reviewModel.findById(reviewId).lean().exec();
        if (!review)
            throw new common_1.NotFoundException('Performance review not found');
        const employeeId = String(review?.employeeId ?? '').trim();
        if (!employeeId) {
            throw new common_1.BadRequestException('Review has no employeeId');
        }
        const profile = await this.resolveEmployeeProfile(employeeId);
        const role = this.resolveRefValue(profile?.role, ['name', 'title', 'roleName']);
        const level = this.resolveRefValue(profile?.level, ['name', 'title', 'levelName']);
        const department = this.resolveRefValue(profile?.department, ['name', 'title', 'departmentName']);
        const businessUnit = this.resolveRefValue(profile?.businessUnit, ['name', 'title', 'businessUnitName']);
        const branch = this.resolveRefValue(profile?.branch, ['name', 'title', 'branchName']);
        const employeeEntityId = this.normalizeEntityId(profile?.entity);
        const employeeEntityKeys = this.buildEntityMatchKeys(profile?.entity);
        const normalizedEmployeeIds = new Set();
        const addEmployeeId = (value) => {
            if (value === null || value === undefined)
                return;
            const raw = String(value).trim();
            if (!raw)
                return;
            const normalized = this.normalizeKey(raw);
            if (normalized)
                normalizedEmployeeIds.add(normalized);
        };
        addEmployeeId(employeeId);
        addEmployeeId(profile?.staffId);
        addEmployeeId(profile?._id);
        addEmployeeId(profile?.id);
        const reviewStartDate = review?.reviewStartDate
            ? new Date(review.reviewStartDate)
            : undefined;
        const reviewEndDate = review?.reviewEndDate
            ? new Date(review.reviewEndDate)
            : undefined;
        const reviewDate = review?.reviewDate ? new Date(review.reviewDate) : new Date();
        const windowStart = reviewStartDate && !Number.isNaN(reviewStartDate.getTime())
            ? reviewStartDate
            : reviewDate;
        const windowEnd = reviewEndDate && !Number.isNaN(reviewEndDate.getTime())
            ? reviewEndDate
            : windowStart;
        const candidates = await this.kpiModel.find({}).lean().exec();
        const decisions = candidates.map((kpi) => {
            const reasons = [];
            let included = true;
            if (!this.isKpiActive(kpi, windowStart, windowEnd)) {
                included = false;
                reasons.push('date-window-mismatch');
            }
            const kpiEntityKey = this.normalizeKey(kpi?.entity);
            if (kpiEntityKey && employeeEntityKeys.size && !employeeEntityKeys.has(kpiEntityKey)) {
                included = false;
                reasons.push(`entity-mismatch (kpi.entity=${kpi?.entity}, employee.entity=${employeeEntityId}, accepted=[${Array.from(employeeEntityKeys).join(',')}])`);
            }
            if (kpi?.employeeId) {
                const normalized = this.normalizeKey(kpi.employeeId);
                const matches = normalized ? normalizedEmployeeIds.has(normalized) : false;
                if (!matches) {
                    included = false;
                    reasons.push(`employee-specific-mismatch (kpi.employeeId=${kpi.employeeId}, allowedIds=${Array.from(normalizedEmployeeIds).join(',')})`);
                }
            }
            else {
                if (!this.matchesDimension(kpi?.roleId, kpi?.roleName, role?.id, role?.name)) {
                    included = false;
                    reasons.push(`role-mismatch (kpi.role=${kpi?.roleName ?? kpi?.roleId ?? 'none'}, employee.role=${role?.name ?? role?.id ?? 'none'})`);
                }
                if (!this.matchesDimension(kpi?.levelId, kpi?.levelName, level?.id, level?.name)) {
                    included = false;
                    reasons.push(`level-mismatch (kpi.level=${kpi?.levelName ?? kpi?.levelId ?? 'none'}, employee.level=${level?.name ?? level?.id ?? 'none'})`);
                }
                if (!this.matchesDimension(kpi?.departmentId, kpi?.departmentName, department?.id, department?.name)) {
                    included = false;
                    reasons.push(`department-mismatch (kpi.department=${kpi?.departmentName ?? kpi?.departmentId ?? 'none'}, employee.department=${department?.name ?? department?.id ?? 'none'})`);
                }
                if (!this.matchesDimension(kpi?.businessUnitId, kpi?.businessUnitName, businessUnit?.id, businessUnit?.name)) {
                    included = false;
                    reasons.push(`businessUnit-mismatch (kpi.businessUnit=${kpi?.businessUnitName ?? kpi?.businessUnitId ?? 'none'}, employee.businessUnit=${businessUnit?.name ?? businessUnit?.id ?? 'none'})`);
                }
                if (!this.matchesDimension(kpi?.branchId, kpi?.branchName, branch?.id, branch?.name)) {
                    included = false;
                    reasons.push(`branch-mismatch (kpi.branch=${kpi?.branchName ?? kpi?.branchId ?? 'none'}, employee.branch=${branch?.name ?? branch?.id ?? 'none'})`);
                }
            }
            return {
                kpiId: String(kpi._id),
                title: kpi.title,
                included,
                reasons,
                kpi: {
                    entity: kpi?.entity,
                    employeeId: kpi?.employeeId,
                    roleId: kpi?.roleId,
                    roleName: kpi?.roleName,
                    levelId: kpi?.levelId,
                    levelName: kpi?.levelName,
                    departmentId: kpi?.departmentId,
                    departmentName: kpi?.departmentName,
                    businessUnitId: kpi?.businessUnitId,
                    businessUnitName: kpi?.businessUnitName,
                    branchId: kpi?.branchId,
                    branchName: kpi?.branchName,
                    startDate: kpi?.startDate,
                    endDate: kpi?.endDate,
                    appraisalCycleId: kpi?.appraisalCycleId,
                },
            };
        });
        return {
            review: {
                id: String(review._id),
                employeeId,
                employeeName: review?.employeeName,
                reviewStartDate: windowStart,
                reviewEndDate: windowEnd,
            },
            employee: {
                id: employeeId,
                entity: employeeEntityId,
                role,
                level,
                department,
                businessUnit,
                branch,
            },
            totalCandidates: candidates.length,
            includedCount: decisions.filter((decision) => decision.included).length,
            decisions,
        };
    }
    async resolveInitialKpis(input) {
        const employeeId = input.employeeId?.trim();
        const employeeName = input.employeeName?.trim();
        if (!employeeId) {
            return { kpiIds: [], kpiSnapshot: [] };
        }
        const cycleIdRaw = input.appraisalCycleId
            ? String(input.appraisalCycleId).trim()
            : '';
        const profile = await this.resolveEmployeeProfile(employeeId);
        const employeeIdCandidates = new Set();
        const normalizedEmployeeIds = new Set();
        const addEmployeeId = (value) => {
            if (value === null || value === undefined)
                return;
            const raw = String(value).trim();
            if (!raw)
                return;
            employeeIdCandidates.add(raw);
            employeeIdCandidates.add(raw.toLowerCase());
            const normalized = this.normalizeKey(raw);
            if (normalized) {
                normalizedEmployeeIds.add(normalized);
            }
        };
        addEmployeeId(employeeId);
        addEmployeeId(profile?.staffId);
        addEmployeeId(profile?._id);
        addEmployeeId(profile?.id);
        const role = this.resolveRefValue(profile?.role, ['name', 'title', 'roleName']);
        const level = this.resolveRefValue(profile?.level, ['name', 'title', 'levelName']);
        const department = this.resolveRefValue(profile?.department, ['name', 'title', 'departmentName']);
        const businessUnit = this.resolveRefValue(profile?.businessUnit, ['name', 'title', 'businessUnitName']);
        const branch = this.resolveRefValue(profile?.branch, ['name', 'title', 'branchName']);
        const employeeEntityKeys = this.buildEntityMatchKeys(profile?.entity);
        const orConditions = [];
        if (employeeIdCandidates.size) {
            orConditions.push({ employeeId: { $in: Array.from(employeeIdCandidates) } });
        }
        if (employeeName) {
            orConditions.push({ employeeName: this.buildRegex(employeeName) });
        }
        const addDimension = (value, idKey = '', nameKey = '') => {
            if (value?.id) {
                orConditions.push({ [idKey]: value.id });
            }
            if (value?.name) {
                orConditions.push({ [nameKey]: this.buildRegex(value.name) });
            }
        };
        addDimension(role, 'roleId', 'roleName');
        addDimension(level, 'levelId', 'levelName');
        addDimension(department, 'departmentId', 'departmentName');
        addDimension(businessUnit, 'businessUnitId', 'businessUnitName');
        addDimension(branch, 'branchId', 'branchName');
        const finalQuery = orConditions.length
            ? { $or: orConditions }
            : {};
        if (cycleIdRaw) {
            const variants = [cycleIdRaw];
            const cycleObjectId = (0, mongo_1.toObjectId)(cycleIdRaw);
            if (cycleObjectId) {
                variants.push(cycleObjectId);
            }
            finalQuery.appraisalCycleId = { $in: variants };
        }
        const candidates = await this.kpiModel.find(finalQuery).sort({ createdAt: -1 }).lean().exec();
        const windowStart = input?.reviewStartDate && !Number.isNaN(input.reviewStartDate.getTime())
            ? input.reviewStartDate
            : input.reviewDate;
        const windowEnd = input?.reviewEndDate && !Number.isNaN(input.reviewEndDate.getTime())
            ? input.reviewEndDate
            : windowStart;
        const applicable = candidates.filter((kpi) => {
            if (!cycleIdRaw && !this.isKpiActive(kpi, windowStart, windowEnd)) {
                return false;
            }
            const kpiEntityKey = this.normalizeKey(kpi?.entity);
            if (kpiEntityKey && employeeEntityKeys.size && !employeeEntityKeys.has(kpiEntityKey)) {
                return false;
            }
            if (kpi?.employeeId) {
                const normalized = this.normalizeKey(kpi.employeeId);
                return normalized ? normalizedEmployeeIds.has(normalized) : false;
            }
            if (!this.matchesDimension(kpi?.roleId, kpi?.roleName, role?.id, role?.name)) {
                return false;
            }
            if (!this.matchesDimension(kpi?.levelId, kpi?.levelName, level?.id, level?.name)) {
                return false;
            }
            if (!this.matchesDimension(kpi?.departmentId, kpi?.departmentName, department?.id, department?.name)) {
                return false;
            }
            if (!this.matchesDimension(kpi?.businessUnitId, kpi?.businessUnitName, businessUnit?.id, businessUnit?.name)) {
                return false;
            }
            if (!this.matchesDimension(kpi?.branchId, kpi?.branchName, branch?.id, branch?.name)) {
                return false;
            }
            return true;
        });
        const typePriority = {
            individual: 0,
            role: 1,
            level: 2,
            department: 3,
            branch: 4,
            business_unit: 5,
        };
        const seenIds = new Set();
        const deduped = new Map();
        for (const kpi of applicable) {
            const kpiId = String(kpi._id);
            if (seenIds.has(kpiId))
                continue;
            seenIds.add(kpiId);
            const key = String(kpi.title ?? '').trim().toLowerCase();
            const existing = deduped.get(key);
            if (!existing) {
                deduped.set(key, kpi);
                continue;
            }
            const currentPriority = typePriority[kpi.type] ?? 99;
            const existingPriority = typePriority[existing.type] ?? 99;
            if (currentPriority < existingPriority) {
                deduped.set(key, kpi);
            }
        }
        const resolved = Array.from(deduped.values());
        const kpiIds = resolved.map((kpi) => kpi._id);
        const kpiSnapshot = resolved.map((kpi) => ({
            kpiId: kpi._id,
            title: kpi.title,
            description: kpi.description,
            targetValue: kpi.targetValue,
            actualValue: kpi.actualValue,
            measurementUnit: kpi.measurementUnit,
            weight: kpi.weight,
            type: kpi.type,
            kpa: kpi.kpa,
            categoryName: kpi.categoryName ?? (kpi.category ? String(kpi.category) : undefined),
            startDate: kpi.startDate ? new Date(kpi.startDate) : undefined,
            endDate: kpi.endDate ? new Date(kpi.endDate) : undefined,
        }));
        return { kpiIds, kpiSnapshot };
    }
    computeKpiWeightTotal(kpiSnapshot) {
        if (!Array.isArray(kpiSnapshot) || !kpiSnapshot.length)
            return 0;
        return kpiSnapshot.reduce((sum, item) => {
            const parsed = typeof item?.weight === 'number' ? item.weight : Number(item?.weight ?? NaN);
            if (!Number.isFinite(parsed) || parsed <= 0)
                return sum;
            return sum + parsed;
        }, 0);
    }
    allocateBehaviouralWeights(ratings, kpiSnapshot) {
        if (!Array.isArray(ratings) || !ratings.length)
            return [];
        const behaviouralBudget = Math.max(0, 100 - this.computeKpiWeightTotal(kpiSnapshot));
        const normalizedBudget = Number(behaviouralBudget.toFixed(2));
        const baseWeights = ratings.map((entry) => {
            const parsed = Number(entry?.weight ?? NaN);
            return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
        });
        const baseWeightTotal = baseWeights.reduce((sum, value) => sum + value, 0);
        if (baseWeightTotal <= 0) {
            return ratings.map((entry) => ({ ...entry, weight: 0 }));
        }
        let allocated = 0;
        return ratings.map((entry, index) => {
            const isLast = index === ratings.length - 1;
            const proportional = normalizedBudget <= 0
                ? 0
                : (normalizedBudget * baseWeights[index]) / baseWeightTotal;
            const nextWeight = isLast
                ? Math.max(0, Number((normalizedBudget - allocated).toFixed(2)))
                : Number(proportional.toFixed(2));
            allocated += nextWeight;
            return {
                ...entry,
                weight: nextWeight,
            };
        });
    }
    async resolveCoreValueSeedsForReview(review) {
        const existingEntity = this.normalizeEntityId(review?.entity);
        let entityId = existingEntity;
        if (!entityId) {
            const profile = await this.resolveEmployeeProfile(String(review?.employeeId ?? ''));
            entityId = this.normalizeEntityId(profile?.entity);
        }
        if (!entityId)
            return [];
        const coreValues = await this.coreValueModel
            .find({
            entity: new mongoose_2.Types.ObjectId(entityId),
            isActive: { $ne: false },
        })
            .sort({ createdAt: 1 })
            .lean()
            .exec();
        return coreValues.map((entry) => ({
            coreValueId: entry?._id,
            title: entry?.title,
            description: entry?.description,
            weight: Number.isFinite(Number(entry?.weight)) ? Number(entry.weight) : 1,
            rating: undefined,
        }));
    }
    async reconcileBehaviouralWeightsForSnapshot(review, kpiSnapshot) {
        const currentEmployeeRatings = Array.isArray(review.coreValueRatings)
            ? review.coreValueRatings
            : [];
        const employeeRatings = currentEmployeeRatings.length
            ? currentEmployeeRatings
            : await this.resolveCoreValueSeedsForReview(review);
        if (employeeRatings.length) {
            review.coreValueRatings = this.allocateBehaviouralWeights(employeeRatings, kpiSnapshot);
            review.coreValueSnapshotAt = new Date();
        }
        const reviewerRatings = Array.isArray(review.reviewerCoreValueRatings)
            ? review.reviewerCoreValueRatings
            : [];
        if (reviewerRatings.length) {
            review.reviewerCoreValueRatings = this.allocateBehaviouralWeights(reviewerRatings, kpiSnapshot);
            review.reviewerCoreValueSnapshotAt = new Date();
        }
    }
    async reconcileReviewSnapshot(reviewId, refreshed) {
        if (!mongoose_2.Types.ObjectId.isValid(reviewId))
            return;
        const review = await this.reviewModel.findById(reviewId).exec();
        if (!review)
            return;
        review.kpiIds = refreshed.kpiIds;
        review.kpiSnapshot = refreshed.kpiSnapshot;
        review.kpiSnapshotAt = new Date();
        await this.reconcileBehaviouralWeightsForSnapshot(review, refreshed.kpiSnapshot);
        await this.performanceScoringService.applyComputedScores(review);
        await review.save();
    }
    async syncActualValueForKpi(kpiId, actualValue, options) {
        if (!mongoose_2.Types.ObjectId.isValid(kpiId)) {
            return { matched: 0, modified: 0 };
        }
        const oid = new mongoose_2.Types.ObjectId(kpiId);
        const baseQuery = {};
        const employeeId = String(options?.employeeId ?? '').trim();
        if (employeeId) {
            baseQuery.employeeId = employeeId;
        }
        const appraisalCycleId = String(options?.appraisalCycleId ?? '').trim();
        if (mongoose_2.Types.ObjectId.isValid(appraisalCycleId)) {
            baseQuery.appraisalCycleId = new mongoose_2.Types.ObjectId(appraisalCycleId);
        }
        const exactQuery = {
            ...baseQuery,
            'kpiSnapshot.kpiId': oid,
        };
        const result = await this.reviewModel
            .updateMany(exactQuery, {
            $set: {
                'kpiSnapshot.$[snapshot].actualValue': actualValue,
                kpiSnapshotAt: new Date(),
            },
        }, { arrayFilters: [{ 'snapshot.kpiId': oid }] })
            .exec();
        if ((result.matchedCount ?? 0) === 0) {
            const normalizedTitle = String(options?.title ?? '')
                .toLowerCase()
                .replace(/\s*\(copy\)/gi, '')
                .replace(/\s+/g, ' ')
                .trim();
            if (normalizedTitle) {
                const reviews = await this.reviewModel.find(baseQuery).exec();
                let matched = 0;
                let modified = 0;
                for (const review of reviews) {
                    const snapshot = Array.isArray(review?.kpiSnapshot) ? review.kpiSnapshot : [];
                    let changed = false;
                    for (const entry of snapshot) {
                        const entryTitle = String(entry?.title ?? '')
                            .toLowerCase()
                            .replace(/\s*\(copy\)/gi, '')
                            .replace(/\s+/g, ' ')
                            .trim();
                        if (entryTitle !== normalizedTitle)
                            continue;
                        matched += 1;
                        entry.actualValue = actualValue;
                        changed = true;
                    }
                    if (!changed)
                        continue;
                    review.kpiSnapshotAt = new Date();
                    await review.save();
                    modified += 1;
                }
                if (matched > 0) {
                    return { matched, modified };
                }
            }
        }
        return {
            matched: result.matchedCount ?? 0,
            modified: result.modifiedCount ?? 0,
        };
    }
    async refreshReviewsForKpi(kpiId, actor) {
        if (actor && !(0, performance_access_util_1.canManagePerformanceWorkflow)(actor)) {
            throw new common_1.ForbiddenException('You do not have permission to trigger a refresh.');
        }
        if (!mongoose_2.Types.ObjectId.isValid(kpiId))
            return { refreshed: 0 };
        const oid = new mongoose_2.Types.ObjectId(kpiId);
        const affected = await this.reviewModel
            .find({ $or: [{ kpiIds: oid }, { 'kpiSnapshot.kpiId': oid }] })
            .select('_id employeeId employeeName')
            .lean()
            .exec();
        let refreshed = 0;
        for (const row of affected) {
            try {
                const review = await this.reviewModel.findById(row._id).exec();
                if (!review)
                    continue;
                const reviewDate = review?.reviewDate
                    ? new Date(review.reviewDate)
                    : new Date();
                const fresh = await this.resolveInitialKpis({
                    employeeId: String(review?.employeeId ?? ''),
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
                review.kpiIds = fresh.kpiIds;
                review.kpiSnapshot = fresh.kpiSnapshot;
                review.kpiSnapshotAt = new Date();
                await this.reconcileBehaviouralWeightsForSnapshot(review, fresh.kpiSnapshot);
                await this.performanceScoringService.applyComputedScores(review);
                await review.save();
                refreshed += 1;
            }
            catch (error) {
                console.error(`refreshReviewsForKpi: failed for review ${row._id}`, error);
            }
        }
        return { refreshed };
    }
};
exports.PerformanceKpiSnapshotService = PerformanceKpiSnapshotService;
exports.PerformanceKpiSnapshotService = PerformanceKpiSnapshotService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(performance_review_schema_1.PerformanceReview.name)),
    __param(1, (0, mongoose_1.InjectModel)(kpi_schema_1.PerformanceKpi.name)),
    __param(2, (0, mongoose_1.InjectModel)(performance_core_value_schema_1.PerformanceCoreValue.name)),
    __param(3, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        performance_scoring_service_1.PerformanceScoringService])
], PerformanceKpiSnapshotService);
//# sourceMappingURL=performance-kpi-snapshot.service.js.map