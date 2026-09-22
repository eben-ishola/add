import { Document, Types } from 'mongoose';
export type ServiceRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'RESOLVED';
export type ServiceRequestCommentRole = 'REQUESTER' | 'RESOLVER';
export declare class ServiceRequestComment {
    author: Types.ObjectId;
    message: string;
    role: ServiceRequestCommentRole;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const ServiceRequestCommentSchema: import("mongoose").Schema<ServiceRequestComment, import("mongoose").Model<ServiceRequestComment, any, any, any, Document<unknown, any, ServiceRequestComment, any, {}> & ServiceRequestComment & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ServiceRequestComment, Document<unknown, {}, import("mongoose").FlatRecord<ServiceRequestComment>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ServiceRequestComment> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare class ServiceRequest {
    title: string;
    serviceArea: string;
    description?: string;
    requester: Types.ObjectId;
    resolver?: Types.ObjectId | null;
    status: ServiceRequestStatus;
    acceptedAt?: Date | null;
    resolvedAt?: Date | null;
    attachment?: string;
    comments: ServiceRequestComment[];
    ratingScore?: number | null;
    ratingComment?: string | null;
    ratedBy?: Types.ObjectId | null;
    ratedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}
export type ServiceRequestDocument = ServiceRequest & Document;
export declare const ServiceRequestSchema: import("mongoose").Schema<ServiceRequest, import("mongoose").Model<ServiceRequest, any, any, any, Document<unknown, any, ServiceRequest, any, {}> & ServiceRequest & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ServiceRequest, Document<unknown, {}, import("mongoose").FlatRecord<ServiceRequest>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ServiceRequest> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
