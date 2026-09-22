import mongoose, { Document } from 'mongoose';
export type PerformanceKpiDocument = PerformanceKpi & Document;
export declare class PerformanceKpi {
    employeeId?: string;
    employeeName?: string;
    roleId?: string;
    roleName?: string;
    levelId?: string;
    levelName?: string;
    departmentId?: string;
    departmentName?: string;
    businessUnitId?: string;
    businessUnitName?: string;
    branchId?: string;
    branchName?: string;
    entity?: string;
    appraisalCycleId?: mongoose.Types.ObjectId;
    appraisalCycleName?: string;
    title: string;
    description: string;
    type: string;
    kpa?: string;
    targetValue: string;
    measurementUnit: string;
    category?: mongoose.Types.ObjectId;
    categoryName?: string;
    startDate?: Date;
    endDate?: Date;
    weight?: number;
    evaluationFrequency?: string;
    collectionSource?: string;
    externalKey?: string;
    scoringMethod?: string;
    scoreDirection?: string;
    hasConditions?: boolean;
    customFields: Array<{
        name: string;
        type: string;
        required: boolean;
    }>;
    conditions: Array<{
        field: string;
        operator: string;
        value: string;
        outcome: string;
    }>;
    scoredBy?: string;
    actualValue?: number | string;
    isActualValueLocked?: boolean;
    lockedBy?: string;
    lockedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const PerformanceKpiSchema: mongoose.Schema<PerformanceKpi, mongoose.Model<PerformanceKpi, any, any, any, mongoose.Document<unknown, any, PerformanceKpi, any, {}> & PerformanceKpi & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, PerformanceKpi, mongoose.Document<unknown, {}, mongoose.FlatRecord<PerformanceKpi>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<PerformanceKpi> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
