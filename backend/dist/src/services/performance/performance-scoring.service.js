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
exports.PerformanceScoringService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const performance_review_schema_1 = require("../../schemas/performance-review.schema");
const kpi_schema_1 = require("../../schemas/kpi.schema");
const performance_kpi_result_schema_1 = require("../../schemas/performance-kpi-result.schema");
const user_schema_1 = require("../../schemas/user.schema");
const performance_workflow_schema_1 = require("../../schemas/performance-workflow.schema");
const performance_1 = require("../../constants/performance");
const kpi_scoring_1 = require("../../utils/performance/kpi-scoring");
const mongo_1 = require("../../utils/shared/mongo");
const performance_review_util_1 = require("../../utils/performance/performance-review.util");
let PerformanceScoringService = class PerformanceScoringService {
    constructor(reviewModel, kpiModel, kpiResultModel, userModel, workflowModel) {
        this.reviewModel = reviewModel;
        this.kpiModel = kpiModel;
        this.kpiResultModel = kpiResultModel;
        this.userModel = userModel;
        this.workflowModel = workflowModel;
    }
    normalizeRating(value) {
        if (value === null || value === undefined || value === '')
            return null;
        const numeric = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(numeric))
            return null;
        return Math.min(performance_1.RATING_SCALE_MAX, Math.max(0, numeric));
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
            .populate('entity')
            .lean()
            .exec();
    }
    formatPeriodKey(value) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }
    resolvePeriodRange(review) {
        const startDate = review?.reviewStartDate ?? review?.reviewDate ?? review?.reviewEndDate;
        const endDate = review?.reviewEndDate ?? review?.reviewDate ?? review?.reviewStartDate;
        if (!startDate || !endDate)
            return null;
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return null;
        }
        const startKey = this.formatPeriodKey(start);
        const endKey = this.formatPeriodKey(end);
        if (startKey > endKey) {
            return { start: endKey, end: startKey };
        }
        return { start: startKey, end: endKey };
    }
    computeWeightedAverage(values) {
        const valid = values.filter((entry) => Number.isFinite(entry.value));
        if (!valid.length)
            return null;
        let totalWeight = 0;
        let weightedSum = 0;
        valid.forEach((entry) => {
            const weight = typeof entry.weight === 'number' && Number.isFinite(entry.weight) && entry.weight > 0
                ? entry.weight
                : 1;
            totalWeight += weight;
            weightedSum += entry.value * weight;
        });
        if (totalWeight <= 0)
            return null;
        return weightedSum / totalWeight;
    }
    computeKpiWeightTotal(kpiSnapshot) {
        if (!Array.isArray(kpiSnapshot) || !kpiSnapshot.length)
            return 0;
        return kpiSnapshot.reduce((sum, item) => {
            const weight = Number(item?.weight);
            return sum + (Number.isFinite(weight) && weight > 0 ? weight : 0);
        }, 0);
    }
    kpiResultRank(result) {
        const source = String(result?.source ?? '').trim().toLowerCase();
        const status = String(result?.status ?? '').trim().toLowerCase();
        const hasScore = (typeof result?.achievement === 'number' && Number.isFinite(result.achievement)) ||
            (typeof result?.score === 'number' && Number.isFinite(result.score));
        const approved = status === 'approved' || status === 'completed' || status === 'reviewed';
        if ((source === 'reviewer' || source === 'supervisor') && approved && hasScore)
            return 70;
        if ((source === 'reviewer' || source === 'supervisor') && approved)
            return 60;
        if (source === 'api' && approved && hasScore)
            return 55;
        if (source === 'employee' && (status === 'submitted' || approved) && hasScore)
            return 50;
        if (hasScore)
            return 40;
        if (status === 'submitted')
            return 30;
        if (source === 'system')
            return 10;
        return 0;
    }
    selectPreferredKpiResults(results) {
        const selected = new Map();
        const sorted = [...results].sort((a, b) => {
            const rankDelta = this.kpiResultRank(b) - this.kpiResultRank(a);
            if (rankDelta !== 0)
                return rankDelta;
            const aUpdated = new Date(a?.updatedAt ?? a?.reviewedAt ?? a?.submittedAt ?? 0).getTime();
            const bUpdated = new Date(b?.updatedAt ?? b?.reviewedAt ?? b?.submittedAt ?? 0).getTime();
            return bUpdated - aUpdated;
        });
        for (const result of sorted) {
            const kpiId = String(result?.kpiId && typeof result.kpiId === 'object'
                ? result.kpiId?._id ?? result.kpiId
                : result?.kpiId ?? '');
            if (!kpiId || selected.has(kpiId))
                continue;
            selected.set(kpiId, result);
        }
        return Array.from(selected.values());
    }
    computeCoreValueScore(ratings) {
        if (!Array.isArray(ratings) || !ratings.length)
            return null;
        const entries = ratings
            .map((entry) => {
            const rating = this.normalizeRating(entry?.rating ?? null);
            if (rating === null)
                return null;
            const weight = entry?.weight !== undefined && entry?.weight !== null && entry?.weight !== ''
                ? Number(entry.weight)
                : undefined;
            return { value: rating, weight };
        })
            .filter(Boolean);
        return this.computeWeightedAverage(entries);
    }
    async computeOkrScore(review) {
        const employeeId = (review?.employeeId ?? '').trim();
        if (!employeeId)
            return null;
        const rawKpiIds = Array.isArray(review?.kpiIds) ? review.kpiIds.filter(Boolean) : [];
        const snapshot = Array.isArray(review?.kpiSnapshot)
            ? review.kpiSnapshot
            : [];
        const snapshotIds = snapshot
            .map((entry) => entry?.kpiId)
            .filter(Boolean);
        let kpiIds = rawKpiIds.length ? rawKpiIds : snapshotIds;
        const cycleId = review?.appraisalCycleId
            ? String(review.appraisalCycleId)
            : '';
        if (!kpiIds.length && cycleId && mongoose_2.Types.ObjectId.isValid(cycleId)) {
            const cycleKpis = await this.kpiModel
                .find({ appraisalCycleId: new mongoose_2.Types.ObjectId(cycleId) })
                .select('_id')
                .lean()
                .exec();
            kpiIds = cycleKpis.map((k) => k._id);
        }
        if (!kpiIds.length)
            return null;
        const baseQuery = {
            employeeId,
            kpiId: { $in: kpiIds },
        };
        const candidateQueries = [];
        if (cycleId && mongoose_2.Types.ObjectId.isValid(cycleId)) {
            candidateQueries.push({ ...baseQuery });
        }
        const range = this.resolvePeriodRange(review);
        if (range) {
            candidateQueries.push({
                ...baseQuery,
                period: { $gte: range.start, $lte: range.end },
            });
        }
        const reviewPeriod = String(review?.reviewPeriod ?? '').trim();
        if (/^\d{4}-\d{2}$/.test(reviewPeriod)) {
            const alreadyCoveredByRange = range && reviewPeriod >= range.start && reviewPeriod <= range.end;
            if (!alreadyCoveredByRange) {
                candidateQueries.push({
                    ...baseQuery,
                    period: reviewPeriod,
                });
            }
        }
        if (!candidateQueries.length)
            return null;
        let results = [];
        for (const query of candidateQueries) {
            results = await this.kpiResultModel
                .find(query)
                .populate({ path: 'kpiId', select: 'weight' })
                .lean()
                .exec();
            if (results.length)
                break;
        }
        if (!results.length)
            return null;
        const entries = [];
        this.selectPreferredKpiResults(results).forEach((result) => {
            const weightRaw = result?.kpiId?.weight;
            const weight = typeof weightRaw === 'number' && Number.isFinite(weightRaw) && weightRaw > 0
                ? weightRaw
                : 1;
            let achievement = typeof result?.achievement === 'number' && Number.isFinite(result.achievement)
                ? result.achievement
                : null;
            if (achievement === null) {
                const score = typeof result?.score === 'number' && Number.isFinite(result.score)
                    ? result.score
                    : null;
                if (score !== null && weight > 0) {
                    achievement = score / weight;
                }
            }
            if (achievement === null)
                return;
            const normalized = Math.max(0, Math.min(1, achievement));
            entries.push({ value: normalized * performance_1.RATING_SCALE_MAX, weight });
        });
        const average = this.computeWeightedAverage(entries);
        if (average === null)
            return null;
        return Math.max(0, Math.min(performance_1.RATING_SCALE_MAX, average));
    }
    async resolveWorkflowScoreWeights(employeeId) {
        const defaults = { employee: 40, reviewer: 60 };
        const profile = employeeId ? await this.resolveEmployeeProfile(employeeId) : null;
        const entityId = this.normalizeEntityId(profile?.entity);
        if (!entityId)
            return defaults;
        const workflow = await this.workflowModel
            .findOne({ entity: new mongoose_2.Types.ObjectId(entityId) })
            .lean()
            .exec();
        const employeeWeight = Number(workflow?.employeeScoreWeight);
        const reviewerWeight = Number(workflow?.reviewerScoreWeight);
        if (!Number.isFinite(employeeWeight) || !Number.isFinite(reviewerWeight)) {
            return defaults;
        }
        const total = employeeWeight + reviewerWeight;
        if (total <= 0 || Math.abs(total - 100) > 0.01) {
            return defaults;
        }
        return { employee: employeeWeight, reviewer: reviewerWeight };
    }
    async backfillSupervisorKpiResults(review, actorId) {
        const empId = (review?.employeeId ?? '').trim();
        const cycleId = review?.appraisalCycleId ? String(review.appraisalCycleId) : '';
        if (!empId || !cycleId)
            return;
        const cycleKpis = await this.kpiModel
            .find({ appraisalCycleId: new mongoose_2.Types.ObjectId(cycleId) })
            .select('_id targetValue scoringMethod scoreDirection weight')
            .lean()
            .exec();
        if (!cycleKpis.length)
            return;
        const kpiById = new Map(cycleKpis.map((k) => [String(k._id), k]));
        const kpiIds = cycleKpis.map((k) => k._id);
        const results = await this.kpiResultModel
            .find({ employeeId: empId, kpiId: { $in: kpiIds } })
            .exec();
        const now = new Date();
        for (const result of results) {
            const source = String(result.source ?? '').trim().toLowerCase();
            const reviewerTouched = source === 'reviewer' ||
                source === 'supervisor' ||
                Boolean(result.reviewedBy) ||
                Boolean(result.reviewedAt);
            if (reviewerTouched)
                continue;
            const employeeValue = result.actualValue;
            if (employeeValue === undefined || employeeValue === null || employeeValue === '') {
                continue;
            }
            const kpi = kpiById.get(String(result.kpiId));
            const scopeKey = String(result.scopeKey ?? '').trim() || `employee:${empId}`;
            const reviewerResult = (await this.kpiResultModel
                .findOne({
                kpiId: result.kpiId,
                period: result.period,
                scopeKey,
                source: 'reviewer',
            })
                .exec()) ??
                new this.kpiResultModel({
                    kpiId: result.kpiId,
                    period: result.period,
                    scopeKey,
                    scopeType: result.scopeType ?? 'employee',
                    scopeId: result.scopeId ?? empId,
                    scopeName: result.scopeName,
                    employeeId: empId,
                    employeeName: result.employeeName,
                    entity: result.entity,
                    source: 'reviewer',
                });
            const achievement = (0, kpi_scoring_1.computeAchievement)(employeeValue, kpi?.targetValue, kpi?.scoreDirection, kpi?.scoringMethod);
            if (achievement !== null) {
                const weight = Number.isFinite(Number(kpi?.weight)) ? Number(kpi.weight) : 1;
                reviewerResult.achievement = achievement;
                reviewerResult.score = achievement * weight;
            }
            reviewerResult.actualValue = employeeValue;
            reviewerResult.source = 'reviewer';
            reviewerResult.status = 'approved';
            reviewerResult.reviewedAt = now;
            if (actorId)
                reviewerResult.reviewedBy = actorId;
            await reviewerResult.save();
        }
    }
    async applyComputedScores(review) {
        const okrScore = await this.computeOkrScore(review);
        const employeeCoreScore = this.computeCoreValueScore(review?.coreValueRatings);
        const reviewerCoreScore = this.computeCoreValueScore(review?.reviewerCoreValueRatings);
        const reviewerRating = this.normalizeRating(review?.rating ?? null) ??
            this.normalizeRating(review?.reviewer2Rating ?? null);
        const kpiWeightTotal = this.computeKpiWeightTotal(review?.kpiSnapshot);
        const behaviouralWeight = Math.max(0, 100 - kpiWeightTotal);
        const weightedBlend = (okrValue, coreValue) => {
            if (kpiWeightTotal > 0 && behaviouralWeight > 0) {
                return (okrValue * kpiWeightTotal + coreValue * behaviouralWeight) / 100;
            }
            if (kpiWeightTotal > 0)
                return okrValue;
            if (behaviouralWeight > 0)
                return coreValue;
            return (okrValue + coreValue) / 2;
        };
        let employeeScore = null;
        if (okrScore !== null && employeeCoreScore !== null) {
            employeeScore = weightedBlend(okrScore, employeeCoreScore);
        }
        else {
            employeeScore = okrScore ?? employeeCoreScore ?? null;
        }
        let reviewerScore = null;
        if (okrScore !== null && reviewerCoreScore !== null) {
            reviewerScore = weightedBlend(okrScore, reviewerCoreScore);
        }
        else if (reviewerCoreScore !== null || okrScore !== null) {
            reviewerScore = reviewerCoreScore ?? okrScore;
        }
        else if (reviewerRating !== null) {
            reviewerScore = reviewerRating;
        }
        let finalScore = null;
        if (employeeScore !== null && reviewerScore !== null) {
            const weights = await this.resolveWorkflowScoreWeights(review.employeeId);
            finalScore = (employeeScore * weights.employee + reviewerScore * weights.reviewer) / 100;
        }
        else {
            finalScore = reviewerScore ?? employeeScore ?? null;
        }
        const clamp = (value) => {
            if (value === null)
                return null;
            const safe = Math.max(0, Math.min(performance_1.RATING_SCALE_MAX, value));
            return Number.isFinite(safe) ? Number(safe.toFixed(2)) : null;
        };
        review.employeeScore = clamp(employeeScore);
        review.reviewerScore = clamp(reviewerScore);
        review.finalScore = clamp(finalScore);
        review.okrScore = clamp(okrScore);
        review.employeeBehaviouralScore = clamp(employeeCoreScore);
        review.reviewerBehaviouralScore = clamp(reviewerCoreScore);
    }
    async backfillSupervisorKpiResultsForReview(reviewId) {
        if (!mongoose_2.Types.ObjectId.isValid(reviewId)) {
            throw new common_1.BadRequestException('Invalid review id');
        }
        const review = await this.reviewModel.findById(reviewId).exec();
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        await this.backfillSupervisorKpiResults(review);
        await this.applyComputedScores(review);
        await review.save();
        return { reviewId, status: 'ok' };
    }
    async recomputeAllReviewScores() {
        let processed = 0;
        let failed = 0;
        const cursor = this.reviewModel.find().cursor();
        for (let review = await cursor.next(); review; review = await cursor.next()) {
            try {
                const doc = review;
                if ((0, performance_review_util_1.normalizePerformanceReviewStatus)(doc.status) === 'completed') {
                    await this.backfillSupervisorKpiResults(doc);
                }
                await this.applyComputedScores(doc);
                await doc.save();
                processed += 1;
            }
            catch {
                failed += 1;
            }
        }
        return { processed, failed };
    }
};
exports.PerformanceScoringService = PerformanceScoringService;
exports.PerformanceScoringService = PerformanceScoringService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(performance_review_schema_1.PerformanceReview.name)),
    __param(1, (0, mongoose_1.InjectModel)(kpi_schema_1.PerformanceKpi.name)),
    __param(2, (0, mongoose_1.InjectModel)(performance_kpi_result_schema_1.PerformanceKpiResult.name)),
    __param(3, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(4, (0, mongoose_1.InjectModel)(performance_workflow_schema_1.PerformanceWorkflowConfig.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], PerformanceScoringService);
//# sourceMappingURL=performance-scoring.service.js.map