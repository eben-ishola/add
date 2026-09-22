import { Document, Model } from 'mongoose';
import { PerformanceReviewDocument } from '../../schemas/performance-review.schema';
import { PerformanceKpiDocument } from '../../schemas/kpi.schema';
import { PerformanceKpiResultDocument } from '../../schemas/performance-kpi-result.schema';
import { UserDocument } from '../../schemas/user.schema';
import { PerformanceWorkflowConfig } from '../../schemas/performance-workflow.schema';
type PerformanceWorkflowConfigDocument = PerformanceWorkflowConfig & Document;
export declare class PerformanceScoringService {
    private readonly reviewModel;
    private readonly kpiModel;
    private readonly kpiResultModel;
    private readonly userModel;
    private readonly workflowModel;
    constructor(reviewModel: Model<PerformanceReviewDocument>, kpiModel: Model<PerformanceKpiDocument>, kpiResultModel: Model<PerformanceKpiResultDocument>, userModel: Model<UserDocument>, workflowModel: Model<PerformanceWorkflowConfigDocument>);
    private normalizeRating;
    private normalizeEntityId;
    private resolveEmployeeProfile;
    private formatPeriodKey;
    private resolvePeriodRange;
    private computeWeightedAverage;
    private computeKpiWeightTotal;
    private kpiResultRank;
    private selectPreferredKpiResults;
    computeCoreValueScore(ratings?: Array<{
        rating?: number | string | null;
        weight?: number | string;
    }>): number | null;
    computeOkrScore(review: PerformanceReviewDocument): Promise<number | null>;
    resolveWorkflowScoreWeights(employeeId: string): Promise<{
        employee: number;
        reviewer: number;
    }>;
    backfillSupervisorKpiResults(review: PerformanceReviewDocument, actorId?: string): Promise<void>;
    applyComputedScores(review: PerformanceReviewDocument): Promise<void>;
    backfillSupervisorKpiResultsForReview(reviewId: string): Promise<{
        reviewId: string;
        status: string;
    }>;
    recomputeAllReviewScores(): Promise<{
        processed: number;
        failed: number;
    }>;
}
export {};
