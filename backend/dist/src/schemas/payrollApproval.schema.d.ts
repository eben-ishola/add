import { Document, Types } from 'mongoose';
export type PayrollApprovalStatus = 'PENDING_REVIEW' | 'PENDING_APPROVAL' | 'PENDING_POSTING' | 'APPROVED' | 'REJECTED';
export declare class PayrollApproval extends Document {
    batchId: string;
    entity: string;
    workflowType?: string;
    status: PayrollApprovalStatus;
    data: Record<string, any>[];
    types: string[];
    requestedBy?: string;
    requestedByName?: string;
    initiatorId?: string;
    initiatorName?: string;
    initiatorComment?: string;
    reviewerIds?: string[];
    auditViewerIds?: string[];
    approverIds?: string[];
    postingIds?: string[];
    reviewerApprovedBy?: Types.ObjectId | string;
    reviewerApprovedByName?: string;
    reviewerApprovedAt?: Date;
    reviewerComment?: string;
    approverApprovedBy?: Types.ObjectId | string;
    approverApprovedByName?: string;
    approverApprovedAt?: Date;
    postingApprovedBy?: Types.ObjectId | string;
    postingApprovedByName?: string;
    postingApprovedAt?: Date;
    processedAt?: Date;
    rejectionReason?: string;
    financeComment?: string;
    financeCommentBy?: Types.ObjectId | string;
    financeCommentByName?: string;
    financeCommentAt?: Date;
    currentStage?: 'REVIEWER' | 'APPROVER' | 'POSTING' | 'POSTED';
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const PayrollApprovalSchema: import("mongoose").Schema<PayrollApproval, import("mongoose").Model<PayrollApproval, any, any, any, Document<unknown, any, PayrollApproval, any, {}> & PayrollApproval & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PayrollApproval, Document<unknown, {}, import("mongoose").FlatRecord<PayrollApproval>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PayrollApproval> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
