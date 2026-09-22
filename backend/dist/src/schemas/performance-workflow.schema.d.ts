import mongoose, { Document } from 'mongoose';
export declare class PerformanceWorkflowConfig extends Document {
    entity: mongoose.Schema.Types.ObjectId;
    enabled: boolean;
    autoIncludeManager: boolean;
    initiatorIds: string[];
    reviewerIds: string[];
    approverIds: string[];
    hrReviewerIds: string[];
    finalApproverIds: string[];
    employeeScoreWeight: number;
    reviewerScoreWeight: number;
}
export declare const PerformanceWorkflowConfigSchema: mongoose.Schema<PerformanceWorkflowConfig, mongoose.Model<PerformanceWorkflowConfig, any, any, any, mongoose.Document<unknown, any, PerformanceWorkflowConfig, any, {}> & PerformanceWorkflowConfig & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, PerformanceWorkflowConfig, mongoose.Document<unknown, {}, mongoose.FlatRecord<PerformanceWorkflowConfig>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<PerformanceWorkflowConfig> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
