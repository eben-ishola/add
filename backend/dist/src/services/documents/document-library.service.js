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
var DocumentLibraryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentLibraryService = void 0;
const common_1 = require("@nestjs/common");
const access_control_util_1 = require("../../utils/shared/access-control.util");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const document_library_schema_1 = require("../../schemas/document-library.schema");
const document_read_schema_1 = require("../../schemas/document-read.schema");
const user_schema_1 = require("../../schemas/user.schema");
let DocumentLibraryService = DocumentLibraryService_1 = class DocumentLibraryService {
    constructor(documentModel, documentReadModel, staffModel) {
        this.documentModel = documentModel;
        this.documentReadModel = documentReadModel;
        this.staffModel = staffModel;
        this.logger = new common_1.Logger(DocumentLibraryService_1.name);
        this.employeeDocumentCategory = 'Employee Documents';
    }
    async onModuleInit() {
        await this.ensureLegacyIndexes();
        await this.backfillCreatedBy();
    }
    async ensureLegacyIndexes() {
        if (!this.legacyIndexCheck) {
            this.legacyIndexCheck = (async () => {
                try {
                    const indexes = await this.documentModel.collection.indexes();
                    const legacyTextIndex = indexes.find((index) => index.key && index.key.tags === 'text');
                    if (legacyTextIndex) {
                        await this.documentModel.collection.dropIndex(legacyTextIndex.name);
                        this.logger.log(`Dropped legacy text index '${legacyTextIndex.name}' that referenced the tags array.`);
                    }
                }
                catch (error) {
                    this.logger.warn(`Unable to verify legacy DocumentLibrary indexes: ${error?.message ?? error}`);
                }
            })();
        }
        return this.legacyIndexCheck;
    }
    async backfillCreatedBy() {
        if (!this.createdByBackfill) {
            this.createdByBackfill = (async () => {
                try {
                    const docs = await this.documentModel
                        .find({
                        $and: [
                            {
                                $or: [
                                    { createdBy: { $exists: false } },
                                    { createdBy: null },
                                    { createdBy: '' },
                                ],
                            },
                            {
                                $or: [
                                    { createdById: { $exists: true } },
                                    { creatorId: { $exists: true } },
                                    { uploadedBy: { $exists: true } },
                                    { owner: { $exists: true } },
                                ],
                            },
                        ],
                    })
                        .select({ createdById: 1, creatorId: 1, uploadedBy: 1, owner: 1, category: 1 })
                        .lean()
                        .exec();
                    if (!docs.length)
                        return;
                    const updates = docs
                        .map((doc) => {
                        const direct = this.normalizeId(doc?.createdById) ??
                            this.normalizeId(doc?.creatorId) ??
                            this.normalizeId(doc?.uploadedBy);
                        let resolved = direct;
                        if (!resolved) {
                            const ownerId = this.normalizeId(doc?.owner);
                            if (ownerId && this.isEmployeeDocumentCategory(doc?.category) && this.isObjectIdString(ownerId)) {
                                resolved = ownerId;
                            }
                        }
                        if (!resolved)
                            return null;
                        return {
                            updateOne: {
                                filter: { _id: doc._id },
                                update: { $set: { createdBy: resolved } },
                            },
                        };
                    })
                        .filter(Boolean);
                    if (!updates.length)
                        return;
                    const result = await this.documentModel.bulkWrite(updates, { ordered: false });
                    const modified = result?.modifiedCount ?? 0;
                    if (modified) {
                        this.logger.log(`Backfilled createdBy on ${modified} document(s).`);
                    }
                }
                catch (error) {
                    this.logger.warn(`Unable to backfill createdBy for DocumentLibrary: ${error?.message ?? error}`);
                }
            })();
        }
        return this.createdByBackfill;
    }
    normalizeAccess(value) {
        const allowedScopes = ['all', 'entities', 'units', 'users'];
        const scope = allowedScopes.includes(value?.scope ?? 'all')
            ? (value?.scope ?? 'all')
            : 'all';
        const normaliseList = (items) => Array.from(new Set((items ?? [])
            .map((item) => (typeof item === 'string' ? item.trim() : ''))
            .filter((item) => item.length)));
        return {
            scope,
            entityIds: scope === 'entities' ? normaliseList(value?.entityIds) : [],
            unitIds: scope === 'units' ? normaliseList(value?.unitIds) : [],
            userIds: scope === 'users' ? normaliseList(value?.userIds) : [],
        };
    }
    normalizeId(value) {
        if (!value)
            return null;
        if (typeof value === 'string') {
            const trimmed = value.trim();
            return trimmed.length ? trimmed : null;
        }
        if (typeof value === 'object') {
            if (typeof value?.toString === 'function') {
                const resolved = String(value).trim();
                if (resolved && resolved !== '[object Object]')
                    return resolved;
            }
            const nestedSource = value?._id ?? value?.id;
            if (nestedSource && nestedSource !== value) {
                const nested = this.normalizeId(nestedSource);
                if (nested)
                    return nested;
            }
            return null;
        }
        if (typeof value?.toString === 'function') {
            const resolved = String(value).trim();
            return resolved && resolved !== '[object Object]' ? resolved : null;
        }
        return null;
    }
    isObjectIdString(value) {
        return Boolean(value && /^[0-9a-fA-F]{24}$/.test(value));
    }
    normalizeOwnerId(value) {
        return this.normalizeId(value) ?? '';
    }
    normalizeUserId(user) {
        const id = user?._id ?? user?.id ?? user?.userId ?? user?.sub;
        return id ? String(id) : undefined;
    }
    isEmployeeDocumentCategory(category) {
        if (!category)
            return false;
        return category.trim().toLowerCase() === this.employeeDocumentCategory.toLowerCase();
    }
    isPolicyDocumentCategory(category) {
        if (!category)
            return false;
        return /^policy(?:\s+documents?)?$/i.test(category.trim());
    }
    policyDocumentCategoryFilter() {
        return {
            category: { $regex: /^policy(?:\s+documents?)?$/i },
        };
    }
    resolveDocumentVersion(record) {
        const direct = Number(record?.version ?? record?.currentVersion);
        if (Number.isFinite(direct) && direct > 0)
            return direct;
        const versions = Array.isArray(record?.versions) ? record.versions : [];
        const latest = versions.reduce((max, entry) => {
            const version = Number(entry?.version);
            return Number.isFinite(version) && version > max ? version : max;
        }, 0);
        return latest || 1;
    }
    isPassportDocument(record) {
        if (!record)
            return false;
        const tags = Array.isArray(record?.tags) ? record.tags : [];
        const fields = [record.title, record.description, ...tags]
            .filter((value) => typeof value === 'string' && value.trim().length);
        return fields.some((value) => /passport/i.test(value));
    }
    ownerMatchesUser(owner, userIds) {
        if (!owner || !userIds.length)
            return false;
        const normalizedOwner = this.normalizeOwnerId(owner);
        if (!normalizedOwner)
            return false;
        if (userIds.includes(normalizedOwner))
            return true;
        const lowerOwner = normalizedOwner.toLowerCase();
        return userIds.some((value) => value.toLowerCase() === lowerOwner);
    }
    async resolveEmployeeOwnerId(owner) {
        const normalized = this.normalizeOwnerId(owner);
        if (!normalized)
            return null;
        if (this.isObjectIdString(normalized))
            return normalized;
        const escaped = this.escapeRegex(normalized);
        const matcher = new RegExp(`^${escaped}$`, 'i');
        const staff = await this.staffModel
            .findOne({ $or: [{ staffId: matcher }, { email: matcher }] })
            .select({ _id: 1 })
            .lean()
            .exec();
        return staff?._id ? String(staff._id) : null;
    }
    async attachEmployeeDocument(record, user) {
        try {
            if (!record || !this.isEmployeeDocumentCategory(record.category)) {
                return;
            }
            const ownerId = await this.resolveEmployeeOwnerId(record.owner);
            if (!ownerId)
                return;
            const ownerValue = this.normalizeOwnerId(record.owner);
            if (ownerValue && ownerValue !== ownerId) {
                await this.documentModel
                    .updateOne({ _id: record._id }, { $set: { owner: ownerId } })
                    .exec();
            }
            const uploadedAt = record?.createdAt ?? record?.updatedAt ?? new Date();
            const entry = {
                documentId: record._id?.toString(),
                title: record.title,
                category: record.category,
                description: record.description,
                fileUrl: record.fileUrl,
                fileType: record.fileType,
                fileSize: record.fileSize,
                uploadedAt,
                uploadedBy: this.normalizeUserId(user),
            };
            const update = {
                $push: { 'employeeInformation.documents': entry },
            };
            if (record.fileUrl && this.isPassportDocument(record)) {
                update.$set = {
                    'employeeInformation.photo': record.fileUrl,
                    'employeeInformation.passportPhoto': record.fileUrl,
                    'employeeInformation.profileImage': record.fileUrl,
                };
            }
            await this.staffModel.findByIdAndUpdate(ownerId, update).exec();
        }
        catch (error) {
            this.logger.warn(`Failed to attach employee document metadata: ${error?.message ?? error}`);
        }
    }
    async detachEmployeeDocument(record) {
        try {
            if (!record || !this.isEmployeeDocumentCategory(record.category)) {
                return;
            }
            const ownerId = await this.resolveEmployeeOwnerId(record.owner);
            if (!ownerId)
                return;
            const documentId = record._id?.toString();
            if (!documentId)
                return;
            await this.staffModel
                .findByIdAndUpdate(ownerId, {
                $pull: { 'employeeInformation.documents': { documentId } },
            })
                .exec();
            if (!record.fileUrl)
                return;
            const staff = await this.staffModel
                .findById(ownerId)
                .select({ employeeInformation: 1 })
                .lean()
                .exec();
            const info = staff?.employeeInformation ?? {};
            const updates = {};
            if (info?.photo === record.fileUrl) {
                updates['employeeInformation.photo'] = null;
            }
            if (info?.passportPhoto === record.fileUrl) {
                updates['employeeInformation.passportPhoto'] = null;
            }
            if (info?.profileImage === record.fileUrl) {
                updates['employeeInformation.profileImage'] = null;
            }
            if (Object.keys(updates).length) {
                await this.staffModel.findByIdAndUpdate(ownerId, { $set: updates }).exec();
            }
        }
        catch (error) {
            this.logger.warn(`Failed to detach employee document metadata: ${error?.message ?? error}`);
        }
    }
    extractPermissionNames(user) {
        const permissions = new Set();
        const register = (source) => {
            if (!source)
                return;
            const list = Array.isArray(source) ? source : [source];
            list.forEach((item) => {
                if (typeof item === 'string' && item.trim()) {
                    permissions.add(item.trim().toLowerCase());
                }
                else if (typeof item?.name === 'string' && item.name.trim()) {
                    permissions.add(item.name.trim().toLowerCase());
                }
            });
        };
        register(user?.permissions);
        register(user?.role?.permissions);
        (Array.isArray(user?.roles) ? user.roles : []).forEach((role) => register(role?.permissions));
        (Array.isArray(user?.additionalRoles) ? user.additionalRoles : []).forEach((assignment) => register(assignment?.role?.permissions ?? assignment?.permissions));
        return permissions;
    }
    isDocumentManager(user) {
        const permissions = this.extractPermissionNames(user);
        if (permissions.has('all'))
            return true;
        return (permissions.has('upload documents') ||
            permissions.has('delete documents'));
    }
    extractRoleNames(roleLike) {
        const names = [];
        const register = (value) => {
            if (typeof value === 'string' && value.trim()) {
                names.push(value.trim().toLowerCase());
            }
        };
        if (!roleLike)
            return names;
        if (typeof roleLike === 'string') {
            register(roleLike);
            return names;
        }
        register(roleLike?.name);
        register(roleLike?.label);
        if (roleLike?.role) {
            register(roleLike?.role?.name);
            register(roleLike?.role?.label);
        }
        return names;
    }
    isSuperAdmin(user) {
        const permissions = this.extractPermissionNames(user);
        if (permissions.has('all'))
            return true;
        for (const name of permissions) {
            if (DocumentLibraryService_1.SUPER_ADMIN_ROLE_NAMES.has(name)) {
                return true;
            }
        }
        const additional = Array.isArray(user?.additionalRoles)
            ? user.additionalRoles.map((assignment) => assignment?.role ?? assignment)
            : [];
        const sources = [
            user?.role,
            ...(Array.isArray(user?.roles) ? user.roles : []),
            ...additional,
        ];
        return sources.some((roleLike) => this.extractRoleNames(roleLike).some((name) => DocumentLibraryService_1.SUPER_ADMIN_ROLE_NAMES.has(name)));
    }
    resolveCreatorId(user) {
        return this.normalizeId(user?._id ?? user?.id ?? user?.userId);
    }
    resolveDocumentCreatorId(doc) {
        const direct = this.normalizeId(doc?.createdBy) ??
            this.normalizeId(doc?.createdById) ??
            this.normalizeId(doc?.creatorId) ??
            this.normalizeId(doc?.uploadedBy);
        if (direct)
            return direct;
        const ownerId = this.normalizeId(doc?.owner);
        if (ownerId && this.isEmployeeDocumentCategory(doc?.category) && this.isObjectIdString(ownerId)) {
            return ownerId;
        }
        return null;
    }
    isCreator(user, doc) {
        const userId = this.resolveCreatorId(user);
        if (!userId)
            return false;
        const creatorId = this.resolveDocumentCreatorId(doc);
        return Boolean(creatorId && creatorId === userId);
    }
    isPrivilegedDocumentActor(user) {
        return this.isDocumentManager(user) || this.isSuperAdmin(user);
    }
    buildVisibilityConditions(context) {
        const conditions = [
            ...this.buildAccessConditions('viewAccess', context),
            ...this.buildAccessConditions('editAccess', context),
        ];
        if (context.userIds.length) {
            conditions.unshift({
                owner: { $in: context.userIds },
                category: { $regex: new RegExp(`^${this.escapeRegex(this.employeeDocumentCategory)}$`, 'i') },
            });
            conditions.unshift({ createdBy: { $in: context.userIds } });
        }
        return conditions;
    }
    resolveAccessContext(user) {
        const userId = this.normalizeId(user?._id ?? user?.id ?? user?.userId ?? user?.sub);
        const userIds = this.resolveUserIdentifiers(user);
        if (userId && !userIds.includes(userId)) {
            userIds.unshift(userId);
        }
        const entityId = this.normalizeId(user?.entity?._id ?? user?.entity);
        const viewerIds = Array.isArray(user?.entityViewer)
            ? user.entityViewer.map((value) => this.normalizeId(value)).filter(Boolean)
            : [];
        const unitId = this.normalizeId(user?.department?._id ?? user?.department);
        return {
            userId,
            userIds,
            entityIds: Array.from(new Set([entityId, ...viewerIds].filter(Boolean))),
            unitIds: unitId ? [unitId] : [],
        };
    }
    matchesAccess(access, context) {
        const resolved = this.normalizeAccess(access);
        if (resolved.scope === 'all')
            return true;
        if (resolved.scope === 'entities') {
            return context.entityIds.some((id) => resolved.entityIds.includes(id));
        }
        if (resolved.scope === 'units') {
            return context.unitIds.some((id) => resolved.unitIds.includes(id));
        }
        if (resolved.scope === 'users') {
            return context.userIds.some((id) => resolved.userIds.includes(id));
        }
        return false;
    }
    buildAccessConditions(accessKey, context) {
        const conditions = [
            { [`${accessKey}.scope`]: 'all' },
        ];
        if (context.entityIds.length) {
            conditions.push({
                [`${accessKey}.scope`]: 'entities',
                [`${accessKey}.entityIds`]: { $in: context.entityIds },
            });
        }
        if (context.unitIds.length) {
            conditions.push({
                [`${accessKey}.scope`]: 'units',
                [`${accessKey}.unitIds`]: { $in: context.unitIds },
            });
        }
        if (context.userIds.length) {
            conditions.push({
                [`${accessKey}.scope`]: 'users',
                [`${accessKey}.userIds`]: { $in: context.userIds },
            });
        }
        return conditions;
    }
    canViewDocument(user, doc) {
        if (this.isSuperAdmin(user))
            return true;
        const context = this.resolveAccessContext(user);
        if (this.isEmployeeDocumentCategory(doc?.category) &&
            this.ownerMatchesUser(doc?.owner, context.userIds)) {
            return true;
        }
        if (this.isCreator(user, doc))
            return true;
        const viewAccess = doc?.viewAccess;
        const editAccess = doc?.editAccess ?? viewAccess;
        return this.matchesAccess(viewAccess, context) || this.matchesAccess(editAccess, context);
    }
    canEditDocument(user, doc) {
        if (this.isCreator(user, doc))
            return true;
        const context = this.resolveAccessContext(user);
        const editAccess = doc?.editAccess ?? doc?.viewAccess;
        return this.matchesAccess(editAccess, context);
    }
    escapeRegex(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    normaliseTags(tags) {
        if (!Array.isArray(tags)) {
            return [];
        }
        return Array.from(new Set(tags
            .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
            .filter((tag) => tag.length > 0)));
    }
    expandCaseVariants(value) {
        const trimmed = value.trim();
        if (!trimmed)
            return [];
        const lower = trimmed.toLowerCase();
        const upper = trimmed.toUpperCase();
        return Array.from(new Set([trimmed, lower, upper]));
    }
    resolveUserIdentifiers(user) {
        const candidates = [
            this.normalizeId(user?._id ?? user?.id ?? user?.userId),
            this.normalizeId(user?.staffId),
            this.normalizeId(user?.email),
        ];
        const resolved = new Set();
        candidates.forEach((candidate) => {
            if (!candidate)
                return;
            this.expandCaseVariants(candidate).forEach((value) => resolved.add(value));
        });
        return Array.from(resolved);
    }
    buildFilters(query) {
        const filters = {};
        const categoryValue = (query.category ?? '').trim();
        if (categoryValue) {
            filters.category = { $regex: new RegExp(`^${this.escapeRegex(categoryValue)}$`, 'i') };
        }
        const ownerValue = (query.owner ?? '').trim();
        if (ownerValue) {
            filters.owner = { $regex: new RegExp(`^${this.escapeRegex(ownerValue)}$`, 'i') };
        }
        if (query.featured !== undefined) {
            filters.featured = query.featured === 'true';
        }
        if (query.excludeEmployeeDocuments === 'true' || query.excludeEmployeeDocuments === '1') {
            const normalizedCategory = categoryValue.toLowerCase();
            const employeeCategory = this.employeeDocumentCategory.toLowerCase();
            if (normalizedCategory === employeeCategory) {
                filters._id = { $exists: false };
            }
            else if (!categoryValue) {
                filters.category = {
                    $not: new RegExp(`^${this.escapeRegex(this.employeeDocumentCategory)}$`, 'i'),
                };
            }
        }
        if (query.search) {
            filters.$text = { $search: query.search };
        }
        return filters;
    }
    async listDocuments(user, query, page = 1, limit = 10) {
        const safePage = Math.max(Number(page) || 1, 1);
        const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
        const skip = (safePage - 1) * safeLimit;
        const filters = this.buildFilters(query);
        const isSuperAdmin = this.isSuperAdmin(user);
        const accessContext = this.resolveAccessContext(user);
        const accessConditions = this.buildVisibilityConditions(accessContext);
        const accessFilter = !isSuperAdmin && accessConditions.length ? { $or: accessConditions } : null;
        const effectiveFilters = accessFilter ? { $and: [filters, accessFilter] } : filters;
        const [data, total] = await Promise.all([
            this.documentModel
                .find(effectiveFilters)
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(safeLimit)
                .lean()
                .exec(),
            this.documentModel.countDocuments(effectiveFilters).exec(),
        ]);
        const creatorIds = Array.from(new Set(data
            .map((doc) => this.resolveDocumentCreatorId(doc))
            .filter((value) => Boolean(value))
            .filter((value) => this.isObjectIdString(value))));
        const creatorMap = new Map();
        if (creatorIds.length) {
            const creators = await this.staffModel
                .find({ _id: { $in: creatorIds } })
                .select({ firstName: 1, lastName: 1, email: 1 })
                .lean()
                .exec();
            creators.forEach((creator) => {
                const name = [creator?.firstName, creator?.lastName].filter(Boolean).join(' ').trim();
                const label = name || creator?.email || String(creator?._id ?? '');
                if (label) {
                    creatorMap.set(String(creator?._id ?? ''), label);
                }
            });
        }
        const includeReadStatus = query.includeReadStatus === 'true' || query.includeReadStatus === '1';
        const userId = this.normalizeUserId(user);
        const readRecordMap = new Map();
        if (includeReadStatus && userId && this.isObjectIdString(userId) && data.length) {
            const ids = data.map((doc) => doc._id).filter(Boolean);
            const readRecords = await this.documentReadModel
                .find({ userId, documentId: { $in: ids } })
                .select({ documentId: 1, version: 1, readAt: 1 })
                .lean()
                .exec();
            readRecords.forEach((record) => {
                readRecordMap.set(`${String(record.documentId)}:${Number(record.version) || 1}`, record);
            });
        }
        const enriched = data.map((doc) => {
            const creatorId = this.resolveDocumentCreatorId(doc);
            const createdByName = creatorId ? creatorMap.get(creatorId) : undefined;
            const version = this.resolveDocumentVersion(doc);
            const readRecord = readRecordMap.get(`${String(doc?._id)}:${version}`);
            return {
                ...doc,
                createdBy: creatorId ?? doc?.createdBy,
                createdByName,
                ...(includeReadStatus
                    ? {
                        version,
                        read: Boolean(readRecord),
                        readAt: readRecord?.readAt,
                    }
                    : {}),
            };
        });
        return {
            data: enriched,
            total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.ceil(total / safeLimit) || 1,
        };
    }
    async getDocument(user, id) {
        const doc = await this.documentModel.findById(id).lean().exec();
        if (!doc) {
            throw new common_1.NotFoundException('Document not found');
        }
        if (!this.canViewDocument(user, doc)) {
            throw new common_1.ForbiddenException('You do not have access to view this document.');
        }
        return doc;
    }
    async listUnreadPolicyDocuments(user, limit = 50) {
        const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
        const userId = this.normalizeUserId(user);
        if (!userId || !this.isObjectIdString(userId)) {
            return { data: [], total: 0, limit: safeLimit };
        }
        const isSuperAdmin = this.isSuperAdmin(user);
        const accessContext = this.resolveAccessContext(user);
        const accessConditions = this.buildVisibilityConditions(accessContext);
        const accessFilter = !isSuperAdmin && accessConditions.length ? { $or: accessConditions } : null;
        const policyFilter = this.policyDocumentCategoryFilter();
        const effectiveFilters = accessFilter ? { $and: [policyFilter, accessFilter] } : policyFilter;
        const documents = await this.documentModel
            .find(effectiveFilters)
            .sort({ updatedAt: -1 })
            .limit(200)
            .lean()
            .exec();
        if (!documents.length) {
            return { data: [], total: 0, limit: safeLimit };
        }
        const ids = documents.map((doc) => doc._id).filter(Boolean);
        const readRecords = await this.documentReadModel
            .find({ userId, documentId: { $in: ids } })
            .select({ documentId: 1, version: 1 })
            .lean()
            .exec();
        const readVersions = new Set(readRecords.map((record) => `${String(record.documentId)}:${Number(record.version) || 1}`));
        const unread = documents.filter((doc) => {
            const version = this.resolveDocumentVersion(doc);
            return !readVersions.has(`${String(doc._id)}:${version}`);
        });
        return {
            data: unread.slice(0, safeLimit).map((doc) => ({
                ...doc,
                version: this.resolveDocumentVersion(doc),
            })),
            total: unread.length,
            limit: safeLimit,
        };
    }
    async markDocumentRead(user, id) {
        const userId = this.normalizeUserId(user);
        if (!userId || !this.isObjectIdString(userId)) {
            throw new common_1.BadRequestException('Unable to resolve the current user.');
        }
        const doc = await this.documentModel.findById(id).lean().exec();
        if (!doc) {
            throw new common_1.NotFoundException('Document not found');
        }
        if (!this.canViewDocument(user, doc)) {
            throw new common_1.ForbiddenException('You do not have access to view this document.');
        }
        const version = this.resolveDocumentVersion(doc);
        const readAt = new Date();
        await this.documentReadModel
            .updateOne({ documentId: doc._id, userId, version }, { $set: { readAt }, $setOnInsert: { documentId: doc._id, userId, version } }, { upsert: true })
            .exec();
        return { read: true, documentId: String(doc._id), version, readAt };
    }
    assertCanCreateDocument(user, payload) {
        if (this.isPrivilegedDocumentActor(user))
            return;
        const category = String(payload?.category ?? '').trim().toLowerCase();
        const self = this.resolveCreatorId(user);
        const owner = this.normalizeId(payload?.owner);
        if (category === this.employeeDocumentCategory.toLowerCase() &&
            self &&
            owner === self) {
            return;
        }
        throw new common_1.ForbiddenException('You do not have permission to upload documents.');
    }
    async createDocument(user, payload, options) {
        if (!options?.alreadyAuthorized) {
            this.assertCanCreateDocument(user, payload);
        }
        if (!payload.title || !payload.category) {
            throw new common_1.BadRequestException('Title and category are required');
        }
        const incomingVersioning = payload.versioning === true || payload.versioning === 'true';
        if (incomingVersioning) {
            const title = payload.title.trim();
            const category = payload.category.trim();
            const existing = await this.documentModel
                .findOne({ title: new RegExp(`^${this.escapeRegex(title)}$`, 'i'), category })
                .exec();
            if (existing) {
                return this.updateDocument(user, existing._id.toString(), {
                    ...payload,
                    versioning: true,
                });
            }
        }
        const tags = this.normaliseTags(payload.tags);
        const creatorId = this.resolveCreatorId(user);
        const rawOwnerId = this.normalizeId(payload.owner);
        const resolvedOwnerId = rawOwnerId && this.isEmployeeDocumentCategory(payload.category)
            ? (await this.resolveEmployeeOwnerId(rawOwnerId)) ?? rawOwnerId
            : rawOwnerId;
        const ownerId = resolvedOwnerId ?? rawOwnerId;
        const defaultUserIds = Array.from(new Set([creatorId, ownerId].filter((value) => Boolean(value))));
        const defaultAccess = creatorId
            ? { scope: 'users', entityIds: [], unitIds: [], userIds: defaultUserIds }
            : this.normalizeAccess();
        const viewAccess = payload.viewAccess ? this.normalizeAccess(payload.viewAccess) : defaultAccess;
        const downloadAccess = payload.downloadAccess ? this.normalizeAccess(payload.downloadAccess) : viewAccess;
        const editAccess = payload.editAccess ? this.normalizeAccess(payload.editAccess) : viewAccess;
        const nextVersion = Number.isFinite(payload.version) && payload.version ? payload.version : 1;
        const versionEntry = {
            version: nextVersion,
            fileUrl: payload.fileUrl,
            fileType: payload.fileType,
            fileSize: payload.fileSize,
            updatedAt: new Date(),
        };
        const record = new this.documentModel({
            ...payload,
            owner: ownerId ?? undefined,
            createdBy: creatorId ?? undefined,
            version: nextVersion,
            versions: payload.versions?.length ? payload.versions : [versionEntry],
            tags,
            tagsSearch: tags.join(' '),
            viewAccess,
            downloadAccess,
            editAccess,
        });
        const saved = await record.save();
        await this.attachEmployeeDocument(saved, user);
        return saved;
    }
    canFileScannedDocuments(user) {
        return this.isSuperAdmin(user) || (0, access_control_util_1.userIsHrDepartment)(user);
    }
    assertCanFileScannedDocuments(user) {
        if (!this.canFileScannedDocuments(user)) {
            throw new common_1.ForbiddenException('Only HR staff and administrators can file a scanned document against a staff profile.');
        }
    }
    describeScannedDocumentTarget(staff) {
        const name = [staff?.firstName, staff?.middleName, staff?.lastName]
            .map((part) => (typeof part === 'string' ? part.trim() : ''))
            .filter(Boolean)
            .join(' ');
        const departmentName = typeof staff?.department === 'object' && staff?.department !== null
            ? staff.department.name
            : undefined;
        const entityName = typeof staff?.entity === 'object' && staff?.entity !== null
            ? staff.entity.name ?? staff.entity.short
            : undefined;
        return {
            staffId: String(staff?.staffId ?? '').trim(),
            name: name || 'Unnamed staff record',
            department: departmentName ? String(departmentName) : undefined,
            entity: entityName ? String(entityName) : undefined,
            status: staff?.status ? String(staff.status) : undefined,
        };
    }
    async findStaffByStaffId(staffId) {
        const normalized = typeof staffId === 'string' ? staffId.trim() : '';
        if (!normalized) {
            throw new common_1.BadRequestException('A staff ID is required.');
        }
        const matcher = new RegExp(`^${this.escapeRegex(normalized)}$`, 'i');
        const staff = await this.staffModel
            .findOne({ staffId: matcher })
            .select({
            staffId: 1,
            firstName: 1,
            middleName: 1,
            lastName: 1,
            department: 1,
            entity: 1,
            status: 1,
        })
            .populate([
            { path: 'department', select: 'name' },
            { path: 'entity', select: 'name short' },
        ])
            .lean()
            .exec();
        if (!staff?._id) {
            throw new common_1.NotFoundException(`No staff record matches staff ID "${normalized}".`);
        }
        return staff;
    }
    buildScannedDocumentTitle(staffId, now = new Date()) {
        const stamp = now.toISOString().slice(0, 10);
        return `Scanned document ${staffId} ${stamp}`.replace(/\s+/g, ' ').trim();
    }
    async lookupStaffForScannedDocument(user, staffId) {
        this.assertCanFileScannedDocuments(user);
        const staff = await this.findStaffByStaffId(staffId);
        return this.describeScannedDocumentTarget(staff);
    }
    async createScannedDocument(user, payload) {
        this.assertCanFileScannedDocuments(user);
        if (!payload?.fileUrl) {
            throw new common_1.BadRequestException('A scanned PDF is required.');
        }
        const staff = await this.findStaffByStaffId(payload.staffId);
        const target = this.describeScannedDocumentTarget(staff);
        const title = typeof payload.title === 'string' && payload.title.trim()
            ? payload.title.trim()
            : this.buildScannedDocumentTitle(target.staffId);
        const description = typeof payload.description === 'string' && payload.description.trim()
            ? payload.description.trim()
            : undefined;
        const pageCount = Number(payload.pageCount);
        const record = await this.createDocument(user, {
            title,
            category: this.employeeDocumentCategory,
            owner: String(staff._id),
            description,
            fileUrl: payload.fileUrl,
            fileType: payload.fileType,
            fileSize: payload.fileSize,
            tags: ['scanned'],
        }, { alreadyAuthorized: true });
        return {
            documentId: String(record?._id ?? ''),
            title,
            category: this.employeeDocumentCategory,
            fileUrl: payload.fileUrl,
            pageCount: Number.isFinite(pageCount) && pageCount > 0
                ? Math.trunc(pageCount)
                : undefined,
            staff: target,
        };
    }
    async updateDocument(user, id, updates) {
        const record = await this.documentModel.findById(id).exec();
        if (!record) {
            throw new common_1.NotFoundException('Document not found');
        }
        if ('createdBy' in updates) {
            delete updates.createdBy;
        }
        if (!this.isPrivilegedDocumentActor(user)) {
            throw new common_1.ForbiddenException('Only document managers or administrators can update documents. Please contact HR to request this change through the approval process.');
        }
        const canEdit = this.canEditDocument(user, record);
        const isAccessUpdate = Boolean(updates.viewAccess || updates.downloadAccess || updates.editAccess);
        const canManageAccess = canEdit || this.isDocumentManager(user) || this.isSuperAdmin(user);
        const nonAccessKeys = Object.keys(updates).filter((key) => !['viewAccess', 'downloadAccess', 'editAccess'].includes(key));
        if (isAccessUpdate && !canManageAccess) {
            throw new common_1.ForbiddenException('You do not have permission to update document access.');
        }
        if (nonAccessKeys.length && !canEdit) {
            throw new common_1.ForbiddenException('You do not have permission to edit this document.');
        }
        if (updates.viewAccess) {
            record.viewAccess = this.normalizeAccess(updates.viewAccess);
            delete updates.viewAccess;
        }
        if (updates.downloadAccess) {
            record.downloadAccess = this.normalizeAccess(updates.downloadAccess);
            delete updates.downloadAccess;
        }
        if (updates.editAccess) {
            record.editAccess = this.normalizeAccess(updates.editAccess);
            delete updates.editAccess;
        }
        if (updates.tags !== undefined) {
            const tags = this.normaliseTags(updates.tags);
            record.tags = tags;
            record.tagsSearch = tags.join(' ');
            delete updates.tags;
        }
        const incomingVersioning = updates?.versioning === true || updates?.versioning === 'true';
        if (incomingVersioning && (updates.fileUrl || updates.fileType || updates.fileSize)) {
            const nextVersion = (record.version ?? 1) + 1;
            record.version = nextVersion;
            const history = Array.isArray(record.versions) ? record.versions : [];
            history.push({
                version: nextVersion,
                fileUrl: updates.fileUrl,
                fileType: updates.fileType,
                fileSize: updates.fileSize,
                updatedAt: new Date(),
            });
            record.versions = history;
        }
        Object.assign(record, updates);
        return record.save();
    }
    async deleteDocument(user, id) {
        const record = await this.documentModel.findById(id).exec();
        if (!record) {
            throw new common_1.NotFoundException('Document not found');
        }
        if (!this.isPrivilegedDocumentActor(user)) {
            throw new common_1.ForbiddenException('Only document managers or administrators can delete documents. Please contact HR to request removal through the approval process.');
        }
        await record.deleteOne();
        await this.detachEmployeeDocument(record);
        return { deleted: true };
    }
    async getCategories(user, excludeEmployeeDocuments) {
        const isSuperAdmin = this.isSuperAdmin(user);
        const accessContext = this.resolveAccessContext(user);
        const accessConditions = this.buildVisibilityConditions(accessContext);
        const matchConditions = [];
        if (!isSuperAdmin && accessConditions.length) {
            matchConditions.push({ $or: accessConditions });
        }
        if (excludeEmployeeDocuments === 'true' || excludeEmployeeDocuments === '1') {
            matchConditions.push({
                category: { $not: new RegExp(`^${this.escapeRegex(this.employeeDocumentCategory)}$`, 'i') },
            });
        }
        const matchStage = matchConditions.length ? { $match: { $and: matchConditions } } : null;
        const pipeline = matchStage
            ? [matchStage, { $group: { _id: '$category', total: { $sum: 1 } } }]
            : [{ $group: { _id: '$category', total: { $sum: 1 } } }];
        const categories = await this.documentModel
            .aggregate(pipeline)
            .exec();
        return categories.map((item) => ({
            category: item._id,
            total: item.total,
        }));
    }
};
exports.DocumentLibraryService = DocumentLibraryService;
DocumentLibraryService.SUPER_ADMIN_ROLE_NAMES = access_control_util_1.SUPER_ADMIN_ROLE_NAME_SET;
exports.DocumentLibraryService = DocumentLibraryService = DocumentLibraryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(document_library_schema_1.DocumentLibrary.name)),
    __param(1, (0, mongoose_1.InjectModel)(document_read_schema_1.DocumentRead.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], DocumentLibraryService);
//# sourceMappingURL=document-library.service.js.map