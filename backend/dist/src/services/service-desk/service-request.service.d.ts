import { Model } from 'mongoose';
import { NoticeService } from 'src/services/comms/notice.service';
import { StaffService } from 'src/services/user/user.service';
import { MailService } from 'src/services/comms/mail.service';
import { ServiceRequestCommentRole, ServiceRequestDocument, ServiceRequestStatus } from 'src/schemas/service-request.schema';
type CreateRequestPayload = {
    title: string;
    serviceArea: string;
    description?: string;
    resolverId?: string;
    initialComment?: string;
};
type ListOptions = {
    role?: 'requester' | 'resolver' | 'all' | 'unassigned';
    status?: ServiceRequestStatus | 'OPEN' | 'CLOSED';
    limit?: number;
    page?: number;
    supervisorScope?: string | string[];
    department?: string | string[];
};
type CommentPayload = {
    message: string;
};
type ActionPayload = {
    comment?: string;
};
type RatingPayload = {
    score: number;
    comment?: string;
};
type AssignPayload = {
    resolverId: string;
    comment?: string;
};
type AdminListOptions = {
    status?: ServiceRequestStatus | 'OPEN' | 'CLOSED';
    startDate?: string;
    endDate?: string;
    requesterId?: string;
    resolverId?: string;
    serviceArea?: string;
    limit?: number;
    page?: number;
};
type PersonSummary = {
    id: string;
    fullName: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    department?: string;
    role?: string;
    avatarUrl?: string;
};
type RequestComment = {
    id: string;
    authorId: string;
    author: PersonSummary | null;
    role: ServiceRequestCommentRole;
    message: string;
    createdAt: string;
    updatedAt: string;
};
type ServiceRequestResponse = {
    id: string;
    title: string;
    serviceArea: string;
    description?: string;
    status: ServiceRequestStatus;
    requester: PersonSummary | null;
    resolver?: PersonSummary | null;
    requestedAt: string;
    acceptedAt?: string | null;
    resolvedAt?: string | null;
    ratedAt?: string | null;
    ratedBy?: string | null;
    ratingScore?: number | null;
    ratingComment?: string | null;
    attachment?: string | null;
    updatedAt: string;
    comments: RequestComment[];
};
export declare class ServiceRequestService {
    private readonly requestModel;
    private readonly staffService;
    private readonly noticeService;
    private readonly mailService?;
    constructor(requestModel: Model<ServiceRequestDocument>, staffService: StaffService, noticeService: NoticeService, mailService?: MailService);
    private ensureStringId;
    private getRequestId;
    createRequest(payload: CreateRequestPayload, requesterId: string): Promise<ServiceRequestResponse>;
    listRequests(userId: string, options?: ListOptions): Promise<{
        data: ServiceRequestResponse[];
        total: number;
    }>;
    getRequest(id: string, userId: string): Promise<ServiceRequestResponse>;
    addComment(id: string, userId: string, payload: CommentPayload): Promise<ServiceRequestResponse>;
    acceptRequest(id: string, userId: string, payload?: ActionPayload): Promise<ServiceRequestResponse>;
    rejectRequest(id: string, userId: string, payload?: ActionPayload): Promise<ServiceRequestResponse>;
    resolveRequest(id: string, userId: string, payload?: ActionPayload): Promise<ServiceRequestResponse>;
    assignRequest(id: string, actorId: string, payload: AssignPayload): Promise<ServiceRequestResponse>;
    rateRequest(id: string, userId: string, payload: RatingPayload): Promise<ServiceRequestResponse>;
    private getPortalBaseUrl;
    private buildRequestUrl;
    private normalizeEmail;
    private resolveRecipientContacts;
    private buildRequestEmailBody;
    private sendRequestEmail;
    private getRoleName;
    private isAdminRole;
    private isSupervisorRole;
    private deriveDepartmentTokens;
    private getGenericServiceAreaRegex;
    private hasMappedServiceArea;
    private matchesServiceAreaTokens;
    private buildListQuery;
    private ensureAccess;
    private isRequester;
    private isResolver;
    private toObjectId;
    private buildRequestLink;
    private hydrateRequest;
    private hydrateRequestList;
    adminListRequests(options?: AdminListOptions): Promise<{
        data: ServiceRequestResponse[];
        total: number;
    }>;
    private fetchUserSummaries;
    private fetchCommentAuthors;
    private fetchUserSummary;
    private notifyCounterparty;
}
export {};
