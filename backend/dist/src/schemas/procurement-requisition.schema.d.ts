import mongoose, { Document } from 'mongoose';
export type ProcurementStatus = 'PENDING_REVIEW' | 'PENDING_APPROVAL' | 'PENDING_POSTING' | 'PENDING_DISBURSEMENT' | 'COMPLETED' | 'REJECTED';
export declare const PROCUREMENT_STATUSES: ProcurementStatus[];
export type ProcurementStage = 'REVIEWER' | 'APPROVER' | 'POSTING' | 'DISBURSEMENT' | 'DONE';
export declare const PROCUREMENT_STAGES: ProcurementStage[];
export type ProcurementAction = 'RAISED' | 'TRIAGED' | 'APPROVED' | 'REJECTED' | 'CLARIFICATION_REQUESTED' | 'RESUBMITTED' | 'GL_POSTED' | 'DISBURSED' | 'FINANCE_COMMENT';
export declare class ProcurementItem {
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}
export declare const ProcurementItemSchema: mongoose.Schema<ProcurementItem, mongoose.Model<ProcurementItem, any, any, any, mongoose.Document<unknown, any, ProcurementItem, any, {}> & ProcurementItem & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, ProcurementItem, mongoose.Document<unknown, {}, mongoose.FlatRecord<ProcurementItem>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<ProcurementItem> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export declare class ProcurementGlEntry {
    businessUnit?: string;
    glName?: string;
    glNumber?: string;
    glType?: string;
    subAccount?: string;
    narration?: string;
    amount: number;
}
export declare const ProcurementGlEntrySchema: mongoose.Schema<ProcurementGlEntry, mongoose.Model<ProcurementGlEntry, any, any, any, mongoose.Document<unknown, any, ProcurementGlEntry, any, {}> & ProcurementGlEntry & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, ProcurementGlEntry, mongoose.Document<unknown, {}, mongoose.FlatRecord<ProcurementGlEntry>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<ProcurementGlEntry> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export declare class ProcurementHistoryEntry {
    stage: ProcurementStage;
    action: ProcurementAction;
    actor?: mongoose.Types.ObjectId;
    actorName?: string;
    comment?: string;
    at: Date;
}
export declare const ProcurementHistoryEntrySchema: mongoose.Schema<ProcurementHistoryEntry, mongoose.Model<ProcurementHistoryEntry, any, any, any, mongoose.Document<unknown, any, ProcurementHistoryEntry, any, {}> & ProcurementHistoryEntry & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, ProcurementHistoryEntry, mongoose.Document<unknown, {}, mongoose.FlatRecord<ProcurementHistoryEntry>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<ProcurementHistoryEntry> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export declare class ProcurementAttachment {
    fileName: string;
    storedName: string;
    kind: 'QUOTE' | 'INVOICE' | 'RECEIPT' | 'OTHER';
    size: number;
    uploadedBy?: mongoose.Types.ObjectId;
    uploadedAt: Date;
}
export declare const ProcurementAttachmentSchema: mongoose.Schema<ProcurementAttachment, mongoose.Model<ProcurementAttachment, any, any, any, mongoose.Document<unknown, any, ProcurementAttachment, any, {}> & ProcurementAttachment & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, ProcurementAttachment, mongoose.Document<unknown, {}, mongoose.FlatRecord<ProcurementAttachment>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<ProcurementAttachment> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export declare class ProcurementRequisition extends Document {
    reference?: string;
    entity: mongoose.Types.ObjectId;
    branch?: mongoose.Types.ObjectId;
    department?: mongoose.Types.ObjectId;
    resolvingDepartment?: mongoose.Types.ObjectId;
    requestedBy: mongoose.Types.ObjectId;
    requestedByName?: string;
    title: string;
    justification?: string;
    assignee?: string;
    items: ProcurementItem[];
    currency: string;
    estimatedAmount: number;
    recommendedAmount: number;
    vatRate: number;
    vatAmount: number;
    withholdingRate: number;
    withholdingAmount: number;
    totalAmount: number;
    netPayable: number;
    payeeName?: string;
    payeeBank?: string;
    payeeAccount?: string;
    paymentType?: string;
    narration?: string;
    expenseCategory?: mongoose.Types.ObjectId;
    budget?: mongoose.Types.ObjectId;
    committedAmount: number;
    budgetAvailableAtApproval: number;
    budgetOverrun: number;
    budgetRef?: Record<string, any>;
    status: ProcurementStatus;
    currentStage: ProcurementStage;
    assignedApprover?: mongoose.Types.ObjectId;
    assignedApproverName?: string;
    history: ProcurementHistoryEntry[];
    rejectionReason?: string;
    financeComment?: string;
    financeCommentBy?: mongoose.Types.ObjectId;
    financeCommentByName?: string;
    financeCommentAt?: Date;
    glEntries: ProcurementGlEntry[];
    disbursedAt?: Date;
    disbursedBy?: mongoose.Types.ObjectId;
    receiptDueAt?: Date;
    attachments: ProcurementAttachment[];
}
export declare const ProcurementRequisitionSchema: mongoose.Schema<ProcurementRequisition, mongoose.Model<ProcurementRequisition, any, any, any, mongoose.Document<unknown, any, ProcurementRequisition, any, {}> & ProcurementRequisition & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, ProcurementRequisition, mongoose.Document<unknown, {}, mongoose.FlatRecord<ProcurementRequisition>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<ProcurementRequisition> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
