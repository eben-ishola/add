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
exports.KpiService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const performance_service_1 = require("../performance/performance.service");
const kpi_schema_1 = require("../../schemas/kpi.schema");
const kpi_category_schema_1 = require("../../schemas/kpi-category.schema");
const user_schema_1 = require("../../schemas/user.schema");
const role_schema_1 = require("../../schemas/role.schema");
const MULTI_SCOPE_TYPE = 'Department, Individual, Role and Level';
let KpiService = class KpiService {
    constructor(kpiModel, categoryModel, userModel, roleModel, performanceService) {
        this.kpiModel = kpiModel;
        this.categoryModel = categoryModel;
        this.userModel = userModel;
        this.roleModel = roleModel;
        this.performanceService = performanceService;
    }
    buildSlug(name) {
        const cleaned = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s_-]/g, '')
            .replace(/\s+/g, '_');
        return cleaned || 'category';
    }
    normalizeText(value) {
        if (value === null || value === undefined)
            return undefined;
        const trimmed = String(value).trim();
        if (!trimmed)
            return undefined;
        const lower = trimmed.toLowerCase();
        if (lower === 'null' || lower === 'undefined')
            return undefined;
        return trimmed;
    }
    normalizeLookupKey(value) {
        const normalized = this.normalizeText(value);
        if (!normalized)
            return '';
        return normalized.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    buildExactRegex(value) {
        const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`^${escaped}$`, 'i');
    }
    buildIdMatchClause(field, raw) {
        const normalized = this.normalizeText(raw);
        if (!normalized)
            return null;
        if (mongoose_2.Types.ObjectId.isValid(normalized)) {
            return {
                [field]: { $in: [normalized, new mongoose_2.Types.ObjectId(normalized)] },
            };
        }
        return { [field]: normalized };
    }
    normalizeType(value) {
        const normalizedRaw = this.normalizeText(value);
        const normalized = normalizedRaw?.toLowerCase() ?? 'individual';
        if (normalized === 'department, individual, role and level' ||
            normalized === 'department_individual_role_level') {
            return MULTI_SCOPE_TYPE;
        }
        const allowed = new Set(['individual', 'role', 'level', 'role_level']);
        if (!allowed.has(normalized)) {
            throw new common_1.BadRequestException(`Unsupported KPI type '${value ?? ''}'.`);
        }
        return normalized;
    }
    normalizeScopeValue(raw) {
        const cleaned = raw.trim().toLowerCase().replace(/[\s-]+/g, '_');
        if (!cleaned)
            return null;
        const normalized = cleaned.replace(/[^a-z_]/g, '');
        const mapping = {
            individual: 'individual',
            employee: 'individual',
            staff: 'individual',
            role: 'role',
            level: 'level',
            department: 'department',
            dept: 'department',
            businessunit: 'business_unit',
            business_unit: 'business_unit',
            businessunitid: 'business_unit',
            branch: 'branch',
        };
        return mapping[normalized] ?? null;
    }
    parseOptionalNumber(raw) {
        if (raw === undefined || raw === null || raw === '')
            return null;
        const cleaned = String(raw).replace(/,/g, '').trim();
        if (!cleaned)
            return null;
        const parsed = Number(cleaned);
        return Number.isFinite(parsed) ? parsed : null;
    }
    parseScopes(raw) {
        const result = new Set();
        if (!raw)
            return result;
        const tokens = String(raw)
            .split(/[,;|]+/)
            .map((token) => token.trim())
            .filter(Boolean);
        for (const token of tokens) {
            const normalized = this.normalizeScopeValue(token);
            if (normalized) {
                result.add(normalized);
                continue;
            }
            if (/\s/.test(token)) {
                token
                    .split(/\s+/)
                    .map((part) => this.normalizeScopeValue(part))
                    .filter((value) => Boolean(value))
                    .forEach((value) => result.add(value));
            }
        }
        return result;
    }
    deriveTypeFromScopes(scopes) {
        if (!scopes.size)
            return MULTI_SCOPE_TYPE;
        if (scopes.size === 1) {
            if (scopes.has('individual'))
                return 'individual';
            if (scopes.has('role'))
                return 'role';
            if (scopes.has('level'))
                return 'level';
            if (scopes.has('department'))
                return 'department';
            if (scopes.has('branch'))
                return 'branch';
            if (scopes.has('business_unit'))
                return 'business_unit';
        }
        if (scopes.size === 2 && scopes.has('role') && scopes.has('level')) {
            return 'role_level';
        }
        return MULTI_SCOPE_TYPE;
    }
    scopesFromRow(row) {
        const fromColumn = this.parseScopes(row.kpi_scopes);
        if (fromColumn.size)
            return fromColumn;
        const fallback = this.parseScopes(row.kpi_scope);
        if (fallback.size)
            return fallback;
        const scopes = new Set();
        if (this.normalizeText(row.employee_id) || this.normalizeText(row.employee_name)) {
            scopes.add('individual');
        }
        if (this.normalizeText(row.role_id) ||
            this.normalizeText(row.roleid) ||
            this.normalizeText(row.role_name) ||
            this.normalizeText(row.rolename) ||
            this.normalizeText(row.role) ||
            this.normalizeText(row.position) ||
            this.normalizeText(row.job_role)) {
            scopes.add('role');
        }
        if (this.normalizeText(row.level_id) || this.normalizeText(row.level_name)) {
            scopes.add('level');
        }
        if (this.normalizeText(row.department_id) || this.normalizeText(row.department_name)) {
            scopes.add('department');
        }
        if (this.normalizeText(row.business_unit_id) || this.normalizeText(row.business_unit_name)) {
            scopes.add('business_unit');
        }
        if (this.normalizeText(row.branch_id) || this.normalizeText(row.branch_name)) {
            scopes.add('branch');
        }
        return scopes;
    }
    serializeScopes(scopes) {
        if (!scopes.size)
            return '';
        const order = [
            'individual',
            'role',
            'level',
            'department',
            'business_unit',
            'branch',
        ];
        return order.filter((scope) => scopes.has(scope)).join('|');
    }
    buildTargetFields(input) {
        const type = this.normalizeType(input.type);
        const employeeId = this.normalizeText(input.employeeId);
        const employeeName = this.normalizeText(input.employeeName);
        const roleId = this.normalizeText(input.roleId);
        const roleName = this.normalizeText(input.roleName);
        const levelId = this.normalizeText(input.levelId);
        const levelName = this.normalizeText(input.levelName);
        if (type === MULTI_SCOPE_TYPE) {
            return {
                type,
                employeeId,
                employeeName,
                roleId,
                roleName,
                levelId,
                levelName,
            };
        }
        if (type === 'individual') {
            if (!employeeId) {
                throw new common_1.BadRequestException('Employee is required for individual KPIs.');
            }
            return {
                type,
                employeeId,
                employeeName,
                roleId: undefined,
                roleName: undefined,
                levelId: undefined,
                levelName: undefined,
            };
        }
        if (type === 'role') {
            if (!roleId && !roleName) {
                throw new common_1.BadRequestException('Role is required for role-based KPIs.');
            }
            return {
                type,
                employeeId: undefined,
                employeeName: undefined,
                roleId,
                roleName,
                levelId: undefined,
                levelName: undefined,
            };
        }
        if (type === 'level') {
            if (!levelId && !levelName) {
                throw new common_1.BadRequestException('Level is required for level-based KPIs.');
            }
            return {
                type,
                employeeId: undefined,
                employeeName: undefined,
                roleId: undefined,
                roleName: undefined,
                levelId,
                levelName,
            };
        }
        if (!roleId && !roleName) {
            throw new common_1.BadRequestException('Role is required for role & level KPIs.');
        }
        if (!levelId && !levelName) {
            throw new common_1.BadRequestException('Level is required for role & level KPIs.');
        }
        return {
            type,
            employeeId: undefined,
            employeeName: undefined,
            roleId,
            roleName,
            levelId,
            levelName,
        };
    }
    async ensureDefaultCategories() {
        const count = await this.categoryModel.estimatedDocumentCount();
        if (count > 0)
            return;
        const defaults = [
            'Productivity',
            'Quality',
            'Efficiency',
            'Customer Satisfaction',
            'Professional Development',
            'Innovation',
        ];
        await this.categoryModel.insertMany(defaults.map((name) => ({
            name,
            slug: this.buildSlug(name),
        })));
    }
    async listCategories() {
        await this.ensureDefaultCategories();
        return this.categoryModel
            .find()
            .sort({ name: 1 })
            .lean()
            .exec();
    }
    async createCategory(name, description) {
        const trimmed = name?.trim();
        if (!trimmed) {
            throw new common_1.BadRequestException('Category name is required');
        }
        const slug = this.buildSlug(trimmed);
        const existing = await this.categoryModel.findOne({ slug }).exec();
        if (existing) {
            throw new common_1.BadRequestException('Category already exists');
        }
        const category = new this.categoryModel({
            name: trimmed,
            slug,
            description,
        });
        return category.save();
    }
    normalizeDates(value) {
        if (!value)
            return undefined;
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? undefined : date;
    }
    normalizeKpiTitle(value) {
        return String(value ?? '')
            .toLowerCase()
            .replace(/\s*\(copy\)/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
    normalizeKpiKey(value) {
        if (value === null || value === undefined)
            return '';
        return String(value).trim().toLowerCase();
    }
    async findDuplicateKpiId(payload, excludeId) {
        const title = this.normalizeKpiTitle(payload?.title);
        if (!title)
            return null;
        if (!payload?.entity && !payload?.appraisalCycleId)
            return null;
        const cycleId = payload?.appraisalCycleId;
        const candidateQuery = {};
        if (payload?.entity) {
            candidateQuery.entity = payload.entity;
        }
        if (cycleId) {
            const cycleVariants = [cycleId];
            if (typeof cycleId === 'string' && mongoose_2.Types.ObjectId.isValid(cycleId)) {
                cycleVariants.push(new mongoose_2.Types.ObjectId(cycleId));
            }
            candidateQuery.appraisalCycleId = { $in: cycleVariants };
        }
        if (excludeId && mongoose_2.Types.ObjectId.isValid(excludeId)) {
            candidateQuery._id = { $ne: new mongoose_2.Types.ObjectId(excludeId) };
        }
        const candidates = await this.kpiModel
            .find(candidateQuery)
            .select('_id title kpa roleId roleName levelId levelName departmentId departmentName branchId branchName businessUnitId businessUnitName employeeId')
            .lean()
            .exec();
        const targetRole = this.normalizeKpiKey(payload?.roleId) ||
            this.normalizeKpiKey(payload?.roleName);
        const targetLevel = this.normalizeKpiKey(payload?.levelId) ||
            this.normalizeKpiKey(payload?.levelName);
        const targetDept = this.normalizeKpiKey(payload?.departmentId) ||
            this.normalizeKpiKey(payload?.departmentName);
        const targetBranch = this.normalizeKpiKey(payload?.branchId) ||
            this.normalizeKpiKey(payload?.branchName);
        const targetBu = this.normalizeKpiKey(payload?.businessUnitId) ||
            this.normalizeKpiKey(payload?.businessUnitName);
        const targetEmployee = this.normalizeKpiKey(payload?.employeeId);
        const targetKpa = this.normalizeKpiKey(payload?.kpa);
        for (const candidate of candidates) {
            if (this.normalizeKpiTitle(candidate.title) !== title)
                continue;
            const cRole = this.normalizeKpiKey(candidate.roleId) ||
                this.normalizeKpiKey(candidate.roleName);
            const cLevel = this.normalizeKpiKey(candidate.levelId) ||
                this.normalizeKpiKey(candidate.levelName);
            const cDept = this.normalizeKpiKey(candidate.departmentId) ||
                this.normalizeKpiKey(candidate.departmentName);
            const cBranch = this.normalizeKpiKey(candidate.branchId) ||
                this.normalizeKpiKey(candidate.branchName);
            const cBu = this.normalizeKpiKey(candidate.businessUnitId) ||
                this.normalizeKpiKey(candidate.businessUnitName);
            const cEmployee = this.normalizeKpiKey(candidate.employeeId);
            const cKpa = this.normalizeKpiKey(candidate.kpa);
            if (cRole !== targetRole)
                continue;
            if (cLevel !== targetLevel)
                continue;
            if (cDept !== targetDept)
                continue;
            if (cBranch !== targetBranch)
                continue;
            if (cBu !== targetBu)
                continue;
            if (cEmployee !== targetEmployee)
                continue;
            if (cKpa !== targetKpa)
                continue;
            return String(candidate._id);
        }
        return null;
    }
    async assertNotDuplicateKpi(payload, excludeId) {
        const dupId = await this.findDuplicateKpiId(payload, excludeId);
        if (dupId) {
            throw new common_1.BadRequestException(`A KPI with the same title and dimensions already exists in this entity/cycle (id=${dupId}). Change the title, role, level, department, branch, business unit, employee, or KPA to differentiate.`);
        }
    }
    async findSimilarKpisByDescription(payload) {
        const description = String(payload?.description ?? '')
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim();
        if (description.length < 10)
            return [];
        if (!payload?.entity && !payload?.appraisalCycleId)
            return [];
        const query = {};
        if (payload.entity)
            query.entity = payload.entity;
        if (payload.appraisalCycleId) {
            const variants = [payload.appraisalCycleId];
            if (mongoose_2.Types.ObjectId.isValid(payload.appraisalCycleId)) {
                variants.push(new mongoose_2.Types.ObjectId(payload.appraisalCycleId));
            }
            query.appraisalCycleId = { $in: variants };
        }
        if (payload.excludeId && mongoose_2.Types.ObjectId.isValid(payload.excludeId)) {
            query._id = { $ne: new mongoose_2.Types.ObjectId(payload.excludeId) };
        }
        const candidates = await this.kpiModel
            .find(query)
            .select('_id title description weight kpa employeeId')
            .lean()
            .exec();
        const targetEmployee = this.normalizeKpiKey(payload.employeeId);
        const targetKpa = this.normalizeKpiKey(payload.kpa);
        const matches = [];
        for (const candidate of candidates) {
            if (this.normalizeKpiKey(candidate.employeeId) !== targetEmployee)
                continue;
            if (this.normalizeKpiKey(candidate.kpa) !== targetKpa)
                continue;
            const candidateDesc = String(candidate.description ?? '')
                .toLowerCase()
                .replace(/\s+/g, ' ')
                .trim();
            if (candidateDesc !== description)
                continue;
            matches.push({
                id: String(candidate._id),
                title: String(candidate.title ?? ''),
                description: String(candidate.description ?? ''),
                weight: Number(candidate.weight ?? 0),
            });
        }
        return matches;
    }
    serializeCsvValue(value) {
        if (value === null || value === undefined)
            return '';
        const str = String(value);
        if (/[",\n]/.test(str)) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }
    async createKpi(payload) {
        const { categoryId, categoryName, hasConditions, customFields = [], conditions = [], weight, startDate, endDate, employeeId, employeeName, roleId, roleName, levelId, levelName, type, ...rest } = payload;
        const target = this.buildTargetFields({
            type,
            employeeId,
            employeeName,
            roleId,
            roleName,
            levelId,
            levelName,
        });
        let categoryRef;
        let resolvedCategoryName = categoryName?.trim();
        if (categoryId) {
            const category = await this.categoryModel.findById(categoryId).exec();
            if (!category) {
                throw new common_1.BadRequestException('Category not found');
            }
            categoryRef = category._id;
            resolvedCategoryName = category.name;
        }
        else if (resolvedCategoryName) {
            const slug = this.buildSlug(resolvedCategoryName);
            let category = await this.categoryModel.findOne({ slug }).exec();
            if (!category) {
                category = await this.categoryModel.create({
                    name: resolvedCategoryName,
                    slug,
                });
            }
            categoryRef = category._id;
            resolvedCategoryName = category.name;
        }
        await this.assertNotDuplicateKpi({
            entity: rest.entity,
            appraisalCycleId: rest.appraisalCycleId,
            title: payload.title,
            kpa: payload.kpa,
            roleId,
            roleName,
            levelId,
            levelName,
            departmentId: payload.departmentId,
            departmentName: payload.departmentName,
            branchId: payload.branchId,
            branchName: payload.branchName,
            businessUnitId: payload.businessUnitId,
            businessUnitName: payload.businessUnitName,
            employeeId,
        });
        const kpi = new this.kpiModel({
            ...rest,
            ...target,
            category: categoryRef,
            categoryName: resolvedCategoryName,
            startDate: this.normalizeDates(startDate),
            endDate: this.normalizeDates(endDate),
            weight: typeof weight === 'number' ? weight : Number(weight ?? 0),
            evaluationFrequency: rest.evaluationFrequency ?? 'monthly',
            hasConditions: !!hasConditions,
            customFields,
            conditions: hasConditions ? conditions : [],
        });
        return kpi.save();
    }
    buildListFilters(filters) {
        const query = {};
        if (!filters) {
            return query;
        }
        if (filters.entity) {
            query.entity = filters.entity;
        }
        if (filters.appraisalCycleId) {
            query.appraisalCycleId = new mongoose_2.Types.ObjectId(filters.appraisalCycleId);
        }
        if (filters.expandRelated && filters.employeeId) {
            const orConditions = [];
            const employeeClause = this.buildIdMatchClause('employeeId', filters.employeeId);
            if (employeeClause) {
                orConditions.push(employeeClause);
            }
            if (filters.relatedRoleId) {
                const roleClause = this.buildIdMatchClause('roleId', filters.relatedRoleId);
                if (roleClause) {
                    orConditions.push(roleClause);
                }
            }
            if (filters.relatedDepartmentId) {
                const departmentClause = this.buildIdMatchClause('departmentId', filters.relatedDepartmentId);
                if (departmentClause) {
                    orConditions.push(departmentClause);
                }
            }
            if (filters.relatedBranchId) {
                const branchClause = this.buildIdMatchClause('branchId', filters.relatedBranchId);
                if (branchClause) {
                    orConditions.push(branchClause);
                }
            }
            if (filters.relatedBusinessUnitId) {
                const unitClause = this.buildIdMatchClause('businessUnitId', filters.relatedBusinessUnitId);
                if (unitClause) {
                    orConditions.push(unitClause);
                }
            }
            if (orConditions.length) {
                query.$or = orConditions;
            }
            if (filters.title) {
                query.title = new RegExp(filters.title, 'i');
            }
            if (filters.search) {
                const regex = new RegExp(filters.search, 'i');
                query.$and = [
                    {
                        $or: [
                            { title: regex },
                            { description: regex },
                            { employeeName: regex },
                            { categoryName: regex },
                        ],
                    },
                ];
            }
            return query;
        }
        const scopeId = filters.roleId || filters.roleName || filters.employeeId || filters.levelId ||
            filters.departmentId || filters.branchId;
        if (filters.type && scopeId) {
            const typeConditions = [
                { type: filters.type },
                { type: MULTI_SCOPE_TYPE },
            ];
            query.$or = query.$or
                ? [...query.$or, ...typeConditions]
                : typeConditions;
        }
        else if (filters.type) {
            query.type = filters.type;
        }
        const employeeClause = this.buildIdMatchClause('employeeId', filters.employeeId);
        if (employeeClause) {
            Object.assign(query, employeeClause);
        }
        const roleIdClause = this.buildIdMatchClause('roleId', filters.roleId);
        if (roleIdClause && filters.roleName) {
            const roleConditions = [
                roleIdClause,
                { roleName: this.buildExactRegex(filters.roleName) },
            ];
            if (query.$or) {
                query.$and = [...(query.$and ?? []), { $or: roleConditions }];
            }
            else {
                query.$or = roleConditions;
            }
        }
        else if (roleIdClause) {
            Object.assign(query, roleIdClause);
        }
        else if (filters.roleName) {
            query.roleName = this.buildExactRegex(filters.roleName);
        }
        const levelClause = this.buildIdMatchClause('levelId', filters.levelId);
        if (levelClause) {
            Object.assign(query, levelClause);
        }
        const departmentClause = this.buildIdMatchClause('departmentId', filters.departmentId);
        if (departmentClause) {
            Object.assign(query, departmentClause);
        }
        if (filters.departmentName) {
            query.departmentName = new RegExp(filters.departmentName, 'i');
        }
        const branchClause = this.buildIdMatchClause('branchId', filters.branchId);
        if (branchClause) {
            Object.assign(query, branchClause);
        }
        if (filters.branchName) {
            query.branchName = new RegExp(filters.branchName, 'i');
        }
        if (filters.category) {
            query.categoryName = filters.category;
        }
        if (filters.kpa) {
            query.kpa = new RegExp(filters.kpa, 'i');
        }
        if (filters.title) {
            query.title = new RegExp(filters.title, 'i');
        }
        if (filters.search) {
            const regex = new RegExp(filters.search, 'i');
            query.$or = [
                { title: regex },
                { description: regex },
                { employeeName: regex },
                { employeeId: regex },
                { roleName: regex },
                { roleId: regex },
                { levelName: regex },
                { levelId: regex },
                { categoryName: regex },
            ];
        }
        return query;
    }
    async listKpisGroupedByStaff(filters) {
        const staffPage = Math.max(Number(filters.page) || 1, 1);
        const staffLimit = Math.min(Math.max(Number(filters.limit) || 20, 1), 100);
        const hasWeightFilter = Number.isFinite(filters.weightFilter);
        const empQuery = { status: { $regex: '^active$', $options: 'i' } };
        if (filters.entity)
            empQuery.entity = filters.entity;
        if (filters.employeeId)
            empQuery._id = filters.employeeId;
        if (filters.search) {
            const nameRegex = new RegExp(filters.search, 'i');
            empQuery.$or = [
                { firstName: nameRegex },
                { lastName: nameRegex },
                { staffId: nameRegex },
            ];
        }
        let employees;
        if (hasWeightFilter) {
            employees = await this.userModel
                .find(empQuery)
                .select('_id firstName lastName staffId role department branch businessUnit level entity')
                .sort({ firstName: 1, lastName: 1 })
                .lean()
                .exec();
        }
        else {
            const staffSkip = (staffPage - 1) * staffLimit;
            employees = await this.userModel
                .find(empQuery)
                .select('_id firstName lastName staffId role department branch businessUnit level entity')
                .sort({ firstName: 1, lastName: 1 })
                .skip(staffSkip)
                .limit(staffLimit)
                .lean()
                .exec();
        }
        if (!employees.length) {
            return { data: [], page: staffPage, limit: staffLimit, total: 0, totalPages: 1 };
        }
        const employeeRoleIds = Array.from(new Set(employees
            .map((employee) => String(employee?.role ?? '').trim())
            .filter((roleId) => mongoose_2.Types.ObjectId.isValid(roleId))));
        const roleNameById = new Map();
        if (employeeRoleIds.length) {
            const roles = await this.roleModel
                .find({ _id: { $in: employeeRoleIds.map((roleId) => new mongoose_2.Types.ObjectId(roleId)) } })
                .select('_id name')
                .lean()
                .exec();
            for (const role of roles) {
                const roleId = String(role?._id ?? '').trim();
                const roleName = this.normalizeText(role?.name);
                if (!roleId || !roleName)
                    continue;
                roleNameById.set(roleId, roleName);
            }
        }
        const kpiQuery = {};
        if (filters.entity)
            kpiQuery.entity = filters.entity;
        if (filters.appraisalCycleId) {
            kpiQuery.appraisalCycleId = new mongoose_2.Types.ObjectId(filters.appraisalCycleId);
        }
        if (filters.title) {
            kpiQuery.title = new RegExp(filters.title, 'i');
        }
        const allKpis = await this.kpiModel.find(kpiQuery).sort({ createdAt: -1 }).lean().exec();
        const buildStaffEntry = (emp) => {
            const empId = String(emp._id);
            const empRoleId = emp.role ? String(emp.role) : '';
            const empRoleName = this.normalizeText(roleNameById.get(empRoleId) ??
                (!mongoose_2.Types.ObjectId.isValid(empRoleId) ? empRoleId : undefined));
            const empDeptId = emp.department ? String(emp.department) : '';
            const empBranchId = emp.branch ? String(emp.branch) : '';
            const empBUId = emp.businessUnit ? String(emp.businessUnit) : '';
            const empLevelId = emp.level ? String(emp.level) : '';
            const empName = [emp.firstName, emp.lastName].filter(Boolean).join(' ') || emp.staffId || empId;
            const matchingKpis = allKpis.filter((kpi) => {
                const t = kpi.type ?? '';
                const kpiEmpId = String(kpi.employeeId ?? '');
                const kpiRoleId = String(kpi.roleId ?? '');
                const kpiRoleName = this.normalizeText(kpi.roleName);
                const kpiDeptId = String(kpi.departmentId ?? '');
                const kpiBranchId = String(kpi.branchId ?? '');
                const kpiBUId = String(kpi.businessUnitId ?? '');
                const kpiLevelId = String(kpi.levelId ?? '');
                const matchEmp = () => kpiEmpId && kpiEmpId === empId;
                const matchRole = () => (kpiRoleId && empRoleId && kpiRoleId === empRoleId) ||
                    Boolean(kpiRoleName &&
                        empRoleName &&
                        kpiRoleName.toLowerCase() === empRoleName.toLowerCase());
                const matchDept = () => kpiDeptId && empDeptId && kpiDeptId === empDeptId;
                const matchBranch = () => kpiBranchId && empBranchId && kpiBranchId === empBranchId;
                const matchBU = () => kpiBUId && empBUId && kpiBUId === empBUId;
                const matchLevel = () => kpiLevelId && empLevelId && kpiLevelId === empLevelId;
                if (t === 'individual' || !t)
                    return matchEmp();
                if (t === 'role')
                    return matchRole();
                if (t === 'level')
                    return matchLevel();
                if (t === 'department')
                    return matchDept();
                if (t === 'branch')
                    return matchBranch();
                if (t === 'business_unit')
                    return matchBU();
                if (t === 'role_level')
                    return matchRole() || matchLevel();
                if (t === MULTI_SCOPE_TYPE) {
                    return matchEmp() || matchRole() || matchDept() || matchBranch() || matchBU() || matchLevel();
                }
                return false;
            });
            const TYPE_PRIORITY = {
                individual: 0, role: 1, level: 2, department: 3, branch: 4, business_unit: 5,
            };
            const seenIds = new Set();
            const deduped = new Map();
            for (const kpi of matchingKpis) {
                const kpiId = String(kpi._id);
                if (seenIds.has(kpiId))
                    continue;
                seenIds.add(kpiId);
                const key = String(kpi.title ?? '').trim().toLowerCase();
                const existing = deduped.get(key);
                if (!existing) {
                    deduped.set(key, kpi);
                }
                else {
                    const curPri = TYPE_PRIORITY[kpi.type] ?? 99;
                    const exPri = TYPE_PRIORITY[existing.type] ?? 99;
                    if (curPri < exPri)
                        deduped.set(key, kpi);
                }
            }
            const rows = Array.from(deduped.values());
            const perspMap = new Map();
            rows.forEach((kpi) => {
                const persp = String(kpi.kpa ?? '').trim() || 'Unspecified Perspective';
                if (!perspMap.has(persp))
                    perspMap.set(persp, []);
                perspMap.get(persp).push(kpi);
            });
            const perspectives = Array.from(perspMap.entries())
                .sort((a, b) => {
                if (a[0].toLowerCase() === 'unspecified perspective')
                    return 1;
                if (b[0].toLowerCase() === 'unspecified perspective')
                    return -1;
                return a[0].localeCompare(b[0]);
            })
                .map(([perspective, pRows]) => ({
                perspective,
                rows: pRows,
                totalWeight: Number(pRows.reduce((s, r) => s + (Number(r.weight) || 0), 0).toFixed(2)),
            }));
            const totalWeight = Number(rows.reduce((s, r) => s + (Number(r.weight) || 0), 0).toFixed(2));
            const typeSet = new Set(rows.map((r) => r.type).filter(Boolean));
            return {
                staffKey: empId,
                staffName: empName,
                staffId: emp.staffId ?? '',
                totalKpis: rows.length,
                totalWeight,
                typeBreakdown: Array.from(typeSet).join(', '),
                perspectives,
                rows,
            };
        };
        let data = employees.map(buildStaffEntry);
        data.sort((a, b) => {
            if (a.totalKpis && !b.totalKpis)
                return -1;
            if (!a.totalKpis && b.totalKpis)
                return 1;
            return a.staffName.localeCompare(b.staffName);
        });
        const allWeights = [
            ...Array.from(new Set(data.map((e) => e.totalWeight).filter((w) => w > 0))).sort((a, b) => b - a),
            0,
        ];
        if (hasWeightFilter) {
            data = data.filter((entry) => entry.totalWeight === filters.weightFilter);
            const totalFiltered = data.length;
            const skip = (staffPage - 1) * staffLimit;
            data = data.slice(skip, skip + staffLimit);
            return {
                data,
                page: staffPage,
                limit: staffLimit,
                total: totalFiltered,
                totalPages: Math.ceil(totalFiltered / staffLimit) || 1,
                availableWeights: allWeights,
            };
        }
        const totalStaff = await this.userModel.countDocuments(empQuery).exec();
        return {
            data,
            page: staffPage,
            limit: staffLimit,
            total: totalStaff,
            totalPages: Math.ceil(totalStaff / staffLimit) || 1,
            availableWeights: allWeights,
        };
    }
    async listKpisGroupedByScope(filters) {
        const groupBy = filters.groupBy;
        const fieldMap = {
            role: { idField: 'roleId', nameField: 'roleName' },
            department: { idField: 'departmentId', nameField: 'departmentName' },
            level: { idField: 'levelId', nameField: 'levelName' },
            branch: { idField: 'branchId', nameField: 'branchName' },
            business_unit: { idField: 'businessUnitId', nameField: 'businessUnitName' },
        };
        const { idField, nameField } = fieldMap[groupBy];
        const kpiQuery = {
            $or: [{ type: groupBy }, { type: MULTI_SCOPE_TYPE }],
        };
        if (filters.entity)
            kpiQuery.entity = filters.entity;
        if (filters.appraisalCycleId) {
            kpiQuery.appraisalCycleId = new mongoose_2.Types.ObjectId(filters.appraisalCycleId);
        }
        if (filters.title) {
            kpiQuery.title = new RegExp(filters.title, 'i');
        }
        if (filters.scopeId) {
            kpiQuery[idField] = filters.scopeId;
        }
        const allKpis = await this.kpiModel.find(kpiQuery).sort({ createdAt: -1 }).lean().exec();
        const groupMap = new Map();
        for (const kpi of allKpis) {
            const sId = String(kpi[idField] ?? '').trim();
            const sName = String(kpi[nameField] ?? '').trim();
            if (!sId && !sName)
                continue;
            const key = sId || sName;
            if (!groupMap.has(key)) {
                groupMap.set(key, { scopeId: sId, scopeName: sName || 'Unnamed', rows: [] });
            }
            const group = groupMap.get(key);
            if (!group.scopeName || group.scopeName === 'Unnamed') {
                if (sName)
                    group.scopeName = sName;
            }
            group.rows.push(kpi);
        }
        if (groupBy === 'role') {
            const roleIds = Array.from(groupMap.values())
                .map((g) => g.scopeId)
                .filter((id) => id && mongoose_2.Types.ObjectId.isValid(id));
            if (roleIds.length) {
                const roles = await this.roleModel
                    .find({ _id: { $in: roleIds.map((id) => new mongoose_2.Types.ObjectId(id)) } })
                    .select('_id name')
                    .lean()
                    .exec();
                const roleNameMap = new Map(roles.map((r) => [String(r._id), r.name]));
                for (const group of groupMap.values()) {
                    const resolved = roleNameMap.get(group.scopeId);
                    if (resolved)
                        group.scopeName = resolved;
                }
            }
        }
        const labelMap = {
            role: 'Role',
            department: 'Department',
            level: 'Level',
            branch: 'Branch',
            business_unit: 'Business Unit',
        };
        const groupLabel = labelMap[groupBy] ?? groupBy;
        const data = Array.from(groupMap.values())
            .sort((a, b) => a.scopeName.localeCompare(b.scopeName))
            .map((group) => {
            const perspMap = new Map();
            group.rows.forEach((kpi) => {
                const persp = String(kpi.kpa ?? '').trim() || 'Unspecified Perspective';
                if (!perspMap.has(persp))
                    perspMap.set(persp, []);
                perspMap.get(persp).push(kpi);
            });
            const perspectives = Array.from(perspMap.entries())
                .sort((a, b) => {
                if (a[0].toLowerCase() === 'unspecified perspective')
                    return 1;
                if (b[0].toLowerCase() === 'unspecified perspective')
                    return -1;
                return a[0].localeCompare(b[0]);
            })
                .map(([perspective, pRows]) => ({
                perspective,
                rows: pRows,
                totalWeight: Number(pRows.reduce((s, r) => s + (Number(r.weight) || 0), 0).toFixed(2)),
            }));
            const totalWeight = Number(group.rows.reduce((s, r) => s + (Number(r.weight) || 0), 0).toFixed(2));
            return {
                key: `${groupBy}-${group.scopeId || group.scopeName.toLowerCase().replace(/\s+/g, '-')}`,
                scopeId: group.scopeId,
                scopeName: group.scopeName,
                groupLabel,
                totalKpis: group.rows.length,
                totalWeight,
                perspectives,
                rows: group.rows,
            };
        });
        const allWeights = [
            ...Array.from(new Set(data.map((g) => g.totalWeight).filter((w) => w > 0))).sort((a, b) => b - a),
            0,
        ];
        if (Number.isFinite(filters.weightFilter)) {
            const filtered = data.filter((g) => g.totalWeight === filters.weightFilter);
            return { data: filtered, total: filtered.length, availableWeights: allWeights };
        }
        return { data, total: data.length, availableWeights: allWeights };
    }
    async listKpis(page = 1, limit = 20, filters) {
        const safePage = Math.max(Number(page) || 1, 1);
        const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 500);
        const skip = (safePage - 1) * safeLimit;
        const mongoFilters = this.buildListFilters(filters);
        const [data, total] = await Promise.all([
            this.kpiModel
                .find(mongoFilters)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(safeLimit)
                .lean()
                .exec(),
            this.kpiModel.countDocuments(mongoFilters).exec(),
        ]);
        return {
            data,
            page: safePage,
            limit: safeLimit,
            total,
            totalPages: Math.ceil(total / safeLimit) || 1,
        };
    }
    async exportKpis(filters) {
        const mongoFilters = this.buildListFilters(filters);
        const records = await this.kpiModel.find(mongoFilters).sort({ createdAt: -1 }).lean().exec();
        const employeeIds = [
            ...new Set(records
                .map((item) => item.employeeId)
                .filter((id) => Boolean(id))),
        ];
        const staffIdMap = new Map();
        if (employeeIds.length) {
            const objectIds = employeeIds
                .filter((id) => mongoose_2.Types.ObjectId.isValid(id))
                .map((id) => new mongoose_2.Types.ObjectId(id));
            if (objectIds.length) {
                const users = await this.userModel
                    .find({ _id: { $in: objectIds } })
                    .select('_id staffId')
                    .lean()
                    .exec();
                for (const u of users) {
                    if (u?.staffId) {
                        staffIdMap.set(String(u._id), String(u.staffId));
                    }
                }
            }
        }
        const headers = [
            'kpi_id',
            'employee_id',
            'employee_name',
            'role_id',
            'role_name',
            'level_id',
            'level_name',
            'department_id',
            'department_name',
            'business_unit_id',
            'business_unit_name',
            'branch_id',
            'branch_name',
            'title',
            'description',
            'type',
            'kpa',
            'kpi_scopes',
            'category',
            'target_value',
            'measurement_unit',
            'weight',
            'evaluation_frequency',
            'collection_source',
            'external_key',
            'scoring_method',
            'score_direction',
            'start_date',
            'end_date',
            'has_conditions',
            'scored_by',
            'appraisal_cycle',
            'created_at',
            'updated_at',
        ];
        const rows = records.map((item) => {
            const scopes = new Set();
            if (item.employeeId || item.employeeName)
                scopes.add('individual');
            if (item.roleId || item.roleName)
                scopes.add('role');
            if (item.levelId || item.levelName)
                scopes.add('level');
            if (item.departmentId || item.departmentName)
                scopes.add('department');
            if (item.businessUnitId || item.businessUnitName)
                scopes.add('business_unit');
            if (item.branchId || item.branchName)
                scopes.add('branch');
            const scopeValue = this.serializeScopes(scopes);
            const resolvedStaffId = item.employeeId
                ? (staffIdMap.get(String(item.employeeId)) ?? String(item.employeeId))
                : '';
            return [
                String(item._id ?? ''),
                resolvedStaffId,
                item.employeeName ?? '',
                item.roleId ?? '',
                item.roleName ?? '',
                item.levelId ?? '',
                item.levelName ?? '',
                item.departmentId ?? '',
                item.departmentName ?? '',
                item.businessUnitId ?? '',
                item.businessUnitName ?? '',
                item.branchId ?? '',
                item.branchName ?? '',
                item.title ?? '',
                item.description ?? '',
                item.type ?? '',
                item.kpa ?? '',
                scopeValue,
                item.categoryName ?? item.category ?? '',
                item.targetValue ?? '',
                item.measurementUnit ?? '',
                item.weight ?? '',
                item.evaluationFrequency ?? '',
                item.collectionSource ?? '',
                item.externalKey ?? '',
                item.scoringMethod ?? '',
                item.scoreDirection ?? '',
                item.startDate ? new Date(item.startDate).toISOString() : '',
                item.endDate ? new Date(item.endDate).toISOString() : '',
                item.hasConditions ? 'yes' : 'no',
                item.scoredBy ?? 'any',
                item.appraisalCycleName ?? '',
                item.createdAt ? new Date(item.createdAt).toISOString() : '',
                item.updatedAt ? new Date(item.updatedAt).toISOString() : '',
            ];
        });
        const csv = [
            headers.join(','),
            ...rows.map((row) => row.map((value) => this.serializeCsvValue(value)).join(',')),
        ].join('\n');
        return csv;
    }
    async getKpi(id) {
        const kpi = await this.kpiModel.findById(id).lean().exec();
        if (!kpi) {
            throw new common_1.NotFoundException('KPI not found');
        }
        return kpi;
    }
    async duplicateKpi(id, appraisalCycleId, appraisalCycleName) {
        const kpi = await this.kpiModel.findById(id).lean().exec();
        if (!kpi) {
            throw new common_1.NotFoundException('KPI not found');
        }
        const collectionSource = String(kpi.collectionSource ?? 'manual').toLowerCase();
        const shouldResetExternal = Boolean(kpi.externalKey);
        const baseTitle = kpi.title
            ? kpi.title.replace(/\s*\(Copy(?:\s+\d+)?\)\s*$/i, '').trim()
            : 'KPI';
        const targetCycleId = appraisalCycleId
            ? new mongoose_2.Types.ObjectId(appraisalCycleId)
            : kpi.appraisalCycleId;
        let candidateTitle = `${baseTitle} (Copy)`;
        let suffix = 2;
        while (await this.findDuplicateKpiId({
            entity: kpi.entity,
            appraisalCycleId: targetCycleId,
            title: candidateTitle,
            kpa: kpi.kpa,
            roleId: kpi.roleId,
            roleName: kpi.roleName,
            levelId: kpi.levelId,
            levelName: kpi.levelName,
            departmentId: kpi.departmentId,
            departmentName: kpi.departmentName,
            branchId: kpi.branchId,
            branchName: kpi.branchName,
            businessUnitId: kpi.businessUnitId,
            businessUnitName: kpi.businessUnitName,
            employeeId: kpi.employeeId,
        })) {
            candidateTitle = `${baseTitle} (Copy ${suffix})`;
            suffix += 1;
            if (suffix > 50)
                break;
        }
        const cloned = {
            ...kpi,
            _id: undefined,
            id: undefined,
            __v: undefined,
            createdAt: undefined,
            updatedAt: undefined,
            title: candidateTitle,
            externalKey: shouldResetExternal ? undefined : kpi.externalKey,
            collectionSource: collectionSource === 'api' ? 'manual' : kpi.collectionSource,
            hasConditions: kpi.hasConditions ?? false,
            customFields: Array.isArray(kpi.customFields) ? kpi.customFields : [],
            conditions: kpi.hasConditions && Array.isArray(kpi.conditions) ? kpi.conditions : [],
            ...(appraisalCycleId ? { appraisalCycleId: targetCycleId, appraisalCycleName } : {}),
        };
        const record = new this.kpiModel(cloned);
        return record.save();
    }
    async updateKpi(id, updates) {
        const kpi = await this.kpiModel.findById(id).exec();
        if (!kpi) {
            throw new common_1.NotFoundException('KPI not found');
        }
        if (updates.categoryId) {
            const category = await this.categoryModel
                .findById(updates.categoryId)
                .exec();
            if (!category) {
                throw new common_1.BadRequestException('Category not found');
            }
            kpi.category = category._id;
            kpi.categoryName = category.name;
        }
        else if (updates.categoryId === null) {
            kpi.category = undefined;
            kpi.categoryName = undefined;
        }
        if (updates.startDate !== undefined) {
            kpi.startDate = this.normalizeDates(updates.startDate);
        }
        if (updates.endDate !== undefined) {
            kpi.endDate = this.normalizeDates(updates.endDate);
        }
        if (updates.weight !== undefined) {
            kpi.weight =
                typeof updates.weight === 'number'
                    ? updates.weight
                    : Number(updates.weight ?? 0);
        }
        if (updates.hasConditions !== undefined) {
            kpi.hasConditions = updates.hasConditions;
            if (!updates.hasConditions) {
                kpi.conditions = [];
            }
        }
        if (updates.customFields) {
            kpi.customFields = updates.customFields;
        }
        if (updates.conditions) {
            kpi.conditions = updates.conditions;
        }
        const shouldRebuildTarget = [
            'type',
            'employeeId',
            'employeeName',
            'roleId',
            'roleName',
            'levelId',
            'levelName',
        ].some((key) => Object.prototype.hasOwnProperty.call(updates, key));
        if (shouldRebuildTarget) {
            const target = this.buildTargetFields({
                type: updates.type ?? kpi.type,
                employeeId: updates.employeeId ?? kpi.employeeId,
                employeeName: updates.employeeName ?? kpi.employeeName,
                roleId: updates.roleId ?? kpi.roleId,
                roleName: updates.roleName ?? kpi.roleName,
                levelId: updates.levelId ?? kpi.levelId,
                levelName: updates.levelName ?? kpi.levelName,
            });
            Object.assign(kpi, target);
        }
        const assignable = {
            title: updates.title ?? kpi.title,
            description: updates.description ?? kpi.description,
            kpa: updates.kpa ?? kpi.kpa,
            targetValue: updates.targetValue ?? kpi.targetValue,
            measurementUnit: updates.measurementUnit ?? kpi.measurementUnit,
            evaluationFrequency: updates.evaluationFrequency ?? kpi.evaluationFrequency,
            collectionSource: updates.collectionSource ?? kpi.collectionSource,
            externalKey: updates.externalKey ?? kpi.externalKey,
            scoringMethod: updates.scoringMethod ?? kpi.scoringMethod,
            scoreDirection: updates.scoreDirection ?? kpi.scoreDirection,
            employeeId: updates.employeeId ?? kpi.employeeId,
            employeeName: updates.employeeName ?? kpi.employeeName,
            roleId: updates.roleId ?? kpi.roleId,
            roleName: updates.roleName ?? kpi.roleName,
            levelId: updates.levelId ?? kpi.levelId,
            levelName: updates.levelName ?? kpi.levelName,
            departmentId: updates.departmentId ?? kpi.departmentId,
            departmentName: updates.departmentName ?? kpi.departmentName,
            businessUnitId: updates.businessUnitId ?? kpi.businessUnitId,
            businessUnitName: updates.businessUnitName ?? kpi.businessUnitName,
            branchId: updates.branchId ?? kpi.branchId,
            branchName: updates.branchName ?? kpi.branchName,
            entity: updates.entity ?? kpi.entity,
            type: updates.type ?? kpi.type,
        };
        Object.assign(kpi, assignable);
        await this.assertNotDuplicateKpi({
            entity: kpi.entity,
            appraisalCycleId: kpi.appraisalCycleId,
            title: kpi.title,
            kpa: kpi.kpa,
            roleId: kpi.roleId,
            roleName: kpi.roleName,
            levelId: kpi.levelId,
            levelName: kpi.levelName,
            departmentId: kpi.departmentId,
            departmentName: kpi.departmentName,
            branchId: kpi.branchId,
            branchName: kpi.branchName,
            businessUnitId: kpi.businessUnitId,
            businessUnitName: kpi.businessUnitName,
            employeeId: kpi.employeeId,
        }, id);
        if (updates.scoredBy !== undefined) {
            kpi.scoredBy = updates.scoredBy;
        }
        if (updates.actualValue !== undefined)
            kpi.actualValue = updates.actualValue;
        if (updates.isActualValueLocked !== undefined) {
            kpi.isActualValueLocked = updates.isActualValueLocked;
            if (updates.isActualValueLocked) {
                kpi.lockedBy = updates.lockedBy ?? kpi.lockedBy;
                kpi.lockedAt = new Date();
            }
        }
        const saved = await kpi.save();
        if (updates.actualValue !== undefined && this.performanceService) {
            try {
                await this.performanceService.syncKpiActualValueInReviewSnapshots(id, saved.actualValue, { title: saved.title });
            }
            catch (error) {
                console.error('updateKpi: syncKpiActualValueInReviewSnapshots failed', error);
            }
        }
        return saved;
    }
    async deleteKpi(id) {
        const result = await this.kpiModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException('KPI not found');
        }
        let refreshed = 0;
        if (this.performanceService) {
            try {
                const summary = await this.performanceService.refreshReviewsForKpi(id);
                refreshed = summary?.refreshed ?? 0;
            }
            catch (error) {
                console.error('deleteKpi: refreshReviewsForKpi failed', error);
            }
        }
        return { deleted: true, reviewsRefreshed: refreshed };
    }
    async bulkCreateFromCsv(rows, entity, appraisalCycleId, appraisalCycleName) {
        if (!rows.length) {
            throw new common_1.BadRequestException('CSV file is empty');
        }
        const normalized = rows.map((row) => {
            const title = this.normalizeText(row.kpi_title) ??
                this.normalizeText(row.title) ??
                this.normalizeText(row.kpi_name) ??
                '';
            const description = this.normalizeText(row.kpi_description) ??
                this.normalizeText(row.description) ??
                this.normalizeText(row.details) ??
                '';
            const rawType = this.normalizeText(row.kpi_type) ??
                this.normalizeText(row.type) ??
                '';
            const targetValue = this.normalizeText(row.target_value) ??
                this.normalizeText(row.target) ??
                this.normalizeText(row.targetvalue) ??
                '';
            const measurementUnit = this.normalizeText(row.measurement_unit) ??
                this.normalizeText(row.unit) ??
                this.normalizeText(row.measurement) ??
                '';
            const kpa = this.normalizeText(row.kpa) ??
                this.normalizeText(row.kpi_kpa) ??
                this.normalizeText(row.kpa_name);
            const categoryName = this.normalizeText(row.category) ??
                this.normalizeText(row.category_name);
            const collectionSource = this.normalizeText(row.collection_source) ??
                this.normalizeText(row.collectionsource) ??
                this.normalizeText(row.source);
            const externalKey = this.normalizeText(row.external_key) ??
                this.normalizeText(row.externalkey) ??
                this.normalizeText(row.metric);
            const scoringMethod = this.normalizeText(row.scoring_method) ??
                this.normalizeText(row.scoringmethod);
            const scoreDirection = this.normalizeText(row.score_direction) ??
                this.normalizeText(row.scoredirection);
            const rawRoleId = this.normalizeText(row.role_id) ??
                this.normalizeText(row.roleid);
            const explicitRoleName = this.normalizeText(row.role_name) ??
                this.normalizeText(row.rolename) ??
                this.normalizeText(row.role) ??
                this.normalizeText(row.position) ??
                this.normalizeText(row.job_role);
            const inferredRoleName = !explicitRoleName && rawRoleId && !mongoose_2.Types.ObjectId.isValid(rawRoleId)
                ? rawRoleId
                : undefined;
            const normalizedRoleId = inferredRoleName ? undefined : rawRoleId;
            const normalizedRoleName = explicitRoleName ?? inferredRoleName;
            const scopes = this.scopesFromRow(row);
            const derivedType = scopes.size ? this.deriveTypeFromScopes(scopes) : undefined;
            const kpiId = this.normalizeText(row.kpi_id) ?? this.normalizeText(row.kpiid);
            return {
                kpiId,
                title,
                description,
                type: derivedType ?? rawType,
                kpa,
                targetValue,
                measurementUnit,
                categoryName,
                evaluationFrequency: this.normalizeText(row.evaluation_frequency) ??
                    this.normalizeText(row.frequency),
                collectionSource,
                externalKey,
                scoringMethod,
                scoreDirection,
                weight: row.weight !== undefined && row.weight !== null && row.weight !== ''
                    ? Number(row.weight)
                    : undefined,
                startDate: row.start_date ?? row.startdate,
                endDate: row.end_date ?? row.enddate,
                employeeId: this.normalizeText(row.employee_id),
                employeeName: this.normalizeText(row.employee_name),
                roleId: normalizedRoleId,
                roleName: normalizedRoleName,
                levelId: this.normalizeText(row.level_id),
                levelName: this.normalizeText(row.level_name),
                departmentId: this.normalizeText(row.department_id),
                departmentName: this.normalizeText(row.department_name) ??
                    this.normalizeText(row.department),
                businessUnitId: this.normalizeText(row.business_unit_id) ??
                    this.normalizeText(row.businessunit_id),
                businessUnitName: this.normalizeText(row.business_unit_name) ??
                    this.normalizeText(row.businessunit_name) ??
                    this.normalizeText(row.business_unit) ??
                    this.normalizeText(row.businessunit),
                branchId: this.normalizeText(row.branch_id) ??
                    this.normalizeText(row.branchid),
                branchName: this.normalizeText(row.branch_name) ??
                    this.normalizeText(row.branch),
                actualValue: this.parseOptionalNumber(row.actual_value ?? row.actualvalue ?? row.actual),
                scoredBy: this.normalizeText(row.scored_by) ?? this.normalizeText(row.scoredby) ?? 'any',
            };
        });
        const uploadEntity = this.normalizeText(entity);
        const uniqueRoleNames = [
            ...new Set(normalized
                .map((row) => row.roleName)
                .filter((value) => Boolean(value))),
        ];
        const roleCandidatesByKey = new Map();
        if (uniqueRoleNames.length) {
            const roleRegexes = uniqueRoleNames.map((name) => new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'));
            const matchedRoles = (await this.roleModel
                .find({ name: { $in: roleRegexes } })
                .select('_id name entity')
                .lean()
                .exec());
            for (const role of matchedRoles) {
                const roleName = this.normalizeText(role?.name);
                if (!roleName)
                    continue;
                const roleEntity = this.normalizeText(role?.entity);
                const entry = { id: String(role._id), name: roleName, entity: roleEntity };
                const keys = new Set([
                    roleName.toLowerCase(),
                    this.normalizeLookupKey(roleName),
                ]);
                keys.forEach((key) => {
                    if (!key)
                        return;
                    const existing = roleCandidatesByKey.get(key) ?? [];
                    existing.push(entry);
                    roleCandidatesByKey.set(key, existing);
                });
            }
        }
        const resolveRoleByName = (roleName) => {
            const normalizedRoleName = this.normalizeText(roleName);
            if (!normalizedRoleName)
                return undefined;
            const keys = [normalizedRoleName.toLowerCase(), this.normalizeLookupKey(normalizedRoleName)];
            const candidates = keys.map((key) => roleCandidatesByKey.get(key) ?? []).find((items) => items.length) ?? [];
            if (!candidates.length)
                return undefined;
            if (uploadEntity) {
                const byEntity = candidates.find((candidate) => this.normalizeText(candidate.entity)?.toLowerCase() === uploadEntity.toLowerCase());
                if (byEntity)
                    return byEntity;
            }
            return candidates[0];
        };
        const uniqueStaffIds = [...new Set(normalized.filter((r) => r.employeeId).map((r) => r.employeeId))];
        const staffIdToUserId = new Map();
        if (uniqueStaffIds.length) {
            const matchedUsers = await this.userModel
                .find({ staffId: { $in: uniqueStaffIds } })
                .select('_id staffId firstName lastName')
                .lean()
                .exec();
            for (const u of matchedUsers) {
                if (u?.staffId) {
                    const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ');
                    staffIdToUserId.set(String(u.staffId).trim(), { id: String(u._id), name: fullName });
                }
            }
        }
        for (const row of normalized) {
            if (row.roleId && !mongoose_2.Types.ObjectId.isValid(row.roleId)) {
                if (!row.roleName) {
                    row.roleName = row.roleId;
                }
                row.roleId = undefined;
            }
            if (!row.roleId && row.roleName) {
                const resolved = resolveRoleByName(row.roleName);
                if (resolved?.id) {
                    row.roleId = resolved.id;
                    if (!row.roleName)
                        row.roleName = resolved.name;
                }
            }
            if (row.employeeId) {
                const resolved = staffIdToUserId.get(row.employeeId.trim());
                if (resolved) {
                    row.employeeId = resolved.id;
                    if (!row.employeeName)
                        row.employeeName = resolved.name;
                }
            }
        }
        const candidates = normalized.filter((row) => row.title && row.description && row.targetValue && row.measurementUnit);
        if (!candidates.length) {
            return { created: 0, skipped: rows.length };
        }
        const categoryNames = new Map();
        candidates.forEach((row) => {
            if (!row.categoryName)
                return;
            categoryNames.set(this.buildSlug(row.categoryName), row.categoryName);
        });
        const slugs = Array.from(categoryNames.keys());
        const existingCategories = slugs.length
            ? await this.categoryModel.find({ slug: { $in: slugs } }).lean().exec()
            : [];
        const categoryMap = new Map();
        existingCategories.forEach((category) => {
            if (!category?.slug)
                return;
            categoryMap.set(category.slug, {
                _id: category._id,
                name: category.name,
            });
        });
        const missingCategories = slugs
            .filter((slug) => !categoryMap.has(slug))
            .map((slug) => ({ name: categoryNames.get(slug) ?? slug, slug }));
        if (missingCategories.length) {
            const createdCategories = await this.categoryModel.insertMany(missingCategories, {
                ordered: false,
            });
            createdCategories.forEach((category) => {
                if (!category?.slug)
                    return;
                categoryMap.set(category.slug, {
                    _id: category._id,
                    name: category.name,
                });
            });
        }
        const toCreate = [];
        const toUpdate = [];
        for (const row of candidates) {
            let target;
            try {
                target = this.buildTargetFields({
                    type: row.type,
                    employeeId: row.employeeId,
                    employeeName: row.employeeName,
                    roleId: row.roleId,
                    roleName: row.roleName,
                    levelId: row.levelId,
                    levelName: row.levelName,
                });
            }
            catch (error) {
                continue;
            }
            let categoryRef;
            let resolvedCategoryName = row.categoryName?.trim();
            if (resolvedCategoryName) {
                const slug = this.buildSlug(resolvedCategoryName);
                const category = categoryMap.get(slug);
                if (category) {
                    categoryRef = category._id;
                    resolvedCategoryName = category.name;
                }
            }
            const { kpiId, ...restRow } = row;
            const doc = {
                ...restRow,
                ...target,
                category: categoryRef,
                categoryName: resolvedCategoryName,
                startDate: this.normalizeDates(row.startDate),
                endDate: this.normalizeDates(row.endDate),
                weight: typeof row.weight === 'number' ? row.weight : Number(row.weight ?? 0),
                evaluationFrequency: row.evaluationFrequency ?? 'monthly',
                hasConditions: false,
                customFields: [],
                conditions: [],
                ...(entity ? { entity } : {}),
                ...(appraisalCycleId ? { appraisalCycleId: new mongoose_2.Types.ObjectId(appraisalCycleId), appraisalCycleName } : {}),
            };
            if (kpiId && mongoose_2.Types.ObjectId.isValid(kpiId)) {
                toUpdate.push({ id: kpiId, data: doc });
            }
            else {
                toCreate.push(doc);
            }
        }
        if (toCreate.length) {
            const remaining = [];
            for (const doc of toCreate) {
                const dupId = await this.findDuplicateKpiId({
                    entity: doc.entity,
                    appraisalCycleId: doc.appraisalCycleId ?? appraisalCycleId,
                    title: doc.title,
                    kpa: doc.kpa,
                    roleId: doc.roleId,
                    roleName: doc.roleName,
                    levelId: doc.levelId,
                    levelName: doc.levelName,
                    departmentId: doc.departmentId,
                    departmentName: doc.departmentName,
                    branchId: doc.branchId,
                    branchName: doc.branchName,
                    businessUnitId: doc.businessUnitId,
                    businessUnitName: doc.businessUnitName,
                    employeeId: doc.employeeId,
                });
                if (dupId) {
                    toUpdate.push({ id: dupId, data: doc });
                }
                else {
                    remaining.push(doc);
                }
            }
            toCreate.length = 0;
            toCreate.push(...remaining);
        }
        let created = 0;
        let updated = 0;
        if (toUpdate.length) {
            const bulkOps = toUpdate.map(({ id, data }) => ({
                updateOne: {
                    filter: { _id: new mongoose_2.Types.ObjectId(id) },
                    update: { $set: data },
                },
            }));
            const result = await this.kpiModel.bulkWrite(bulkOps, { ordered: false });
            updated = result.modifiedCount ?? 0;
        }
        if (toCreate.length) {
            const inserted = await this.kpiModel.insertMany(toCreate, { ordered: false });
            created = inserted.length;
        }
        return { created, updated, skipped: rows.length - created - updated };
    }
};
exports.KpiService = KpiService;
exports.KpiService = KpiService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(kpi_schema_1.PerformanceKpi.name)),
    __param(1, (0, mongoose_1.InjectModel)(kpi_category_schema_1.KpiCategory.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(3, (0, mongoose_1.InjectModel)(role_schema_1.Role.name)),
    __param(4, (0, common_1.Optional)()),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => performance_service_1.PerformanceService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        performance_service_1.PerformanceService])
], KpiService);
//# sourceMappingURL=kpi.service.js.map