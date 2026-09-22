import { Model } from 'mongoose';
import { DisciplinaryCase, DisciplinaryCaseDocument } from 'src/schemas/disciplinary-case.schema';
import { StaffService } from 'src/services/user/user.service';
import { MailService } from 'src/services/comms/mail.service';
type CreateCaseInput = {
    employeeId: string;
    employeeName?: string;
    entity?: string;
    department?: string;
    category?: string;
    status?: string;
    severity?: string;
    incidentDate?: string | Date;
    reviewerId?: string;
    reviewerName?: string;
    summary?: string;
    nextSteps?: string;
    salaryDeductionRequired?: boolean;
    salaryDeductionApplied?: boolean;
    salaryDeductionAppliedAt?: string | Date;
    salaryDeductionAppliedBy?: string;
    attachments?: Array<{
        name: string;
        url?: string;
    }>;
    sendEmail?: boolean;
};
type UpdateCaseInput = Partial<CreateCaseInput>;
export declare class DisciplinaryService {
    private readonly caseModel;
    private readonly staffService?;
    private readonly mailService?;
    constructor(caseModel: Model<DisciplinaryCaseDocument>, staffService?: StaffService, mailService?: MailService);
    private normalizeDate;
    private normalizeEmail;
    private buildStaffDisplayName;
    private formatIncidentDate;
    private resolveCaseSubject;
    private buildCaseMessage;
    private notifyCaseCreated;
    private buildFilters;
    listCases(query: {
        search?: string;
        status?: string;
        severity?: string;
        category?: string;
        department?: string;
        entity?: string;
    }, page?: number, limit?: number): Promise<{
        data: (import("mongoose").FlattenMaps<DisciplinaryCaseDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getCase(id: string): Promise<import("mongoose").FlattenMaps<DisciplinaryCaseDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    createCase(payload: CreateCaseInput): Promise<import("mongoose").Document<unknown, {}, DisciplinaryCaseDocument, {}, {}> & DisciplinaryCase & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    updateCase(id: string, updates: UpdateCaseInput): Promise<import("mongoose").Document<unknown, {}, DisciplinaryCaseDocument, {}, {}> & DisciplinaryCase & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    applySalaryDeduction(id: string, appliedBy?: string): Promise<import("mongoose").Document<unknown, {}, DisciplinaryCaseDocument, {}, {}> & DisciplinaryCase & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    deleteCase(id: string): Promise<{
        deleted: boolean;
    }>;
    getSummary(query: {
        status?: string;
        severity?: string;
        category?: string;
        department?: string;
        entity?: string;
    }): Promise<{
        total: any;
        byStatus: any;
        bySeverity: any;
        byCategory: any;
    }>;
    private serializeCsvValue;
    exportCases(query: {
        search?: string;
        status?: string;
        severity?: string;
        category?: string;
        department?: string;
        entity?: string;
    }): Promise<string>;
}
export {};
