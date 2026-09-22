export declare class PerformanceCoreValueRatingDto {
    coreValueId?: string;
    id?: string;
    _id?: string;
    title?: string;
    description?: string;
    weight?: number | string;
    rating?: number | string | null;
}
declare class PerformanceReviewCommonDto {
    employeeName?: string;
    department?: string;
    position?: string;
    reviewDate?: string | Date;
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
    coreValueRatings?: PerformanceCoreValueRatingDto[];
    reviewerCoreValueRatings?: PerformanceCoreValueRatingDto[];
    appraisalCycleId?: string;
    appraisalCycleName?: string;
}
export declare class CreatePerformanceReviewDto extends PerformanceReviewCommonDto {
    employeeId: string;
    reviewType: string;
    reviewPeriod: string;
    reviewStartDate: string | Date;
    reviewEndDate: string | Date;
}
export declare class UpdatePerformanceReviewDto extends PerformanceReviewCommonDto {
    employeeId?: string;
    reviewType?: string;
    reviewPeriod?: string;
    reviewStartDate?: string | Date;
    reviewEndDate?: string | Date;
    reviewStage?: string;
    reviewStageUpdatedAt?: string | Date;
    employeeScore?: number | string | null;
    reviewerScore?: number | string | null;
    finalScore?: number | string | null;
    resetStaffScores?: boolean;
    resetAllScores?: boolean;
    resetIndividualScores?: boolean;
    draft?: boolean;
}
export declare class NudgePerformanceReviewsDto {
    entity?: string;
    appraisalCycleId?: string;
}
export declare class NudgeOutstandingPerformanceReviewsDto {
    entity?: string;
    cycleId?: string;
    dryRun?: boolean;
}
export {};
