import mongoose, { Document } from 'mongoose';
export type PerformanceReviewDocument = PerformanceReview & Document;
export declare class PerformanceReview {
    employeeId: string;
    employeeName: string;
    department?: string;
    entity?: string;
    appraisalCycleId?: mongoose.Types.ObjectId;
    appraisalCycleName?: string;
    position?: string;
    reviewType: string;
    reviewPeriod: string;
    reviewDate: Date;
    reviewStartDate: Date;
    reviewEndDate: Date;
    status: string;
    reviewStage?: string;
    reviewStageUpdatedAt?: Date;
    rating?: number | null;
    reviewer2Rating?: number | null;
    employeeScore?: number | null;
    reviewerScore?: number | null;
    finalScore?: number | null;
    okrScore?: number | null;
    employeeBehaviouralScore?: number | null;
    reviewerBehaviouralScore?: number | null;
    reviewerId?: string;
    reviewerName?: string;
    reviewer2Id?: string;
    reviewer2Name?: string;
    hrReviewerIds?: string[];
    summary?: string;
    recommendation?: string;
    exceptionalAchievement?: string;
    trainingRecommendation?: string;
    reviewer2Summary?: string;
    reviewer2Recommendation?: string;
    reviewerTrainingRecommendation?: string;
    reviewer2TrainingRecommendation?: string;
    kpiIds?: mongoose.Types.ObjectId[];
    kpiSnapshot?: Array<{
        kpiId?: mongoose.Types.ObjectId;
        title?: string;
        description?: string;
        targetValue?: string;
        actualValue?: number | string | null;
        measurementUnit?: string;
        weight?: number;
        type?: string;
        kpa?: string;
        categoryName?: string;
        startDate?: Date;
        endDate?: Date;
    }>;
    kpiSnapshotAt?: Date;
    coreValueRatings?: Array<{
        coreValueId?: mongoose.Types.ObjectId;
        title?: string;
        description?: string;
        weight?: number;
        rating?: number;
    }>;
    coreValueSnapshotAt?: Date;
    reviewerCoreValueRatings?: Array<{
        coreValueId?: mongoose.Types.ObjectId;
        title?: string;
        description?: string;
        weight?: number;
        rating?: number;
    }>;
    reviewerCoreValueSnapshotAt?: Date;
}
export declare const PerformanceReviewSchema: mongoose.Schema<PerformanceReview, mongoose.Model<PerformanceReview, any, any, any, mongoose.Document<unknown, any, PerformanceReview, any, {}> & PerformanceReview & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, PerformanceReview, mongoose.Document<unknown, {}, mongoose.FlatRecord<PerformanceReview>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<PerformanceReview> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
