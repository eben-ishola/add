import { Model, Types } from 'mongoose';
import { PerformanceReviewDocument } from '../../schemas/performance-review.schema';
import { PerformanceKpiDocument } from '../../schemas/kpi.schema';
import { PerformanceCoreValueDocument } from '../../schemas/performance-core-value.schema';
import { UserDocument } from '../../schemas/user.schema';
import { PerformanceScoringService } from 'src/services/performance/performance-scoring.service';
export declare class PerformanceKpiSnapshotService {
    private readonly reviewModel;
    private readonly kpiModel;
    private readonly coreValueModel;
    private readonly userModel;
    private readonly performanceScoringService;
    constructor(reviewModel: Model<PerformanceReviewDocument>, kpiModel: Model<PerformanceKpiDocument>, coreValueModel: Model<PerformanceCoreValueDocument>, userModel: Model<UserDocument>, performanceScoringService: PerformanceScoringService);
    private normalizeKey;
    private normalizeEntityId;
    private matchesDimension;
    private isKpiActive;
    private resolveEmployeeProfile;
    private buildEntityMatchKeys;
    private resolveRefValue;
    private buildRegex;
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
    computeKpiWeightTotal(kpiSnapshot?: Array<{
        weight?: number | string | null;
    }>): number;
    allocateBehaviouralWeights<T extends {
        weight?: number | string | null;
    }>(ratings: T[], kpiSnapshot?: Array<{
        weight?: number | string | null;
    }>): T[];
    private resolveCoreValueSeedsForReview;
    reconcileBehaviouralWeightsForSnapshot(review: PerformanceReviewDocument, kpiSnapshot?: Array<{
        weight?: number | string | null;
    }>): Promise<void>;
    reconcileReviewSnapshot(reviewId: string, refreshed: {
        kpiIds: any[];
        kpiSnapshot: Array<{
            weight?: number | string | null;
        }>;
    }): Promise<void>;
    syncActualValueForKpi(kpiId: string, actualValue: unknown, options?: {
        employeeId?: string;
        appraisalCycleId?: string;
        title?: string;
    }): Promise<{
        matched: number;
        modified: number;
    }>;
    refreshReviewsForKpi(kpiId: string, actor?: any): Promise<{
        refreshed: number;
    }>;
}
