import { Document } from 'mongoose';
export type LeavePolicyDocument = LeavePolicy & Document;
export declare class LeavePolicy {
    noticePeriodDays: number;
    requireHandoverNote: boolean;
    noticeExemptTypes: string[];
    fixedAllocations: Record<string, number>;
    companyGL: string;
    leaveGL: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const LeavePolicySchema: import("mongoose").Schema<LeavePolicy, import("mongoose").Model<LeavePolicy, any, any, any, Document<unknown, any, LeavePolicy, any, {}> & LeavePolicy & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LeavePolicy, Document<unknown, {}, import("mongoose").FlatRecord<LeavePolicy>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<LeavePolicy> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
