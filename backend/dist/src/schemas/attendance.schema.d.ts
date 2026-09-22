import { Document } from 'mongoose';
export type AttendanceDocument = Attendance & Document;
export declare class Attendance {
    employeeId: string;
    employeeName: string;
    entity?: string;
    entityId?: string;
    clockIn: Date;
    clockOut: Date;
    totalHours: string;
    status: string;
    workMode: string;
    ip: string;
    city: string;
    country: string;
    isp: string;
    clockInPhotoUrl?: string;
    clockOutPhotoUrl?: string;
    note?: string;
    date: Date;
    latePolicyStep?: number;
    latePolicyAction?: string;
    latePolicyMailSent?: boolean;
    latePolicyMailRecipients?: string[];
    latePolicyMailSentAt?: Date;
    latePolicyProcessedAt?: Date;
}
export declare const AttendanceSchema: import("mongoose").Schema<Attendance, import("mongoose").Model<Attendance, any, any, any, Document<unknown, any, Attendance, any, {}> & Attendance & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Attendance, Document<unknown, {}, import("mongoose").FlatRecord<Attendance>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Attendance> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
