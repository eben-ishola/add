import { Document, Model, Types } from 'mongoose';
import { PerformanceReview, PerformanceReviewDocument } from '../../schemas/performance-review.schema';
import { UserDocument } from '../../schemas/user.schema';
import { PerformanceWorkflowConfig } from '../../schemas/performance-workflow.schema';
import { PerformanceCoreValueService } from 'src/services/performance/performance-core-value.service';
import { PerformanceCycleService } from 'src/services/performance/performance-cycle.service';
import { PerformanceKpiSnapshotService } from 'src/services/performance/performance-kpi-snapshot.service';
import { PerformanceNotificationService } from 'src/services/performance/performance-notification.service';
import { PerformanceReviewService } from 'src/services/performance/performance-review.service';
import { PerformanceScoringService } from 'src/services/performance/performance-scoring.service';
import { PerformanceWorkflowConfigService } from 'src/services/performance/performance-workflow-config.service';
type PerformanceWorkflowConfigDocument = PerformanceWorkflowConfig & Document;
type CreateReviewInput = {
    employeeId: string;
    employeeName?: string;
    department?: string;
    position?: string;
    reviewType: string;
    reviewPeriod: string;
    reviewDate?: string | Date;
    reviewStartDate: string | Date;
    reviewEndDate: string | Date;
    status?: string;
    rating?: number | string | null;
    reviewerId?: string;
    reviewerName?: string;
    reviewer2Id?: string;
    reviewer2Name?: string;
    summary?: string;
    recommendation?: string;
    exceptionalAchievement?: string;
    trainingRecommendation?: string;
    reviewer2Summary?: string;
    reviewer2Recommendation?: string;
    reviewer2Rating?: number | string | null;
    coreValueRatings?: Array<{
        coreValueId?: string;
        id?: string;
        _id?: string;
        title?: string;
        description?: string;
        weight?: number | string;
        rating?: number | string | null;
    }>;
    reviewerCoreValueRatings?: Array<{
        coreValueId?: string;
        id?: string;
        _id?: string;
        title?: string;
        description?: string;
        weight?: number | string;
        rating?: number | string | null;
    }>;
    appraisalCycleId?: string;
    appraisalCycleName?: string;
};
type UpdateReviewInput = Partial<CreateReviewInput>;
export declare class PerformanceService {
    private readonly reviewModel;
    private readonly userModel;
    private readonly workflowModel;
    private readonly performanceCoreValueService;
    private readonly performanceCycleService;
    private readonly performanceKpiSnapshotService;
    private readonly performanceNotificationService;
    private readonly performanceReviewService;
    private readonly performanceScoringService;
    private readonly performanceWorkflowConfigService;
    constructor(reviewModel: Model<PerformanceReviewDocument>, userModel: Model<UserDocument>, workflowModel: Model<PerformanceWorkflowConfigDocument>, performanceCoreValueService: PerformanceCoreValueService, performanceCycleService: PerformanceCycleService, performanceKpiSnapshotService: PerformanceKpiSnapshotService, performanceNotificationService: PerformanceNotificationService, performanceReviewService: PerformanceReviewService, performanceScoringService: PerformanceScoringService, performanceWorkflowConfigService: PerformanceWorkflowConfigService);
    private static readonly SUPER_ADMIN_ROLE_NAMES;
    private static readonly ADMIN_ROLE_NAMES;
    private static readonly PERFORMANCE_WORKFLOW_ROLE_NAMES;
    private extractRoleNames;
    private extractPermissionNames;
    private userHasPermission;
    private normalizeRoleNameTokens;
    private userHasWorkflowRole;
    private canManagePerformanceWorkflow;
    private userHasSuperAdminRole;
    private userHasAdminRole;
    private normalizeEntityId;
    private normalizeUserId;
    private normalizeUserIdList;
    private normalizeIdentifier;
    private resolveEmployeeProfile;
    private resolveReviewerName;
    private formatEmployeeName;
    debugKpiResolutionForReview(reviewId: string): Promise<{
        review: {
            id: string;
            employeeId: string;
            employeeName: string;
            reviewStartDate: Date;
            reviewEndDate: Date;
        };
        employee: {
            id: string;
            entity: string;
            role: {
                id?: string;
                name?: string;
            };
            level: {
                id?: string;
                name?: string;
            };
            department: {
                id?: string;
                name?: string;
            };
            businessUnit: {
                id?: string;
                name?: string;
            };
            branch: {
                id?: string;
                name?: string;
            };
        };
        totalCandidates: number;
        includedCount: number;
        decisions: {
            kpiId: string;
            title: any;
            included: boolean;
            reasons: string[];
            kpi: {
                entity: any;
                employeeId: any;
                roleId: any;
                roleName: any;
                levelId: any;
                levelName: any;
                departmentId: any;
                departmentName: any;
                businessUnitId: any;
                businessUnitName: any;
                branchId: any;
                branchName: any;
                startDate: any;
                endDate: any;
                appraisalCycleId: any;
            };
        }[];
    }>;
    resolveInitialKpis(input: {
        employeeId: string;
        employeeName?: string;
        reviewStartDate?: Date;
        reviewEndDate?: Date;
        reviewDate: Date;
        appraisalCycleId?: string;
    }): Promise<{
        kpiIds: any[];
        kpiSnapshot: any[];
    } | {
        kpiIds: Types.ObjectId[];
        kpiSnapshot: {
            kpiId: Types.ObjectId;
            title: any;
            description: any;
            targetValue: any;
            actualValue: any;
            measurementUnit: any;
            weight: any;
            type: any;
            kpa: any;
            categoryName: any;
            startDate: Date;
            endDate: Date;
        }[];
    }>;
    private reconcileBehaviouralWeightsForSnapshot;
    reconcileReviewSnapshot(reviewId: string, refreshed: {
        kpiIds: any[];
        kpiSnapshot: Array<{
            weight?: number | string | null;
        }>;
    }): Promise<void>;
    syncKpiActualValueInReviewSnapshots(kpiId: string, actualValue: unknown, options?: {
        employeeId?: string;
        appraisalCycleId?: string;
        title?: string;
    }): Promise<{
        matched: number;
        modified: number;
    }>;
    backfillSupervisorKpiResultsForReview(reviewId: string): Promise<{
        reviewId: string;
        status: string;
    }>;
    refreshReview(reviewId: string, actor: any): Promise<{
        status: number;
        message: string;
    }>;
    private resolveReviewerAssignmentForEmployee;
    refreshReviewsForKpi(kpiId: string, actor?: any): Promise<{
        refreshed: number;
    }>;
    notifyOutstandingReviews(opts?: {
        actor?: any;
        entity?: string;
        cycleId?: string;
        dryRun?: boolean;
    }): Promise<{
        cycles: number;
        employeesScanned: number;
        outstanding: number;
        notified: number;
        failed: number;
        skippedNoUserId: number;
    }>;
    recomputeAllReviewScores(): Promise<{
        processed: number;
        failed: number;
    }>;
    listReviews(user: any, query: Partial<{
        status: string;
        department: string;
        reviewer: string;
        employeeId: string;
        search: string;
        supervisorScope?: string;
        subordinateScope?: string;
        entity?: string;
        appraisalCycleId?: string;
    }>, page?: number, limit?: number): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getReviewStats(user: any, query: Partial<{
        status: string;
        department: string;
        reviewer: string;
        employeeId: string;
        search: string;
        supervisorScope?: string;
        subordinateScope?: string;
        entity?: string;
        appraisalCycleId?: string;
    }>): Promise<{
        total: number;
        completed: number;
        pending: number;
        ratedCount: number;
        average: number;
    }>;
    exportReviews(user: any, query: Partial<{
        status: string;
        department: string;
        reviewer: string;
        employeeId: string;
        search: string;
        supervisorScope?: string;
        subordinateScope?: string;
        entity?: string;
        appraisalCycleId?: string;
    }>): Promise<{
        data: (import("mongoose").FlattenMaps<PerformanceReviewDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
        total: number;
    }>;
    getReview(id: string, user?: any): Promise<import("mongoose").FlattenMaps<PerformanceReviewDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    nudgeAllPendingSupervisors(filters: {
        entity?: string;
        appraisalCycleId?: string;
    } | undefined, actor: any): Promise<{
        status: number;
        message: string;
        sent: number;
        skipped: number;
        total: number;
    }>;
    nudgeReviewSupervisor(id: string, actor: any): Promise<{
        status: number;
        message: string;
    }>;
    createReview(payload: CreateReviewInput): Promise<any>;
    updateReview(id: string, updates: UpdateReviewInput, actor?: any): Promise<Document<unknown, {}, PerformanceReviewDocument, {}, {}> & PerformanceReview & Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    bulkCreateFromCsv(rows: Array<Record<string, string>>): Promise<{
        created: number;
        skipped: number;
    }>;
    deleteReview(id: string): Promise<{
        deleted: boolean;
    }>;
    listCoreValues(user: any, entity?: string): Promise<any>;
    createCoreValue(user: any, payload: any): Promise<any>;
    updateCoreValue(user: any, id: string, payload: any): Promise<any>;
    deleteCoreValue(user: any, id: string): Promise<any>;
    listAppraisalCycles(user: any, entity?: string, search?: string): Promise<any>;
    listActiveAppraisalCycles(user: any, entity?: string): Promise<any>;
    debugAppraisalCycleExists(user: any, entity?: string): Promise<any>;
    getAppraisalCycle(user: any, id: string): Promise<any>;
    createAppraisalCycle(user: any, payload: any): Promise<any>;
    updateAppraisalCycle(user: any, id: string, payload: any): Promise<any>;
    deleteAppraisalCycle(user: any, id: string): Promise<any>;
    getWorkflowConfigs(user: any, entity?: string): Promise<any>;
    saveWorkflowConfig(user: any, payload: any): Promise<any>;
}
export {};
