import mongoose, { Document, Types } from 'mongoose';
export type LeaveMappingDocument = LeaveMapping & Document;
export declare class LeaveMapping {
    leaveDays: string;
    leaveType: string;
    levelCategory: mongoose.Types.ObjectId;
}
export declare const LeaveMappingSchema: mongoose.Schema<LeaveMapping, mongoose.Model<LeaveMapping, any, any, any, mongoose.Document<unknown, any, LeaveMapping, any, {}> & LeaveMapping & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, LeaveMapping, mongoose.Document<unknown, {}, mongoose.FlatRecord<LeaveMapping>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<LeaveMapping> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
