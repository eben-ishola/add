import { JobService } from 'src/services/jobs/job.service';
import { Job } from 'src/schemas/job.schema';
import { Application } from 'src/schemas/application.schema';
export declare class JobController {
    private readonly jobService;
    constructor(jobService: JobService);
    createJob(data: Partial<Job>): Promise<import("mongoose").Document<unknown, {}, import("src/schemas/job.schema").JobDocument, {}, {}> & Job & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    listVacancies(location: string, status: string, search: string, page: string, limit: string, entity: string): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("src/schemas/job.schema").JobDocument, {}, {}> & Job & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    apply(resume: Express.Multer.File, data: any): Promise<import("mongoose").Document<unknown, {}, import("src/schemas/application.schema").ApplicationDocument, {}, {}> & Application & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    listApplications(status: string, search: string, entity: string, page?: string, limit?: string): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("src/schemas/application.schema").ApplicationDocument, {}, {}> & Application & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    updateApplicationStatus(id: string, payload: any, user: any): Promise<{
        status: number;
        message: string;
    }>;
    updateJob(id: string, data: Partial<Job>): Promise<import("mongoose").Document<unknown, {}, import("src/schemas/job.schema").JobDocument, {}, {}> & Job & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    getJob(id: string): Promise<import("mongoose").Document<unknown, {}, import("src/schemas/job.schema").JobDocument, {}, {}> & Job & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    deleteJob(id: string): Promise<{
        deleted: boolean;
    }>;
    getApplication(id: string): Promise<import("mongoose").Document<unknown, {}, import("src/schemas/application.schema").ApplicationDocument, {}, {}> & Application & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
}
