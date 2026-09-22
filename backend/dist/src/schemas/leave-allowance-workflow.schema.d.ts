import mongoose, { Document } from 'mongoose';
export declare class LeaveAllowanceWorkflowConfig extends Document {
    entity: mongoose.Schema.Types.ObjectId;
    initiatorIds: string[];
    reviewerIds: string[];
    auditViewerIds: string[];
    approverIds: string[];
    postingIds: string[];
    financeIds: string[];
    companyGL: string;
}
export declare const LeaveAllowanceWorkflowConfigSchema: mongoose.Schema<LeaveAllowanceWorkflowConfig, mongoose.Model<LeaveAllowanceWorkflowConfig, any, any, any, mongoose.Document<unknown, any, LeaveAllowanceWorkflowConfig, any, {}> & LeaveAllowanceWorkflowConfig & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, LeaveAllowanceWorkflowConfig, mongoose.Document<unknown, {}, mongoose.FlatRecord<LeaveAllowanceWorkflowConfig>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<LeaveAllowanceWorkflowConfig> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
