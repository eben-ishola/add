import { Document, Types } from 'mongoose';
export type ExitWorkflowDocument = ExitWorkflowConfig & Document;
export declare const LINE_MANAGER_STAGE_KEY = "LINE_MANAGER";
export declare const CONFIGURABLE_EXIT_STAGES: ({
    readonly key: "CREDIT_RISK";
    readonly label: "Credit risk management";
    readonly unit: "Credit Risk Management";
} | {
    readonly key: "LOAN_MONITORING";
    readonly label: "Loan monitoring";
    readonly unit: "Loan Monitoring";
} | {
    readonly key: "IT";
    readonly label: "Information technology";
    readonly unit: "Information Technology";
} | {
    readonly key: "ADMIN";
    readonly label: "Admin department";
    readonly unit: "Admin";
} | {
    readonly key: "INTERNAL_AUDIT";
    readonly label: "Internal audit";
    readonly unit: "Internal Audit";
} | {
    readonly key: "HR";
    readonly label: "Human resources";
    readonly unit: "HR Department";
})[];
export declare const EXIT_STAGE_KEYS: ("CREDIT_RISK" | "LOAN_MONITORING" | "IT" | "ADMIN" | "INTERNAL_AUDIT" | "HR")[];
export declare class ExitWorkflowStage {
    key: string;
    label: string;
    unit: string;
    order: number;
    userIds: Types.ObjectId[];
    departmentIds: Types.ObjectId[];
}
export declare const ExitWorkflowStageSchema: import("mongoose").Schema<ExitWorkflowStage, import("mongoose").Model<ExitWorkflowStage, any, any, any, Document<unknown, any, ExitWorkflowStage, any, {}> & ExitWorkflowStage & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ExitWorkflowStage, Document<unknown, {}, import("mongoose").FlatRecord<ExitWorkflowStage>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ExitWorkflowStage> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare class ExitWorkflowConfig {
    entity: Types.ObjectId;
    stages: ExitWorkflowStage[];
    hrIds: Types.ObjectId[];
    updatedBy?: Types.ObjectId | null;
}
export declare const ExitWorkflowConfigSchema: import("mongoose").Schema<ExitWorkflowConfig, import("mongoose").Model<ExitWorkflowConfig, any, any, any, Document<unknown, any, ExitWorkflowConfig, any, {}> & ExitWorkflowConfig & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ExitWorkflowConfig, Document<unknown, {}, import("mongoose").FlatRecord<ExitWorkflowConfig>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ExitWorkflowConfig> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
