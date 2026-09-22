import mongoose, { Document } from 'mongoose';
export type ProcurementWorkflowDocument = ProcurementWorkflowConfig & Document;
export declare class ProcurementWorkflowConfig {
    entity: mongoose.Types.ObjectId;
    reviewerIds: mongoose.Types.ObjectId[];
    reviewerDepartments: mongoose.Types.ObjectId[];
    approverPoolIds: mongoose.Types.ObjectId[];
    approverDepartments: mongoose.Types.ObjectId[];
    postingIds: mongoose.Types.ObjectId[];
    postingDepartments: mongoose.Types.ObjectId[];
    disbursementIds: mongoose.Types.ObjectId[];
    disbursementDepartments: mongoose.Types.ObjectId[];
    auditViewerIds: mongoose.Types.ObjectId[];
    receiptGraceDays: number;
    updatedBy?: string | null;
}
export declare const ProcurementWorkflowConfigSchema: mongoose.Schema<ProcurementWorkflowConfig, mongoose.Model<ProcurementWorkflowConfig, any, any, any, mongoose.Document<unknown, any, ProcurementWorkflowConfig, any, {}> & ProcurementWorkflowConfig & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, ProcurementWorkflowConfig, mongoose.Document<unknown, {}, mongoose.FlatRecord<ProcurementWorkflowConfig>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<ProcurementWorkflowConfig> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
