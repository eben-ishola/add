import mongoose, { Document } from 'mongoose';
export declare class InconvenienceWorkflowConfig extends Document {
    entity: mongoose.Schema.Types.ObjectId;
    initiatorIds: string[];
    reviewerIds: string[];
    auditViewerIds: string[];
    approverIds: string[];
    postingIds: string[];
    financeIds: string[];
    inconvenienceGl: string;
    companyGL: string;
}
export declare const InconvenienceWorkflowConfigSchema: mongoose.Schema<InconvenienceWorkflowConfig, mongoose.Model<InconvenienceWorkflowConfig, any, any, any, mongoose.Document<unknown, any, InconvenienceWorkflowConfig, any, {}> & InconvenienceWorkflowConfig & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, InconvenienceWorkflowConfig, mongoose.Document<unknown, {}, mongoose.FlatRecord<InconvenienceWorkflowConfig>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<InconvenienceWorkflowConfig> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export type InconvenienceWorkflowConfigDocument = InconvenienceWorkflowConfig & Document;
