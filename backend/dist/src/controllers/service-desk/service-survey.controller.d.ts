import { CreateServiceSurveyPayload, ServiceSurveyService } from 'src/services/service-desk/service-survey.service';
import { ServiceSurveyCustomerType } from 'src/schemas/service-survey.schema';
export declare class ServiceSurveyController {
    private readonly serviceSurveyService;
    constructor(serviceSurveyService: ServiceSurveyService);
    submitExternal(payload: CreateServiceSurveyPayload): Promise<import("src/schemas/service-survey.schema").ServiceSurveyDocument | (import("mongoose").Document<unknown, {}, import("src/schemas/service-survey.schema").ServiceSurveyDocument, {}, {}> & import("src/schemas/service-survey.schema").ServiceSurvey & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })>;
    createExternalReference(payload: Pick<CreateServiceSurveyPayload, 'serviceArea' | 'requestSubmittedAt' | 'entity' | 'unit'>, req: any): Promise<{
        referenceCode: string;
        requestSubmittedAt: Date;
        survey: import("mongoose").Document<unknown, {}, import("src/schemas/service-survey.schema").ServiceSurveyDocument, {}, {}> & import("src/schemas/service-survey.schema").ServiceSurvey & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
    }>;
    submitInternal(payload: CreateServiceSurveyPayload, req: any): Promise<import("mongoose").Document<unknown, {}, import("src/schemas/service-survey.schema").ServiceSurveyDocument, {}, {}> & import("src/schemas/service-survey.schema").ServiceSurvey & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    findAll(type?: ServiceSurveyCustomerType, serviceArea?: string, from?: string, to?: string, page?: string, limit?: string, sort?: 'asc' | 'desc', assignment?: 'unassigned' | 'self' | 'assigned', req?: any): Promise<{
        data: (import("mongoose").FlattenMaps<import("src/schemas/service-survey.schema").ServiceSurveyDocument> & Required<{
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
    summary(type?: ServiceSurveyCustomerType): Promise<{
        total: number;
        updatedAt: string;
        overall: {
            count: number;
            averageSatisfaction: number | null;
            averageResponsiveness: number | null;
            averageTurnaroundRating: number | null;
            averageTurnaroundHours: number | null;
            averageTurnaroundTargetHours: number | null;
            percentWithinTarget: number | null;
        };
        byType: {
            INTERNAL: {
                count: number;
                averageSatisfaction: number | null;
                averageResponsiveness: number | null;
                averageTurnaroundRating: number | null;
                averageTurnaroundHours: number | null;
                averageTurnaroundTargetHours: number | null;
                percentWithinTarget: number | null;
            };
            EXTERNAL: {
                count: number;
                averageSatisfaction: number | null;
                averageResponsiveness: number | null;
                averageTurnaroundRating: number | null;
                averageTurnaroundHours: number | null;
                averageTurnaroundTargetHours: number | null;
                percentWithinTarget: number | null;
            };
        };
    }>;
    assignSurvey(id: string, req: any, body?: {
        respondentId?: string;
    }): Promise<(import("mongoose").Document<unknown, {}, import("src/schemas/service-survey.schema").ServiceSurveyDocument, {}, {}> & import("src/schemas/service-survey.schema").ServiceSurvey & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | (import("src/schemas/service-survey.schema").ServiceSurvey & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })>;
}
