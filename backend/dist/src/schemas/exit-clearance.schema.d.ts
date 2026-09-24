import { Document, Types } from 'mongoose';
export type ExitClearanceStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ClearanceItemStatus = 'PENDING' | 'COMPLETED' | 'RETURNED' | 'NOT_APPLICABLE';
export type ClearanceSectionStatus = 'PENDING' | 'COMPLETED' | 'NOT_APPLICABLE';
export declare const CLEARANCE_ITEM_STATUSES: ClearanceItemStatus[];
export declare const CLEARANCE_SECTION_STATUSES: ClearanceSectionStatus[];
export declare const CLEARANCE_ITEMS: readonly [{
    readonly key: "HANDOVER_NOTE";
    readonly label: "Hand over note";
    readonly unit: "Line Manager";
}, {
    readonly key: "LAPTOP";
    readonly label: "Tab / laptop / charger";
    readonly unit: "Admin";
}, {
    readonly key: "HEADSET";
    readonly label: "Head set and charger";
    readonly unit: "Admin";
}, {
    readonly key: "CUG_PHONE";
    readonly label: "CUG phone";
    readonly unit: "Admin";
}, {
    readonly key: "STAFF_ID";
    readonly label: "Staff ID card";
    readonly unit: "HR Department";
}];
export declare const CLEARANCE_SECTIONS: readonly [{
    readonly key: "LINE_MANAGER";
    readonly label: "Line manager";
    readonly unit: "Line Manager";
}, {
    readonly key: "CREDIT_RISK";
    readonly label: "Credit risk management";
    readonly unit: "Credit Risk Management";
}, {
    readonly key: "LOAN_MONITORING";
    readonly label: "Loan monitoring";
    readonly unit: "Loan Monitoring";
}, {
    readonly key: "IT";
    readonly label: "Information technology";
    readonly unit: "Information Technology";
}, {
    readonly key: "ADMIN";
    readonly label: "Admin department";
    readonly unit: "Admin";
}, {
    readonly key: "INTERNAL_AUDIT";
    readonly label: "Internal audit";
    readonly unit: "Internal Audit";
}, {
    readonly key: "HR";
    readonly label: "Human resources";
    readonly unit: "HR Department";
}];
export declare const MARKET_FACING_DEPARTMENTS: string[];
export declare const isMarketFacingDepartment: (name?: string | null) => boolean;
export type ClearanceItemKey = (typeof CLEARANCE_ITEMS)[number]['key'];
export type ClearanceSectionKey = (typeof CLEARANCE_SECTIONS)[number]['key'];
export type ExitClearanceDocument = ExitClearance & Document;
export declare class ClearanceItem {
    key: string;
    label: string;
    unit: string;
    status: ClearanceItemStatus;
    confirmedBy?: Types.ObjectId | null;
    confirmedByName?: string;
    confirmedAt?: Date | null;
    comment?: string;
}
export declare const ClearanceItemSchema: import("mongoose").Schema<ClearanceItem, import("mongoose").Model<ClearanceItem, any, any, any, Document<unknown, any, ClearanceItem, any, {}> & ClearanceItem & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ClearanceItem, Document<unknown, {}, import("mongoose").FlatRecord<ClearanceItem>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ClearanceItem> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare class ClearanceSection {
    key: string;
    label: string;
    unit: string;
    status: ClearanceSectionStatus;
    data: Record<string, any>;
    comment?: string;
    completedBy?: Types.ObjectId | null;
    completedByName?: string;
    completedAt?: Date | null;
}
export declare const ClearanceSectionSchema: import("mongoose").Schema<ClearanceSection, import("mongoose").Model<ClearanceSection, any, any, any, Document<unknown, any, ClearanceSection, any, {}> & ClearanceSection & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ClearanceSection, Document<unknown, {}, import("mongoose").FlatRecord<ClearanceSection>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ClearanceSection> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare class ExitClearance {
    exitRequest: Types.ObjectId;
    staff: Types.ObjectId;
    staffName?: string;
    staffId?: string;
    designation?: string;
    entity?: Types.ObjectId | null;
    department?: Types.ObjectId | null;
    branch?: Types.ObjectId | null;
    lineManager?: Types.ObjectId | null;
    exitDate: Date;
    marketFacing: boolean;
    items: ClearanceItem[];
    sections: ClearanceSection[];
    status: ExitClearanceStatus;
    completedAt?: Date | null;
    completedBy?: Types.ObjectId | null;
}
export declare const ExitClearanceSchema: import("mongoose").Schema<ExitClearance, import("mongoose").Model<ExitClearance, any, any, any, Document<unknown, any, ExitClearance, any, {}> & ExitClearance & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ExitClearance, Document<unknown, {}, import("mongoose").FlatRecord<ExitClearance>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ExitClearance> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
