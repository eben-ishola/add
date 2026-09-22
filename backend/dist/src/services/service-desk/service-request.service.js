"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRequestService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notice_service_1 = require("../comms/notice.service");
const user_service_1 = require("../user/user.service");
const mail_service_1 = require("../comms/mail.service");
const service_request_schema_1 = require("../../schemas/service-request.schema");
const config_1 = require("../../config");
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalizeDepartmentTokens = (input) => {
    if (!input) {
        return [];
    }
    const raw = Array.isArray(input) ? input : [input];
    return raw
        .flatMap((value) => String(value)
        .split(/[,|]/)
        .map((token) => token.trim())
        .filter(Boolean))
        .filter(Boolean);
};
const CANONICAL_DEPARTMENT_ALIASES = [
    {
        label: 'operations',
        aliases: ['operations', 'operation', 'ops', 'teller', 'funds transfer', 'customer service'],
    },
    {
        label: 'credit',
        aliases: ['credit', 'credit analyst', 'credit admin'],
    },
    {
        label: 'human resource',
        aliases: ['human resource', 'human resources', 'hr', 'people operations'],
    },
    {
        label: 'information technology',
        aliases: ['information technology', 'information tech', 'technology', 'it', 'it officer', 'it solutions engineer'],
    },
];
const GENERIC_SERVICE_AREAS = new Set([
    'general',
    'others',
    'other',
    'uncategorized',
    'unknown service',
]);
const resolveCanonicalDepartmentLabel = (value) => {
    if (!value)
        return null;
    const normalized = String(value).trim().toLowerCase();
    if (!normalized)
        return null;
    const tokens = normalized.split(/[^a-z0-9]+/).filter(Boolean);
    for (const config of CANONICAL_DEPARTMENT_ALIASES) {
        const matched = config.aliases.some((alias) => {
            const normalizedAlias = alias.trim().toLowerCase();
            if (!normalizedAlias)
                return false;
            if (normalizedAlias.includes(' ')) {
                return normalized.includes(normalizedAlias);
            }
            return tokens.includes(normalizedAlias);
        });
        if (matched) {
            return config.label;
        }
    }
    return null;
};
const getCanonicalDepartmentAliases = (label) => {
    if (!label)
        return [];
    const config = CANONICAL_DEPARTMENT_ALIASES.find((item) => item.label === label);
    if (!config)
        return [label];
    return Array.from(new Set([...config.aliases, config.label]));
};
let ServiceRequestService = class ServiceRequestService {
    constructor(requestModel, staffService, noticeService, mailService) {
        this.requestModel = requestModel;
        this.staffService = staffService;
        this.noticeService = noticeService;
        this.mailService = mailService;
    }
    ensureStringId(value) {
        if (!value)
            return '';
        if (typeof value === 'string')
            return value;
        if (value instanceof mongoose_2.Types.ObjectId)
            return value.toHexString();
        try {
            return String(value);
        }
        catch {
            return '';
        }
    }
    getRequestId(request) {
        return this.ensureStringId(request?._id ??
            request?.id ??
            request?._id);
    }
    async createRequest(payload, requesterId) {
        const title = payload.title?.trim();
        const serviceArea = payload.serviceArea?.trim();
        if (!title) {
            throw new common_1.BadRequestException('Request title is required.');
        }
        if (!serviceArea) {
            throw new common_1.BadRequestException('Service area is required.');
        }
        const resolverId = payload.resolverId
            ? this.toObjectId(payload.resolverId, 'resolverId')
            : null;
        const request = await this.requestModel.create({
            title,
            serviceArea,
            description: payload.description?.trim() || undefined,
            attachment: payload?.attachment?.trim?.() || undefined,
            requester: this.toObjectId(requesterId),
            resolver: resolverId,
            comments: payload.initialComment?.trim()
                ? [
                    {
                        author: this.toObjectId(requesterId),
                        role: 'REQUESTER',
                        message: payload.initialComment.trim(),
                    },
                ]
                : [],
        });
        if (resolverId) {
            await this.noticeService.createNotice({
                userId: this.ensureStringId(resolverId),
                message: `New service request "${title}" requires your attention.`,
                link: this.buildRequestLink(this.getRequestId(request)),
                type: 'service-request',
            });
            const requesterSummary = await this.fetchUserSummary(requesterId);
            const requesterLabel = requesterSummary?.fullName ?? 'a requester';
            const subject = `New service request: ${title}`;
            const message = `A new service request "${title}" was submitted by ${requesterLabel}.`;
            await this.sendRequestEmail(resolverId, subject, message, request);
        }
        return this.hydrateRequest(request);
    }
    async listRequests(userId, options = {}) {
        const actor = await this.staffService.getById(String(userId)).catch(() => null);
        const query = this.buildListQuery(userId, options, actor);
        const page = Math.max(options.page ?? 1, 1);
        const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.requestModel
                .find(query)
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.requestModel.countDocuments(query),
        ]);
        const responses = await this.hydrateRequestList(items);
        return {
            data: responses,
            total,
        };
    }
    async getRequest(id, userId) {
        const request = await this.requestModel.findById(id);
        if (!request) {
            throw new common_1.NotFoundException('Service request not found.');
        }
        const actor = await this.staffService.getById(String(userId)).catch(() => null);
        await this.ensureAccess(request, userId, {
            allowDepartmentScope: true,
            actor,
        });
        return this.hydrateRequest(request);
    }
    async addComment(id, userId, payload) {
        const request = await this.requestModel.findById(id);
        if (!request) {
            throw new common_1.NotFoundException('Service request not found.');
        }
        await this.ensureAccess(request, userId);
        const message = payload.message?.trim();
        if (!message) {
            throw new common_1.BadRequestException('Comment message is required.');
        }
        const role = this.isRequester(request, userId)
            ? 'REQUESTER'
            : 'RESOLVER';
        request.comments.push({
            author: this.toObjectId(userId),
            role,
            message,
        });
        await request.save();
        await this.notifyCounterparty(request, userId, role === 'REQUESTER'
            ? `New comment from the requester on "${request.title}".`
            : `New update from the resolving user on "${request.title}".`, message);
        return this.hydrateRequest(request);
    }
    async acceptRequest(id, userId, payload = {}) {
        const request = await this.requestModel.findById(id);
        if (!request) {
            throw new common_1.NotFoundException('Service request not found.');
        }
        if (request.status === 'REJECTED') {
            throw new common_1.BadRequestException('Rejected requests cannot be accepted.');
        }
        if (request.status === 'RESOLVED') {
            throw new common_1.BadRequestException('Resolved requests cannot be accepted.');
        }
        if (request.resolver && !this.isResolver(request, userId)) {
            throw new common_1.ForbiddenException('Only the assigned resolver can accept this request.');
        }
        request.status = 'ACCEPTED';
        request.resolver = this.toObjectId(userId);
        request.acceptedAt = new Date();
        if (payload.comment?.trim()) {
            request.comments.push({
                author: this.toObjectId(userId),
                role: 'RESOLVER',
                message: payload.comment.trim(),
            });
        }
        await request.save();
        await this.noticeService.createNotice({
            userId: this.ensureStringId(request.requester),
            message: `Your service request "${request.title}" has been accepted.`,
            link: this.buildRequestLink(this.getRequestId(request)),
            type: 'service-request-accepted',
        });
        const resolverSummary = await this.fetchUserSummary(userId);
        const resolverLabel = resolverSummary?.fullName
            ? ` by ${resolverSummary.fullName}`
            : '';
        const subject = `Service request accepted: ${request.title}`;
        const message = `Your service request "${request.title}" has been accepted${resolverLabel}.`;
        await this.sendRequestEmail(request.requester, subject, message, request, {
            comment: payload.comment,
        });
        return this.hydrateRequest(request);
    }
    async rejectRequest(id, userId, payload = {}) {
        const request = await this.requestModel.findById(id);
        if (!request) {
            throw new common_1.NotFoundException('Service request not found.');
        }
        if (!this.isResolver(request, userId)) {
            throw new common_1.ForbiddenException('Only the resolving user can reject this request.');
        }
        if (request.status === 'RESOLVED') {
            throw new common_1.BadRequestException('Resolved requests cannot be rejected.');
        }
        request.status = 'REJECTED';
        request.resolvedAt = new Date();
        if (payload.comment?.trim()) {
            request.comments.push({
                author: this.toObjectId(userId),
                role: 'RESOLVER',
                message: payload.comment.trim(),
            });
        }
        await request.save();
        await this.noticeService.createNotice({
            userId: this.ensureStringId(request.requester),
            message: `Your service request "${request.title}" has been rejected.`,
            link: this.buildRequestLink(this.getRequestId(request)),
            type: 'service-request-rejected',
        });
        const resolverSummary = await this.fetchUserSummary(userId);
        const resolverLabel = resolverSummary?.fullName
            ? ` by ${resolverSummary.fullName}`
            : '';
        const subject = `Service request rejected: ${request.title}`;
        const message = `Your service request "${request.title}" has been rejected${resolverLabel}.`;
        await this.sendRequestEmail(request.requester, subject, message, request, {
            comment: payload.comment,
        });
        return this.hydrateRequest(request);
    }
    async resolveRequest(id, userId, payload = {}) {
        const request = await this.requestModel.findById(id);
        if (!request) {
            throw new common_1.NotFoundException('Service request not found.');
        }
        if (!this.isResolver(request, userId)) {
            throw new common_1.ForbiddenException('Only the resolving user can close this request.');
        }
        request.status = 'RESOLVED';
        request.resolvedAt = new Date();
        if (payload.comment?.trim()) {
            request.comments.push({
                author: this.toObjectId(userId),
                role: 'RESOLVER',
                message: payload.comment.trim(),
            });
        }
        await request.save();
        await this.noticeService.createNotice({
            userId: this.ensureStringId(request.requester),
            message: `Your service request "${request.title}" has been resolved.`,
            link: this.buildRequestLink(this.getRequestId(request)),
            type: 'service-request-resolved',
        });
        const resolverSummary = await this.fetchUserSummary(userId);
        const resolverLabel = resolverSummary?.fullName
            ? ` by ${resolverSummary.fullName}`
            : '';
        const subject = `Service request resolved: ${request.title}`;
        const message = `Your service request "${request.title}" has been resolved${resolverLabel}.`;
        await this.sendRequestEmail(request.requester, subject, message, request, {
            comment: payload.comment,
        });
        return this.hydrateRequest(request);
    }
    async assignRequest(id, actorId, payload) {
        const request = await this.requestModel.findById(id);
        if (!request) {
            throw new common_1.NotFoundException('Service request not found.');
        }
        if (request.status === 'RESOLVED' || request.status === 'REJECTED') {
            throw new common_1.BadRequestException('Closed requests cannot be reassigned.');
        }
        const resolverObjectId = this.toObjectId(payload.resolverId, 'resolverId');
        const actor = await this.staffService.getById(String(actorId));
        const actorRole = String(actor?.role?.name ?? actor?.role ?? '').trim().toLowerCase();
        const isActorAdmin = actorRole.includes('super-admin') ||
            actorRole.includes('super admin') ||
            actorRole.includes('admin');
        const isActorSupervisor = actorRole.includes('supervisor');
        const isSelfAssign = String(resolverObjectId) === String(actorId);
        if (!isSelfAssign && !isActorAdmin && !isActorSupervisor) {
            throw new common_1.ForbiddenException('You are not allowed to reassign this request.');
        }
        request.resolver = resolverObjectId;
        request.status = 'PENDING';
        request.acceptedAt = null;
        if (payload.comment?.trim()) {
            request.comments.push({
                author: this.toObjectId(actorId),
                role: 'RESOLVER',
                message: payload.comment.trim(),
            });
        }
        await request.save();
        await this.noticeService.createNotice({
            userId: this.ensureStringId(resolverObjectId),
            message: `A service request "${request.title}" has been assigned to you.`,
            link: this.buildRequestLink(this.getRequestId(request)),
            type: 'service-request-assigned',
        });
        const actorSummary = await this.fetchUserSummary(actorId);
        const actorLabel = actorSummary?.fullName
            ? ` by ${actorSummary.fullName}`
            : '';
        const subject = `Service request assigned: ${request.title}`;
        const message = `A service request "${request.title}" has been assigned to you${actorLabel}.`;
        await this.sendRequestEmail(resolverObjectId, subject, message, request, {
            comment: payload.comment,
        });
        return this.hydrateRequest(request);
    }
    async rateRequest(id, userId, payload) {
        const request = await this.requestModel.findById(id);
        if (!request) {
            throw new common_1.NotFoundException('Service request not found.');
        }
        if (!this.isRequester(request, userId)) {
            throw new common_1.ForbiddenException('Only the requester can rate this service.');
        }
        if (request.status !== 'RESOLVED') {
            throw new common_1.BadRequestException('Only resolved requests can be rated.');
        }
        if (request.ratedAt && request.ratedBy) {
            throw new common_1.BadRequestException('This request has already been rated.');
        }
        const score = Number(payload.score);
        if (!Number.isFinite(score) || score < 1 || score > 5) {
            throw new common_1.BadRequestException('Rating must be a number between 1 and 5.');
        }
        request.ratingScore = score;
        request.ratingComment = payload.comment?.trim() || null;
        request.ratedBy = this.toObjectId(userId);
        request.ratedAt = new Date();
        await request.save();
        if (request.resolver) {
            await this.noticeService.createNotice({
                userId: this.ensureStringId(request.resolver),
                message: `A requester rated service request "${request.title}" with ${score}/5.`,
                link: this.buildRequestLink(this.getRequestId(request)),
                type: 'service-request-rated',
            });
            const subject = `Service request rated: ${request.title}`;
            const message = `A requester rated service request "${request.title}" with ${score}/5.`;
            await this.sendRequestEmail(request.resolver, subject, message, request, {
                comment: payload.comment,
            });
        }
        return this.hydrateRequest(request);
    }
    getPortalBaseUrl() {
        const candidates = [
            process.env.HR_PORTAL_WEB_URL,
            process.env.HR_PORTAL_BASE_URL,
            process.env.FRONTEND_BASE_URL,
            process.env.FRONTEND_URL,
        ];
        const fallback = config_1.config.frontendUrl;
        const base = candidates.find((value) => typeof value === 'string' && value.trim().length > 0) ?? fallback;
        return base.replace(/\/+$/, '');
    }
    buildRequestUrl(id) {
        const base = this.getPortalBaseUrl();
        return `${base}/service-requests/${id}`;
    }
    normalizeEmail(value) {
        if (typeof value !== 'string')
            return null;
        const trimmed = value.trim();
        return trimmed ? trimmed : null;
    }
    async resolveRecipientContacts(recipientId) {
        if (!recipientId)
            return null;
        const staff = await this.staffService
            .getById(String(recipientId))
            .catch(() => null);
        if (!staff)
            return null;
        const email = this.normalizeEmail(staff?.email);
        const departmentEmail = this.normalizeEmail(typeof staff?.department === 'object'
            ? staff.department?.groupEmail
            : null);
        const recipients = Array.from(new Set([email, departmentEmail].filter(Boolean)));
        if (!recipients.length)
            return null;
        const firstName = typeof staff?.firstName === 'string' ? staff.firstName.trim() : '';
        const lastName = typeof staff?.lastName === 'string' ? staff.lastName.trim() : '';
        const fullName = [firstName, lastName].filter(Boolean).join(' ') ||
            staff?.email ||
            'there';
        return {
            recipients,
            firstName: firstName || undefined,
            fullName,
        };
    }
    buildRequestEmailBody(params) {
        const lines = [
            `Hello ${params.greeting},`,
            '',
            params.message,
            '',
            `Title: ${params.request.title}`,
            `Service area: ${params.request.serviceArea}`,
            `Status: ${params.request.status}`,
        ];
        if (params.request.description) {
            lines.push(`Description: ${params.request.description}`);
        }
        if (params.comment) {
            lines.push(`Comment: ${params.comment}`);
        }
        if (params.link) {
            lines.push('', `View: ${params.link}`);
        }
        return lines.join('\n');
    }
    async sendRequestEmail(recipientId, subject, message, request, options) {
        if (!this.mailService)
            return;
        const recipient = await this.resolveRecipientContacts(recipientId ?? null);
        if (!recipient)
            return;
        const greetingName = recipient.firstName?.trim() ||
            recipient.fullName?.trim() ||
            'there';
        const body = this.buildRequestEmailBody({
            greeting: greetingName,
            message,
            request,
            comment: options?.comment?.trim(),
            link: this.buildRequestUrl(this.getRequestId(request)),
        });
        try {
            for (const to of recipient.recipients) {
                await this.mailService.sendMail({ to, subject, text: body });
            }
        }
        catch (error) {
            console.error('Failed to send service request email', error);
        }
    }
    getRoleName(actor) {
        return String(actor?.role?.name ?? actor?.role ?? '').trim().toLowerCase();
    }
    isAdminRole(role) {
        return (role.includes('super-admin') ||
            role.includes('super admin') ||
            role.includes('admin'));
    }
    isSupervisorRole(role) {
        return role.includes('supervisor');
    }
    deriveDepartmentTokens(actor) {
        const tokens = new Set();
        const department = String(actor?.department?.name ?? actor?.department ?? '').trim();
        const role = this.getRoleName(actor);
        const canonical = resolveCanonicalDepartmentLabel(department) ??
            resolveCanonicalDepartmentLabel(role);
        if (canonical) {
            getCanonicalDepartmentAliases(canonical).forEach((alias) => {
                tokens.add(alias.toLowerCase());
            });
        }
        const addLooseTokens = (value) => {
            value
                .toLowerCase()
                .split(/[^a-z0-9]+/)
                .map((token) => token.trim())
                .filter((token) => token.length >= 2)
                .forEach((token) => tokens.add(token));
        };
        if (department) {
            addLooseTokens(department);
        }
        if (!canonical && role) {
            addLooseTokens(role);
        }
        return Array.from(tokens).filter(Boolean);
    }
    getGenericServiceAreaRegex() {
        return Array.from(GENERIC_SERVICE_AREAS).map((label) => new RegExp(`^${escapeRegex(label)}$`, 'i'));
    }
    hasMappedServiceArea(serviceArea) {
        const normalized = (serviceArea ?? '').trim().toLowerCase();
        if (!normalized)
            return false;
        return !GENERIC_SERVICE_AREAS.has(normalized);
    }
    matchesServiceAreaTokens(value, tokens) {
        const haystack = value.toLowerCase();
        return tokens.some((token) => haystack.includes(token.toLowerCase()));
    }
    buildListQuery(userId, options, actor) {
        const query = {};
        const requesterId = this.toObjectId(userId);
        const roleName = this.getRoleName(actor);
        const isActorAdmin = this.isAdminRole(roleName);
        const actorDepartmentTokens = this.deriveDepartmentTokens(actor);
        switch (options.role) {
            case 'requester':
                query.requester = requesterId;
                break;
            case 'resolver':
                query.resolver = requesterId;
                break;
            case 'unassigned':
                query.resolver = null;
                break;
            default:
                query.$or = [{ requester: requesterId }, { resolver: requesterId }];
                break;
        }
        if (options.supervisorScope) {
            const rawValues = Array.isArray(options.supervisorScope)
                ? options.supervisorScope
                : [options.supervisorScope];
            const resolverIds = rawValues
                .filter((value) => typeof value === 'string' && mongoose_2.Types.ObjectId.isValid(value))
                .map((value) => this.toObjectId(value));
            if (resolverIds.length) {
                query.$and = [
                    ...(query.$and ?? []),
                    { resolver: { $in: resolverIds } },
                ];
            }
        }
        if (options.status) {
            if (options.status === 'OPEN') {
                query.status = { $in: ['PENDING', 'ACCEPTED'] };
            }
            else if (options.status === 'CLOSED') {
                query.status = { $in: ['REJECTED', 'RESOLVED'] };
            }
            else {
                query.status = options.status;
            }
        }
        const isUnassignedRole = options.role === 'unassigned';
        if (isUnassignedRole && !isActorAdmin) {
            const scopedTokens = Array.from(new Set([
                ...normalizeDepartmentTokens(options.department).map((token) => token.toLowerCase()),
                ...actorDepartmentTokens,
            ])).filter(Boolean);
            const serviceAreaPatterns = [
                ...this.getGenericServiceAreaRegex(),
                ...scopedTokens.map((token) => new RegExp(escapeRegex(token), 'i')),
            ];
            if (serviceAreaPatterns.length) {
                query.$and = [
                    ...(query.$and ?? []),
                    { serviceArea: { $in: serviceAreaPatterns } },
                ];
            }
        }
        else {
            const departmentTokens = normalizeDepartmentTokens(options.department);
            if (departmentTokens.length) {
                const departmentConditions = departmentTokens.map((token) => ({
                    serviceArea: { $regex: escapeRegex(token), $options: 'i' },
                }));
                query.$and = [
                    ...(query.$and ?? []),
                    { $or: departmentConditions },
                ];
            }
        }
        return query;
    }
    async ensureAccess(request, userId, options) {
        if (this.isRequester(request, userId)) {
            return;
        }
        if (this.isResolver(request, userId)) {
            return;
        }
        const allowDepartmentScope = options?.allowDepartmentScope ?? false;
        if (allowDepartmentScope && !request.resolver) {
            if (!this.hasMappedServiceArea(request.serviceArea)) {
                return;
            }
            const actor = options?.actor ?? (await this.staffService.getById(String(userId)).catch(() => null));
            const roleName = this.getRoleName(actor);
            if (this.isAdminRole(roleName)) {
                return;
            }
            const departmentTokens = this.deriveDepartmentTokens(actor);
            const serviceAreaValue = String(request.serviceArea ?? '').toLowerCase();
            const requesterDepartment = String(request?.requester?.department?.name ?? request?.requester?.department ?? '').toLowerCase();
            if (this.matchesServiceAreaTokens(serviceAreaValue, departmentTokens)) {
                return;
            }
            if (requesterDepartment && this.matchesServiceAreaTokens(requesterDepartment, departmentTokens)) {
                return;
            }
            if (this.isSupervisorRole(roleName) && this.matchesServiceAreaTokens(serviceAreaValue, departmentTokens)) {
                return;
            }
        }
        throw new common_1.ForbiddenException('You do not have access to this request.');
    }
    isRequester(request, userId) {
        return request.requester &&
            String(request.requester) === String(userId);
    }
    isResolver(request, userId) {
        return request.resolver &&
            String(request.resolver) === String(userId);
    }
    toObjectId(value, field) {
        if (!mongoose_2.Types.ObjectId.isValid(value)) {
            throw new common_1.BadRequestException(`${field ?? 'value'} is not a valid identifier.`);
        }
        return new mongoose_2.Types.ObjectId(value);
    }
    buildRequestLink(id) {
        return `/service-requests/${id}`;
    }
    async hydrateRequest(request) {
        const plain = typeof request?.toJSON === 'function' ? request.toJSON() : request;
        const [requester, resolver, commentMap] = await Promise.all([
            this.fetchUserSummary(plain.requester),
            plain.resolver ? this.fetchUserSummary(plain.resolver) : Promise.resolve(null),
            this.fetchCommentAuthors(plain.comments ?? []),
        ]);
        const comments = plain.comments?.map((comment) => ({
            id: String(comment._id ?? comment.id ?? comment.createdAt ?? Date.now()),
            authorId: comment.author ? String(comment.author) : '',
            author: comment.author ? commentMap.get(String(comment.author)) ?? null : null,
            role: comment.role,
            message: comment.message,
            createdAt: comment.createdAt
                ? new Date(comment.createdAt).toISOString()
                : new Date().toISOString(),
            updatedAt: comment.updatedAt
                ? new Date(comment.updatedAt).toISOString()
                : new Date().toISOString(),
        })) ?? [];
        return {
            id: String(plain._id),
            title: plain.title,
            serviceArea: plain.serviceArea,
            description: plain.description ?? undefined,
            status: plain.status,
            requester,
            resolver,
            requestedAt: plain.createdAt
                ? new Date(plain.createdAt).toISOString()
                : new Date().toISOString(),
            acceptedAt: plain.acceptedAt ? new Date(plain.acceptedAt).toISOString() : null,
            resolvedAt: plain.resolvedAt ? new Date(plain.resolvedAt).toISOString() : null,
            ratedAt: plain.ratedAt ? new Date(plain.ratedAt).toISOString() : null,
            ratedBy: plain.ratedBy ? this.ensureStringId(plain.ratedBy) : null,
            ratingScore: typeof plain.ratingScore === 'number' ? Number(plain.ratingScore) : null,
            ratingComment: plain.ratingComment ?? null,
            attachment: plain.attachment ?? null,
            updatedAt: plain.updatedAt
                ? new Date(plain.updatedAt).toISOString()
                : new Date().toISOString(),
            comments,
        };
    }
    async hydrateRequestList(requests) {
        if (!requests.length) {
            return [];
        }
        const userIds = new Set();
        for (const request of requests) {
            if (request.requester) {
                userIds.add(String(request.requester));
            }
            if (request.resolver) {
                userIds.add(String(request.resolver));
            }
            (request.comments ?? []).forEach((comment) => {
                if (comment.author) {
                    userIds.add(String(comment.author));
                }
            });
        }
        const summaries = await this.fetchUserSummaries(Array.from(userIds));
        return requests.map((request) => {
            const comments = (request.comments ?? []).map((comment) => ({
                id: String(comment._id ?? comment.id ?? comment.createdAt ?? Date.now()),
                authorId: comment.author ? String(comment.author) : '',
                author: comment.author
                    ? summaries.get(String(comment.author)) ?? null
                    : null,
                role: comment.role,
                message: comment.message,
                createdAt: comment.createdAt
                    ? new Date(comment.createdAt).toISOString()
                    : new Date().toISOString(),
                updatedAt: comment.updatedAt
                    ? new Date(comment.updatedAt).toISOString()
                    : new Date().toISOString(),
            })) ?? [];
            return {
                id: this.getRequestId(request),
                title: request.title,
                serviceArea: request.serviceArea,
                description: request.description ?? undefined,
                status: request.status,
                requester: request.requester
                    ? summaries.get(String(request.requester)) ?? null
                    : null,
                resolver: request.resolver
                    ? summaries.get(String(request.resolver)) ?? null
                    : null,
                requestedAt: request.createdAt
                    ? new Date(request.createdAt).toISOString()
                    : new Date().toISOString(),
                acceptedAt: request.acceptedAt
                    ? new Date(request.acceptedAt).toISOString()
                    : null,
                resolvedAt: request.resolvedAt
                    ? new Date(request.resolvedAt).toISOString()
                    : null,
                ratedAt: request.ratedAt ? new Date(request.ratedAt).toISOString() : null,
                ratedBy: request.ratedBy ? this.ensureStringId(request.ratedBy) : null,
                ratingScore: typeof request.ratingScore === 'number'
                    ? Number(request.ratingScore)
                    : null,
                ratingComment: request.ratingComment ?? null,
                updatedAt: request.updatedAt
                    ? new Date(request.updatedAt).toISOString()
                    : new Date().toISOString(),
                comments,
            };
        });
    }
    async adminListRequests(options = {}) {
        const page = Math.max(options.page ?? 1, 1);
        const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);
        const skip = (page - 1) * limit;
        const query = {};
        if (options.status) {
            if (options.status === 'OPEN') {
                query.status = { $in: ['PENDING', 'ACCEPTED'] };
            }
            else if (options.status === 'CLOSED') {
                query.status = { $in: ['REJECTED', 'RESOLVED'] };
            }
            else {
                query.status = options.status;
            }
        }
        if (options.serviceArea) {
            query.serviceArea = { $regex: options.serviceArea, $options: 'i' };
        }
        if (options.requesterId) {
            if (!mongoose_2.Types.ObjectId.isValid(options.requesterId)) {
                throw new common_1.BadRequestException('requesterId is not a valid identifier.');
            }
            query.requester = this.toObjectId(options.requesterId);
        }
        if (options.resolverId) {
            if (!mongoose_2.Types.ObjectId.isValid(options.resolverId)) {
                throw new common_1.BadRequestException('resolverId is not a valid identifier.');
            }
            query.resolver = this.toObjectId(options.resolverId);
        }
        if (options.startDate || options.endDate) {
            const createdAt = {};
            if (options.startDate) {
                const start = new Date(options.startDate);
                if (Number.isNaN(start.getTime())) {
                    throw new common_1.BadRequestException('startDate is not a valid date.');
                }
                createdAt.$gte = start;
            }
            if (options.endDate) {
                const end = new Date(options.endDate);
                if (Number.isNaN(end.getTime())) {
                    throw new common_1.BadRequestException('endDate is not a valid date.');
                }
                createdAt.$lte = end;
            }
            query.createdAt = createdAt;
        }
        const [items, total] = await Promise.all([
            this.requestModel
                .find(query)
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.requestModel.countDocuments(query),
        ]);
        const data = await this.hydrateRequestList(items);
        return { data, total };
    }
    async fetchUserSummaries(userIds) {
        const map = new Map();
        await Promise.all(userIds.map(async (id) => {
            const summary = await this.fetchUserSummary(id);
            if (summary) {
                map.set(id, summary);
            }
        }));
        return map;
    }
    async fetchCommentAuthors(comments) {
        const ids = Array.from(new Set(comments
            .filter((comment) => comment?.author)
            .map((comment) => String(comment.author))));
        return this.fetchUserSummaries(ids);
    }
    async fetchUserSummary(id) {
        if (!id) {
            return null;
        }
        try {
            const user = await this.staffService.getById(String(id));
            if (!user) {
                return null;
            }
            const firstName = user?.firstName ?? '';
            const lastName = user?.lastName ?? '';
            const fullName = [firstName, lastName].filter((value) => value && value.trim()).join(' ') ||
                user?.email ||
                'Unknown user';
            const department = typeof user?.department === 'string'
                ? user.department
                : user?.department?.name;
            const role = typeof user?.role === 'string' ? user.role : user?.role?.name;
            const avatarUrl = user?.employeeInformation?.photo ??
                user?.employeeInformation?.passportPhoto ??
                user?.employeeInformation?.profileImage ??
                null;
            return {
                id: String(user?._id ?? id),
                fullName,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                email: user?.email ?? undefined,
                department: department ?? undefined,
                role: role ?? undefined,
                avatarUrl: avatarUrl ?? undefined,
            };
        }
        catch {
            return null;
        }
    }
    async notifyCounterparty(request, actorId, message, comment) {
        const requesterId = String(request.requester);
        const resolverId = request.resolver ? String(request.resolver) : null;
        if (resolverId && requesterId === resolverId) {
            return;
        }
        if (String(actorId) === requesterId && resolverId) {
            await this.noticeService.createNotice({
                userId: this.ensureStringId(resolverId),
                message,
                link: this.buildRequestLink(this.getRequestId(request)),
                type: 'service-request-comment',
            });
            await this.sendRequestEmail(resolverId, `New comment on service request: ${request.title}`, message, request, { comment });
        }
        else if (String(actorId) === resolverId) {
            await this.noticeService.createNotice({
                userId: this.ensureStringId(request.requester),
                message,
                link: this.buildRequestLink(this.getRequestId(request)),
                type: 'service-request-comment',
            });
            await this.sendRequestEmail(request.requester, `New comment on service request: ${request.title}`, message, request, { comment });
        }
    }
};
exports.ServiceRequestService = ServiceRequestService;
exports.ServiceRequestService = ServiceRequestService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(service_request_schema_1.ServiceRequest.name)),
    __param(3, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        user_service_1.StaffService,
        notice_service_1.NoticeService,
        mail_service_1.MailService])
], ServiceRequestService);
//# sourceMappingURL=service-request.service.js.map