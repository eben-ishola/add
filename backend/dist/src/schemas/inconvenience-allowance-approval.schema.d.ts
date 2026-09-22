import mongoose, { Document } from 'mongoose';
export type InconvenienceAllowanceApprovalStatus = 'PENDING_REVIEW' | 'PENDING_APPROVAL' | 'PENDING_POSTING' | 'APPROVED' | 'REJECTED';
export declare class InconvenienceAllowanceApproval extends Document {
    entity: mongoose.Types.ObjectId;
    department?: mongoose.Types.ObjectId;
    year: number;
    month: number;
    weekOfMonth: number;
    frequency: 'monthly';
    status: InconvenienceAllowanceApprovalStatus;
    currentStage: 'REVIEWER' | 'APPROVER' | 'POSTING' | 'POSTED';
    data: Record<string, any>[];
    requestedBy?: string;
    requestedByName?: string;
    initiatorComment?: string;
    reviewerIds?: string[];
    auditViewerIds?: string[];
    approverIds?: string[];
    postingIds?: string[];
    reviewerApprovedAt?: Date;
    reviewerApprovedBy?: mongoose.Types.ObjectId;
    reviewerApprovedByName?: string;
    approverApprovedAt?: Date;
    approverApprovedBy?: mongoose.Types.ObjectId;
    approverApprovedByName?: string;
    postingApprovedBy?: mongoose.Types.ObjectId;
    postingApprovedByName?: string;
    postingApprovedAt?: Date;
    rejectionReason?: string;
    financeComment?: string;
    financeCommentBy?: mongoose.Types.ObjectId;
    financeCommentByName?: string;
    financeCommentAt?: Date;
}
export declare const InconvenienceAllowanceApprovalSchema: mongoose.Schema<InconvenienceAllowanceApproval, mongoose.Model<InconvenienceAllowanceApproval, any, any, any, mongoose.Document<unknown, any, InconvenienceAllowanceApproval, any, {}> & InconvenienceAllowanceApproval & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, InconvenienceAllowanceApproval, mongoose.Document<unknown, {}, mongoose.FlatRecord<InconvenienceAllowanceApproval>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<InconvenienceAllowanceApproval> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
