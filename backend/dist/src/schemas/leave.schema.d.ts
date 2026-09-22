import mongoose, { Document, Types } from 'mongoose';
export type LeaveDocument = Leave & Document;
export declare class Leave {
    leaveType: string;
    userId: Types.ObjectId;
    entity: Types.ObjectId;
    relievingOfficer: Types.ObjectId;
    startDate: string;
    endDate: string;
    resumptionDate?: string;
    startNoticeSentAt?: Date;
    numberOfDays: number;
    reason: string;
    contactDetails: string;
    handoverNoteUrl: string;
    relieverApproval: Types.ObjectId;
    relieverStatus: string;
    hodApproval: Types.ObjectId;
    hodStatus: string;
    hrApproval: Types.ObjectId;
    hrStatus: string;
    relieverComment: string;
    hodComment: string;
    hrComment: string;
    relieverApprovalDate: Date;
    hodApprovalDate: Date;
    hrApprovalDate: Date;
    status: string;
}
export declare const LeaveSchema: mongoose.Schema<Leave, mongoose.Model<Leave, any, any, any, mongoose.Document<unknown, any, Leave, any, {}> & Leave & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Leave, mongoose.Document<unknown, {}, mongoose.FlatRecord<Leave>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<Leave> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
