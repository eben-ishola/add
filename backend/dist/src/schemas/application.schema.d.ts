import { Document, Types } from 'mongoose';
import { Job } from './job.schema';
import { Subsidiary } from './subsidiary.schema';
export type ApplicationDocument = Application & Document;
export declare class Application {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dob: Date;
    experience: number;
    source: string;
    referral?: string;
    currentSalary: number;
    expectedSalary: number;
    job: Types.ObjectId | Job;
    entity: Types.ObjectId | Subsidiary;
    status: string;
    resumeUrl: string;
    coverLetter: string;
    history: {
        status: string;
        previousStatus?: string;
        date: Date;
        note?: string;
        actionBy?: {
            id?: string;
            name?: string;
            email?: string;
        };
    }[];
}
export declare const ApplicationSchema: import("mongoose").Schema<Application, import("mongoose").Model<Application, any, any, any, Document<unknown, any, Application, any, {}> & Application & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Application, Document<unknown, {}, import("mongoose").FlatRecord<Application>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Application> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
