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
var TransportAllowanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportAllowanceService = void 0;
const common_1 = require("@nestjs/common");
const access_control_util_1 = require("../../utils/shared/access-control.util");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const transport_allowance_schema_1 = require("../../schemas/transport-allowance.schema");
const transport_allowance_setting_schema_1 = require("../../schemas/transport-allowance-setting.schema");
const department_schema_1 = require("../../schemas/department.schema");
const role_schema_1 = require("../../schemas/role.schema");
const subsidiary_schema_1 = require("../../schemas/subsidiary.schema");
const transport_workflow_schema_1 = require("../../schemas/transport-workflow.schema");
const transport_allowance_approval_schema_1 = require("../../schemas/transport-allowance-approval.schema");
const notice_service_1 = require("../comms/notice.service");
const workflow_notifier_service_1 = require("../comms/workflow-notifier.service");
const user_schema_1 = require("../../schemas/user.schema");
const branch_schema_1 = require("../../schemas/branch.schema");
const access_control_util_2 = require("../../utils/shared/access-control.util");
let TransportAllowanceService = TransportAllowanceService_1 = class TransportAllowanceService {
    constructor(transportModel, transportSettingModel, departmentModel, roleModel, subsidiaryModel, transportWorkflowModel, transportApprovalModel, userModel, branchModel, noticeService, workflowNotifier) {
        this.transportModel = transportModel;
        this.transportSettingModel = transportSettingModel;
        this.departmentModel = departmentModel;
        this.roleModel = roleModel;
        this.subsidiaryModel = subsidiaryModel;
        this.transportWorkflowModel = transportWorkflowModel;
        this.transportApprovalModel = transportApprovalModel;
        this.userModel = userModel;
        this.branchModel = branchModel;
        this.noticeService = noticeService;
        this.workflowNotifier = workflowNotifier;
    }
    async buildBranchByLowerName() {
        const branches = await this.branchModel
            .find({})
            .select('_id name gl')
            .lean()
            .exec();
        const map = new Map();
        for (const b of branches) {
            const key = String(b?.name ?? '').trim().toLowerCase();
            if (key) {
                map.set(key, { branchId: b._id, name: b.name ?? '', gl: b.gl ?? '' });
            }
        }
        return map;
    }
    async onModuleInit() {
        try {
            const col = this.transportSettingModel.collection;
            const indexes = await col.indexes();
            const stale = indexes.find((idx) => idx.name === 'entity_1_department_1_role_1_frequency_1');
            if (stale) {
                await col.dropIndex('entity_1_department_1_role_1_frequency_1');
                console.log('Dropped stale index: entity_1_department_1_role_1_frequency_1');
            }
        }
        catch {
        }
    }
    normalizeObjectId(value, label) {
        const raw = value?._id ?? value?.id ?? value ?? '';
        const normalized = String(raw ?? '').trim();
        if (!normalized || !mongoose_2.Types.ObjectId.isValid(normalized)) {
            throw new common_1.BadRequestException(`${label} is required.`);
        }
        return new mongoose_2.Types.ObjectId(normalized);
    }
    toNumber(value, fallback = 0) {
        if (value === null || value === undefined || value === '')
            return fallback;
        const parsed = typeof value === 'number' ? value : Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    normalizeAmount(value) {
        const parsed = this.toNumber(value, Number.NaN);
        if (!Number.isFinite(parsed) || parsed < 0) {
            throw new common_1.BadRequestException('Amount must be a non-negative number.');
        }
        return parsed;
    }
    normalizeFrequency(value, fallback = 'monthly') {
        const normalized = this.normalizeText(value).toLowerCase();
        if (!normalized)
            return fallback;
        if (normalized === 'week' || normalized === 'weekly')
            return 'weekly';
        if (normalized === 'month' || normalized === 'monthly')
            return 'monthly';
        throw new common_1.BadRequestException('Frequency must be either weekly or monthly.');
    }
    normalizeText(value) {
        return String(value ?? '').trim();
    }
    normalizeTransportLevel(value, required = false) {
        const normalized = this.normalizeText(value).toLowerCase();
        if (!normalized && required) {
            throw new common_1.BadRequestException('Transport level is required.');
        }
        return normalized;
    }
    normalizeUserId(value) {
        if (value == null)
            return null;
        const candidate = typeof value === 'object'
            ? value?._id ?? value?.id ?? value?.userId ?? value
            : value;
        const normalized = String(candidate ?? '').trim();
        if (!normalized || normalized.toLowerCase() === 'undefined' || normalized.toLowerCase() === 'null') {
            return null;
        }
        if (!mongoose_2.Types.ObjectId.isValid(normalized)) {
            return null;
        }
        return normalized;
    }
    normalizeUserIdentifierValue(value) {
        if (value == null)
            return null;
        const candidate = typeof value === 'object'
            ? value?.id ?? value?._id ?? value?.userId ?? value?.employeeId ?? value?.email ?? value
            : value;
        const normalized = this.normalizeText(candidate);
        if (!normalized)
            return null;
        const lowered = normalized.toLowerCase();
        if (lowered === 'undefined' || lowered === 'null' || lowered === '[object object]') {
            return null;
        }
        return normalized;
    }
    getUserIdentifierVariants(user) {
        const candidates = [
            user?.id,
            user?._id,
            user?.userId,
        ];
        return Array.from(new Set(candidates
            .map((value) => this.normalizeUserIdentifierValue(value))
            .filter((value) => Boolean(value))));
    }
    getUserIdentifierSet(user) {
        return new Set(this.getUserIdentifierVariants(user).map((value) => value.toLowerCase()));
    }
    listIncludesUserIdentifier(values, identifierSet) {
        if (!identifierSet.size || values == null)
            return false;
        const bucket = Array.isArray(values) ? values : [values];
        return bucket.some((entry) => {
            const normalized = this.normalizeUserIdentifierValue(entry);
            if (normalized && identifierSet.has(normalized.toLowerCase())) {
                return true;
            }
            if (typeof entry === 'string') {
                const tokens = entry
                    .split(',')
                    .map((part) => part.trim().toLowerCase())
                    .filter((token) => token &&
                    token !== 'undefined' &&
                    token !== 'null' &&
                    token !== '[object object]');
                return tokens.some((token) => identifierSet.has(token));
            }
            return false;
        });
    }
    composeUserName(user) {
        const parts = [user?.firstName, user?.lastName]
            .map((value) => (typeof value === 'string' ? value.trim() : ''))
            .filter(Boolean);
        if (parts.length)
            return parts.join(' ');
        const fallback = this.normalizeText(user?.fullName ?? user?.name ?? user?.email ?? '');
        return fallback || undefined;
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
    extractPermissionNames(user) {
        const names = new Set();
        const register = (source) => {
            if (!source)
                return;
            const values = Array.isArray(source) ? source : [source];
            values.forEach((permission) => {
                if (!permission)
                    return;
                if (typeof permission === 'string') {
                    names.add(permission.trim().toLowerCase());
                }
                else if (typeof permission?.name === 'string') {
                    names.add(permission.name.trim().toLowerCase());
                }
            });
        };
        register(user?.permissions);
        register(user?.role?.permissions);
        if (Array.isArray(user?.roles)) {
            user.roles.forEach((role) => {
                register(role?.permissions);
                register(role?.role?.permissions);
            });
        }
        const additional = Array.isArray(user?.additionalRoles)
            ? user.additionalRoles
            : user?.additionalRoles
                ? [user.additionalRoles]
                : [];
        additional.forEach((assignment) => {
            const roleNode = assignment?.role ?? assignment;
            register(roleNode?.permissions);
        });
        return names;
    }
    hasGlobalAccess(user) {
        if (!user)
            return false;
        const permissions = this.extractPermissionNames(user);
        if (permissions.has('all'))
            return true;
        for (const name of permissions) {
            if (TransportAllowanceService_1.SUPER_ADMIN_ROLE_NAMES.has(name)) {
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
        return sources.some((roleLike) => this.extractRoleNames(roleLike).some((name) => TransportAllowanceService_1.SUPER_ADMIN_ROLE_NAMES.has(name)));
    }
    userHasAnyPermission(user, permissions) {
        const names = this.extractPermissionNames(user);
        if (names.has('all'))
            return true;
        return permissions.some((permission) => names.has(permission.toLowerCase()));
    }
    workflowHasUserInRoles(workflow, user, roles) {
        const identifiers = this.getUserIdentifierSet(user);
        if (!identifiers.size)
            return false;
        const roleBuckets = {
            initiator: workflow?.initiatorIds,
            reviewer: workflow?.reviewerIds,
            approver: workflow?.approverIds,
            poster: workflow?.postingIds,
            auditViewer: workflow?.auditViewerIds,
        };
        const expandedRoles = roles.includes('member')
            ? ['initiator', 'reviewer', 'approver', 'poster', 'auditViewer']
            : roles;
        return expandedRoles.some((role) => this.listIncludesUserIdentifier(roleBuckets[role], identifiers));
    }
    async assertTransportWorkflowAccess(user, entity, roles, permissions, message) {
        if (this.hasGlobalAccess(user) || this.userHasAnyPermission(user, permissions)) {
            return;
        }
        const entityId = this.normalizeObjectId(entity, 'Entity');
        const workflow = await this.transportWorkflowModel
            .findOne({ entity: entityId })
            .lean()
            .exec();
        if (workflow && this.workflowHasUserInRoles(workflow, user, roles)) {
            return;
        }
        throw new common_1.ForbiddenException(message);
    }
    canViewApproval(user, approval) {
        if (this.hasGlobalAccess(user))
            return true;
        const identifiers = this.getUserIdentifierSet(user);
        if (!identifiers.size)
            return false;
        return (this.listIncludesUserIdentifier(approval?.requestedBy, identifiers) ||
            this.listIncludesUserIdentifier(approval?.reviewerIds, identifiers) ||
            this.listIncludesUserIdentifier(approval?.approverIds, identifiers) ||
            this.listIncludesUserIdentifier(approval?.auditViewerIds, identifiers) ||
            this.listIncludesUserIdentifier(approval?.postingIds, identifiers));
    }
    canReviewApproval(user, approval) {
        if (this.hasGlobalAccess(user))
            return true;
        const identifiers = this.getUserIdentifierSet(user);
        return this.listIncludesUserIdentifier(approval?.reviewerIds, identifiers);
    }
    canApproveApproval(user, approval) {
        if (this.hasGlobalAccess(user))
            return true;
        const identifiers = this.getUserIdentifierSet(user);
        return this.listIncludesUserIdentifier(approval?.approverIds, identifiers);
    }
    canPostApproval(user, approval) {
        if (this.hasGlobalAccess(user))
            return true;
        const identifiers = this.getUserIdentifierSet(user);
        return this.listIncludesUserIdentifier(approval?.postingIds, identifiers);
    }
    normalizeUserIdList(items) {
        if (!Array.isArray(items))
            return [];
        return Array.from(new Set(items
            .map((item) => this.normalizeText(item))
            .filter((item) => item.length > 0 &&
            item.toLowerCase() !== 'undefined' &&
            item.toLowerCase() !== 'null')));
    }
    resolveStageFromStatus(status) {
        const normalized = this.normalizeText(status).toUpperCase();
        if (normalized === TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.PENDING_APPROVAL) {
            return 'APPROVER';
        }
        if (normalized === TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.PENDING_POSTING) {
            return 'POSTING';
        }
        if (normalized === TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.APPROVED) {
            return 'POSTED';
        }
        return 'REVIEWER';
    }
    buildTransportApprovalLink(approvalId) {
        const id = this.normalizeText(approvalId);
        return id ? `/payroll-transport-approvals/${id}` : '/payroll-transport-approvals';
    }
    normalizeApprovalCurrentStage(approval) {
        const stage = this.normalizeText(approval?.currentStage).toUpperCase();
        if (stage === 'REVIEWER' || stage === 'APPROVER' || stage === 'POSTING' || stage === 'POSTED') {
            return stage;
        }
        const status = this.normalizeText(approval?.status).toUpperCase();
        if (status === TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.REJECTED) {
            if (approval?.approverApprovedAt) {
                return 'POSTING';
            }
            if (approval?.reviewerApprovedAt) {
                return 'APPROVER';
            }
            return 'REVIEWER';
        }
        if (status === TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.APPROVED) {
            return approval?.postingApprovedAt ? 'POSTED' : 'POSTING';
        }
        return this.resolveStageFromStatus(status);
    }
    resolveNamedValue(value) {
        if (typeof value !== 'string')
            return undefined;
        const trimmed = value.trim();
        return trimmed || undefined;
    }
    normalizeUserLookupValue(value) {
        if (value == null)
            return null;
        const candidate = typeof value === 'object'
            ? value?._id ?? value?.id ?? value?.userId ?? value?.staffId ?? value?.staffID ?? value
            : value;
        const normalized = this.normalizeText(candidate);
        if (!normalized)
            return null;
        const lowered = normalized.toLowerCase();
        if (lowered === 'undefined' || lowered === 'null')
            return null;
        return normalized;
    }
    collectApprovalUserIds(approval) {
        if (!approval || typeof approval !== 'object')
            return [];
        const ids = new Set();
        const add = (value) => {
            const normalized = this.normalizeUserLookupValue(value);
            if (normalized)
                ids.add(normalized);
        };
        add(approval?.requestedBy);
        add(approval?.reviewerApprovedBy);
        add(approval?.approverApprovedBy);
        add(approval?.postingApprovedBy);
        [approval?.reviewerIds, approval?.approverIds, approval?.postingIds, approval?.auditViewerIds]
            .forEach((list) => {
            if (!Array.isArray(list))
                return;
            list.forEach((value) => add(value));
        });
        return Array.from(ids);
    }
    async buildUserNameDirectory(userIds) {
        const normalizedIds = Array.from(new Set(userIds
            .map((value) => this.normalizeUserLookupValue(value))
            .filter((value) => Boolean(value))));
        if (!normalizedIds.length)
            return new Map();
        const objectIds = normalizedIds
            .filter((value) => mongoose_2.Types.ObjectId.isValid(value))
            .map((value) => new mongoose_2.Types.ObjectId(value));
        const staffIds = normalizedIds.filter((value) => !mongoose_2.Types.ObjectId.isValid(value));
        if (!objectIds.length && !staffIds.length)
            return new Map();
        const queryParts = [];
        if (objectIds.length) {
            queryParts.push({ _id: { $in: objectIds } });
        }
        if (staffIds.length) {
            queryParts.push({ staffId: { $in: staffIds } });
        }
        const users = await this.userModel
            .find(queryParts.length === 1 ? queryParts[0] : { $or: queryParts })
            .select('_id staffId firstName lastName fullName name email')
            .lean()
            .exec();
        const directory = new Map();
        users.forEach((user) => {
            const name = this.composeUserName(user);
            if (!name)
                return;
            const objectId = this.normalizeUserLookupValue(user?._id);
            if (objectId) {
                directory.set(objectId, name);
                directory.set(objectId.toLowerCase(), name);
            }
            const staffId = this.normalizeUserLookupValue(user?.staffId);
            if (staffId) {
                directory.set(staffId, name);
                directory.set(staffId.toLowerCase(), name);
            }
        });
        return directory;
    }
    resolveUserLabel(directory, value) {
        const normalized = this.normalizeUserLookupValue(value);
        if (!normalized)
            return undefined;
        return directory.get(normalized) ?? directory.get(normalized.toLowerCase());
    }
    enrichApprovalDisplayNames(approval, directory) {
        const initiatorDisplayName = this.resolveNamedValue(approval?.initiatorDisplayName) ??
            this.resolveNamedValue(approval?.requestedByName) ??
            this.resolveUserLabel(directory, approval?.requestedBy);
        const reviewerApprovedByName = this.resolveNamedValue(approval?.reviewerApprovedByName) ??
            this.resolveUserLabel(directory, approval?.reviewerApprovedBy);
        const reviewerNames = this.normalizeUserIdList(approval?.reviewerIds)
            .map((id) => this.resolveUserLabel(directory, id))
            .filter((name) => Boolean(name));
        const reviewerDisplayName = this.resolveNamedValue(approval?.reviewerDisplayName) ??
            reviewerApprovedByName ??
            (reviewerNames.length ? reviewerNames.join(', ') : undefined);
        const approverApprovedByName = this.resolveNamedValue(approval?.approverApprovedByName) ??
            this.resolveUserLabel(directory, approval?.approverApprovedBy);
        const approverNames = this.normalizeUserIdList(approval?.approverIds)
            .map((id) => this.resolveUserLabel(directory, id))
            .filter((name) => Boolean(name));
        const approverDisplayName = this.resolveNamedValue(approval?.approverDisplayName) ??
            approverApprovedByName ??
            (approverNames.length ? approverNames.join(', ') : undefined);
        const postingApprovedByName = this.resolveNamedValue(approval?.postingApprovedByName) ??
            this.resolveUserLabel(directory, approval?.postingApprovedBy);
        const postingNames = this.normalizeUserIdList(approval?.postingIds)
            .map((id) => this.resolveUserLabel(directory, id))
            .filter((name) => Boolean(name));
        const postingDisplayName = this.resolveNamedValue(approval?.postingDisplayName) ??
            postingApprovedByName ??
            (postingNames.length ? postingNames.join(', ') : undefined);
        const auditViewerNames = this.normalizeUserIdList(approval?.auditViewerIds)
            .map((id) => this.resolveUserLabel(directory, id))
            .filter((name) => Boolean(name));
        return {
            ...approval,
            currentStage: this.normalizeApprovalCurrentStage(approval),
            initiatorDisplayName,
            reviewerApprovedByName,
            reviewerNames,
            reviewerDisplayName,
            approverApprovedByName,
            approverNames,
            approverDisplayName,
            postingApprovedByName,
            postingNames,
            postingDisplayName,
            auditViewerNames,
        };
    }
    escapeRegex(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    pickRowValue(row, aliases) {
        for (const alias of aliases) {
            const value = this.normalizeText(row?.[alias]);
            if (value)
                return value;
        }
        return '';
    }
    async resolveEntityForSettingRow(rawValue, cache) {
        const normalized = this.normalizeText(rawValue);
        if (!normalized) {
            throw new common_1.BadRequestException('Entity is required.');
        }
        const cacheKey = normalized.toLowerCase();
        const cached = cache.get(cacheKey);
        if (cached)
            return cached;
        if (mongoose_2.Types.ObjectId.isValid(normalized)) {
            const objectId = new mongoose_2.Types.ObjectId(normalized);
            const entity = await this.subsidiaryModel
                .findById(objectId)
                .select('name short')
                .lean()
                .exec();
            const tokens = Array.from(new Set([
                normalized.toLowerCase(),
                this.normalizeText(entity?.name).toLowerCase(),
                this.normalizeText(entity?.short).toLowerCase(),
            ].filter(Boolean)));
            const resolved = { id: objectId, tokens };
            cache.set(cacheKey, resolved);
            return resolved;
        }
        const matcher = new RegExp(`^${this.escapeRegex(normalized)}$`, 'i');
        const entity = await this.subsidiaryModel
            .findOne({ $or: [{ name: matcher }, { short: matcher }] })
            .select('_id name short')
            .lean()
            .exec();
        if (!entity?._id) {
            throw new common_1.BadRequestException(`Entity "${normalized}" was not found.`);
        }
        const resolvedId = new mongoose_2.Types.ObjectId(String(entity._id));
        const tokens = Array.from(new Set([
            String(entity._id).toLowerCase(),
            this.normalizeText(entity?.name).toLowerCase(),
            this.normalizeText(entity?.short).toLowerCase(),
        ].filter(Boolean)));
        const resolved = { id: resolvedId, tokens };
        cache.set(cacheKey, resolved);
        return resolved;
    }
    async resolveDepartmentForSettingRow(entityId, rawValue, cache) {
        const normalized = this.normalizeText(rawValue);
        if (!normalized) {
            throw new common_1.BadRequestException('Department is required.');
        }
        const cacheKey = `${String(entityId)}::${normalized.toLowerCase()}`;
        const cached = cache.get(cacheKey);
        if (cached)
            return cached;
        if (mongoose_2.Types.ObjectId.isValid(normalized)) {
            const resolved = new mongoose_2.Types.ObjectId(normalized);
            cache.set(cacheKey, resolved);
            return resolved;
        }
        const matcher = new RegExp(`^${this.escapeRegex(normalized)}$`, 'i');
        let department = await this.departmentModel
            .findOne({
            name: matcher,
            $or: [{ entity: entityId }, { entity: null }, { entity: { $exists: false } }],
        })
            .select('_id')
            .lean()
            .exec();
        if (!department?._id) {
            department = await this.departmentModel
                .findOne({ name: matcher })
                .select('_id')
                .lean()
                .exec();
        }
        if (!department?._id) {
            throw new common_1.BadRequestException(`Department "${normalized}" was not found.`);
        }
        const resolved = new mongoose_2.Types.ObjectId(String(department._id));
        cache.set(cacheKey, resolved);
        return resolved;
    }
    async resolveRoleForSettingRow(entityId, entityTokens, rawValue, cache) {
        const normalized = this.normalizeText(rawValue);
        if (!normalized) {
            throw new common_1.BadRequestException('Role is required.');
        }
        const cacheKey = `${String(entityId)}::${normalized.toLowerCase()}`;
        const cached = cache.get(cacheKey);
        if (cached)
            return cached;
        if (mongoose_2.Types.ObjectId.isValid(normalized)) {
            const resolved = new mongoose_2.Types.ObjectId(normalized);
            cache.set(cacheKey, resolved);
            return resolved;
        }
        const matcher = new RegExp(`^${this.escapeRegex(normalized)}$`, 'i');
        const candidates = await this.roleModel
            .find({ name: matcher })
            .select('_id entity')
            .lean()
            .exec();
        if (!candidates.length) {
            throw new common_1.BadRequestException(`Role "${normalized}" was not found.`);
        }
        let matchedRole = candidates[0];
        if (candidates.length > 1) {
            const tokenSet = new Set(entityTokens.map((token) => token.toLowerCase()));
            const scoped = candidates.find((candidate) => {
                const roleEntity = this.normalizeText(candidate?.entity).toLowerCase();
                return roleEntity ? tokenSet.has(roleEntity) : false;
            });
            if (scoped) {
                matchedRole = scoped;
            }
            else {
                throw new common_1.BadRequestException(`Multiple roles matched "${normalized}". Use role_id to disambiguate.`);
            }
        }
        const resolved = new mongoose_2.Types.ObjectId(String(matchedRole._id));
        cache.set(cacheKey, resolved);
        return resolved;
    }
    resolveContext(payload, records) {
        const entityId = payload?.entity ?? records[0]?.entity;
        const departmentId = payload?.department ?? records[0]?.department;
        const year = this.toNumber(payload?.year ?? records[0]?.year);
        const month = this.toNumber(payload?.month ?? records[0]?.month);
        const weekOfMonth = this.toNumber(payload?.weekOfMonth ?? records[0]?.weekOfMonth);
        if (!entityId || !departmentId || !year || !month || !weekOfMonth) {
            throw new common_1.BadRequestException('Entity, department, year, month, and week are required.');
        }
        return {
            normalizedEntity: this.normalizeObjectId(entityId, 'Entity'),
            normalizedDepartment: this.normalizeObjectId(departmentId, 'Department'),
            year,
            month,
            weekOfMonth,
        };
    }
    resolveBatchContext(payload, records) {
        const entityId = payload?.entity ?? records[0]?.entity;
        const year = this.toNumber(payload?.year ?? records[0]?.year);
        const month = this.toNumber(payload?.month ?? records[0]?.month);
        const weekOfMonth = this.toNumber(payload?.weekOfMonth ?? records[0]?.weekOfMonth);
        if (!entityId || !year || !month || !weekOfMonth) {
            throw new common_1.BadRequestException('Entity, year, month, and week are required.');
        }
        return {
            normalizedEntity: this.normalizeObjectId(entityId, 'Entity'),
            year,
            month,
            weekOfMonth,
        };
    }
    buildProrationRows(records, payload) {
        const baseDaysDefault = this.toNumber(payload?.baseDays ?? 5, 5);
        return records.map((record) => {
            const staffId = record?.staff ?? record?.staffId ?? record?._id ?? record?.id;
            const staffObjectId = this.normalizeObjectId(staffId, 'Staff');
            const staffName = typeof record?.staffName === 'string'
                ? record.staffName.trim()
                : typeof record?.name === 'string'
                    ? record.name.trim()
                    : undefined;
            const addosserAccount = typeof record?.addosserAccount === 'string'
                ? record.addosserAccount.trim()
                : undefined;
            const baseDays = this.toNumber(record?.baseDays ?? payload?.baseDays ?? baseDaysDefault, baseDaysDefault);
            const days = this.toNumber(record?.days ?? payload?.days ?? baseDays, baseDays);
            const baseAmount = this.toNumber(record?.baseAmount ?? payload?.baseAmount ?? 0, 0);
            const proratedAmount = baseDays > 0 ? Number(((baseAmount / baseDays) * days).toFixed(2)) : 0;
            return {
                staff: staffObjectId,
                staffId: record?.staffId ?? record?.staffCode ?? record?.employeeId ?? undefined,
                staffName,
                addosserAccount,
                baseDays,
                days,
                baseAmount,
                proratedAmount,
            };
        });
    }
    async list(filters, user) {
        await this.assertTransportWorkflowAccess(user, filters.entity, ['member'], ['view transport allowance', 'view payroll', 'view payroll settings'], 'You do not have permission to view transport allowance.');
        const query = {};
        if (filters.entity) {
            query.entity = this.normalizeObjectId(filters.entity, 'Entity');
        }
        if (filters.department) {
            query.department = this.normalizeObjectId(filters.department, 'Department');
        }
        if (filters.staff) {
            query.staff = this.normalizeObjectId(filters.staff, 'Staff');
        }
        if (filters.year) {
            query.year = this.toNumber(filters.year);
        }
        if (filters.month) {
            query.month = this.toNumber(filters.month);
        }
        if (filters.weekOfMonth) {
            query.weekOfMonth = this.toNumber(filters.weekOfMonth);
        }
        const rows = await this.transportModel.find(query).lean().exec();
        return { status: 200, data: rows };
    }
    async listSettings(filters, user) {
        await this.assertTransportWorkflowAccess(user, filters.entity, ['member'], ['view transport allowance', 'view payroll', 'view payroll settings'], 'You do not have permission to view transport allowance settings.');
        const query = {};
        if (filters.entity) {
            query.entity = this.normalizeObjectId(filters.entity, 'Entity');
        }
        if (filters.transportLevel) {
            const transportLevel = this.normalizeTransportLevel(filters.transportLevel);
            query.transportLevel = new RegExp(`^${this.escapeRegex(transportLevel)}$`, 'i');
        }
        const hasPaginationRequest = filters.page !== undefined || filters.limit !== undefined;
        const page = Math.max(this.toNumber(filters.page, 1), 1);
        const limit = Math.min(Math.max(this.toNumber(filters.limit, 10), 1), 200);
        if (hasPaginationRequest) {
            const skip = (page - 1) * limit;
            const [rows, total] = await Promise.all([
                this.transportSettingModel
                    .find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean()
                    .exec(),
                this.transportSettingModel.countDocuments(query),
            ]);
            return {
                status: 200,
                data: rows,
                total,
                page,
                limit,
                totalPages: Math.max(Math.ceil(total / limit), 1),
            };
        }
        const rows = await this.transportSettingModel
            .find(query)
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        return { status: 200, data: rows };
    }
    async getWorkflowConfigs(entity, user) {
        const hasConfigPermission = this.hasGlobalAccess(user) ||
            this.userHasAnyPermission(user, [
                'view transport allowance',
                'view payroll',
                'view payroll settings',
            ]);
        if (entity) {
            await this.assertTransportWorkflowAccess(user, entity, ['member'], ['view transport allowance', 'view payroll', 'view payroll settings'], 'You do not have permission to view transport workflow configuration.');
        }
        const query = {};
        if (entity) {
            query.entity = this.normalizeObjectId(entity, 'Entity');
        }
        else if (!hasConfigPermission) {
            const identifiers = this.getUserIdentifierVariants(user);
            if (!identifiers.length) {
                throw new common_1.ForbiddenException('You do not have permission to view transport workflow configuration.');
            }
            query.$or = [
                { initiatorIds: { $in: identifiers } },
                { reviewerIds: { $in: identifiers } },
                { auditViewerIds: { $in: identifiers } },
                { approverIds: { $in: identifiers } },
                { postingIds: { $in: identifiers } },
            ];
        }
        const configs = await this.transportWorkflowModel
            .find(query)
            .populate('entity', 'name short code')
            .lean()
            .exec();
        return { status: 200, data: configs };
    }
    async saveWorkflowConfig(payload) {
        const entity = this.normalizeObjectId(payload?.entity, 'Entity');
        const initiatorIds = this.normalizeUserIdList(payload?.initiators);
        const reviewerIds = this.normalizeUserIdList(payload?.reviewers);
        const auditViewerIds = this.normalizeUserIdList(payload?.auditViewers);
        const approverIds = this.normalizeUserIdList(payload?.approvers);
        const postingIds = this.normalizeUserIdList(payload?.posters ?? payload?.postingIds);
        const financeIds = this.normalizeUserIdList(payload?.finance ?? payload?.financeIds);
        const transportGl = this.normalizeText(payload?.transportGl);
        const companyGL = this.normalizeText(payload?.companyGL);
        if (!reviewerIds.length) {
            throw new common_1.BadRequestException('At least one reviewer must be selected.');
        }
        if (!approverIds.length) {
            throw new common_1.BadRequestException('At least one approver must be selected.');
        }
        if (!postingIds.length) {
            throw new common_1.BadRequestException('At least one poster must be selected.');
        }
        const config = await this.transportWorkflowModel
            .findOneAndUpdate({ entity }, {
            $set: {
                entity,
                initiatorIds,
                reviewerIds,
                auditViewerIds,
                approverIds,
                postingIds,
                financeIds,
                transportGl,
                companyGL,
            },
        }, { upsert: true, new: true, setDefaultsOnInsert: true })
            .populate('entity', 'name short code')
            .lean()
            .exec();
        return { status: 200, data: config };
    }
    async upsertSetting(payload) {
        const normalizedEntity = this.normalizeObjectId(payload?.entity, 'Entity');
        const transportLevel = this.normalizeTransportLevel(payload?.transportLevel, true);
        const amount = this.normalizeAmount(payload?.amount);
        const filter = { entity: normalizedEntity, transportLevel };
        const update = { $set: { entity: normalizedEntity, transportLevel, amount } };
        try {
            const saved = await this.transportSettingModel
                .findOneAndUpdate(filter, update, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            })
                .lean()
                .exec();
            return { status: 200, data: saved };
        }
        catch (error) {
            if (error?.code === 11000) {
                const retried = await this.transportSettingModel
                    .findOneAndUpdate(filter, update, { new: true })
                    .lean()
                    .exec();
                if (retried) {
                    return { status: 200, data: retried };
                }
                const byRegex = await this.transportSettingModel
                    .findOneAndUpdate({ entity: normalizedEntity, transportLevel: new RegExp(`^${transportLevel}$`, 'i') }, update, { new: true })
                    .lean()
                    .exec();
                if (byRegex) {
                    return { status: 200, data: byRegex };
                }
                throw new common_1.BadRequestException(`A setting for transport level "${transportLevel}" already exists for this entity.`);
            }
            throw new common_1.BadRequestException(error?.message ?? 'Unable to save transport setting.');
        }
    }
    async bulkUpsertSettings(rows, options) {
        const records = Array.isArray(rows) ? rows : [];
        if (!records.length) {
            throw new common_1.BadRequestException('No transport setting records provided.');
        }
        const defaultEntity = this.normalizeText(options?.entity);
        const entityCache = new Map();
        const errors = [];
        const operations = [];
        for (let index = 0; index < records.length; index += 1) {
            const row = records[index] ?? {};
            const rowNumber = index + 2;
            try {
                const entityRaw = this.pickRowValue(row, [
                    'entity',
                    'entity_id',
                    'entityid',
                    'subsidiary',
                    'subsidiary_id',
                    'subsidiaryid',
                ]) || defaultEntity;
                if (!entityRaw) {
                    throw new common_1.BadRequestException('Entity is required in upload payload or row.');
                }
                const transportLevelRaw = this.pickRowValue(row, [
                    'transport_level',
                    'transportlevel',
                    'transport_tier',
                    'transporttier',
                    'level',
                ]);
                const transportLevel = this.normalizeTransportLevel(transportLevelRaw, true);
                if (!transportLevel) {
                    throw new common_1.BadRequestException('Transport level is required.');
                }
                const amountRaw = this.pickRowValue(row, [
                    'amount',
                    'transport_amount',
                    'transportallowance',
                    'transport_allowance',
                ]);
                if (amountRaw === '') {
                    throw new common_1.BadRequestException('Amount is required.');
                }
                const amount = this.normalizeAmount(amountRaw);
                const resolvedEntity = await this.resolveEntityForSettingRow(entityRaw, entityCache);
                operations.push({
                    updateOne: {
                        filter: {
                            entity: resolvedEntity.id,
                            transportLevel,
                        },
                        update: {
                            $set: {
                                entity: resolvedEntity.id,
                                transportLevel,
                                amount,
                            },
                        },
                        upsert: true,
                    },
                });
            }
            catch (error) {
                const description = typeof error?.message === 'string' && error.message.trim()
                    ? error.message
                    : 'Invalid row.';
                errors.push({
                    row: rowNumber,
                    error: description,
                });
            }
        }
        if (!operations.length) {
            const firstError = errors[0]?.error ?? 'No valid rows found.';
            throw new common_1.BadRequestException(`No valid rows found. ${firstError}`);
        }
        const result = await this.transportSettingModel.bulkWrite(operations, { ordered: false });
        return {
            status: 200,
            processed: records.length,
            imported: operations.length,
            skipped: errors.length,
            updated: result.modifiedCount ?? 0,
            upserted: result.upsertedCount ?? 0,
            errors,
        };
    }
    async deleteSetting(id) {
        const normalizedId = String(id ?? '').trim();
        if (!normalizedId || !mongoose_2.Types.ObjectId.isValid(normalizedId)) {
            throw new common_1.BadRequestException('Setting id is required.');
        }
        const deleted = await this.transportSettingModel
            .findByIdAndDelete(new mongoose_2.Types.ObjectId(normalizedId))
            .lean()
            .exec();
        if (!deleted) {
            throw new common_1.NotFoundException('Transport setting not found.');
        }
        return { status: 200, deleted: true };
    }
    async preview(payload, user) {
        const records = Array.isArray(payload?.records)
            ? payload.records
            : Array.isArray(payload)
                ? payload
                : [];
        if (!records.length) {
            throw new common_1.BadRequestException('No transport allowance records provided.');
        }
        const context = this.resolveContext(payload, records);
        await this.assertTransportWorkflowAccess(user, context.normalizedEntity, ['initiator'], ['view transport allowance', 'view payroll', 'view payroll settings'], 'You are not allowed to initiate transport allowance for this entity.');
        const rows = this.buildProrationRows(records, payload).map((row) => ({
            ...row,
            staff: String(row.staff),
            entity: String(context.normalizedEntity),
            department: String(context.normalizedDepartment),
            year: context.year,
            month: context.month,
            weekOfMonth: context.weekOfMonth,
        }));
        const total = rows.reduce((sum, row) => sum + (Number(row.proratedAmount) || 0), 0);
        return { status: 200, data: rows, totals: { total } };
    }
    async generate(payload, user) {
        const entity = this.normalizeObjectId(payload?.entity, 'Entity');
        await this.assertTransportWorkflowAccess(user, entity, ['initiator'], ['view transport allowance', 'view payroll', 'view payroll settings'], 'You are not allowed to initiate transport allowance for this entity.');
        const departmentRaw = this.normalizeText(payload?.department);
        const year = this.toNumber(payload?.year, Number.NaN);
        const month = this.toNumber(payload?.month, Number.NaN);
        const weekOfMonth = this.toNumber(payload?.weekOfMonth, Number.NaN);
        const frequency = this.normalizeFrequency(payload?.frequency, 'weekly');
        if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(weekOfMonth)) {
            throw new common_1.BadRequestException('Year, month, and week are required.');
        }
        const settingsQuery = {
            entity,
        };
        const settings = await this.transportSettingModel.find(settingsQuery).lean().exec();
        if (!settings.length) {
            return { status: 200, data: [], totals: { total: 0 } };
        }
        const amountLookup = new Map();
        const transportLevels = new Set();
        settings.forEach((setting) => {
            const transportLevel = this.normalizeTransportLevel(setting?.transportLevel);
            const amount = Number(setting?.amount ?? 0);
            if (!transportLevel || !Number.isFinite(amount))
                return;
            amountLookup.set(transportLevel, amount);
            transportLevels.add(transportLevel);
        });
        if (!amountLookup.size) {
            return { status: 200, data: [], totals: { total: 0 } };
        }
        const transportLevelMatchers = Array.from(transportLevels).map((level) => new RegExp(`^${this.escapeRegex(level)}$`, 'i'));
        const staffQuery = {
            entity,
            status: { $regex: /^\s*(?:active|approved)\s*$/i },
            transportLevel: { $in: transportLevelMatchers },
        };
        if (departmentRaw && departmentRaw !== 'all') {
            staffQuery.department = this.normalizeObjectId(departmentRaw, 'Department');
        }
        const staffList = await this.userModel
            .find(staffQuery)
            .select('_id firstName lastName middleName staffId addosserAccount department transportLevel')
            .lean()
            .exec();
        if (!staffList.length) {
            return { status: 200, data: [], totals: { total: 0 } };
        }
        const existingProrations = await this.transportModel
            .find({
            entity,
            year,
            month,
            weekOfMonth,
            staff: { $in: staffList.map((staff) => staff?._id).filter(Boolean) },
        })
            .lean()
            .exec();
        const existingMap = new Map();
        existingProrations.forEach((row) => {
            const key = String(row?.staff ?? '').trim();
            if (key)
                existingMap.set(key, row);
        });
        const rows = staffList
            .map((staff) => {
            const staffObjectId = String(staff?._id ?? '').trim();
            const departmentId = String(staff?.department ?? '').trim();
            const transportLevel = this.normalizeTransportLevel(staff?.transportLevel);
            if (!staffObjectId || !departmentId || !transportLevel)
                return null;
            const baseAmount = amountLookup.get(transportLevel);
            if (baseAmount === undefined)
                return null;
            const existing = existingMap.get(staffObjectId);
            const baseDays = this.toNumber(existing?.baseDays, 5);
            const days = this.toNumber(existing?.days, baseDays);
            const proratedAmount = baseDays > 0 ? Number(((baseAmount / baseDays) * days).toFixed(2)) : 0;
            const firstName = this.normalizeText(staff?.firstName);
            const lastName = this.normalizeText(staff?.lastName);
            const middleName = this.normalizeText(staff?.middleName);
            const fullName = [lastName, firstName, middleName].filter(Boolean).join(' ').trim() || 'Unnamed staff';
            return {
                id: staffObjectId,
                staff: staffObjectId,
                staffObjectId,
                staffId: this.normalizeText(staff?.staffId) || '-',
                name: fullName,
                addosserAccount: this.normalizeText(staff?.addosserAccount) || '-',
                departmentId,
                transportLevel,
                baseAmount,
                baseDays,
                days,
                proratedAmount,
                year,
                month,
                weekOfMonth,
                frequency,
                entity: String(entity),
                department: departmentId,
            };
        })
            .filter(Boolean);
        const total = rows.reduce((sum, row) => sum + (Number(row?.proratedAmount) || 0), 0);
        return { status: 200, data: rows, totals: { total } };
    }
    async upsert(payload, user) {
        const records = Array.isArray(payload?.records)
            ? payload.records
            : Array.isArray(payload)
                ? payload
                : [];
        if (!records.length) {
            throw new common_1.BadRequestException('No transport allowance records provided.');
        }
        const context = this.resolveContext(payload, records);
        await this.assertTransportWorkflowAccess(user, context.normalizedEntity, ['initiator'], ['view transport allowance', 'view payroll', 'view payroll settings'], 'You are not allowed to initiate transport allowance for this entity.');
        const rows = this.buildProrationRows(records, payload);
        const staffIds = rows.map((r) => r.staff).filter(Boolean);
        const staffUsers = staffIds.length
            ? await this.userModel
                .find({ _id: { $in: staffIds } })
                .populate('branch', '_id name gl')
                .select('_id branch')
                .lean()
                .exec()
            : [];
        const branchByStaff = new Map();
        let branchByLowerName = null;
        for (const u of staffUsers) {
            const branch = u?.branch;
            if (branch && typeof branch === 'object') {
                branchByStaff.set(String(u._id), {
                    branchId: branch?._id,
                    name: branch?.name ?? '',
                    gl: branch?.gl ?? '',
                });
                continue;
            }
            if (typeof branch === 'string' && branch.trim()) {
                if (!branchByLowerName) {
                    branchByLowerName = await this.buildBranchByLowerName();
                }
                const hit = branchByLowerName.get(branch.trim().toLowerCase());
                if (hit) {
                    branchByStaff.set(String(u._id), { ...hit });
                }
            }
        }
        const ops = rows.map((row) => {
            const branchInfo = branchByStaff.get(String(row.staff));
            return {
                updateOne: {
                    filter: {
                        entity: context.normalizedEntity,
                        department: context.normalizedDepartment,
                        staff: row.staff,
                        year: context.year,
                        month: context.month,
                        weekOfMonth: context.weekOfMonth,
                    },
                    update: {
                        $set: {
                            entity: context.normalizedEntity,
                            department: context.normalizedDepartment,
                            staff: row.staff,
                            staffId: row.staffId,
                            staffName: row.staffName,
                            addosserAccount: row.addosserAccount,
                            year: context.year,
                            month: context.month,
                            weekOfMonth: context.weekOfMonth,
                            baseDays: row.baseDays,
                            days: row.days,
                            baseAmount: row.baseAmount,
                            proratedAmount: row.proratedAmount,
                            branch: branchInfo?.branchId ?? null,
                            branchName: branchInfo?.name ?? '',
                            branchGL: branchInfo?.gl ?? '',
                        },
                    },
                    upsert: true,
                },
            };
        });
        const result = await this.transportModel.bulkWrite(ops, { ordered: false });
        return {
            status: 200,
            updated: result.modifiedCount ?? 0,
            upserted: result.upsertedCount ?? 0,
        };
    }
    async submitForReview(payload, actor) {
        const records = Array.isArray(payload?.records)
            ? payload.records
            : Array.isArray(payload)
                ? payload
                : [];
        if (!records.length) {
            throw new common_1.BadRequestException('No transport allowance records provided.');
        }
        const context = this.resolveBatchContext(payload, records);
        await this.assertTransportWorkflowAccess(actor, context.normalizedEntity, ['initiator'], ['view transport allowance', 'view payroll', 'view payroll settings'], 'You are not allowed to initiate transport allowance for this entity.');
        const prorationRows = this.buildProrationRows(records, payload);
        const staffIds = prorationRows
            .map((r) => r.staff)
            .filter(Boolean);
        const staffUsers = staffIds.length
            ? await this.userModel
                .find({ _id: { $in: staffIds } })
                .populate('branch', 'name gl')
                .select('_id branch department addosserAccount')
                .lean()
                .exec()
            : [];
        const branchByStaff = new Map();
        const departmentByStaff = new Map();
        const addosserAccountByStaff = new Map();
        let branchByLowerName = null;
        for (const u of staffUsers) {
            const branch = u?.branch;
            if (branch && typeof branch === 'object') {
                branchByStaff.set(String(u._id), {
                    name: branch?.name ?? '',
                    gl: branch?.gl ?? '',
                });
            }
            else if (typeof branch === 'string' && branch.trim()) {
                if (!branchByLowerName) {
                    branchByLowerName = await this.buildBranchByLowerName();
                }
                const hit = branchByLowerName.get(branch.trim().toLowerCase());
                if (hit) {
                    branchByStaff.set(String(u._id), { name: hit.name, gl: hit.gl });
                }
            }
            const dept = u?.department;
            if (dept) {
                departmentByStaff.set(String(u._id), String(dept));
            }
            const addosserAccount = this.normalizeText(u?.addosserAccount);
            if (addosserAccount) {
                addosserAccountByStaff.set(String(u._id), addosserAccount);
            }
        }
        const departmentByRecord = new Map();
        for (const rec of records) {
            const staffKey = String(rec?.staff ?? rec?.staffId ?? rec?._id ?? rec?.id ?? '');
            const deptId = this.normalizeText(rec?.department ?? rec?.departmentId);
            if (staffKey && deptId) {
                departmentByRecord.set(staffKey, deptId);
            }
        }
        const allDeptIds = Array.from(new Set([...departmentByRecord.values(), ...departmentByStaff.values()].filter((id) => id && mongoose_2.Types.ObjectId.isValid(id))));
        const departmentDocs = allDeptIds.length
            ? await this.departmentModel
                .find({ _id: { $in: allDeptIds.map((id) => new mongoose_2.Types.ObjectId(id)) } })
                .select('_id name')
                .lean()
                .exec()
            : [];
        const departmentNameById = new Map();
        for (const dept of departmentDocs) {
            if (dept?._id) {
                departmentNameById.set(String(dept._id), String(dept.name ?? ''));
            }
        }
        const data = prorationRows.map((row) => {
            const staffKey = String(row.staff);
            const branchInfo = branchByStaff.get(staffKey);
            const rowDepartment = departmentByRecord.get(staffKey) ??
                departmentByStaff.get(staffKey) ??
                '';
            const recordAddosserAccount = this.normalizeText(row.addosserAccount);
            const resolvedAddosserAccount = recordAddosserAccount && recordAddosserAccount !== '-'
                ? recordAddosserAccount
                : addosserAccountByStaff.get(staffKey) ?? '';
            return {
                ...row,
                staff: staffKey,
                addosserAccount: resolvedAddosserAccount,
                branch: branchInfo?.name ?? '',
                branchGL: branchInfo?.gl ?? '',
                entity: String(context.normalizedEntity),
                department: rowDepartment,
                departmentName: rowDepartment ? departmentNameById.get(rowDepartment) ?? '' : '',
                year: context.year,
                month: context.month,
                weekOfMonth: context.weekOfMonth,
            };
        });
        const frequency = this.normalizeFrequency(payload?.frequency, 'weekly');
        const initiatorComment = this.normalizeText(payload?.initiatorComment ?? payload?.comment ?? payload?.notes);
        const workflow = await this.transportWorkflowModel
            .findOne({ entity: context.normalizedEntity })
            .lean()
            .exec();
        if (!workflow) {
            throw new common_1.BadRequestException('Transport workflow is not configured for this entity.');
        }
        const reviewerIds = this.normalizeUserIdList(workflow.reviewerIds);
        const approverIds = this.normalizeUserIdList(workflow.approverIds);
        const auditViewerIds = this.normalizeUserIdList(workflow.auditViewerIds);
        const postingIds = this.normalizeUserIdList(workflow.postingIds);
        if (!reviewerIds.length) {
            throw new common_1.BadRequestException('At least one reviewer must be configured.');
        }
        const pendingStatuses = [
            TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.PENDING_REVIEW,
            TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.PENDING_APPROVAL,
            TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.PENDING_POSTING,
        ];
        const existing = await this.transportApprovalModel
            .findOne({
            entity: context.normalizedEntity,
            department: { $in: [null, undefined] },
            year: context.year,
            month: context.month,
            weekOfMonth: context.weekOfMonth,
            frequency,
            status: { $in: pendingStatuses },
        })
            .exec();
        const requesterId = this.normalizeUserIdentifierValue(actor?.id ?? actor?._id ?? actor?.userId);
        if (existing) {
            existing.data = data;
            existing.currentStage = 'REVIEWER';
            existing.status = TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.PENDING_REVIEW;
            existing.reviewerIds = reviewerIds;
            existing.approverIds = approverIds;
            existing.auditViewerIds = auditViewerIds;
            existing.postingIds = postingIds;
            existing.requestedBy = requesterId ?? existing.requestedBy;
            existing.requestedByName = this.composeUserName(actor) ?? existing.requestedByName;
            existing.initiatorComment = initiatorComment || existing.initiatorComment;
            await existing.save();
            await this.workflowNotifier?.dispatch({
                module: 'transport_allowance',
                event: 'submitted',
                doc: existing,
            });
            return {
                status: 200,
                message: 'Transport allowance sent to reviewer.',
                approvalId: existing._id,
            };
        }
        const approval = await this.transportApprovalModel.create({
            entity: context.normalizedEntity,
            year: context.year,
            month: context.month,
            weekOfMonth: context.weekOfMonth,
            frequency,
            status: TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.PENDING_REVIEW,
            currentStage: 'REVIEWER',
            data,
            requestedBy: requesterId ?? undefined,
            requestedByName: this.composeUserName(actor),
            initiatorComment: initiatorComment || undefined,
            reviewerIds,
            approverIds,
            auditViewerIds,
            postingIds,
        });
        await this.workflowNotifier?.dispatch({
            module: 'transport_allowance',
            event: 'submitted',
            doc: approval,
        });
        return {
            status: 200,
            message: 'Transport allowance sent to reviewer.',
            approvalId: approval._id,
        };
    }
    async getApprovals(user, options) {
        const query = {};
        if (options?.status) {
            query.status = this.normalizeText(options.status);
        }
        if (options?.entity) {
            query.entity = this.normalizeObjectId(options.entity, 'Entity');
        }
        const requesterIdentifiers = this.getUserIdentifierVariants(user);
        const requesterIdentifierSet = new Set(requesterIdentifiers.map((value) => value.toLowerCase()));
        const requestedAssignedId = this.normalizeUserIdentifierValue(options?.assignedId);
        const hasGlobalAccess = this.hasGlobalAccess(user);
        if (requestedAssignedId &&
            requesterIdentifierSet.size &&
            !requesterIdentifierSet.has(requestedAssignedId.toLowerCase()) &&
            !hasGlobalAccess) {
            throw new common_1.ForbiddenException('You are not allowed to filter transport approvals for another user.');
        }
        const targetAssignedIdentifiers = requestedAssignedId
            ? (requesterIdentifierSet.has(requestedAssignedId.toLowerCase())
                ? requesterIdentifiers
                : [requestedAssignedId])
            : requesterIdentifiers;
        const shouldRestrictToAssigned = Boolean(options?.assignedOnly) &&
            Boolean(targetAssignedIdentifiers.length) &&
            (!hasGlobalAccess || Boolean(requestedAssignedId));
        if (shouldRestrictToAssigned && targetAssignedIdentifiers.length) {
            query.$or = [
                { requestedBy: { $in: targetAssignedIdentifiers } },
                { reviewerIds: { $in: targetAssignedIdentifiers } },
                { approverIds: { $in: targetAssignedIdentifiers } },
                { auditViewerIds: { $in: targetAssignedIdentifiers } },
                { postingIds: { $in: targetAssignedIdentifiers } },
            ];
        }
        const rows = await this.transportApprovalModel
            .find(query)
            .populate('entity', 'name short code gl')
            .populate('department', 'name')
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        const filtered = hasGlobalAccess ? rows : rows.filter((row) => this.canViewApproval(user, row));
        const userIds = Array.from(new Set(filtered.flatMap((row) => this.collectApprovalUserIds(row))));
        const userDirectory = await this.buildUserNameDirectory(userIds);
        const enriched = filtered.map((row) => this.enrichApprovalDisplayNames(row, userDirectory));
        return { status: 200, data: enriched };
    }
    async getApprovalById(id, user) {
        const approval = await this.transportApprovalModel
            .findById(id)
            .populate('entity', 'name short code gl')
            .populate('department', 'name')
            .lean()
            .exec();
        if (!approval) {
            throw new common_1.NotFoundException('Transport approval not found.');
        }
        if (!this.canViewApproval(user, approval)) {
            throw new common_1.BadRequestException('You are not allowed to view this approval.');
        }
        await this.backfillApprovalAddosserAccounts(id, approval);
        const userDirectory = await this.buildUserNameDirectory(this.collectApprovalUserIds(approval));
        const enriched = this.enrichApprovalDisplayNames(approval, userDirectory);
        return { status: 200, data: enriched };
    }
    async backfillApprovalAddosserAccounts(id, approval) {
        const rows = Array.isArray(approval?.data) ? approval.data : [];
        if (!rows.length)
            return;
        const missingStaffIds = new Set();
        rows.forEach((row) => {
            const current = this.normalizeText(row?.addosserAccount);
            if (current && current !== '-')
                return;
            const staffId = this.normalizeText(row?.staff);
            if (staffId && mongoose_2.Types.ObjectId.isValid(staffId)) {
                missingStaffIds.add(staffId);
            }
        });
        if (!missingStaffIds.size)
            return;
        const users = await this.userModel
            .find({ _id: { $in: Array.from(missingStaffIds).map((sid) => new mongoose_2.Types.ObjectId(sid)) } })
            .select('_id addosserAccount')
            .lean()
            .exec();
        const accountByStaff = new Map();
        for (const u of users) {
            const account = this.normalizeText(u?.addosserAccount);
            if (account)
                accountByStaff.set(String(u._id), account);
        }
        if (!accountByStaff.size)
            return;
        let mutated = false;
        const nextRows = rows.map((row) => {
            const current = this.normalizeText(row?.addosserAccount);
            if (current && current !== '-')
                return row;
            const staffId = this.normalizeText(row?.staff);
            const resolved = staffId ? accountByStaff.get(staffId) : undefined;
            if (!resolved)
                return row;
            mutated = true;
            return { ...row, addosserAccount: resolved };
        });
        if (!mutated)
            return;
        approval.data = nextRows;
        await this.transportApprovalModel.updateOne({ _id: id }, { $set: { data: nextRows } }).exec();
    }
    assertFinanceCommenter(user) {
        if ((0, access_control_util_2.userDepartmentIncludes)(user, 'audit')) {
            throw new common_1.ForbiddenException('Audit department has read-only access.');
        }
        if ((0, access_control_util_2.userIsSuperAdmin)(user))
            return;
        if (!(0, access_control_util_2.userCanLeaveFinanceComment)(user)) {
            throw new common_1.ForbiddenException('Only super admins and the finance/fincon departments can leave a finance comment.');
        }
    }
    async updateFinanceComment(id, user, comment) {
        const approval = await this.transportApprovalModel.findById(id).exec();
        if (!approval) {
            throw new common_1.NotFoundException('Transport approval not found.');
        }
        this.assertFinanceCommenter(user);
        const financeComment = this.normalizeText(comment);
        approval.financeComment = financeComment || undefined;
        const actorId = this.normalizeUserId(user?._id ?? user?.id ?? user?.userId);
        approval.financeCommentBy = actorId ? new mongoose_2.Types.ObjectId(actorId) : undefined;
        approval.financeCommentByName = this.composeUserName(user) ?? undefined;
        approval.financeCommentAt = new Date();
        await approval.save();
        return { status: 200, message: 'Finance comment updated successfully.' };
    }
    async approveApproval(id, user, comment) {
        const approval = await this.transportApprovalModel.findById(id).exec();
        if (!approval) {
            throw new common_1.NotFoundException('Transport approval not found.');
        }
        const actorId = this.normalizeUserId(user?._id ?? user?.id ?? user?.userId);
        const actorName = this.composeUserName(user);
        if (approval.status === TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.REJECTED) {
            throw new common_1.BadRequestException('This approval has already been rejected.');
        }
        if (approval.status === TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.APPROVED) {
            throw new common_1.BadRequestException('This approval has already been completed.');
        }
        if (approval.status === TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.PENDING_REVIEW) {
            if (!this.canReviewApproval(user, approval)) {
                throw new common_1.BadRequestException('Only configured reviewers can approve at this stage.');
            }
            approval.status = TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.PENDING_APPROVAL;
            approval.currentStage = 'APPROVER';
            approval.reviewerApprovedAt = new Date();
            approval.reviewerApprovedBy = actorId ? new mongoose_2.Types.ObjectId(actorId) : undefined;
            approval.reviewerApprovedByName = actorName ?? undefined;
            if (comment && this.normalizeText(comment)) {
                approval.initiatorComment = this.normalizeText(approval.initiatorComment)
                    ? `${approval.initiatorComment}\n\nReviewer: ${this.normalizeText(comment)}`
                    : `Reviewer: ${this.normalizeText(comment)}`;
            }
            await approval.save();
            await this.workflowNotifier?.dispatch({
                module: 'transport_allowance',
                event: 'reviewed',
                doc: approval,
            });
            return { status: 200, message: 'Transport batch moved to approvers.' };
        }
        if (!this.canApproveApproval(user, approval)) {
            throw new common_1.BadRequestException('Only configured approvers can approve at this stage.');
        }
        approval.status = TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.PENDING_POSTING;
        approval.currentStage = 'POSTING';
        approval.approverApprovedAt = new Date();
        approval.approverApprovedBy = actorId ? new mongoose_2.Types.ObjectId(actorId) : undefined;
        approval.approverApprovedByName = actorName ?? undefined;
        if (comment && this.normalizeText(comment)) {
            approval.initiatorComment = this.normalizeText(approval.initiatorComment)
                ? `${approval.initiatorComment}\n\nApprover: ${this.normalizeText(comment)}`
                : `Approver: ${this.normalizeText(comment)}`;
        }
        await approval.save();
        await this.workflowNotifier?.dispatch({
            module: 'transport_allowance',
            event: 'approved',
            doc: approval,
        });
        return { status: 200, message: 'Transport batch approved and forwarded for posting.' };
    }
    async rejectApproval(id, user, reason) {
        const approval = await this.transportApprovalModel.findById(id).exec();
        if (!approval) {
            throw new common_1.NotFoundException('Transport approval not found.');
        }
        if (approval.status === TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.REJECTED) {
            throw new common_1.BadRequestException('This approval has already been rejected.');
        }
        if (approval.status === TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.APPROVED) {
            throw new common_1.BadRequestException('This approval has already been completed.');
        }
        if (approval.status === TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.PENDING_REVIEW) {
            if (!this.canReviewApproval(user, approval)) {
                throw new common_1.BadRequestException('Only configured reviewers can reject at this stage.');
            }
        }
        else if (approval.status === TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.PENDING_APPROVAL) {
            if (!this.canApproveApproval(user, approval)) {
                throw new common_1.BadRequestException('Only configured approvers can reject at this stage.');
            }
        }
        else if (approval.status === TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.PENDING_POSTING) {
            if (!this.canPostApproval(user, approval)) {
                throw new common_1.BadRequestException('Only configured posting users can reject at this stage.');
            }
        }
        const stageAtRejection = this.resolveStageFromStatus(approval.status);
        approval.status = TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.REJECTED;
        approval.currentStage = stageAtRejection;
        approval.rejectionReason = this.normalizeText(reason) || undefined;
        await approval.save();
        await this.workflowNotifier?.dispatch({
            module: 'transport_allowance',
            event: 'rejected',
            doc: approval,
        });
        return { status: 200, message: 'Transport batch rejected.' };
    }
    async markPostingComplete(id, user) {
        const approval = await this.transportApprovalModel.findById(id).exec();
        if (!approval) {
            throw new common_1.NotFoundException('Transport approval not found.');
        }
        if (approval.status !== TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.PENDING_POSTING) {
            throw new common_1.BadRequestException('This approval is not in the posting stage.');
        }
        if (!this.canPostApproval(user, approval)) {
            throw new common_1.BadRequestException('Only configured posting users can mark posting as completed.');
        }
        const userId = this.normalizeUserId(user?._id ?? user?.id ?? user?.userId);
        const actorName = this.composeUserName(user);
        approval.postingApprovedBy = userId ? new mongoose_2.Types.ObjectId(userId) : undefined;
        approval.postingApprovedByName = actorName;
        approval.postingApprovedAt = new Date();
        approval.status = TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.APPROVED;
        approval.currentStage = 'POSTED';
        await approval.save();
        await this.workflowNotifier?.dispatch({
            module: 'transport_allowance',
            event: 'posted',
            doc: approval,
        });
        return { status: 200, message: 'Transport batch marked as posted.' };
    }
    async switchApprovalAccount(_user, approvalId, staffId, accountType) {
        const normalizedType = String(accountType ?? '').trim().toLowerCase();
        if (normalizedType !== 'atlas' && normalizedType !== 'addosser') {
            throw new common_1.BadRequestException('accountType must be "atlas" or "addosser".');
        }
        const target = String(staffId ?? '').trim();
        if (!target) {
            throw new common_1.BadRequestException('staffId is required.');
        }
        const approval = await this.transportApprovalModel.findById(approvalId).exec();
        if (!approval) {
            throw new common_1.NotFoundException('Transport approval not found.');
        }
        if (String(approval.status ?? '').toUpperCase() ===
            TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.APPROVED) {
            throw new common_1.BadRequestException('The payout account can no longer be switched after the batch has been posted.');
        }
        const rows = Array.isArray(approval.data)
            ? approval.data
            : [];
        const targetKey = target.toLowerCase();
        const idsOf = (row) => [row?.staff, row?.staffId, row?.staffObjectId, row?.id]
            .map((value) => String(value ?? '').trim().toLowerCase())
            .filter(Boolean);
        const matches = rows.filter((row) => idsOf(row).includes(targetKey));
        if (!matches.length) {
            throw new common_1.NotFoundException('Staff not found in this approval.');
        }
        const userLookupIds = Array.from(new Set(matches
            .map((row) => this.normalizeUserId(row?.staff))
            .filter((value) => Boolean(value))));
        let userDoc = userLookupIds.length
            ? await this.userModel
                .findOne({ _id: { $in: userLookupIds } })
                .select('_id atlasAccount addosserAccount')
                .lean()
                .exec()
            : null;
        if (!userDoc) {
            userDoc = await this.userModel
                .findOne({ staffId: target })
                .select('_id atlasAccount addosserAccount')
                .lean()
                .exec();
        }
        const source = normalizedType === 'atlas'
            ? userDoc?.atlasAccount
            : userDoc?.addosserAccount;
        const account = source === null || source === undefined ? '' : String(source).trim();
        if (!account) {
            throw new common_1.BadRequestException(`This staff has no ${normalizedType === 'atlas' ? 'Atlas' : 'Addosser'} account on file.`);
        }
        for (const row of matches) {
            row.payoutAccount = account;
            row.payoutAccountType = normalizedType;
        }
        approval.markModified('data');
        await approval.save();
        return {
            status: 200,
            message: 'Payout account switched successfully.',
            accountType: normalizedType,
            account,
        };
    }
    async switchApprovalAccountForAll(_user, approvalId, accountType) {
        const normalizedType = String(accountType ?? '').trim().toLowerCase();
        if (normalizedType !== 'atlas' && normalizedType !== 'addosser') {
            throw new common_1.BadRequestException('accountType must be "atlas" or "addosser".');
        }
        const approval = await this.transportApprovalModel.findById(approvalId).exec();
        if (!approval) {
            throw new common_1.NotFoundException('Transport approval not found.');
        }
        if (String(approval.status ?? '').toUpperCase() ===
            TransportAllowanceService_1.TRANSPORT_APPROVAL_STATUS.APPROVED) {
            throw new common_1.BadRequestException('The payout account can no longer be switched after the batch has been posted.');
        }
        const rows = Array.isArray(approval.data)
            ? approval.data
            : [];
        if (!rows.length) {
            throw new common_1.NotFoundException('This approval has no rows to switch.');
        }
        const objectIds = Array.from(new Set(rows
            .map((row) => this.normalizeUserId(row?.staff))
            .filter((value) => Boolean(value))));
        const usersById = new Map(objectIds.length
            ? (await this.userModel
                .find({ _id: { $in: objectIds } })
                .select('_id staffId atlasAccount addosserAccount')
                .lean()
                .exec()).map((user) => [String(user._id), user])
            : []);
        const fallbackCodes = Array.from(new Set(rows
            .filter((row) => !this.normalizeUserId(row?.staff))
            .map((row) => String(row?.staffId ?? '').trim())
            .filter(Boolean)));
        const usersByCode = new Map(fallbackCodes.length
            ? (await this.userModel
                .find({ staffId: { $in: fallbackCodes } })
                .select('_id staffId atlasAccount addosserAccount')
                .lean()
                .exec()).map((user) => [String(user.staffId ?? '').trim().toLowerCase(), user])
            : []);
        let switched = 0;
        let skipped = 0;
        for (const row of rows) {
            const userDoc = usersById.get(this.normalizeUserId(row?.staff) ?? '') ??
                usersByCode.get(String(row?.staffId ?? '').trim().toLowerCase());
            const source = normalizedType === 'atlas'
                ? userDoc?.atlasAccount
                : userDoc?.addosserAccount;
            const account = source === null || source === undefined ? '' : String(source).trim();
            if (!account) {
                skipped += 1;
                continue;
            }
            row.payoutAccount = account;
            row.payoutAccountType = normalizedType;
            switched += 1;
        }
        const label = normalizedType === 'atlas' ? 'Atlas' : 'Addosser';
        if (!switched) {
            throw new common_1.BadRequestException(`No staff in this approval has a ${label} account on file.`);
        }
        approval.markModified('data');
        await approval.save();
        return {
            status: 200,
            message: skipped
                ? `Payout account switched for ${switched} row(s); ${skipped} row(s) had no ${label} account on file and were left unchanged.`
                : 'Payout account switched successfully.',
            accountType: normalizedType,
            switched,
            skipped,
            appliedToAll: skipped === 0,
        };
    }
    async getWorkflowRole(user, options) {
        const userIdentifiers = this.getUserIdentifierSet(user);
        if (!userIdentifiers.size) {
            return {
                status: 200,
                data: {
                    isReviewer: false,
                    isFinalApprover: false,
                    isPoster: false,
                    isAuditViewer: false,
                    isInitiator: false,
                    isFinance: false,
                    entities: [],
                    entityCount: 0,
                },
            };
        }
        const query = {};
        if (options?.entity && !options?.scanAll) {
            query.entity = this.normalizeObjectId(options.entity, 'Entity');
        }
        const configs = await this.transportWorkflowModel.find(query).lean().exec();
        let isReviewer = false;
        let isFinalApprover = false;
        let isPoster = false;
        let isAuditViewer = false;
        let isInitiator = false;
        let isFinance = false;
        const entities = [];
        for (const config of configs) {
            const entityId = String(config?.entity ?? '');
            const inReviewers = this.listIncludesUserIdentifier(config.reviewerIds, userIdentifiers);
            const inApprovers = this.listIncludesUserIdentifier(config.approverIds, userIdentifiers);
            const inPosters = this.listIncludesUserIdentifier(config.postingIds, userIdentifiers);
            const inAudit = this.listIncludesUserIdentifier(config.auditViewerIds, userIdentifiers);
            const inInitiators = this.listIncludesUserIdentifier(config.initiatorIds, userIdentifiers);
            const inFinance = this.listIncludesUserIdentifier(config.financeIds, userIdentifiers);
            if (inReviewers || inApprovers || inPosters || inAudit || inInitiators) {
                if (entityId)
                    entities.push(entityId);
            }
            if (inReviewers)
                isReviewer = true;
            if (inApprovers)
                isFinalApprover = true;
            if (inPosters)
                isPoster = true;
            if (inAudit)
                isAuditViewer = true;
            if (inInitiators)
                isInitiator = true;
            if (inFinance)
                isFinance = true;
        }
        return {
            status: 200,
            data: {
                isReviewer,
                isFinalApprover,
                isPoster,
                isAuditViewer,
                isInitiator,
                isFinance,
                entities,
                entityCount: entities.length,
            },
        };
    }
};
exports.TransportAllowanceService = TransportAllowanceService;
TransportAllowanceService.TRANSPORT_APPROVAL_STATUS = {
    PENDING_REVIEW: 'PENDING_REVIEW',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    PENDING_POSTING: 'PENDING_POSTING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
};
TransportAllowanceService.SUPER_ADMIN_ROLE_NAMES = access_control_util_1.SUPER_ADMIN_ROLE_NAME_SET_WITH_MD;
exports.TransportAllowanceService = TransportAllowanceService = TransportAllowanceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(transport_allowance_schema_1.TransportAllowance.name)),
    __param(1, (0, mongoose_1.InjectModel)(transport_allowance_setting_schema_1.TransportAllowanceSetting.name)),
    __param(2, (0, mongoose_1.InjectModel)(department_schema_1.Department.name)),
    __param(3, (0, mongoose_1.InjectModel)(role_schema_1.Role.name)),
    __param(4, (0, mongoose_1.InjectModel)(subsidiary_schema_1.Subsidiary.name)),
    __param(5, (0, mongoose_1.InjectModel)(transport_workflow_schema_1.TransportWorkflowConfig.name)),
    __param(6, (0, mongoose_1.InjectModel)(transport_allowance_approval_schema_1.TransportAllowanceApproval.name)),
    __param(7, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(8, (0, mongoose_1.InjectModel)(branch_schema_1.Branch.name)),
    __param(10, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        notice_service_1.NoticeService,
        workflow_notifier_service_1.WorkflowNotifier])
], TransportAllowanceService);
//# sourceMappingURL=transport-allowance.service.js.map