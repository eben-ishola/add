import mongoose, { Document } from 'mongoose';
export type CompensationConfigDocument = CompensationConfig & Document;
export declare const COMPENSATION_VALUE_TYPES: readonly ["global", "others"];
export type CompensationValueType = (typeof COMPENSATION_VALUE_TYPES)[number];
export declare const COMPENSATION_PAY_TYPES: readonly ["reimbursable", "individual_performance", "bank_performance", "salary", "percentage"];
export type CompensationPayType = (typeof COMPENSATION_PAY_TYPES)[number];
export declare const COMPENSATION_PERCENT_BASES: readonly ["basic", "transport", "housing", "combination", "gross", "net"];
export type CompensationPercentBase = (typeof COMPENSATION_PERCENT_BASES)[number];
export declare const COMPENSATION_COMBINATION_COMPONENTS: readonly ["basic", "transport", "housing"];
export declare class CompensationConfig extends Document {
    entity: mongoose.Schema.Types.ObjectId;
    title: string;
    glCode?: string;
    valueType: CompensationValueType;
    globalAmount?: number;
    payType?: CompensationPayType | null;
    percent?: number;
    percentBase?: CompensationPercentBase | null;
    combinationComponents?: string[];
    reviewerIds: string[];
    approverIds: string[];
    auditViewerIds: string[];
    postingIds: string[];
    financeIds: string[];
    active?: boolean;
    createdBy?: mongoose.Types.ObjectId;
}
export declare const CompensationConfigSchema: mongoose.Schema<CompensationConfig, mongoose.Model<CompensationConfig, any, any, any, mongoose.Document<unknown, any, CompensationConfig, any, {}> & CompensationConfig & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, CompensationConfig, mongoose.Document<unknown, {}, mongoose.FlatRecord<CompensationConfig>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<CompensationConfig> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
