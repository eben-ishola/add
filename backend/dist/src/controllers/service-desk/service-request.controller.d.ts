import { ServiceRequestService } from 'src/services/service-desk/service-request.service';
export declare class ServiceRequestController {
    private readonly serviceRequestService;
    constructor(serviceRequestService: ServiceRequestService);
    create(req: any, body: {
        title: string;
        serviceArea: string;
        description?: string;
        resolverId?: string;
        initialComment?: string;
    }): Promise<{
        id: string;
        title: string;
        serviceArea: string;
        description?: string;
        status: import("../../schemas/service-request.schema").ServiceRequestStatus;
        requester: {
            id: string;
            fullName: string;
            firstName?: string;
            lastName?: string;
            email?: string;
            department?: string;
            role?: string;
            avatarUrl?: string;
        } | null;
        resolver?: {
            id: string;
            fullName: string;
            firstName?: string;
            lastName?: string;
            email?: string;
            department?: string;
            role?: string;
            avatarUrl?: string;
        } | null;
        requestedAt: string;
        acceptedAt?: string | null;
        resolvedAt?: string | null;
        ratedAt?: string | null;
        ratedBy?: string | null;
        ratingScore?: number | null;
        ratingComment?: string | null;
        attachment?: string | null;
        updatedAt: string;
        comments: {
            id: string;
            authorId: string;
            author: {
                id: string;
                fullName: string;
                firstName?: string;
                lastName?: string;
                email?: string;
                department?: string;
                role?: string;
                avatarUrl?: string;
            } | null;
            role: import("../../schemas/service-request.schema").ServiceRequestCommentRole;
            message: string;
            createdAt: string;
            updatedAt: string;
        }[];
    }>;
    list(req: any, role?: 'requester' | 'resolver' | 'all' | 'unassigned', status?: string, page?: string, limit?: string, supervisorScope?: string, department?: string | string[]): Promise<{
        data: {
            id: string;
            title: string;
            serviceArea: string;
            description?: string;
            status: import("../../schemas/service-request.schema").ServiceRequestStatus;
            requester: {
                id: string;
                fullName: string;
                firstName?: string;
                lastName?: string;
                email?: string;
                department?: string;
                role?: string;
                avatarUrl?: string;
            } | null;
            resolver?: {
                id: string;
                fullName: string;
                firstName?: string;
                lastName?: string;
                email?: string;
                department?: string;
                role?: string;
                avatarUrl?: string;
            } | null;
            requestedAt: string;
            acceptedAt?: string | null;
            resolvedAt?: string | null;
            ratedAt?: string | null;
            ratedBy?: string | null;
            ratingScore?: number | null;
            ratingComment?: string | null;
            attachment?: string | null;
            updatedAt: string;
            comments: {
                id: string;
                authorId: string;
                author: {
                    id: string;
                    fullName: string;
                    firstName?: string;
                    lastName?: string;
                    email?: string;
                    department?: string;
                    role?: string;
                    avatarUrl?: string;
                } | null;
                role: import("../../schemas/service-request.schema").ServiceRequestCommentRole;
                message: string;
                createdAt: string;
                updatedAt: string;
            }[];
        }[];
        total: number;
    }>;
    adminList(status?: string, startDate?: string, endDate?: string, requesterId?: string, resolverId?: string, serviceArea?: string, page?: string, limit?: string): Promise<{
        data: {
            id: string;
            title: string;
            serviceArea: string;
            description?: string;
            status: import("../../schemas/service-request.schema").ServiceRequestStatus;
            requester: {
                id: string;
                fullName: string;
                firstName?: string;
                lastName?: string;
                email?: string;
                department?: string;
                role?: string;
                avatarUrl?: string;
            } | null;
            resolver?: {
                id: string;
                fullName: string;
                firstName?: string;
                lastName?: string;
                email?: string;
                department?: string;
                role?: string;
                avatarUrl?: string;
            } | null;
            requestedAt: string;
            acceptedAt?: string | null;
            resolvedAt?: string | null;
            ratedAt?: string | null;
            ratedBy?: string | null;
            ratingScore?: number | null;
            ratingComment?: string | null;
            attachment?: string | null;
            updatedAt: string;
            comments: {
                id: string;
                authorId: string;
                author: {
                    id: string;
                    fullName: string;
                    firstName?: string;
                    lastName?: string;
                    email?: string;
                    department?: string;
                    role?: string;
                    avatarUrl?: string;
                } | null;
                role: import("../../schemas/service-request.schema").ServiceRequestCommentRole;
                message: string;
                createdAt: string;
                updatedAt: string;
            }[];
        }[];
        total: number;
    }>;
    get(id: string, req: any): Promise<{
        id: string;
        title: string;
        serviceArea: string;
        description?: string;
        status: import("../../schemas/service-request.schema").ServiceRequestStatus;
        requester: {
            id: string;
            fullName: string;
            firstName?: string;
            lastName?: string;
            email?: string;
            department?: string;
            role?: string;
            avatarUrl?: string;
        } | null;
        resolver?: {
            id: string;
            fullName: string;
            firstName?: string;
            lastName?: string;
            email?: string;
            department?: string;
            role?: string;
            avatarUrl?: string;
        } | null;
        requestedAt: string;
        acceptedAt?: string | null;
        resolvedAt?: string | null;
        ratedAt?: string | null;
        ratedBy?: string | null;
        ratingScore?: number | null;
        ratingComment?: string | null;
        attachment?: string | null;
        updatedAt: string;
        comments: {
            id: string;
            authorId: string;
            author: {
                id: string;
                fullName: string;
                firstName?: string;
                lastName?: string;
                email?: string;
                department?: string;
                role?: string;
                avatarUrl?: string;
            } | null;
            role: import("../../schemas/service-request.schema").ServiceRequestCommentRole;
            message: string;
            createdAt: string;
            updatedAt: string;
        }[];
    }>;
    comment(id: string, req: any, body: {
        message: string;
    }): Promise<{
        id: string;
        title: string;
        serviceArea: string;
        description?: string;
        status: import("../../schemas/service-request.schema").ServiceRequestStatus;
        requester: {
            id: string;
            fullName: string;
            firstName?: string;
            lastName?: string;
            email?: string;
            department?: string;
            role?: string;
            avatarUrl?: string;
        } | null;
        resolver?: {
            id: string;
            fullName: string;
            firstName?: string;
            lastName?: string;
            email?: string;
            department?: string;
            role?: string;
            avatarUrl?: string;
        } | null;
        requestedAt: string;
        acceptedAt?: string | null;
        resolvedAt?: string | null;
        ratedAt?: string | null;
        ratedBy?: string | null;
        ratingScore?: number | null;
        ratingComment?: string | null;
        attachment?: string | null;
        updatedAt: string;
        comments: {
            id: string;
            authorId: string;
            author: {
                id: string;
                fullName: string;
                firstName?: string;
                lastName?: string;
                email?: string;
                department?: string;
                role?: string;
                avatarUrl?: string;
            } | null;
            role: import("../../schemas/service-request.schema").ServiceRequestCommentRole;
            message: string;
            createdAt: string;
            updatedAt: string;
        }[];
    }>;
    accept(id: string, req: any, body: {
        comment?: string;
    }): Promise<{
        id: string;
        title: string;
        serviceArea: string;
        description?: string;
        status: import("../../schemas/service-request.schema").ServiceRequestStatus;
        requester: {
            id: string;
            fullName: string;
            firstName?: string;
            lastName?: string;
            email?: string;
            department?: string;
            role?: string;
            avatarUrl?: string;
        } | null;
        resolver?: {
            id: string;
            fullName: string;
            firstName?: string;
            lastName?: string;
            email?: string;
            department?: string;
            role?: string;
            avatarUrl?: string;
        } | null;
        requestedAt: string;
        acceptedAt?: string | null;
        resolvedAt?: string | null;
        ratedAt?: string | null;
        ratedBy?: string | null;
        ratingScore?: number | null;
        ratingComment?: string | null;
        attachment?: string | null;
        updatedAt: string;
        comments: {
            id: string;
            authorId: string;
            author: {
                id: string;
                fullName: string;
                firstName?: string;
                lastName?: string;
                email?: string;
                department?: string;
                role?: string;
                avatarUrl?: string;
            } | null;
            role: import("../../schemas/service-request.schema").ServiceRequestCommentRole;
            message: string;
            createdAt: string;
            updatedAt: string;
        }[];
    }>;
    reject(id: string, req: any, body: {
        comment?: string;
    }): Promise<{
        id: string;
        title: string;
        serviceArea: string;
        description?: string;
        status: import("../../schemas/service-request.schema").ServiceRequestStatus;
        requester: {
            id: string;
            fullName: string;
            firstName?: string;
            lastName?: string;
            email?: string;
            department?: string;
            role?: string;
            avatarUrl?: string;
        } | null;
        resolver?: {
            id: string;
            fullName: string;
            firstName?: string;
            lastName?: string;
            email?: string;
            department?: string;
            role?: string;
            avatarUrl?: string;
        } | null;
        requestedAt: string;
        acceptedAt?: string | null;
        resolvedAt?: string | null;
        ratedAt?: string | null;
        ratedBy?: string | null;
        ratingScore?: number | null;
        ratingComment?: string | null;
        attachment?: string | null;
        updatedAt: string;
        comments: {
            id: string;
            authorId: string;
            author: {
                id: string;
                fullName: string;
                firstName?: string;
                lastName?: string;
                email?: string;
                department?: string;
                role?: string;
                avatarUrl?: string;
            } | null;
            role: import("../../schemas/service-request.schema").ServiceRequestCommentRole;
            message: string;
            createdAt: string;
            updatedAt: string;
        }[];
    }>;
    resolve(id: string, req: any, body: {
        comment?: string;
    }): Promise<{
        id: string;
        title: string;
        serviceArea: string;
        description?: string;
        status: import("../../schemas/service-request.schema").ServiceRequestStatus;
        requester: {
            id: string;
            fullName: string;
            firstName?: string;
            lastName?: string;
            email?: string;
            department?: string;
            role?: string;
            avatarUrl?: string;
        } | null;
        resolver?: {
            id: string;
            fullName: string;
            firstName?: string;
            lastName?: string;
            email?: string;
            department?: string;
            role?: string;
            avatarUrl?: string;
        } | null;
        requestedAt: string;
        acceptedAt?: string | null;
        resolvedAt?: string | null;
        ratedAt?: string | null;
        ratedBy?: string | null;
        ratingScore?: number | null;
        ratingComment?: string | null;
        attachment?: string | null;
        updatedAt: string;
        comments: {
            id: string;
            authorId: string;
            author: {
                id: string;
                fullName: string;
                firstName?: string;
                lastName?: string;
                email?: string;
                department?: string;
                role?: string;
                avatarUrl?: string;
            } | null;
            role: import("../../schemas/service-request.schema").ServiceRequestCommentRole;
            message: string;
            createdAt: string;
            updatedAt: string;
        }[];
    }>;
    rate(id: string, req: any, body: {
        score: number;
        comment?: string;
    }): Promise<{
        id: string;
        title: string;
        serviceArea: string;
        description?: string;
        status: import("../../schemas/service-request.schema").ServiceRequestStatus;
        requester: {
            id: string;
            fullName: string;
            firstName?: string;
            lastName?: string;
            email?: string;
            department?: string;
            role?: string;
            avatarUrl?: string;
        } | null;
        resolver?: {
            id: string;
            fullName: string;
            firstName?: string;
            lastName?: string;
            email?: string;
            department?: string;
            role?: string;
            avatarUrl?: string;
        } | null;
        requestedAt: string;
        acceptedAt?: string | null;
        resolvedAt?: string | null;
        ratedAt?: string | null;
        ratedBy?: string | null;
        ratingScore?: number | null;
        ratingComment?: string | null;
        attachment?: string | null;
        updatedAt: string;
        comments: {
            id: string;
            authorId: string;
            author: {
                id: string;
                fullName: string;
                firstName?: string;
                lastName?: string;
                email?: string;
                department?: string;
                role?: string;
                avatarUrl?: string;
            } | null;
            role: import("../../schemas/service-request.schema").ServiceRequestCommentRole;
            message: string;
            createdAt: string;
            updatedAt: string;
        }[];
    }>;
    assign(id: string, req: any, body: {
        resolverId: string;
        comment?: string;
    }): Promise<{
        id: string;
        title: string;
        serviceArea: string;
        description?: string;
        status: import("../../schemas/service-request.schema").ServiceRequestStatus;
        requester: {
            id: string;
            fullName: string;
            firstName?: string;
            lastName?: string;
            email?: string;
            department?: string;
            role?: string;
            avatarUrl?: string;
        } | null;
        resolver?: {
            id: string;
            fullName: string;
            firstName?: string;
            lastName?: string;
            email?: string;
            department?: string;
            role?: string;
            avatarUrl?: string;
        } | null;
        requestedAt: string;
        acceptedAt?: string | null;
        resolvedAt?: string | null;
        ratedAt?: string | null;
        ratedBy?: string | null;
        ratingScore?: number | null;
        ratingComment?: string | null;
        attachment?: string | null;
        updatedAt: string;
        comments: {
            id: string;
            authorId: string;
            author: {
                id: string;
                fullName: string;
                firstName?: string;
                lastName?: string;
                email?: string;
                department?: string;
                role?: string;
                avatarUrl?: string;
            } | null;
            role: import("../../schemas/service-request.schema").ServiceRequestCommentRole;
            message: string;
            createdAt: string;
            updatedAt: string;
        }[];
    }>;
}
