import { Document, Types } from 'mongoose';
export type ExitRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
export type ExitRequestAction = 'INITIATED' | 'SUBMITTED' | 'RESUBMITTED' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
export declare const EXIT_REQUEST_STATUSES: ExitRequestStatus[];
export declare const NOTICE_PERIODS: readonly ["2 weeks", "4 weeks", "6 weeks", "3 months"];
export type NoticePeriod = (typeof NOTICE_PERIODS)[number];
export type ExitRequestDocument = ExitRequest & Document;
export declare class ExitRequestHistoryEntry {
    action: ExitRequestAction;
    actor?: Types.ObjectId | null;
    actorName?: string;
    comment?: string;
    at: Date;
}
export declare const ExitRequestHistoryEntrySchema: import("mongoose").Schema<ExitRequestHistoryEntry, import("mongoose").Model<ExitRequestHistoryEntry, any, any, any, Document<unknown, any, ExitRequestHistoryEntry, any, {}> & ExitRequestHistoryEntry & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ExitRequestHistoryEntry, Document<unknown, {}, import("mongoose").FlatRecord<ExitRequestHistoryEntry>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ExitRequestHistoryEntry> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare class ExitHandoverAttachment {
    fileName: string;
    storedName: string;
    uploadedBy?: Types.ObjectId | null;
    uploadedAt: Date;
}
export declare const ExitHandoverAttachmentSchema: import("mongoose").Schema<ExitHandoverAttachment, import("mongoose").Model<ExitHandoverAttachment, any, any, any, Document<unknown, any, ExitHandoverAttachment, any, {}> & ExitHandoverAttachment & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ExitHandoverAttachment, Document<unknown, {}, import("mongoose").FlatRecord<ExitHandoverAttachment>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ExitHandoverAttachment> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare class ExitRequest {
    staff: Types.ObjectId;
    staffName?: string;
    staffId?: string;
    entity?: Types.ObjectId | null;
    department?: Types.ObjectId | null;
    branch?: Types.ObjectId | null;
    lineManager?: Types.ObjectId | null;
    proposedExitDate: Date;
    reason?: string;
    noticePeriod?: NoticePeriod | null;
    handoverNote?: string;
    handoverAttachments: ExitHandoverAttachment[];
    status: ExitRequestStatus;
    submittedAt: Date;
    decidedBy?: Types.ObjectId | null;
    decidedByName?: string;
    decidedAt?: Date | null;
    decisionComment?: string;
    approvedExitDate?: Date | null;
    history: ExitRequestHistoryEntry[];
}
export declare const ExitRequestSchema: import("mongoose").Schema<ExitRequest, import("mongoose").Model<ExitRequest, any, any, any, Document<unknown, any, ExitRequest, any, {}> & ExitRequest & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ExitRequest, Document<unknown, {}, import("mongoose").FlatRecord<ExitRequest>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ExitRequest> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
