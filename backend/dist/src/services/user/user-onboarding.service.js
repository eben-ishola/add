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
var UserOnboardingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserOnboardingService = void 0;
const common_1 = require("@nestjs/common");
const exit_service_1 = require("../employee-lifecycle/exit.service");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const role_schema_1 = require("../../schemas/role.schema");
const document_library_schema_1 = require("../../schemas/document-library.schema");
const index_utils_1 = require("../../utils/index.utils");
const user_name_util_1 = require("../../utils/user/user-name.util");
const subsidiary_service_1 = require("../org/subsidiary.service");
const level_service_1 = require("../org/level.service");
const branch_service_1 = require("../org/branch.service");
const department_service_1 = require("../org/department.service");
const businessUnit_service_1 = require("../org/businessUnit.service");
const notice_service_1 = require("../comms/notice.service");
const mail_service_1 = require("../comms/mail.service");
const user_directory_service_1 = require("./user-directory.service");
const config_1 = require("../../config");
const STAFF_WORKFLOW_FIELDS = [
    'firstName',
    'lastName',
    'middleName',
    'email',
    'staffId',
    'staffID',
    'userId',
    'userID',
    'status',
    'confirmed',
    'startDate',
    'exitDate',
    'role',
    'department',
    'branch',
    'additionalBranch',
    'businessUnit',
    'level',
    'transportLevel',
    'inconvenienceLevel',
    'entity',
    'phoneNumber',
    'dateOfBirth',
    'orbitID',
    'addosserAccount',
    'atlasAccount',
    'aftaAccount',
    'additionalAfta',
    'addToGross',
    'supervisorId',
    'supervisor2Id',
    'allowMultiBranch',
    'rent',
    'rentStartDate',
    'rentEndDate',
    'rentStart',
    'rentEnd',
    'additionalRoles',
    'supervisorStatus',
    'auditStatus',
    'itStatus',
    'hrStatus',
    'workflowType',
    'workflowStage',
    'workflowUpdatedAt',
    'requiresHrApproval',
    'pendingChanges',
    'createdAt',
    'updatedAt',
];
const STAFF_WORKFLOW_PROJECTION = STAFF_WORKFLOW_FIELDS.join(' ');
const DEFAULT_TEMPORARY_PASSWORD = 'addosser';
const STAFF_SUPERVISOR_LITE_POPULATE = [
    {
        path: 'supervisorId',
        select: 'firstName lastName email staffId staffID userId userID',
        options: { lean: true },
        skipInvalidIds: true,
    },
    {
        path: 'supervisor2Id',
        select: 'firstName lastName email staffId staffID userId userID',
        options: { lean: true },
        skipInvalidIds: true,
    },
];
let UserOnboardingService = UserOnboardingService_1 = class UserOnboardingService {
    constructor(staffModel, roleModel, documentModel, entityService, levelService, branchService, departmentService, businessUnit, noticeService, userDirectoryService, mailService, exitService) {
        this.staffModel = staffModel;
        this.roleModel = roleModel;
        this.documentModel = documentModel;
        this.entityService = entityService;
        this.levelService = levelService;
        this.branchService = branchService;
        this.departmentService = departmentService;
        this.businessUnit = businessUnit;
        this.noticeService = noticeService;
        this.userDirectoryService = userDirectoryService;
        this.mailService = mailService;
        this.exitService = exitService;
        this.logger = new common_1.Logger(UserOnboardingService_1.name);
    }
    extractObjectIdCandidate(value) {
        if (value == null)
            return null;
        if (typeof value === 'string')
            return value;
        if (typeof value === 'number' && Number.isFinite(value))
            return String(value);
        if (value instanceof mongoose_2.default.Types.ObjectId) {
            return value.toHexString();
        }
        if (typeof value === 'object') {
            if (typeof value?.toHexString === 'function') {
                return value.toHexString();
            }
            const fields = ['_id', 'id', 'value', '$oid'];
            for (const field of fields) {
                if (field in value) {
                    const resolved = this.extractObjectIdCandidate(value[field]);
                    if (resolved) {
                        return resolved;
                    }
                }
            }
        }
        const stringified = String(value);
        if (stringified && stringified !== '[object Object]') {
            return stringified;
        }
        return null;
    }
    normalizeObjectId(value) {
        const candidate = this.extractObjectIdCandidate(value);
        if (!candidate)
            return null;
        const trimmed = candidate.trim();
        if (!trimmed) {
            return null;
        }
        const lowered = trimmed.toLowerCase();
        if (lowered === 'undefined' || lowered === 'null' || lowered === 'all') {
            return null;
        }
        if (mongoose_2.default.Types.ObjectId.isValid(trimmed)) {
            return new mongoose_2.default.Types.ObjectId(trimmed);
        }
        return null;
    }
    isObjectIdEqual(a, b) {
        if (!a && !b)
            return true;
        if (!a || !b)
            return false;
        try {
            const aStr = mongoose_2.default.Types.ObjectId.isValid(a) ? String(a) : String(a?._id ?? a);
            const bStr = mongoose_2.default.Types.ObjectId.isValid(b) ? String(b) : String(b?._id ?? b);
            return aStr === bStr;
        }
        catch {
            return false;
        }
    }
    normalizeValue(value) {
        if (value == null)
            return null;
        if (mongoose_2.default.Types.ObjectId.isValid(value)) {
            return String(value);
        }
        if (value instanceof Date) {
            return value.toISOString();
        }
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
                const parsed = new Date(trimmed);
                if (!Number.isNaN(parsed.getTime())) {
                    return parsed.toISOString();
                }
            }
            return trimmed;
        }
        if (typeof value === 'object') {
            return JSON.stringify(this.toPlainValue(value));
        }
        return String(value);
    }
    toPlainValue(value) {
        if (value === null || value === undefined)
            return value;
        if (value instanceof Date)
            return value;
        if (mongoose_2.default.Types.ObjectId.isValid(value))
            return value;
        if (Array.isArray(value))
            return value.map((entry) => this.toPlainValue(entry));
        if (typeof value === 'object') {
            if (typeof value.toObject === 'function') {
                try {
                    return this.toPlainValue(value.toObject({ depopulate: true, virtuals: false }));
                }
                catch {
                }
            }
            const output = {};
            Object.entries(value).forEach(([key, entry]) => {
                output[key] = this.toPlainValue(entry);
            });
            return output;
        }
        return value;
    }
    isDiffableObject(value) {
        if (!value || typeof value !== 'object')
            return false;
        if (Array.isArray(value))
            return false;
        if (value instanceof Date)
            return false;
        if (mongoose_2.default.Types.ObjectId.isValid(value))
            return false;
        return true;
    }
    computeNestedPendingChange(current, next) {
        if (typeof next === 'undefined')
            return undefined;
        if (this.isDiffableObject(next)) {
            const currentObject = this.isDiffableObject(current)
                ? this.toPlainValue(current)
                : {};
            const nextObject = this.toPlainValue(next);
            const nestedDiff = {};
            Object.entries(nextObject).forEach(([key, value]) => {
                const childDiff = this.computeNestedPendingChange(currentObject?.[key], value);
                if (typeof childDiff !== 'undefined') {
                    nestedDiff[key] = childDiff;
                }
            });
            return Object.keys(nestedDiff).length ? nestedDiff : undefined;
        }
        const normalizedCurrent = this.normalizeValue(current);
        const normalizedNext = this.normalizeValue(next);
        return normalizedCurrent !== normalizedNext ? next : undefined;
    }
    mergeNestedValue(current, next) {
        if (!this.isDiffableObject(next))
            return next;
        const currentObject = this.isDiffableObject(current)
            ? this.toPlainValue(current)
            : {};
        const merged = { ...currentObject };
        Object.entries(next).forEach(([key, value]) => {
            merged[key] = this.mergeNestedValue(currentObject?.[key], value);
        });
        return merged;
    }
    escapeRegex(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    normalizeOptionalObjectIds(payload, fields) {
        if (!payload || typeof payload !== 'object')
            return payload;
        for (const field of fields) {
            const value = payload[field];
            if (typeof value === 'string' && value.trim() === '') {
                payload[field] = null;
            }
        }
        return payload;
    }
    normalizeAdditionalBranchIds(payload) {
        if (!payload || typeof payload !== 'object')
            return;
        if (!('additionalBranch' in payload))
            return;
        const raw = payload.additionalBranch;
        if (raw == null) {
            payload.additionalBranch = [];
            return;
        }
        const values = Array.isArray(raw) ? raw : [raw];
        const normalized = values
            .map((value) => this.normalizeObjectId(value))
            .filter((value) => Boolean(value));
        payload.additionalBranch = normalized;
    }
    stripEmptyPayloadFields(payload) {
        if (!payload || typeof payload !== 'object')
            return {};
        const cleaned = {};
        Object.entries(payload).forEach(([key, value]) => {
            if (value === null || value === undefined)
                return;
            if (typeof value === 'string' && value.trim() === '')
                return;
            cleaned[key] = value;
        });
        return cleaned;
    }
    extractRoleNameValue(value) {
        if (!value)
            return null;
        if (typeof value === 'string')
            return value.trim();
        if (typeof value === 'object') {
            if (typeof value?.name === 'string')
                return value.name.trim();
            if (typeof value?.label === 'string')
                return value.label.trim();
        }
        return null;
    }
    serializeRoleAssignmentsSnapshot(input) {
        const list = Array.isArray(input) ? input : input ? [input] : [];
        const normalized = list
            .map((entry) => {
            const roleId = this.normalizeObjectId(typeof entry === 'object' ? entry?.role ?? entry?.roleId ?? entry?.value ?? entry : entry);
            if (!roleId)
                return null;
            const entityId = this.normalizeObjectId(typeof entry === 'object' ? entry?.entity ?? entry?.entityId ?? entry?.subsidiary ?? entry?.tenant : undefined);
            return {
                role: roleId.toHexString(),
                entity: entityId ? entityId.toHexString() : null,
            };
        })
            .filter((entry) => Boolean(entry))
            .sort((a, b) => {
            const left = `${a.role}::${a.entity ?? ''}`;
            const right = `${b.role}::${b.entity ?? ''}`;
            return left.localeCompare(right);
        });
        return JSON.stringify(normalized);
    }
    async resolveAdditionalRoleAssignments(input) {
        const values = Array.isArray(input) ? input : input ? [input] : [];
        if (!values.length)
            return [];
        const assignments = [];
        const pending = [];
        values.forEach((entry) => {
            if (!entry)
                return;
            const directRoleValue = typeof entry === 'object'
                ? entry?.role ?? entry?.roleId ?? entry?.value
                : entry;
            const roleObjectId = this.normalizeObjectId(directRoleValue);
            const entityObjectId = this.normalizeObjectId(typeof entry === 'object' ? entry?.entity ?? entry?.entityId ?? entry?.subsidiary ?? entry?.tenant : undefined);
            if (roleObjectId) {
                assignments.push({ role: roleObjectId, entity: entityObjectId ?? undefined });
                return;
            }
            const roleName = this.extractRoleNameValue(typeof entry === 'object' ? entry?.role ?? entry : entry);
            if (roleName) {
                pending.push({ name: roleName.trim().toLowerCase(), entity: entityObjectId ?? undefined });
            }
        });
        if (pending.length) {
            const pendingNames = Array.from(new Set(pending.map((item) => item.name)));
            const regexes = pendingNames.map((name) => new RegExp(`^${this.escapeRegex(name)}$`, 'i'));
            const roles = await this.roleModel.find({ name: { $in: regexes } }).select('_id name').lean();
            const resolvedByName = new Map(roles.map((role) => [
                String(role?.name ?? '')
                    .trim()
                    .toLowerCase(),
                role?._id,
            ]));
            const missing = pendingNames.filter((name) => !resolvedByName.has(name));
            if (missing.length) {
                throw new Error(`Role(s) not found: ${missing.join(', ')}`);
            }
            pending.forEach((item) => {
                const resolvedRoleId = resolvedByName.get(item.name);
                if (resolvedRoleId) {
                    assignments.push({ role: resolvedRoleId, entity: item.entity });
                }
            });
        }
        const unique = new Map();
        assignments.forEach((assignment) => {
            const key = `${assignment.role.toHexString()}::${assignment.entity?.toHexString() ?? ''}`;
            if (!unique.has(key)) {
                unique.set(key, assignment);
            }
        });
        return Array.from(unique.values());
    }
    normalizeEntityCandidates(entity) {
        const candidates = [];
        const raw = String(entity?._id ?? entity ?? '').trim();
        if (!raw)
            return candidates;
        candidates.push(raw);
        if (mongoose_2.default.Types.ObjectId.isValid(raw)) {
            candidates.push(new mongoose_2.default.Types.ObjectId(raw));
        }
        return candidates;
    }
    async resolveRoleByNameAndEntity(name, entity) {
        const normalizedName = name?.trim();
        if (!normalizedName)
            return null;
        const baseQuery = {
            name: { $regex: new RegExp(`^${this.escapeRegex(normalizedName)}$`, 'i') },
        };
        const candidates = this.normalizeEntityCandidates(entity);
        if (candidates.length) {
            baseQuery.entity = { $in: candidates };
        }
        const role = (await this.roleModel.findOne(baseQuery).lean()) ??
            (await this.roleModel
                .findOne({ name: baseQuery.name })
                .lean());
        return role;
    }
    async resolveReferenceId(field, value, entityId) {
        const directObjectId = this.normalizeObjectId(typeof value === 'object' ? value?._id ?? value?.id ?? value?.value ?? value : value);
        if (directObjectId) {
            return directObjectId;
        }
        const name = typeof value === 'string'
            ? value.trim()
            : typeof value === 'object'
                ? String(value?.name ?? value?.label ?? '').trim()
                : '';
        if (!name)
            return null;
        try {
            switch (field) {
                case 'entity': {
                    const entity = (await this.entityService.getSubsidiaryByShort(name)) ??
                        (await this.entityService.getSubsidiaryByName(name));
                    return this.normalizeObjectId(entity?._id ?? entity?.id);
                }
                case 'department': {
                    const department = (await this.departmentService.getDepartmentByNameAndEntity(name, entityId ?? undefined)) ??
                        (await this.departmentService.getDepartmentByName(name));
                    return this.normalizeObjectId(department?._id ?? department?.id);
                }
                case 'businessUnit': {
                    const bu = await this.businessUnit.getBusinessUnitByName(name);
                    return this.normalizeObjectId(bu?._id ?? bu?.id);
                }
                case 'branch': {
                    const branch = await this.branchService.getBranchByName(name);
                    return this.normalizeObjectId(branch?._id ?? branch?.id);
                }
                case 'level': {
                    const level = await this.levelService.getLevelByNameAndEntity(name);
                    return this.normalizeObjectId(level?._id ?? level?.id);
                }
                case 'role': {
                    const role = await this.resolveRoleByNameAndEntity(name, entityId ?? undefined);
                    return this.normalizeObjectId(role?._id ?? role?.id);
                }
                case 'supervisor':
                case 'supervisorId': {
                    const supervisor = await this.userDirectoryService.getById(name).catch(() => null);
                    return supervisor?._id ? new mongoose_2.default.Types.ObjectId(supervisor._id) : null;
                }
                case 'supervisor2Id': {
                    const supervisor = await this.userDirectoryService.getById(name).catch(() => null);
                    return supervisor?._id ? new mongoose_2.default.Types.ObjectId(supervisor._id) : null;
                }
                default:
                    return null;
            }
        }
        catch {
            return null;
        }
    }
    async sanitizeStaffPayload(payload) {
        if (!payload)
            return {};
        const result = { ...payload };
        (0, user_name_util_1.normalizeNameFields)(result);
        this.normalizeOptionalObjectIds(result, [
            'supervisorId',
            'supervisor2Id',
            'branch',
            'department',
            'entity',
            'businessUnit',
            'level',
            'role',
        ]);
        let scopedEntity = this.normalizeObjectId(typeof result.entity === 'object'
            ? result.entity?._id ?? result.entity?.id ?? result.entity
            : result.entity) ??
            this.normalizeObjectId(result.entityId ?? result.subsidiary ?? result.subsidiaryId);
        const refKeys = [
            'entity',
            'department',
            'role',
            'businessUnit',
            'branch',
            'level',
            'supervisor',
            'supervisorId',
            'supervisor2Id',
        ];
        for (const key of refKeys) {
            const current = result[key];
            if (!current)
                continue;
            const resolved = await this.resolveReferenceId(key, current, scopedEntity);
            if (resolved) {
                result[key] = resolved;
                if (key === 'entity') {
                    scopedEntity = resolved;
                }
            }
        }
        if ('additionalBranch' in result) {
            const entries = Array.isArray(result.additionalBranch)
                ? result.additionalBranch
                : result.additionalBranch
                    ? [result.additionalBranch]
                    : [];
            const resolvedEntries = await Promise.all(entries.map((entry) => this.resolveReferenceId('branch', entry, scopedEntity)));
            result.additionalBranch = resolvedEntries.filter(Boolean);
        }
        if ('additionalRoles' in result) {
            const resolved = await this.resolveAdditionalRoleAssignments(result.additionalRoles);
            result.additionalRoles = resolved;
        }
        for (const numericField of ['additionalAfta', 'addToGross']) {
            if (numericField in result) {
                const raw = result[numericField];
                if (raw === '' || raw === null || raw === undefined) {
                    result[numericField] = 0;
                }
                else {
                    const parsed = Number(String(raw).replace(/,/g, '').trim());
                    result[numericField] = Number.isFinite(parsed) ? parsed : 0;
                }
            }
        }
        if ('allowMultiBranch' in result) {
            const raw = result.allowMultiBranch;
            if (typeof raw === 'string') {
                const normalized = raw.trim().toLowerCase();
                result.allowMultiBranch = ['true', '1', 'yes', 'y', 'on'].includes(normalized);
            }
            else {
                result.allowMultiBranch = Boolean(raw);
            }
        }
        return result;
    }
    computePendingChanges(existing, updates) {
        const diff = {};
        const ignored = new Set([
            '_id',
            'createdAt',
            'updatedAt',
            '__v',
            'pendingChanges',
            'requiresHrApproval',
            'workflowStage',
            'workflowType',
            'workflowUpdatedAt',
            'supervisorStatus',
            'auditStatus',
            'itStatus',
            'hrStatus',
            'hodApproval',
            'auditApproval',
            'itApproval',
            'supervisorApproverId',
            'auditApproverId',
            'itApproverId',
            'hrApproverId',
        ]);
        for (const [key, value] of Object.entries(updates)) {
            if (ignored.has(key))
                continue;
            if (typeof value === 'undefined')
                continue;
            const current = existing?.[key];
            if (key === 'additionalRoles') {
                const currentSnapshot = this.serializeRoleAssignmentsSnapshot(current);
                const nextSnapshot = this.serializeRoleAssignmentsSnapshot(value);
                if (currentSnapshot !== nextSnapshot) {
                    diff[key] = value;
                }
                continue;
            }
            if (mongoose_2.default.Types.ObjectId.isValid(value) || mongoose_2.default.Types.ObjectId.isValid(current)) {
                if (!this.isObjectIdEqual(current, value)) {
                    diff[key] = value;
                }
                continue;
            }
            const nestedDiff = this.computeNestedPendingChange(current, value);
            if (typeof nestedDiff !== 'undefined') {
                diff[key] = nestedDiff;
            }
        }
        return diff;
    }
    async normalizePendingReferenceIds(pending, staff) {
        if (!pending || typeof pending !== 'object')
            return pending;
        const normalized = { ...pending };
        let scopedEntity = this.normalizeObjectId(typeof normalized.entity === 'object' ? normalized.entity?._id ?? normalized.entity?.id ?? normalized.entity : normalized.entity) ?? this.normalizeObjectId(staff?.entity);
        const refKeys = [
            'department',
            'role',
            'businessUnit',
            'branch',
            'level',
            'supervisor',
            'supervisorId',
            'entity',
        ];
        for (const key of refKeys) {
            const current = normalized[key];
            if (!current)
                continue;
            const resolved = await this.resolveReferenceId(key, current, scopedEntity);
            if (resolved) {
                normalized[key] = resolved;
                if (key === 'entity') {
                    scopedEntity = resolved;
                }
            }
        }
        if (normalized.additionalBranch) {
            const entries = Array.isArray(normalized.additionalBranch)
                ? normalized.additionalBranch
                : [normalized.additionalBranch];
            const resolvedEntries = await Promise.all(entries.map((entry) => this.resolveReferenceId('branch', entry, scopedEntity)));
            normalized.additionalBranch = resolvedEntries.filter(Boolean);
        }
        return normalized;
    }
    async createNotice(userId, message, link, type) {
        if (!userId)
            return;
        try {
            await this.noticeService.createNotice({
                userId: String(userId),
                message,
                link,
                type,
            });
        }
        catch {
        }
    }
    async notifySupervisorStage(staff) {
        const candidate = staff?.supervisor2Id ?? staff?.supervisorId ?? null;
        const targetId = candidate && mongoose_2.default.Types.ObjectId.isValid(String(candidate))
            ? new mongoose_2.default.Types.ObjectId(String(candidate))
            : null;
        if (!targetId) {
            staff.supervisorStatus = 'Approved';
            await this.progressToAuditStage(staff, null);
            return;
        }
        await this.createNotice(targetId, `Staff onboarding approval requested for ${staff.firstName} ${staff.lastName}.`, `/employees/${staff._id}`, 'enrollment-supervisor');
    }
    async commenceExit(staff, exitDate, approverId) {
        if (!this.exitService)
            return;
        try {
            await this.exitService.commenceExit(staff?._id, exitDate, {
                id: approverId ? String(approverId) : '',
            });
        }
        catch (error) {
            this.logger.error(`Unable to start exit clearance for ${staff?._id}: ${error?.message ?? error}`);
        }
    }
    async progressToAuditStage(staff, approverId) {
        staff.workflowStage = 'AUDIT';
        staff.auditStatus = 'Pending';
        staff.workflowUpdatedAt = new Date();
        if (approverId) {
            staff.hodApproval = approverId;
        }
        await staff.save();
        const auditApprover = await this.userDirectoryService.findActiveStaffByRoleKeywords(['head of audit'], staff.entity);
        const auditUser = auditApprover?.[0];
        if (auditUser?._id) {
            await this.createNotice(auditUser._id, `Audit approval required for ${staff.firstName} ${staff.lastName}'s onboarding.`, `/employees/${staff._id}`, 'enrollment-audit');
        }
    }
    async notifyItStage(staff) {
        const itUsers = await this.userDirectoryService.findActiveStaffByRoleKeywords(['it'], staff.entity);
        await Promise.all(itUsers.map((user) => this.createNotice(user._id, `IT action required for ${staff.firstName} ${staff.lastName}'s onboarding.`, `/employees/${staff._id}`, 'enrollment-it')));
    }
    async notifyHrStage(staff) {
        const hrUsers = await this.userDirectoryService.findActiveStaffByRoleKeywords(['hr super admin'], staff.entity);
        await Promise.all(hrUsers.map((user) => this.createNotice(user._id, `HR review required for updates to ${staff.firstName} ${staff.lastName}.`, `/employees/${staff._id}`, 'update-hr')));
    }
    async notifyStaffOutcome(staff, status, context) {
        const message = context === 'enrollment'
            ? status === 'Approved'
                ? 'Your onboarding has been completed.'
                : 'Your onboarding request was rejected.'
            : status === 'Approved'
                ? 'Your profile update has been approved.'
                : 'Your profile update was rejected.';
        await this.createNotice(staff._id, message, `/employees/${staff._id}`, context === 'enrollment' ? 'enrollment-outcome' : 'update-outcome');
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
    normalizeEmail(value) {
        return typeof value === 'string' ? value.trim().toLowerCase() : '';
    }
    getStaffFullName(staff) {
        return [staff?.firstName, staff?.middleName, staff?.lastName]
            .filter((value) => typeof value === 'string' && value.trim().length)
            .join(' ')
            .trim();
    }
    renderStaffEmailBodyTemplate(template, staff, loginUrl, handbookUrl) {
        const email = this.normalizeEmail(staff?.email);
        const variables = {
            firstName: staff?.firstName ?? '',
            middleName: staff?.middleName ?? '',
            lastName: staff?.lastName ?? '',
            fullName: this.getStaffFullName(staff) || email,
            email,
            staffId: staff?.staffId ?? staff?.staffID ?? '',
            loginUrl,
            changePasswordUrl: `${loginUrl}/change-password`,
            handbookUrl: handbookUrl ?? '',
            handbookLink: handbookUrl ?? '',
        };
        return template.replace(/{{\s*([^}]+)\s*}}/g, (_match, rawKey) => {
            const key = String(rawKey ?? '').trim();
            return variables[key] ?? '';
        });
    }
    buildEntityAccessConditions(entityId) {
        if (!entityId)
            return [];
        return [
            { 'viewAccess.scope': 'entities', 'viewAccess.entityIds': entityId },
            { 'downloadAccess.scope': 'entities', 'downloadAccess.entityIds': entityId },
            { 'editAccess.scope': 'entities', 'editAccess.entityIds': entityId },
        ];
    }
    async findWelcomeHandbook(staff) {
        const entityId = this.extractObjectIdCandidate(staff?.entity);
        const baseQuery = {
            title: { $regex: /\bhandbook\b/i },
            category: { $regex: /^policy(?:\s+documents?)?$/i },
        };
        const entityConditions = this.buildEntityAccessConditions(entityId);
        if (entityConditions.length) {
            const entityDocument = await this.documentModel
                .findOne({
                ...baseQuery,
                $or: entityConditions,
            })
                .sort({ featured: -1, updatedAt: -1 })
                .lean()
                .exec();
            if (entityDocument)
                return entityDocument;
        }
        return this.documentModel
            .findOne({
            ...baseQuery,
            $or: [
                { 'viewAccess.scope': 'all' },
                { viewAccess: { $exists: false } },
                { 'viewAccess.scope': { $exists: false } },
            ],
        })
            .sort({ featured: -1, updatedAt: -1 })
            .lean()
            .exec();
    }
    getPublicAssetsBaseUrl() {
        const candidates = [
            process.env.PUBLIC_ASSETS_BASE_URL,
            process.env.VITE_PUBLIC_ASSETS_BASE_URL,
            process.env.API_BASE_URL,
            process.env.HR_PORTAL_API_URL,
            process.env.BACKEND_PUBLIC_URL,
        ];
        return candidates.find((value) => typeof value === 'string' && value.trim().length > 0)?.replace(/\/+$/, '');
    }
    resolveDocumentFileUrl(fileUrl) {
        const trimmed = typeof fileUrl === 'string' ? fileUrl.trim() : '';
        if (!trimmed)
            return undefined;
        if (/^https?:\/\//i.test(trimmed))
            return trimmed;
        const assetBase = this.getPublicAssetsBaseUrl();
        if (!assetBase)
            return undefined;
        return `${assetBase}/${trimmed.replace(/^\/+/, '')}`;
    }
    resolveHandbookUrl(handbook, loginUrl) {
        const documentId = this.extractObjectIdCandidate(handbook?._id ?? handbook?.id);
        if (documentId) {
            return `${loginUrl}/documents/view/${documentId}`;
        }
        return this.resolveDocumentFileUrl(handbook?.fileUrl);
    }
    async sendWelcomeEmailForNewStaff(staff) {
        const email = this.normalizeEmail(staff?.email);
        if (!email)
            return;
        try {
            const loginUrl = this.getPortalBaseUrl();
            const handbook = await this.findWelcomeHandbook(staff);
            const handbookUrl = this.resolveHandbookUrl(handbook, loginUrl);
            const handbookBody = typeof handbook?.description === 'string' && handbook.description.trim().length
                ? this.renderStaffEmailBodyTemplate(handbook.description.trim(), staff, loginUrl, handbookUrl)
                : `Welcome to ADDOSSER HRMS. Your employee profile has been created.`;
            const staffId = staff?.staffId ?? staff?.staffID ?? '';
            const credentialLines = [
                handbookUrl ? `Employee handbook: ${handbookUrl}` : '',
                'Login credentials',
                `Login URL: ${loginUrl}`,
                `Email: ${email}`,
                staffId ? `Staff ID: ${staffId}` : '',
                `Temporary password: ${DEFAULT_TEMPORARY_PASSWORD}`,
                '',
                'Please change your password immediately after signing in.',
            ].filter(Boolean);
            const text = `${handbookBody}\n\n${credentialLines.join('\n')}`;
            const result = await this.mailService.sendMail({
                to: email,
                subject: 'Your ADDOSSER HRMS login details',
                text,
            });
            if (result && result.success === false) {
                this.logger.warn(`Welcome email to ${email} was not sent: ${result.message ?? 'unknown mail service response'}`);
            }
        }
        catch (error) {
            this.logger.warn(`Unable to send welcome email to ${email}: ${error?.message ?? error}`);
        }
    }
    async createOrUpdateStaff(createStaffDto) {
        try {
            const { email, staffId, ...updateData } = createStaffDto;
            if (!email && !staffId) {
                throw new Error('Either email or staffId must be provided to identify the staff record.');
            }
            const query = {};
            if (staffId)
                query.staffId = staffId;
            if (email)
                query.email = email;
            const existing = await this.staffModel.findOne(query);
            const now = new Date();
            if (existing) {
                const normalizedUpdates = await this.sanitizeStaffPayload({ email, staffId, ...updateData });
                const diffs = this.computePendingChanges(existing, normalizedUpdates);
                if (!Object.keys(diffs).length) {
                    return existing;
                }
                existing.pendingChanges = {
                    ...(existing.pendingChanges || {}),
                    ...diffs,
                };
                existing.requiresHrApproval = true;
                existing.workflowType = 'update';
                existing.workflowStage = 'HR_REVIEW';
                existing.hrStatus = 'Pending';
                existing.workflowUpdatedAt = now;
                await existing.save();
                await this.notifyHrStage(existing);
                return existing;
            }
            const normalizedPayload = await this.sanitizeStaffPayload(createStaffDto);
            const payload = {
                ...normalizedPayload,
                status: 'Pending',
                supervisorStatus: 'Pending',
                auditStatus: 'Pending',
                itStatus: 'Pending',
                hrStatus: 'Pending',
                workflowType: 'enrollment',
                workflowStage: 'SUPERVISOR',
                requiresHrApproval: false,
                workflowUpdatedAt: now,
            };
            if (payload.supervisor2Id === '') {
                payload.supervisor2Id = null;
            }
            const staff = new this.staffModel(payload);
            await staff.save();
            await this.notifySupervisorStage(staff);
            await this.sendWelcomeEmailForNewStaff(staff);
            return staff;
        }
        catch (e) {
            console.error('createOrUpdateStaff failed:', e);
            throw new Error(e.message || 'Unable to create/update staff');
        }
    }
    async createStaff(createStaffDto) {
        try {
            const { email, staffId, ...updateData } = createStaffDto;
            if (!email && !staffId) {
                throw new Error('Either email or staffId must be provided to identify the staff record.');
            }
            const query = {};
            if (staffId)
                query.staffId = staffId;
            if (email)
                query.email = email;
            const existing = await this.staffModel.findOne(query);
            const now = new Date();
            if (existing) {
                const normalizedUpdates = await this.sanitizeStaffPayload({ email, staffId, ...updateData });
                const diffs = this.computePendingChanges(existing, normalizedUpdates);
                if (!Object.keys(diffs).length) {
                    return existing;
                }
                existing.pendingChanges = {
                    ...(existing.pendingChanges || {}),
                    ...diffs,
                };
                existing.requiresHrApproval = true;
                existing.workflowType = 'update';
                existing.workflowStage = 'HR_REVIEW';
                existing.hrStatus = 'Pending';
                existing.workflowUpdatedAt = now;
                await existing.save();
                await this.notifyHrStage(existing);
                return existing;
            }
            const normalizedPayload = await this.sanitizeStaffPayload(createStaffDto);
            const payload = {
                ...normalizedPayload,
                status: 'Active',
                supervisorStatus: 'Pending',
                auditStatus: 'Pending',
                itStatus: 'Pending',
                hrStatus: 'Pending',
                workflowType: 'enrollment',
                workflowStage: 'SUPERVISOR',
                requiresHrApproval: false,
                workflowUpdatedAt: now,
            };
            if (payload.supervisorId === '') {
                payload.supervisorId = null;
            }
            if (payload.supervisor2Id === '') {
                payload.supervisor2Id = null;
            }
            const staff = new this.staffModel(payload);
            await staff.save();
            await this.notifySupervisorStage(staff);
            await this.sendWelcomeEmailForNewStaff(staff);
            return staff;
        }
        catch (e) {
            console.error('createOrUpdateStaff failed:', e);
            throw new Error(e.message || 'Unable to create staff');
        }
    }
    async updateUploadedStaff(createStaffDto, options) {
        try {
            const { email, staffId, ...updateData } = createStaffDto;
            if (!email && !staffId) {
                throw new Error('Either email or staffId must be provided to identify the staff record.');
            }
            let existing = null;
            if (staffId) {
                existing = await this.staffModel.findOne({ staffId });
            }
            if (!existing && email) {
                existing = await this.staffModel.findOne({ email });
            }
            if (!existing) {
                if (!options?.allowCreate) {
                    return null;
                }
                const now = new Date();
                const normalizedPayload = await this.sanitizeStaffPayload(createStaffDto);
                const payload = {
                    ...normalizedPayload,
                    status: normalizedPayload.status ?? 'Active',
                    supervisorStatus: 'Pending',
                    auditStatus: 'Pending',
                    itStatus: 'Pending',
                    hrStatus: 'Pending',
                    workflowType: 'enrollment',
                    workflowStage: 'SUPERVISOR',
                    requiresHrApproval: false,
                    workflowUpdatedAt: now,
                };
                const staff = new this.staffModel(payload);
                await staff.save();
                await this.notifySupervisorStage(staff);
                await this.sendWelcomeEmailForNewStaff(staff);
                return staff;
            }
            const now = new Date();
            const normalizedUpdates = await this.sanitizeStaffPayload({ email, staffId, ...updateData });
            const diffs = this.computePendingChanges(existing, normalizedUpdates);
            if (!Object.keys(diffs).length) {
                return existing;
            }
            existing.pendingChanges = {
                ...(existing.pendingChanges || {}),
                ...diffs,
            };
            existing.requiresHrApproval = true;
            existing.workflowType = 'update';
            existing.workflowStage = 'HR_REVIEW';
            existing.hrStatus = 'Pending';
            existing.workflowUpdatedAt = now;
            await existing.save({ validateBeforeSave: false });
            await this.notifyHrStage(existing);
            return existing;
        }
        catch (e) {
            console.error('updateUploadedStaff failed:', e);
            throw new Error(e.message || 'Unable to update staff');
        }
    }
    async updateStaff(createStaffDto) {
        try {
            const { id, ...updateData } = createStaffDto;
            const staff = await this.staffModel.findById(id);
            if (!staff) {
                throw new Error('Staff not found');
            }
            if (updateData.exitDate) {
                const exit = new Date(updateData.exitDate);
                if (!isNaN(exit.getTime())) {
                    updateData.exitDate = exit;
                    const isBefore2020 = exit.getFullYear() < 2020;
                    const isPast = exit.getTime() <= Date.now();
                    updateData.status = (!isBefore2020 && isPast) ? 'Inactive' : 'Active';
                }
                else {
                    delete updateData.exitDate;
                }
            }
            const diffs = this.computePendingChanges(staff, updateData);
            if (!Object.keys(diffs).length) {
                return staff;
            }
            staff.pendingChanges = {
                ...(staff.pendingChanges || {}),
                ...diffs,
            };
            staff.requiresHrApproval = true;
            staff.workflowType = 'update';
            staff.workflowStage = 'HR_REVIEW';
            staff.hrStatus = 'Pending';
            staff.workflowUpdatedAt = new Date();
            await staff.save({ validateBeforeSave: false });
            await this.notifyHrStage(staff);
            return staff;
        }
        catch (e) {
            throw new Error(e.message || 'Unable to update staff');
        }
    }
    async resetRent(staffId) {
        const staff = await this.staffModel.findById(staffId);
        if (!staff) {
            throw new Error('Staff not found');
        }
        return this.updateStaff({
            id: staffId,
            rent: null,
            rentStartDate: null,
            rentEndDate: null,
            rentStart: null,
            rentEnd: null,
            rentReceipt: null,
            rentSupporting: null,
        });
    }
    async getWorkflowSummary(type, entity, supervisorId) {
        const allowedTypes = type ? [type] : ['enrollment', 'update'];
        const filter = {
            workflowType: { $in: allowedTypes },
        };
        if (entity) {
            filter.$or = [{ entity }, { entity: (0, index_utils_1.toObjectId)(entity) }];
        }
        const normalizedSupervisor = this.normalizeObjectId(supervisorId);
        if (normalizedSupervisor) {
            filter.$and = [
                ...(filter.$and ?? []),
                { $or: [{ supervisorId: normalizedSupervisor }, { supervisor2Id: normalizedSupervisor }] },
            ];
        }
        const data = await this.staffModel
            .find(filter)
            .select(STAFF_WORKFLOW_PROJECTION)
            .populate([
            { path: 'department', select: 'name entity', options: { lean: true } },
            { path: 'role', select: 'name app profileKey', options: { lean: true }, skipInvalidIds: true },
            { path: 'branch', select: 'name entity', options: { lean: true } },
            { path: 'entity', select: 'name short', options: { lean: true } },
            ...STAFF_SUPERVISOR_LITE_POPULATE,
        ])
            .sort({ workflowUpdatedAt: -1, updatedAt: -1 })
            .lean();
        return data.map((item) => ({
            _id: item._id,
            staffId: item.staffId,
            name: `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim(),
            department: item?.department?.name ?? null,
            role: item?.role?.name ?? null,
            branch: item?.branch?.name ?? null,
            entity: item?.entity?.name ?? item?.entity ?? null,
            supervisorStatus: item?.supervisorStatus ?? 'Pending',
            auditStatus: item?.auditStatus ?? 'Pending',
            itStatus: item?.itStatus ?? 'Pending',
            hrStatus: item?.hrStatus ?? 'Pending',
            workflowType: item?.workflowType ?? null,
            workflowStage: item?.workflowStage ?? 'NONE',
            workflowUpdatedAt: item?.workflowUpdatedAt ?? item?.updatedAt ?? item?.createdAt,
            requiresHrApproval: !!item?.requiresHrApproval,
            pendingChanges: item?.pendingChanges ?? null,
            status: item?.status,
            supervisor: item?.supervisorId ? `${item.supervisorId?.firstName ?? ''} ${item.supervisorId?.lastName ?? ''}`.trim() : null,
            supervisor2: item?.supervisor2Id ? `${item.supervisor2Id?.firstName ?? ''} ${item.supervisor2Id?.lastName ?? ''}`.trim() : null,
        }));
    }
    async approveUser(userId, approverId, type, action = 'approve', payload) {
        try {
            const staff = await this.staffModel.findById(userId);
            if (!staff) {
                throw new Error('Staff not found');
            }
            const optionalRefs = [
                'supervisorId',
                'supervisor2Id',
                'businessUnit',
                'role',
                'department',
                'branch',
                'entity',
                'level',
            ];
            this.normalizeOptionalObjectIds(staff, optionalRefs);
            this.normalizeAdditionalBranchIds(staff);
            if (staff.pendingChanges && typeof staff.pendingChanges === 'object') {
                this.normalizeOptionalObjectIds(staff.pendingChanges, optionalRefs);
            }
            const now = new Date();
            const isApprove = action === 'approve';
            if (type === 'supervisor') {
                if (staff.workflowStage !== 'SUPERVISOR') {
                    throw new Error('Staff is not awaiting supervisor approval.');
                }
                staff.supervisorStatus = isApprove ? 'Approved' : 'Rejected';
                staff.workflowUpdatedAt = now;
                if (isApprove) {
                    await this.progressToAuditStage(staff, approverId);
                }
                else {
                    staff.status = 'Rejected';
                    staff.workflowStage = 'REJECTED';
                    await staff.save();
                    await this.notifyStaffOutcome(staff, 'Rejected', 'enrollment');
                }
                return {
                    message: `Supervisor ${isApprove ? 'approval' : 'rejection'} recorded successfully`,
                    data: staff,
                };
            }
            if (type === 'audit') {
                if (staff.workflowStage !== 'AUDIT') {
                    throw new Error('Staff is not awaiting audit approval.');
                }
                staff.auditStatus = isApprove ? 'Approved' : 'Rejected';
                staff.auditApproval = isApprove ? approverId : staff.auditApproval;
                staff.workflowUpdatedAt = now;
                if (isApprove) {
                    staff.workflowStage = 'IT';
                    await staff.save();
                    await this.notifyItStage(staff);
                }
                else {
                    staff.status = 'Rejected';
                    staff.workflowStage = 'REJECTED';
                    await staff.save();
                    await this.notifyStaffOutcome(staff, 'Rejected', 'enrollment');
                }
                return {
                    message: `Audit ${isApprove ? 'approval' : 'rejection'} recorded successfully`,
                    data: staff,
                };
            }
            if (type === 'it') {
                if (staff.workflowStage !== 'IT') {
                    throw new Error('Staff is not awaiting IT action.');
                }
                staff.itStatus = isApprove ? 'Approved' : 'Rejected';
                staff.itApproval = isApprove ? approverId : staff.itApproval;
                staff.workflowUpdatedAt = now;
                if (isApprove) {
                    if (payload?.orbitID) {
                        staff.orbitID = payload.orbitID;
                    }
                    if (payload?.email) {
                        staff.email = payload.email;
                    }
                    staff.status = 'Active';
                    staff.workflowStage = 'COMPLETED';
                    staff.hrStatus = 'Approved';
                    staff.requiresHrApproval = false;
                    staff.pendingChanges = null;
                    staff.workflowType = 'enrollment';
                    await staff.save();
                    await this.notifyStaffOutcome(staff, 'Approved', 'enrollment');
                }
                else {
                    staff.status = 'Rejected';
                    staff.workflowStage = 'REJECTED';
                    await staff.save();
                    await this.notifyStaffOutcome(staff, 'Rejected', 'enrollment');
                }
                return {
                    message: `IT ${isApprove ? 'completion' : 'rejection'} recorded successfully`,
                    data: staff,
                };
            }
            if (type === 'hr') {
                if (!staff.requiresHrApproval) {
                    throw new Error('Staff is not pending HR review.');
                }
                staff.hrStatus = isApprove ? 'Approved' : 'Rejected';
                staff.workflowUpdatedAt = now;
                if (isApprove) {
                    const pendingRaw = await this.normalizePendingReferenceIds(staff.pendingChanges || {}, staff);
                    const clearsExitDate = Object.prototype.hasOwnProperty.call(pendingRaw, 'exitDate') &&
                        pendingRaw.exitDate === null;
                    const pending = this.stripEmptyPayloadFields(pendingRaw);
                    const pendingExitDate = pending?.exitDate;
                    const resolvedExitDate = pendingExitDate instanceof Date ? pendingExitDate : new Date(pendingExitDate);
                    const hasExitUpdate = pendingExitDate !== undefined &&
                        pendingExitDate !== null &&
                        !Number.isNaN(resolvedExitDate.getTime());
                    if (hasExitUpdate) {
                        staff.exitDate = resolvedExitDate;
                        if (Object.prototype.hasOwnProperty.call(pending, 'status')) {
                            staff.status = pending.status;
                        }
                        staff.pendingChanges = null;
                        staff.requiresHrApproval = false;
                        staff.workflowStage = 'COMPLETED';
                        staff.workflowType = null;
                        await staff.save({ validateBeforeSave: false });
                        await this.commenceExit(staff, resolvedExitDate, approverId);
                        await this.notifyStaffOutcome(staff, 'Approved', 'update');
                        return {
                            message: `HR ${isApprove ? 'approval' : 'rejection'} recorded successfully`,
                            data: staff,
                        };
                    }
                    for (const [key, value] of Object.entries(pending)) {
                        if (key === 'additionalRoles') {
                            staff[key] = await this.resolveAdditionalRoleAssignments(value);
                            continue;
                        }
                        staff[key] = this.mergeNestedValue(staff[key], value);
                    }
                    if (clearsExitDate) {
                        staff.exitDate = null;
                    }
                    staff.pendingChanges = null;
                    staff.requiresHrApproval = false;
                    staff.workflowStage = 'COMPLETED';
                    staff.workflowType = null;
                    await staff.save();
                    await this.notifyStaffOutcome(staff, 'Approved', 'update');
                }
                else {
                    staff.pendingChanges = null;
                    staff.requiresHrApproval = false;
                    staff.workflowStage = 'REJECTED';
                    staff.workflowType = null;
                    await staff.save();
                    await this.notifyStaffOutcome(staff, 'Rejected', 'update');
                }
                return {
                    message: `HR ${isApprove ? 'approval' : 'rejection'} recorded successfully`,
                    data: staff,
                };
            }
            throw new Error('Invalid approval type');
        }
        catch (e) {
            throw new Error(`approveUser failed: ${e.message}`);
        }
    }
};
exports.UserOnboardingService = UserOnboardingService;
exports.UserOnboardingService = UserOnboardingService = UserOnboardingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __param(1, (0, mongoose_1.InjectModel)(role_schema_1.Role.name)),
    __param(2, (0, mongoose_1.InjectModel)(document_library_schema_1.DocumentLibrary.name)),
    __param(11, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        subsidiary_service_1.SubsidiaryService,
        level_service_1.LevelService,
        branch_service_1.BranchService,
        department_service_1.DepartmentService,
        businessUnit_service_1.BusinessUnitService,
        notice_service_1.NoticeService,
        user_directory_service_1.UserDirectoryService,
        mail_service_1.MailService,
        exit_service_1.ExitService])
], UserOnboardingService);
//# sourceMappingURL=user-onboarding.service.js.map