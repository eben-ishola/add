import mongoose, { Document } from 'mongoose';
export type CompensationOthersDocument = CompensationOthers & Document;
export declare class CompensationOthersEntry {
    userId: mongoose.Types.ObjectId;
    staffId?: string;
    atlasAccount?: string;
    payoutAccount?: string;
    payoutAccountType?: string;
    amount: number;
    baseAmount?: number;
    days?: number;
    branch?: mongoose.Types.ObjectId;
    branchName?: string;
    branchGL?: string;
}
export declare const CompensationOthersEntrySchema: mongoose.Schema<CompensationOthersEntry, mongoose.Model<CompensationOthersEntry, any, any, any, mongoose.Document<unknown, any, CompensationOthersEntry, any, {}> & CompensationOthersEntry & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, CompensationOthersEntry, mongoose.Document<unknown, {}, mongoose.FlatRecord<CompensationOthersEntry>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<CompensationOthersEntry> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export declare class CompensationOthersWorkflow {
    reviewerId: mongoose.Types.ObjectId;
    approverId: mongoose.Types.ObjectId;
    posterId: mongoose.Types.ObjectId;
    reviewerStatus: string;
    approverStatus: string;
    posterStatus: string;
}
export declare const CompensationOthersWorkflowSchema: mongoose.Schema<CompensationOthersWorkflow, mongoose.Model<CompensationOthersWorkflow, any, any, any, mongoose.Document<unknown, any, CompensationOthersWorkflow, any, {}> & CompensationOthersWorkflow & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, CompensationOthersWorkflow, mongoose.Document<unknown, {}, mongoose.FlatRecord<CompensationOthersWorkflow>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<CompensationOthersWorkflow> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export declare class CompensationOthers {
    entity: mongoose.Types.ObjectId;
    title: string;
    glCode: string;
    month: string;
    totalAmount: number;
    entries: CompensationOthersEntry[];
    workflow: CompensationOthersWorkflow;
    status: string;
    createdBy?: mongoose.Types.ObjectId;
    financeComment?: string;
    financeCommentBy?: mongoose.Types.ObjectId;
    financeCommentByName?: string;
    financeCommentAt?: Date;
}
export declare const CompensationOthersSchema: mongoose.Schema<CompensationOthers, mongoose.Model<CompensationOthers, any, any, any, mongoose.Document<unknown, any, CompensationOthers, any, {}> & CompensationOthers & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, CompensationOthers, mongoose.Document<unknown, {}, mongoose.FlatRecord<CompensationOthers>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<CompensationOthers> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
