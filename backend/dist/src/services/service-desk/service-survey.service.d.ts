import { Model } from 'mongoose';
import { ServiceSurvey, ServiceSurveyCustomerType, ServiceSurveyDocument } from 'src/schemas/service-survey.schema';
import { StaffService } from 'src/services/user/user.service';
export type CreateServiceSurveyPayload = {
    serviceArea: string;
    entity?: string;
    department?: string;
    unit?: string;
    satisfactionRating?: number;
    responsivenessRating?: number;
    turnaroundRating?: number;
    comments?: string;
    requestSubmittedAt?: string | Date | null;
    responseReceivedAt?: string | Date | null;
    turnaroundTargetHours?: number | null;
    referenceCode?: string;
    internalRespondent?: string | null;
};
type ListSurveyOptions = {
    customerType?: ServiceSurveyCustomerType;
    serviceArea?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
    sort?: 'asc' | 'desc';
    assignment?: 'unassigned' | 'assigned' | 'self';
    currentUserId?: string;
};
type SummaryMetrics = {
    count: number;
    averageSatisfaction: number | null;
    averageResponsiveness: number | null;
    averageTurnaroundRating: number | null;
    averageTurnaroundHours: number | null;
    averageTurnaroundTargetHours: number | null;
    percentWithinTarget: number | null;
};
export declare class ServiceSurveyService {
    private readonly surveyModel;
    private readonly staffService;
    constructor(surveyModel: Model<ServiceSurveyDocument>, staffService: StaffService);
    private normalizeEntity;
    private toObjectId;
    private toObjectIdOrNull;
    private buildServiceAreaCode;
    createExternal(payload: CreateServiceSurveyPayload): Promise<ServiceSurveyDocument | (import("mongoose").Document<unknown, {}, ServiceSurveyDocument, {}, {}> & ServiceSurvey & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })>;
    createInternal(payload: CreateServiceSurveyPayload, respondentId: string | null | undefined): Promise<import("mongoose").Document<unknown, {}, ServiceSurveyDocument, {}, {}> & ServiceSurvey & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    private createSurvey;
    private updateSurvey;
    createExternalReference(payload: {
        serviceArea?: string;
        entity?: string;
        requestSubmittedAt?: string | Date | null;
        internalRespondent?: string | null;
        unit?: string;
    }): Promise<{
        referenceCode: string;
        requestSubmittedAt: Date;
        survey: import("mongoose").Document<unknown, {}, ServiceSurveyDocument, {}, {}> & ServiceSurvey & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
    }>;
    findAll(options?: ListSurveyOptions): Promise<{
        data: (import("mongoose").FlattenMaps<ServiceSurveyDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    assignSurvey(surveyId: string, actorId?: string | null, respondentId?: string | null): Promise<(import("mongoose").Document<unknown, {}, ServiceSurveyDocument, {}, {}> & ServiceSurvey & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | (ServiceSurvey & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })>;
    getSummary(customerType?: ServiceSurveyCustomerType): Promise<{
        total: number;
        updatedAt: string;
        overall: SummaryMetrics;
        byType: {
            INTERNAL: SummaryMetrics;
            EXTERNAL: SummaryMetrics;
        };
    }>;
    private computeMetrics;
    private parseDate;
    private calculateTurnaround;
    private normalizeScore;
    private isScore;
    private isNumber;
    private averageOrNull;
    private roundToTwo;
    private roleHasKeyword;
    private attachInternalRespondentSummaries;
    private extractRespondentId;
    private toStaffSummary;
}
export {};
