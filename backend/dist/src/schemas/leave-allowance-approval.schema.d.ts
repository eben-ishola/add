import { Document, Types } from 'mongoose';
export type LeaveAllowanceApprovalStatus = 'PENDING_REVIEW' | 'PENDING_APPROVAL' | 'PENDING_POSTING' | 'APPROVED' | 'REJECTED';
export declare class LeaveAllowanceApproval extends Document {
    payrollApprovalId: string;
    batchId: string;
    entity: string;
    status: LeaveAllowanceApprovalStatus;
    data: Record<string, any>[];
    types: string[];
    year?: number;
    month?: number;
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
export declare const LeaveAllowanceApprovalSchema: import("mongoose").Schema<LeaveAllowanceApproval, import("mongoose").Model<LeaveAllowanceApproval, any, any, any, Document<unknown, any, LeaveAllowanceApproval, any, {}> & LeaveAllowanceApproval & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LeaveAllowanceApproval, Document<unknown, {}, import("mongoose").FlatRecord<LeaveAllowanceApproval>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<LeaveAllowanceApproval> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
