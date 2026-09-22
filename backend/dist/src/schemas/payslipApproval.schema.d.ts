import { Document } from 'mongoose';
export type PayslipApprovalStatus = 'PENDING_REVIEW' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
export declare class PayslipApproval extends Document {
    staffId: string;
    staffObjectId?: string;
    employeeId?: string;
    staffName?: string;
    entity: string;
    periodKey: string;
    period?: string;
    periodDate?: Date;
    status: PayslipApprovalStatus;
    reviewerIds?: string[];
    approverIds?: string[];
    requestedBy?: string;
    requestedByName?: string;
    reviewerApprovedBy?: string;
    reviewerApprovedAt?: Date;
    approverApprovedBy?: string;
    approverApprovedAt?: Date;
    rejectionReason?: string;
    currentStage?: 'REVIEWER' | 'APPROVER' | 'APPROVED' | 'REJECTED';
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const PayslipApprovalSchema: import("mongoose").Schema<PayslipApproval, import("mongoose").Model<PayslipApproval, any, any, any, Document<unknown, any, PayslipApproval, any, {}> & PayslipApproval & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PayslipApproval, Document<unknown, {}, import("mongoose").FlatRecord<PayslipApproval>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PayslipApproval> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
