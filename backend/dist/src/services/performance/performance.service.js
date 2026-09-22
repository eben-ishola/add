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
var PerformanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceService = void 0;
const common_1 = require("@nestjs/common");
const access_control_util_1 = require("../../utils/shared/access-control.util");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const performance_review_schema_1 = require("../../schemas/performance-review.schema");
const user_schema_1 = require("../../schemas/user.schema");
const performance_workflow_schema_1 = require("../../schemas/performance-workflow.schema");
const performance_core_value_service_1 = require("./performance-core-value.service");
const performance_cycle_service_1 = require("./performance-cycle.service");
const performance_kpi_snapshot_service_1 = require("./performance-kpi-snapshot.service");
const performance_notification_service_1 = require("./performance-notification.service");
const performance_review_service_1 = require("./performance-review.service");
const performance_scoring_service_1 = require("./performance-scoring.service");
const performance_workflow_config_service_1 = require("./performance-workflow-config.service");
const mongo_1 = require("../../utils/shared/mongo");
let PerformanceService = PerformanceService_1 = class PerformanceService {
    constructor(reviewModel, userModel, workflowModel, performanceCoreValueService, performanceCycleService, performanceKpiSnapshotService, performanceNotificationService, performanceReviewService, performanceScoringService, performanceWorkflowConfigService) {
        this.reviewModel = reviewModel;
        this.userModel = userModel;
        this.workflowModel = workflowModel;
        this.performanceCoreValueService = performanceCoreValueService;
        this.performanceCycleService = performanceCycleService;
        this.performanceKpiSnapshotService = performanceKpiSnapshotService;
        this.performanceNotificationService = performanceNotificationService;
        this.performanceReviewService = performanceReviewService;
        this.performanceScoringService = performanceScoringService;
        this.performanceWorkflowConfigService = performanceWorkflowConfigService;
    }
    extractRoleNames(roleLike) {
        const names = [];
        const register = (value) => {
            if (typeof value === 'string' && value.trim()) {
                names.push(value.trim().toLowerCase());
            }
        };
        if (!roleLike)
            return names;
        if (typeof roleLike === 'string') {
            register(roleLike);
            return names;
        }
        register(roleLike?.name);
        register(roleLike?.label);
        if (roleLike?.role) {
            register(roleLike?.role?.name);
            register(roleLike?.role?.label);
        }
        return names;
    }
    extractPermissionNames(user) {
        const names = new Set();
        const register = (source) => {
            if (!source)
                return;
            const values = Array.isArray(source) ? source : [source];
            values.forEach((permission) => {
                if (!permission)
                    return;
                if (typeof permission === 'string') {
                    names.add(permission.trim().toLowerCase());
                }
                else if (typeof permission?.name === 'string') {
                    names.add(permission.name.trim().toLowerCase());
                }
            });
        };
        register(user?.permissions);
        register(user?.role?.permissions);
        if (Array.isArray(user?.roles)) {
            user.roles.forEach((role) => {
                register(role?.permissions);
                register(role?.role?.permissions);
            });
        }
        const additional = Array.isArray(user?.additionalRoles)
            ? user.additionalRoles
            : user?.additionalRoles
                ? [user.additionalRoles]
                : [];
        additional.forEach((assignment) => {
            const roleNode = assignment?.role ?? assignment;
            register(roleNode?.permissions);
        });
        return names;
    }
    userHasPermission(user, required) {
        const permissions = this.extractPermissionNames(user);
        if (permissions.has('all'))
            return true;
        const list = Array.isArray(required) ? required : [required];
        return list.some((perm) => permissions.has(perm.toLowerCase()));
    }
    normalizeRoleNameTokens(roleName) {
        const base = String(roleName).trim().toLowerCase();
        if (!base)
            return [];
        const condensed = base.replace(/[\s_-]+/g, '');
        const hyphenated = base.replace(/[\s_]+/g, '-');
        return Array.from(new Set([base, condensed, hyphenated]));
    }
    userHasWorkflowRole(user) {
        const additional = Array.isArray(user?.additionalRoles)
            ? user.additionalRoles.map((assignment) => assignment?.role ?? assignment)
            : [];
        const sources = [
            user?.role,
            ...(Array.isArray(user?.roles) ? user.roles : []),
            ...additional,
        ];
        return sources.some((roleLike) => this.extractRoleNames(roleLike).some((name) => this.normalizeRoleNameTokens(name).some((token) => PerformanceService_1.PERFORMANCE_WORKFLOW_ROLE_NAMES.has(token))));
    }
    canManagePerformanceWorkflow(user) {
        return (this.userHasSuperAdminRole(user) ||
            this.userHasAdminRole(user) ||
            this.userHasPermission(user, ['performance management']) ||
            this.userHasWorkflowRole(user));
    }
    userHasSuperAdminRole(user) {
        const permissions = this.extractPermissionNames(user);
        if (permissions.has('all'))
            return true;
        for (const name of permissions) {
            if (PerformanceService_1.SUPER_ADMIN_ROLE_NAMES.has(name)) {
                return true;
            }
        }
        const additional = Array.isArray(user?.additionalRoles)
            ? user.additionalRoles.map((assignment) => assignment?.role ?? assignment)
            : [];
        const sources = [
            user?.role,
            ...(Array.isArray(user?.roles) ? user.roles : []),
            ...additional,
        ];
        return sources.some((roleLike) => this.extractRoleNames(roleLike).some((name) => PerformanceService_1.SUPER_ADMIN_ROLE_NAMES.has(name)));
    }
    userHasAdminRole(user) {
        const permissions = this.extractPermissionNames(user);
        if (permissions.has('all'))
            return true;
        for (const name of permissions) {
            if (PerformanceService_1.ADMIN_ROLE_NAMES.has(name)) {
                return true;
            }
        }
        const additional = Array.isArray(user?.additionalRoles)
            ? user.additionalRoles.map((assignment) => assignment?.role ?? assignment)
            : [];
        const sources = [
            user?.role,
            ...(Array.isArray(user?.roles) ? user.roles : []),
            ...additional,
        ];
        return sources.some((roleLike) => this.extractRoleNames(roleLike).some((name) => this.normalizeRoleNameTokens(name).some((token) => PerformanceService_1.ADMIN_ROLE_NAMES.has(token))));
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
    normalizeUserId(value) {
        if (value == null)
            return null;
        const candidate = typeof value === 'object'
            ? value?._id ?? value?.id ?? value?.userId ?? value
            : value;
        const normalized = String(candidate ?? '').trim();
        if (!normalized || normalized.toLowerCase() === 'undefined' || normalized.toLowerCase() === 'null') {
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
    async resolveReviewerName(reviewerId) {
        const trimmed = (reviewerId ?? '').trim();
        if (!trimmed)
            return undefined;
        const profile = await this.resolveEmployeeProfile(trimmed);
        return this.formatEmployeeName(profile, undefined, trimmed);
    }
    formatEmployeeName(profile, fallbackName, fallbackId) {
        const trimmedFallback = (fallbackName ?? '').trim();
        if (trimmedFallback)
            return trimmedFallback;
        const name = (profile?.fullName ??
            [profile?.firstName, profile?.lastName].filter(Boolean).join(' '))?.trim?.() ?? '';
        if (name)
            return name;
        return (profile?.email ??
            profile?.staffId ??
            fallbackId ??
            'Unknown employee');
    }
    async debugKpiResolutionForReview(reviewId) {
        return this.performanceKpiSnapshotService.debugKpiResolutionForReview(reviewId);
    }
    async resolveInitialKpis(input) {
        return this.performanceKpiSnapshotService.resolveInitialKpis(input);
    }
    async reconcileBehaviouralWeightsForSnapshot(review, kpiSnapshot) {
        return this.performanceKpiSnapshotService.reconcileBehaviouralWeightsForSnapshot(review, kpiSnapshot);
    }
    async reconcileReviewSnapshot(reviewId, refreshed) {
        return this.performanceKpiSnapshotService.reconcileReviewSnapshot(reviewId, refreshed);
    }
    async syncKpiActualValueInReviewSnapshots(kpiId, actualValue, options) {
        return this.performanceKpiSnapshotService.syncActualValueForKpi(kpiId, actualValue, options);
    }
    async backfillSupervisorKpiResultsForReview(reviewId) {
        return this.performanceScoringService.backfillSupervisorKpiResultsForReview(reviewId);
    }
    async refreshReview(reviewId, actor) {
        if (!this.canManagePerformanceWorkflow(actor)) {
            throw new common_1.ForbiddenException('You do not have permission to refresh an appraisal.');
        }
        if (!mongoose_2.Types.ObjectId.isValid(reviewId)) {
            throw new common_1.BadRequestException('Invalid review id');
        }
        const review = await this.reviewModel.findById(reviewId).exec();
        if (!review) {
            throw new common_1.NotFoundException('Performance review not found');
        }
        const employeeId = String(review?.employeeId ?? '').trim();
        if (!employeeId) {
            throw new common_1.BadRequestException('Review has no employeeId');
        }
        const reviewDate = review?.reviewDate
            ? new Date(review.reviewDate)
            : new Date();
        const refreshed = await this.resolveInitialKpis({
            employeeId,
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
        review.kpiIds = refreshed.kpiIds;
        review.kpiSnapshot = refreshed.kpiSnapshot;
        review.kpiSnapshotAt = new Date();
        await this.performanceReviewService.deleteKpiResultsForReview(review, { extraKpiIds: refreshed.kpiIds });
        await this.reconcileBehaviouralWeightsForSnapshot(review, refreshed.kpiSnapshot);
        const reassignment = await this.resolveReviewerAssignmentForEmployee(employeeId);
        review.reviewerId = reassignment.reviewerId ?? null;
        review.reviewerName = reassignment.reviewerName ?? null;
        review.reviewer2Id = reassignment.reviewer2Id ?? null;
        review.reviewer2Name = reassignment.reviewer2Name ?? null;
        review.hrReviewerIds = reassignment.hrReviewerIds;
        review.rating = null;
        review.reviewer2Rating = null;
        review.employeeScore = null;
        review.reviewerScore = null;
        review.finalScore = null;
        review.okrScore = null;
        review.employeeBehaviouralScore = null;
        review.reviewerBehaviouralScore = null;
        review.coreValueRatings = [];
        review.coreValueSnapshotAt = undefined;
        review.reviewerCoreValueRatings = [];
        review.reviewerCoreValueSnapshotAt = undefined;
        review.reviewStage = 'employee';
        review.reviewStageUpdatedAt = new Date();
        review.status = 'Pending Employee Review';
        await review.save();
        return {
            status: 200,
            message: `Refreshed: ${refreshed.kpiSnapshot.length} KPI(s), previous KPI results deleted, employee can start afresh.`,
        };
    }
    async resolveReviewerAssignmentForEmployee(employeeId) {
        const profile = await this.resolveEmployeeProfile(employeeId);
        if (!profile)
            return { hrReviewerIds: [] };
        const supervisorIdRaw = this.normalizeUserId(profile?.supervisorId) ??
            this.normalizeIdentifier(profile?.supervisorId);
        const supervisor2IdRaw = this.normalizeUserId(profile?.supervisor2Id) ??
            this.normalizeIdentifier(profile?.supervisor2Id);
        const employeeRecordId = this.normalizeUserId(profile?._id ?? profile?.id) ??
            this.normalizeIdentifier(profile?._id ?? profile?.id);
        let reviewerId = supervisorIdRaw && supervisorIdRaw !== employeeRecordId
            ? supervisorIdRaw
            : undefined;
        let reviewer2Id = supervisor2IdRaw &&
            supervisor2IdRaw !== employeeRecordId &&
            supervisor2IdRaw !== reviewerId
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
        if (!reviewerId && hrReviewerIds.length) {
            reviewerId = hrReviewerIds[0];
        }
        if (!reviewer2Id && hrReviewerIds.length) {
            reviewer2Id = hrReviewerIds.find((id) => id !== reviewerId);
        }
        if (reviewer2Id && reviewer2Id === reviewerId) {
            reviewer2Id = undefined;
        }
        const reviewerName = reviewerId ? await this.resolveReviewerName(reviewerId) : undefined;
        const reviewer2Name = reviewer2Id ? await this.resolveReviewerName(reviewer2Id) : undefined;
        return { reviewerId, reviewerName, reviewer2Id, reviewer2Name, hrReviewerIds };
    }
    async refreshReviewsForKpi(kpiId, actor) {
        return this.performanceKpiSnapshotService.refreshReviewsForKpi(kpiId, actor);
    }
    async notifyOutstandingReviews(opts) {
        return this.performanceNotificationService.notifyOutstandingReviews(opts);
    }
    async recomputeAllReviewScores() {
        return this.performanceScoringService.recomputeAllReviewScores();
    }
    async listReviews(user, query, page = 1, limit = 10) {
        return this.performanceReviewService.listReviews(user, query, page, limit);
    }
    async getReviewStats(user, query) {
        return this.performanceReviewService.getReviewStats(user, query);
    }
    async exportReviews(user, query) {
        return this.performanceReviewService.exportReviews(user, query);
    }
    async getReview(id, user) {
        return this.performanceReviewService.getReview(id, user);
    }
    async nudgeAllPendingSupervisors(filters, actor) {
        return this.performanceNotificationService.nudgeAllPendingSupervisors(filters, actor);
    }
    async nudgeReviewSupervisor(id, actor) {
        return this.performanceNotificationService.nudgeReviewSupervisor(id, actor);
    }
    async createReview(payload) {
        return this.performanceReviewService.createReview(payload);
    }
    async updateReview(id, updates, actor) {
        return this.performanceReviewService.updateReview(id, updates, actor);
    }
    async bulkCreateFromCsv(rows) {
        return this.performanceReviewService.bulkCreateFromCsv(rows);
    }
    async deleteReview(id) {
        return this.performanceReviewService.deleteReview(id);
    }
    async listCoreValues(user, entity) {
        return this.performanceCoreValueService.listCoreValues(user, entity);
    }
    async createCoreValue(user, payload) {
        return this.performanceCoreValueService.createCoreValue(user, payload);
    }
    async updateCoreValue(user, id, payload) {
        return this.performanceCoreValueService.updateCoreValue(user, id, payload);
    }
    async deleteCoreValue(user, id) {
        return this.performanceCoreValueService.deleteCoreValue(user, id);
    }
    async listAppraisalCycles(user, entity, search) {
        return this.performanceCycleService.listAppraisalCycles(user, entity, search);
    }
    async listActiveAppraisalCycles(user, entity) {
        return this.performanceCycleService.listActiveAppraisalCycles(user, entity);
    }
    async debugAppraisalCycleExists(user, entity) {
        return this.performanceCycleService.debugAppraisalCycleExists(user, entity);
    }
    async getAppraisalCycle(user, id) {
        return this.performanceCycleService.getAppraisalCycle(user, id);
    }
    async createAppraisalCycle(user, payload) {
        return this.performanceCycleService.createAppraisalCycle(user, payload);
    }
    async updateAppraisalCycle(user, id, payload) {
        return this.performanceCycleService.updateAppraisalCycle(user, id, payload);
    }
    async deleteAppraisalCycle(user, id) {
        return this.performanceCycleService.deleteAppraisalCycle(user, id);
    }
    async getWorkflowConfigs(user, entity) {
        return this.performanceWorkflowConfigService.getWorkflowConfigs(user, entity);
    }
    async saveWorkflowConfig(user, payload) {
        return this.performanceWorkflowConfigService.saveWorkflowConfig(user, payload);
    }
};
exports.PerformanceService = PerformanceService;
PerformanceService.SUPER_ADMIN_ROLE_NAMES = access_control_util_1.SUPER_ADMIN_ROLE_NAME_SET;
PerformanceService.ADMIN_ROLE_NAMES = new Set([
    'admin',
    'system admin',
    'system-admin',
    'systemadmin',
    'entity hr admin',
    'entity-hr-admin',
    'entityhradmin',
]);
PerformanceService.PERFORMANCE_WORKFLOW_ROLE_NAMES = new Set([
    'performance-manager',
    'performance manager',
    'performancemanager',
    'performance-officer',
    'performance officer',
    'performanceofficer',
    'performance-training-partner',
    'performance training partner',
    'performancetrainingpartner',
]);
exports.PerformanceService = PerformanceService = PerformanceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(performance_review_schema_1.PerformanceReview.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(performance_workflow_schema_1.PerformanceWorkflowConfig.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        performance_core_value_service_1.PerformanceCoreValueService,
        performance_cycle_service_1.PerformanceCycleService,
        performance_kpi_snapshot_service_1.PerformanceKpiSnapshotService,
        performance_notification_service_1.PerformanceNotificationService,
        performance_review_service_1.PerformanceReviewService,
        performance_scoring_service_1.PerformanceScoringService,
        performance_workflow_config_service_1.PerformanceWorkflowConfigService])
], PerformanceService);
//# sourceMappingURL=performance.service.js.map