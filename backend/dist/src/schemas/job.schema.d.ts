import mongoose, { Document } from 'mongoose';
export type JobDocument = Job & Document;
export declare class Job {
    title: string;
    description: string;
    summary: string;
    location: string;
    type: string;
    department: string;
    entity: mongoose.Types.ObjectId;
    requirement: string[];
    status: string;
    category: string;
    deadline: Date;
}
export declare const JobSchema: mongoose.Schema<Job, mongoose.Model<Job, any, any, any, mongoose.Document<unknown, any, Job, any, {}> & Job & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Job, mongoose.Document<unknown, {}, mongoose.FlatRecord<Job>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<Job> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
