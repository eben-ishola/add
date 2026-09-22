import mongoose, { Document } from 'mongoose';
export type TransportAllowanceApprovalStatus = 'PENDING_REVIEW' | 'PENDING_APPROVAL' | 'PENDING_POSTING' | 'APPROVED' | 'REJECTED';
export declare class TransportAllowanceApproval extends Document {
    entity: mongoose.Types.ObjectId;
    department?: mongoose.Types.ObjectId;
    year: number;
    month: number;
    weekOfMonth: number;
    frequency: 'weekly' | 'monthly';
    status: TransportAllowanceApprovalStatus;
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
export declare const TransportAllowanceApprovalSchema: mongoose.Schema<TransportAllowanceApproval, mongoose.Model<TransportAllowanceApproval, any, any, any, mongoose.Document<unknown, any, TransportAllowanceApproval, any, {}> & TransportAllowanceApproval & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, TransportAllowanceApproval, mongoose.Document<unknown, {}, mongoose.FlatRecord<TransportAllowanceApproval>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<TransportAllowanceApproval> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
