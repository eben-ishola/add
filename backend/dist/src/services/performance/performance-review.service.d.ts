import { Document, Model } from 'mongoose';
import { PerformanceKpiDocument } from '../../schemas/kpi.schema';
import { PerformanceKpiResultDocument } from '../../schemas/performance-kpi-result.schema';
import { PerformanceReview, PerformanceReviewDocument } from '../../schemas/performance-review.schema';
import { PerformanceWorkflowConfig } from '../../schemas/performance-workflow.schema';
import { UserDocument } from '../../schemas/user.schema';
import { PerformanceKpiSnapshotService } from 'src/services/performance/performance-kpi-snapshot.service';
import { PerformanceNotificationService } from 'src/services/performance/performance-notification.service';
import { PerformanceScoringService } from 'src/services/performance/performance-scoring.service';
type PerformanceWorkflowConfigDocument = PerformanceWorkflowConfig & Document;
type ReviewQuery = Partial<{
    status: string;
    department: string;
    reviewer: string;
    employeeId: string;
    search: string;
    supervisorScope?: string;
    subordinateScope?: string;
    entity?: string;
    appraisalCycleId?: string;
}>;
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
type UpdateReviewInput = Partial<CreateReviewInput> & {
    draft?: boolean;
};
export declare class PerformanceReviewService {
    private readonly reviewModel;
    private readonly userModel;
    private readonly kpiModel;
    private readonly kpiResultModel;
    private readonly workflowModel;
    private readonly performanceKpiSnapshotService;
    private readonly performanceNotificationService;
    private readonly performanceScoringService;
    private static readonly REVIEW_PERIOD_LABELS;
    constructor(reviewModel: Model<PerformanceReviewDocument>, userModel: Model<UserDocument>, kpiModel: Model<PerformanceKpiDocument>, kpiResultModel: Model<PerformanceKpiResultDocument>, workflowModel: Model<PerformanceWorkflowConfigDocument>, performanceKpiSnapshotService: PerformanceKpiSnapshotService, performanceNotificationService: PerformanceNotificationService, performanceScoringService: PerformanceScoringService);
    private isPrivilegedUser;
    private normalizeMatchKey;
    private collectUserIdentifiers;
    private normalizeSubordinateScope;
    private buildSupervisorScopeFilter;
    private getDirectSubordinateIds;
    private getSubordinateChainIds;
    private buildUserAccessFilter;
    private normalizeUserId;
    private normalizeUserIdList;
    private normalizeIdentifier;
    private normalizeRating;
    private normalizeCoreValueRatings;
    private validateReviewPeriod;
    private buildRegex;
    private resolveRefValue;
    private formatEmployeeName;
    private resolveEmployeeProfile;
    private resolveReviewerName;
    private resolveEmployeeUserId;
    private normalizeEntityId;
    private resetReviewScores;
    private collectReviewKpiObjectIds;
    deleteKpiResultsForReview(review: PerformanceReviewDocument | Record<string, any>, options?: {
        extraKpiIds?: any[];
        clearKpiActualValue?: boolean;
    }): Promise<{
        deletedResults: number;
        clearedKpis: number;
    }>;
    private buildFilters;
    private resolveInitialReviewStage;
    private assertCanAccessReview;
    private applyAccessFilter;
    listReviews(user: any, query: ReviewQuery, page?: number, limit?: number): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getReviewStats(user: any, query: ReviewQuery): Promise<{
        total: number;
        completed: number;
        pending: number;
        ratedCount: number;
        average: number;
    }>;
    exportReviews(user: any, query: ReviewQuery): Promise<{
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
}
export {};
