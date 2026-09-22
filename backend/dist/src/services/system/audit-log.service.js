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
var AuditLogService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogService = void 0;
const common_1 = require("@nestjs/common");
const access_control_util_1 = require("../../utils/shared/access-control.util");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const audit_log_schema_1 = require("../../schemas/audit-log.schema");
const attendance_schema_1 = require("../../schemas/attendance.schema");
const branch_schema_1 = require("../../schemas/branch.schema");
const businessunit_schema_1 = require("../../schemas/businessunit.schema");
const department_schema_1 = require("../../schemas/department.schema");
const level_schema_1 = require("../../schemas/level.schema");
const payroll_schema_1 = require("../../schemas/payroll.schema");
const payrollMap_schema_1 = require("../../schemas/payrollMap.schema");
const payroll_workflow_schema_1 = require("../../schemas/payroll-workflow.schema");
const permission_schema_1 = require("../../schemas/permission.schema");
const role_schema_1 = require("../../schemas/role.schema");
const subsidiary_schema_1 = require("../../schemas/subsidiary.schema");
const tax_config_schema_1 = require("../../schemas/tax-config.schema");
const territory_schema_1 = require("../../schemas/territory.schema");
const user_schema_1 = require("../../schemas/user.schema");
let AuditLogService = AuditLogService_1 = class AuditLogService {
    constructor(auditModel, staffModel, subsidiaryModel, departmentModel, roleModel, permissionModel, branchModel, businessUnitModel, levelModel, territoryModel, mainSubsidiaryModel, attendanceModel, payrollModel, payrollMapModel, payrollWorkflowModel, taxConfigModel) {
        this.auditModel = auditModel;
        this.staffModel = staffModel;
        this.subsidiaryModel = subsidiaryModel;
        this.departmentModel = departmentModel;
        this.roleModel = roleModel;
        this.permissionModel = permissionModel;
        this.branchModel = branchModel;
        this.businessUnitModel = businessUnitModel;
        this.levelModel = levelModel;
        this.territoryModel = territoryModel;
        this.mainSubsidiaryModel = mainSubsidiaryModel;
        this.attendanceModel = attendanceModel;
        this.payrollModel = payrollModel;
        this.payrollMapModel = payrollMapModel;
        this.payrollWorkflowModel = payrollWorkflowModel;
        this.taxConfigModel = taxConfigModel;
        this.logger = new common_1.Logger(AuditLogService_1.name);
    }
    async record(payload) {
        try {
            await this.auditModel.create(payload);
        }
        catch (error) {
            this.logger.warn(`Audit log write failed: ${error?.message ?? error}`);
        }
    }
    buildActor(user) {
        if (!user)
            return undefined;
        const id = this.normalizeId(user?._id ?? user?.id ?? user?.userId);
        const firstName = typeof user?.firstName === 'string' ? user.firstName.trim() : '';
        const lastName = typeof user?.lastName === 'string' ? user.lastName.trim() : '';
        const name = `${firstName} ${lastName}`.trim();
        const email = typeof user?.email === 'string' ? user.email.trim() : '';
        const roles = Array.from(this.extractRoleNames(user));
        const profileKey = typeof user?.profileKey === 'string' && user.profileKey.trim()
            ? user.profileKey.trim()
            : undefined;
        if (!id && !name && !email && !roles.length && !profileKey)
            return undefined;
        return {
            id: id ?? undefined,
            name: name || undefined,
            email: email || undefined,
            roles: roles.length ? roles : undefined,
            profileKey,
        };
    }
    isAuditDepartment(user) {
        const department = String(user?.department?.name ?? user?.department ?? '').trim().toLowerCase();
        return department.includes('audit');
    }
    assertCanView(user) {
        if (!user) {
            throw new common_1.ForbiddenException('You do not have permission to view audit logs.');
        }
        if (this.isAuditDepartment(user)) {
            return;
        }
        const permissions = this.extractPermissionNames(user);
        if (permissions.has('all') || permissions.has('view activity logs')) {
            return;
        }
        for (const name of permissions) {
            if (AuditLogService_1.SUPER_ADMIN_ROLE_NAMES.has(name)) {
                return;
            }
        }
        const roleNames = this.extractRoleNames(user);
        for (const name of roleNames) {
            if (AuditLogService_1.SUPER_ADMIN_ROLE_NAMES.has(name)) {
                return;
            }
        }
        throw new common_1.ForbiddenException('You do not have permission to view audit logs.');
    }
    async findAll(filters) {
        const page = Number.isFinite(filters.page) ? Number(filters.page) : 1;
        const limit = Number.isFinite(filters.limit) ? Number(filters.limit) : 20;
        const normalizedLimit = Math.min(Math.max(limit, 1), 200);
        const skip = (Math.max(page, 1) - 1) * normalizedLimit;
        const query = {};
        if (filters.actorId) {
            query['actor.id'] = filters.actorId;
        }
        if (filters.entity) {
            query.entity = filters.entity;
        }
        if (filters.entityId) {
            query.entityId = filters.entityId;
        }
        if (filters.scopeEntityId) {
            query.scopeEntityId = filters.scopeEntityId;
        }
        if (filters.action) {
            query.action = filters.action;
        }
        if (filters.method) {
            query.method = filters.method.toUpperCase();
        }
        if (filters.path) {
            query.path = new RegExp(filters.path, 'i');
        }
        if (filters.startDate || filters.endDate) {
            const startDate = filters.startDate ? new Date(filters.startDate) : null;
            const endDate = filters.endDate ? new Date(filters.endDate) : null;
            if (startDate && !Number.isNaN(startDate.getTime())) {
                query.createdAt = { ...(query.createdAt ?? {}), $gte: startDate };
            }
            if (endDate && !Number.isNaN(endDate.getTime())) {
                query.createdAt = { ...(query.createdAt ?? {}), $lte: endDate };
            }
        }
        if (filters.search) {
            const search = new RegExp(filters.search, 'i');
            query.$or = [
                { path: search },
                { entity: search },
                { entityId: search },
                { 'actor.name': search },
                { 'actor.email': search },
                { action: search },
            ];
        }
        const [data, total] = await Promise.all([
            this.auditModel
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(normalizedLimit)
                .lean()
                .exec(),
            this.auditModel.countDocuments(query),
        ]);
        await this.hydrateEntityNames(data);
        return {
            data,
            total,
            page: Math.max(page, 1),
            totalPages: Math.max(Math.ceil(total / normalizedLimit), 1),
        };
    }
    async findOne(id) {
        const record = await this.auditModel.findById(id).lean().exec();
        if (!record) {
            throw new common_1.NotFoundException('Audit log not found');
        }
        await this.hydrateEntityNames([record]);
        return record;
    }
    async hydrateEntityNames(records) {
        if (!Array.isArray(records) || !records.length)
            return;
        const unresolved = [];
        const idsByKey = {};
        const registerId = (key, entityId) => {
            if (!idsByKey[key]) {
                idsByKey[key] = new Set();
            }
            idsByKey[key].add(entityId);
        };
        for (const record of records) {
            if (!record)
                continue;
            if (record.entityName)
                continue;
            const derived = this.extractEntityName(record);
            if (derived) {
                record.entityName = derived;
                continue;
            }
            const key = this.resolveEntityLookup(record);
            if (!key)
                continue;
            const entityId = this.normalizeId(record.entityId);
            if (!entityId) {
                const fallbackLabel = this.resolveEntityLabel(key);
                if (fallbackLabel) {
                    record.entityName = fallbackLabel;
                }
                continue;
            }
            unresolved.push({ record, key, entityId });
            registerId(key, entityId);
        }
        if (!unresolved.length)
            return;
        const nameMaps = {};
        if (idsByKey.staff?.size) {
            nameMaps.staff = await this.loadStaffNameMap(Array.from(idsByKey.staff));
        }
        const payrollConfigIds = Array.from(idsByKey['payroll-config'] ?? []);
        const payrollWorkflowIds = Array.from(idsByKey['payroll-workflow'] ?? []);
        const payrollMapIds = Array.from(idsByKey['payroll-map'] ?? []);
        const payrollConfigs = payrollConfigIds.length
            ? await this.loadPayrollConfigs(payrollConfigIds)
            : [];
        const payrollWorkflows = payrollWorkflowIds.length
            ? await this.loadPayrollWorkflows(payrollWorkflowIds)
            : [];
        const payrollMaps = payrollMapIds.length
            ? await this.loadPayrollMaps(payrollMapIds)
            : [];
        const subsidiaryIds = new Set(idsByKey.subsidiary ?? []);
        payrollConfigs.forEach((config) => {
            if (config?.entity) {
                subsidiaryIds.add(String(config.entity));
            }
        });
        payrollWorkflows.forEach((config) => {
            if (config?.entity) {
                subsidiaryIds.add(String(config.entity));
            }
        });
        payrollMaps.forEach((config) => {
            if (config?.entity) {
                subsidiaryIds.add(String(config.entity));
            }
        });
        if (subsidiaryIds.size) {
            nameMaps.subsidiary = await this.loadSubsidiaryNameMap(Array.from(subsidiaryIds));
        }
        if (idsByKey.department?.size) {
            nameMaps.department = await this.loadNameMap(this.departmentModel, Array.from(idsByKey.department), ['name'], ['name']);
        }
        if (idsByKey.role?.size) {
            nameMaps.role = await this.loadNameMap(this.roleModel, Array.from(idsByKey.role), ['name'], ['name']);
        }
        if (idsByKey.permission?.size) {
            nameMaps.permission = await this.loadNameMap(this.permissionModel, Array.from(idsByKey.permission), ['name'], ['name']);
        }
        if (idsByKey.branch?.size) {
            nameMaps.branch = await this.loadNameMap(this.branchModel, Array.from(idsByKey.branch), ['name'], ['name']);
        }
        if (idsByKey['business-unit']?.size) {
            nameMaps['business-unit'] = await this.loadNameMap(this.businessUnitModel, Array.from(idsByKey['business-unit']), ['BU_NM'], ['BU_NM']);
        }
        if (idsByKey.level?.size) {
            nameMaps.level = await this.loadNameMap(this.levelModel, Array.from(idsByKey.level), ['name'], ['name']);
        }
        if (idsByKey.territory?.size) {
            nameMaps.territory = await this.loadNameMap(this.territoryModel, Array.from(idsByKey.territory), ['name'], ['name']);
        }
        if (idsByKey.attendance?.size) {
            nameMaps.attendance = await this.loadNameMap(this.attendanceModel, Array.from(idsByKey.attendance), ['employeeName', 'employeeId'], ['employeeId']);
        }
        if (idsByKey['tax-config']?.size) {
            nameMaps['tax-config'] = await this.loadNameMap(this.taxConfigModel, Array.from(idsByKey['tax-config']), ['configName'], ['configName']);
        }
        if (payrollConfigs.length) {
            const payrollConfigMap = new Map();
            for (const config of payrollConfigs) {
                const configId = config?._id ? String(config._id) : '';
                if (!configId)
                    continue;
                const entityLabel = config?.entity
                    ? nameMaps.subsidiary?.get(String(config.entity))
                    : '';
                payrollConfigMap.set(configId, entityLabel ? `Payroll config - ${entityLabel}` : 'Payroll config');
            }
            nameMaps['payroll-config'] = payrollConfigMap;
        }
        if (payrollWorkflows.length) {
            const payrollWorkflowMap = new Map();
            for (const config of payrollWorkflows) {
                const configId = config?._id ? String(config._id) : '';
                if (!configId)
                    continue;
                const entityLabel = config?.entity
                    ? nameMaps.subsidiary?.get(String(config.entity))
                    : '';
                payrollWorkflowMap.set(configId, entityLabel ? `Payroll workflow - ${entityLabel}` : 'Payroll workflow');
            }
            nameMaps['payroll-workflow'] = payrollWorkflowMap;
        }
        if (payrollMaps.length) {
            const payrollMapNames = new Map();
            for (const config of payrollMaps) {
                const configId = config?._id ? String(config._id) : '';
                if (!configId)
                    continue;
                const levelLabel = typeof config?.level === 'string' && config.level.trim() ? config.level.trim() : '';
                const entityLabel = config?.entity
                    ? nameMaps.subsidiary?.get(String(config.entity))
                    : '';
                const labelBase = levelLabel ? `Payroll map ${levelLabel}` : 'Payroll map';
                payrollMapNames.set(configId, entityLabel ? `${labelBase} - ${entityLabel}` : labelBase);
            }
            nameMaps['payroll-map'] = payrollMapNames;
        }
        for (const { record, key, entityId } of unresolved) {
            if (!record || record.entityName)
                continue;
            const resolved = nameMaps[key]?.get(entityId);
            if (resolved) {
                record.entityName = resolved;
                continue;
            }
            const fallbackLabel = this.resolveEntityLabel(key);
            if (fallbackLabel) {
                record.entityName = fallbackLabel;
            }
        }
    }
    extractEntityName(record) {
        const candidates = [
            this.extractNameFromPayload(record?.changes),
            this.extractNameFromPayload(record?.params),
            this.extractNameFromPayload(record?.query),
        ];
        for (const candidate of candidates) {
            if (candidate)
                return candidate;
        }
        return undefined;
    }
    extractNameFromPayload(payload) {
        if (!payload || typeof payload !== 'object')
            return undefined;
        const fullName = typeof payload?.fullName === 'string' ? payload.fullName.trim() : '';
        if (fullName)
            return fullName;
        const firstName = typeof payload?.firstName === 'string' ? payload.firstName.trim() : '';
        const lastName = typeof payload?.lastName === 'string' ? payload.lastName.trim() : '';
        const composed = `${firstName} ${lastName}`.trim();
        if (composed)
            return composed;
        const nameKeys = ['name', 'title', 'label', 'subject'];
        for (const key of nameKeys) {
            const value = payload?.[key];
            if (typeof value === 'string' && value.trim()) {
                return value.trim();
            }
        }
        return undefined;
    }
    resolveEntityLookup(record) {
        const entityKey = this.normalizeEntityKey(record?.entity);
        if (!entityKey)
            return undefined;
        const path = this.normalizePath(record?.path, record?.metadata?.route);
        if (entityKey === 'attendance') {
            if (path.includes('/config'))
                return 'attendance-config';
            return 'attendance';
        }
        if (entityKey === 'subsidiary') {
            if (path.includes('/territory'))
                return 'territory';
            return 'subsidiary';
        }
        if (entityKey === 'payroll') {
            if (path.includes('/tax-config'))
                return 'tax-config';
            if (path.includes('/workflow-config'))
                return 'payroll-workflow';
            if (path.includes('/allmap'))
                return 'payroll-map';
            if (path.includes('/config'))
                return 'payroll-config';
            return 'payroll';
        }
        return AuditLogService_1.ENTITY_ALIASES[entityKey];
    }
    resolveEntityLabel(key) {
        switch (key) {
            case 'attendance-config':
                return 'Attendance config';
            case 'payroll-config':
                return 'Payroll config';
            case 'payroll-workflow':
                return 'Payroll workflow';
            case 'payroll-map':
                return 'Payroll map';
            case 'tax-config':
                return 'Tax config';
            default:
                return undefined;
        }
    }
    normalizeEntityKey(value) {
        if (!value || typeof value !== 'string')
            return '';
        return value.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    normalizePath(path, route) {
        const segments = [path, route].filter(Boolean).map((value) => String(value).toLowerCase());
        return segments.join(' ');
    }
    pickFirstStringField(value, keys) {
        if (!value || !Array.isArray(keys))
            return undefined;
        for (const key of keys) {
            const field = value?.[key];
            if (typeof field === 'string' && field.trim()) {
                return field.trim();
            }
        }
        return undefined;
    }
    async loadNameMap(model, ids, fields, extraMatchFields) {
        const map = new Map();
        if (!model || !ids.length)
            return map;
        const objectIds = ids.filter((id) => mongoose_2.Types.ObjectId.isValid(id));
        const stringIds = ids.filter((id) => !mongoose_2.Types.ObjectId.isValid(id));
        const or = [];
        if (objectIds.length) {
            or.push({ _id: { $in: objectIds } });
        }
        if (stringIds.length && extraMatchFields?.length) {
            extraMatchFields.forEach((field) => {
                or.push({ [field]: { $in: stringIds } });
            });
        }
        if (!or.length)
            return map;
        const select = Array.from(new Set(['_id', ...fields, ...(extraMatchFields ?? [])])).join(' ');
        const docs = await model.find({ $or: or }).select(select).lean();
        for (const doc of docs) {
            const name = this.pickFirstStringField(doc, fields);
            if (!name)
                continue;
            if (doc?._id) {
                map.set(String(doc._id), name);
            }
            if (extraMatchFields?.length) {
                extraMatchFields.forEach((field) => {
                    const value = doc?.[field];
                    if (typeof value === 'string' && value.trim()) {
                        map.set(value.trim(), name);
                    }
                });
            }
        }
        return map;
    }
    async loadStaffNameMap(ids) {
        const map = new Map();
        const objectIds = ids.filter((id) => mongoose_2.Types.ObjectId.isValid(id));
        const staffIds = ids.filter((id) => !mongoose_2.Types.ObjectId.isValid(id));
        const or = [];
        if (objectIds.length) {
            or.push({ _id: { $in: objectIds } });
        }
        if (staffIds.length) {
            or.push({ staffId: { $in: staffIds } });
        }
        if (!or.length)
            return map;
        const staffRecords = await this.staffModel
            .find({ $or: or })
            .select('firstName lastName staffId email')
            .lean();
        for (const staff of staffRecords) {
            const firstName = typeof staff?.firstName === 'string' ? staff.firstName.trim() : '';
            const lastName = typeof staff?.lastName === 'string' ? staff.lastName.trim() : '';
            const name = `${firstName} ${lastName}`.trim()
                || (typeof staff?.staffId === 'string' ? staff.staffId.trim() : '')
                || (typeof staff?.email === 'string' ? staff.email.trim() : '');
            const fallbackName = name || (staff?._id ? String(staff._id) : '');
            if (staff?._id) {
                map.set(String(staff._id), fallbackName);
            }
            if (typeof staff?.staffId === 'string' && staff.staffId.trim()) {
                map.set(staff.staffId.trim(), fallbackName);
            }
        }
        return map;
    }
    async loadSubsidiaryNameMap(ids) {
        const map = await this.loadNameMap(this.subsidiaryModel, ids, ['name', 'short'], ['short', 'name']);
        const remaining = ids.filter((id) => !map.has(id));
        if (!remaining.length)
            return map;
        const fallback = await this.loadNameMap(this.mainSubsidiaryModel, remaining, ['name', 'short'], ['short', 'name']);
        for (const [key, value] of fallback.entries()) {
            if (!map.has(key)) {
                map.set(key, value);
            }
        }
        return map;
    }
    async loadPayrollConfigs(ids) {
        const objectIds = ids.filter((id) => mongoose_2.Types.ObjectId.isValid(id));
        if (!objectIds.length)
            return [];
        return this.payrollModel.find({ _id: { $in: objectIds } }).select('entity').lean();
    }
    async loadPayrollWorkflows(ids) {
        const objectIds = ids.filter((id) => mongoose_2.Types.ObjectId.isValid(id));
        if (!objectIds.length)
            return [];
        return this.payrollWorkflowModel.find({ _id: { $in: objectIds } }).select('entity').lean();
    }
    async loadPayrollMaps(ids) {
        const objectIds = ids.filter((id) => mongoose_2.Types.ObjectId.isValid(id));
        if (!objectIds.length)
            return [];
        return this.payrollMapModel.find({ _id: { $in: objectIds } }).select('entity level').lean();
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
    extractRoleNames(user) {
        const names = new Set();
        const register = (value) => {
            if (typeof value === 'string' && value.trim()) {
                names.add(value.trim().toLowerCase());
            }
        };
        const registerRoleLike = (roleLike) => {
            if (!roleLike)
                return;
            register(roleLike?.name);
            register(roleLike?.label);
            register(roleLike?.roleName);
            if (roleLike?.role) {
                register(roleLike?.role?.name);
                register(roleLike?.role?.label);
            }
        };
        registerRoleLike(user?.role);
        (Array.isArray(user?.roles) ? user.roles : []).forEach(registerRoleLike);
        (Array.isArray(user?.additionalRoles) ? user.additionalRoles : []).forEach((assignment) => registerRoleLike(assignment?.role ?? assignment));
        return names;
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
};
exports.AuditLogService = AuditLogService;
AuditLogService.SUPER_ADMIN_ROLE_NAMES = access_control_util_1.SUPER_ADMIN_ROLE_NAME_SET;
AuditLogService.ENTITY_ALIASES = {
    staff: 'staff',
    user: 'staff',
    users: 'staff',
    employee: 'staff',
    employees: 'staff',
    subsidiary: 'subsidiary',
    subsidiaries: 'subsidiary',
    entity: 'subsidiary',
    entities: 'subsidiary',
    department: 'department',
    departments: 'department',
    role: 'role',
    roles: 'role',
    createrole: 'role',
    editrole: 'role',
    permission: 'permission',
    permissions: 'permission',
    createpermission: 'permission',
    editpermission: 'permission',
    branch: 'branch',
    branches: 'branch',
    createbranch: 'branch',
    editbranch: 'branch',
    businessunit: 'business-unit',
    businessunits: 'business-unit',
    createbusinessunit: 'business-unit',
    editbusinessunit: 'business-unit',
    level: 'level',
    levels: 'level',
    territory: 'territory',
    territories: 'territory',
};
exports.AuditLogService = AuditLogService = AuditLogService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(audit_log_schema_1.AuditLog.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(subsidiary_schema_1.Subsidiary.name)),
    __param(3, (0, mongoose_1.InjectModel)(department_schema_1.Department.name)),
    __param(4, (0, mongoose_1.InjectModel)(role_schema_1.Role.name)),
    __param(5, (0, mongoose_1.InjectModel)(permission_schema_1.Permission.name)),
    __param(6, (0, mongoose_1.InjectModel)(branch_schema_1.Branch.name)),
    __param(7, (0, mongoose_1.InjectModel)(businessunit_schema_1.BusinessUnit.name)),
    __param(8, (0, mongoose_1.InjectModel)(level_schema_1.Level.name)),
    __param(9, (0, mongoose_1.InjectModel)(territory_schema_1.Territory.name)),
    __param(10, (0, mongoose_1.InjectModel)(subsidiary_schema_1.Subsidiary.name)),
    __param(11, (0, mongoose_1.InjectModel)(attendance_schema_1.Attendance.name)),
    __param(12, (0, mongoose_1.InjectModel)(payroll_schema_1.Payroll.name)),
    __param(13, (0, mongoose_1.InjectModel)(payrollMap_schema_1.PayrollMap.name)),
    __param(14, (0, mongoose_1.InjectModel)(payroll_workflow_schema_1.PayrollWorkflowConfig.name)),
    __param(15, (0, mongoose_1.InjectModel)(tax_config_schema_1.TaxConfig.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AuditLogService);
//# sourceMappingURL=audit-log.service.js.map