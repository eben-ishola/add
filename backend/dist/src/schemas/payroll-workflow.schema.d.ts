import mongoose, { Document } from 'mongoose';
export declare class PayrollWorkflowConfig extends Document {
    entity: mongoose.Schema.Types.ObjectId;
    initiatorIds: string[];
    reviewerIds: string[];
    auditViewerIds: string[];
    approverIds: string[];
    postingIds: string[];
    financeIds: string[];
    exitAccountNumber?: string;
    exitAccountName?: string;
}
export declare const PayrollWorkflowConfigSchema: mongoose.Schema<PayrollWorkflowConfig, mongoose.Model<PayrollWorkflowConfig, any, any, any, mongoose.Document<unknown, any, PayrollWorkflowConfig, any, {}> & PayrollWorkflowConfig & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, PayrollWorkflowConfig, mongoose.Document<unknown, {}, mongoose.FlatRecord<PayrollWorkflowConfig>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<PayrollWorkflowConfig> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
