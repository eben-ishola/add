import mongoose, { Document } from 'mongoose';
export type PerformanceKpiResultDocument = PerformanceKpiResult & Document;
export declare class PerformanceKpiResult {
    kpiId: mongoose.Types.ObjectId;
    period: string;
    scopeKey: string;
    scopeType?: string;
    scopeId?: string;
    scopeName?: string;
    employeeId?: string;
    employeeName?: string;
    entity?: string;
    source?: string;
    status?: string;
    achievement?: number;
    score?: number;
    submittedBy?: string;
    submittedAt?: Date;
    reviewedBy?: string;
    reviewerName?: string;
    reviewedAt?: Date;
    actualValue?: number | string;
    employeeActualValue?: number | string;
    reviewerActualValue?: number | string;
    isActualValueLocked?: boolean;
    lockedBy?: string;
    lockedAt?: Date;
}
export declare const PerformanceKpiResultSchema: mongoose.Schema<PerformanceKpiResult, mongoose.Model<PerformanceKpiResult, any, any, any, mongoose.Document<unknown, any, PerformanceKpiResult, any, {}> & PerformanceKpiResult & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, PerformanceKpiResult, mongoose.Document<unknown, {}, mongoose.FlatRecord<PerformanceKpiResult>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<PerformanceKpiResult> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
