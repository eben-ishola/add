export declare class ProcurementItemDto {
    description: string;
    quantity?: number;
    unitPrice?: number;
}
export declare class ProcurementItemPriceDto {
    description?: string;
    quantity?: number;
    unitPrice?: number;
}
export declare class CreateRequisitionDto {
    title: string;
    entity: string;
    branch?: string;
    department?: string;
    resolvingDepartment?: string;
    justification?: string;
    assignee?: string;
    currency?: string;
    items?: ProcurementItemDto[];
    payeeName?: string;
}
export declare class TriageRequisitionDto {
    assignedApprover: string;
    recommendedAmount?: number;
    vatRate?: number;
    withholdingRate?: number;
    expenseCategory?: string;
    items?: ProcurementItemPriceDto[];
    payeeName?: string;
    payeeBank?: string;
    payeeAccount?: string;
    paymentType?: string;
    narration?: string;
    comment?: string;
}
export declare class ProcurementCommentDto {
    comment?: string;
}
export declare class ProcurementRejectDto {
    reason: string;
}
export declare class ProcurementGlEntryDto {
    businessUnit: string;
    glName: string;
    glNumber: string;
    glType?: string;
    subAccount?: string;
    narration: string;
    amount: number;
}
export declare class PostGlDto {
    entries: ProcurementGlEntryDto[];
    comment: string;
}
export declare class DisburseDto {
    comment?: string;
    receiptGraceDays?: number;
}
export declare class SaveProcurementWorkflowDto {
    entity: string;
    reviewerIds?: string[];
    reviewerDepartments?: string[];
    approverPoolIds?: string[];
    approverDepartments?: string[];
    postingIds?: string[];
    postingDepartments?: string[];
    disbursementIds?: string[];
    disbursementDepartments?: string[];
    auditViewerIds?: string[];
    receiptGraceDays?: number;
}
