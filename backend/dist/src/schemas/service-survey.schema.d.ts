import { Document, Types } from 'mongoose';
export type ServiceSurveyDocument = ServiceSurvey & Document;
export type ServiceSurveyCustomerType = 'INTERNAL' | 'EXTERNAL';
export declare class ServiceSurvey {
    customerType: ServiceSurveyCustomerType;
    serviceArea: string;
    entity?: string | null;
    referenceCode?: string | null;
    referenceSequence?: number | null;
    department?: string;
    unit?: string;
    satisfactionRating?: number;
    responsivenessRating?: number;
    turnaroundRating?: number;
    comments?: string;
    requestSubmittedAt?: Date;
    responseReceivedAt?: Date;
    turnaroundTargetHours?: number;
    turnaroundActualHours?: number;
    turnaroundMetTarget?: boolean;
    internalRespondent?: Types.ObjectId;
}
export declare const ServiceSurveySchema: import("mongoose").Schema<ServiceSurvey, import("mongoose").Model<ServiceSurvey, any, any, any, Document<unknown, any, ServiceSurvey, any, {}> & ServiceSurvey & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ServiceSurvey, Document<unknown, {}, import("mongoose").FlatRecord<ServiceSurvey>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ServiceSurvey> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
