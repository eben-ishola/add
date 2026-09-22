import mongoose, { Document } from 'mongoose';
export declare class TransportWorkflowConfig extends Document {
    entity: mongoose.Schema.Types.ObjectId;
    initiatorIds: string[];
    reviewerIds: string[];
    auditViewerIds: string[];
    approverIds: string[];
    postingIds: string[];
    financeIds: string[];
    transportGl: string;
    companyGL: string;
}
export declare const TransportWorkflowConfigSchema: mongoose.Schema<TransportWorkflowConfig, mongoose.Model<TransportWorkflowConfig, any, any, any, mongoose.Document<unknown, any, TransportWorkflowConfig, any, {}> & TransportWorkflowConfig & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, TransportWorkflowConfig, mongoose.Document<unknown, {}, mongoose.FlatRecord<TransportWorkflowConfig>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<TransportWorkflowConfig> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export type TransportWorkflowConfigDocument = TransportWorkflowConfig & Document;
