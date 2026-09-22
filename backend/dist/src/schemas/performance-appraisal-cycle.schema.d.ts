import mongoose, { Document } from 'mongoose';
export type PerformanceAppraisalCycleDocument = PerformanceAppraisalCycle & Document;
export declare class PerformanceAppraisalCycle {
    entity: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    year: string;
    startDate: Date;
    endDate: Date;
    reviewStartDate?: Date;
    reviewEndDate?: Date;
    status: string;
    types: string[];
    scoreType?: string;
    scoreTypeLabel?: string;
    ratingTagsEnabled?: boolean;
    arcEnabled?: boolean;
    ratingTags?: Array<Record<string, any>>;
    formSnapshot?: Record<string, any>;
    createdBy?: mongoose.Types.ObjectId;
}
export declare const PerformanceAppraisalCycleSchema: mongoose.Schema<PerformanceAppraisalCycle, mongoose.Model<PerformanceAppraisalCycle, any, any, any, mongoose.Document<unknown, any, PerformanceAppraisalCycle, any, {}> & PerformanceAppraisalCycle & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, PerformanceAppraisalCycle, mongoose.Document<unknown, {}, mongoose.FlatRecord<PerformanceAppraisalCycle>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<PerformanceAppraisalCycle> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
