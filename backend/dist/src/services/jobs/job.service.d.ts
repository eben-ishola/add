import mongoose, { Model } from 'mongoose';
import { JobDocument, Job } from 'src/schemas/job.schema';
import { Application, ApplicationDocument } from 'src/schemas/application.schema';
import { MailService } from 'src/services/comms/mail.service';
export declare class JobService {
    private jobModel;
    private applicationModel;
    private readonly notificationService;
    constructor(jobModel: Model<JobDocument>, applicationModel: Model<ApplicationDocument>, notificationService: MailService);
    private buildActionBy;
    createJob(data: Partial<Job>): Promise<mongoose.Document<unknown, {}, JobDocument, {}, {}> & Job & mongoose.Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    updateJob(id: string, data: Partial<Job>): Promise<mongoose.Document<unknown, {}, JobDocument, {}, {}> & Job & mongoose.Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    deleteJob(id: string): Promise<{
        deleted: boolean;
    }>;
    listVacancies(filter: {
        location?: string;
        status?: string;
        search?: string;
        entity?: string;
    }, page?: number, limit?: number): Promise<{
        data: (mongoose.Document<unknown, {}, JobDocument, {}, {}> & Job & mongoose.Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getJob(id: string): Promise<mongoose.Document<unknown, {}, JobDocument, {}, {}> & Job & mongoose.Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    applyToJob(data: Partial<Application>): Promise<mongoose.Document<unknown, {}, ApplicationDocument, {}, {}> & Application & mongoose.Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    listApplications(filter: {
        status?: string;
        search?: string;
        entity?: string;
    }, page?: number, limit?: number): Promise<{
        data: (mongoose.Document<unknown, {}, ApplicationDocument, {}, {}> & Application & mongoose.Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getApplication(id: string): Promise<mongoose.Document<unknown, {}, ApplicationDocument, {}, {}> & Application & mongoose.Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    updateApplicationStatus(id: string, status: string, date: string, note?: string, user?: any): Promise<{
        status: number;
        message: string;
    }>;
}
