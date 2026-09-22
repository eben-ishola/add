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
exports.UserImportService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const spreadsheet_util_1 = require("../../utils/shared/spreadsheet.util");
const user_date_util_1 = require("../../utils/user/user-date.util");
const user_name_util_1 = require("../../utils/user/user-name.util");
const role_schema_1 = require("../../schemas/role.schema");
const subsidiary_service_1 = require("../org/subsidiary.service");
const level_service_1 = require("../org/level.service");
const branch_service_1 = require("../org/branch.service");
const department_service_1 = require("../org/department.service");
const businessUnit_service_1 = require("../org/businessUnit.service");
const STAFF_UPLOAD_MAPPED_FIELDS = [
    'entity',
    'department',
    'businessUnit',
    'level',
    'branch',
    'role',
    'supervisorId',
    'startDate',
    'exitDate',
    'dateOfBirth',
    'firstName',
    'lastName',
    'middleName',
    'email',
    'phoneNumber',
    'addosserAccount',
    'atlasAccount',
    'aftaAccount',
    'status',
    'orbitID',
    'confirmed',
    'staffId',
    'staffID',
    'supervisor',
    'supervisor2',
    'transportLevel',
];
const ACCOUNT_DETAIL_FIELDS = [
    'bankName',
    'accountName',
    'accountNumber',
    'bvn',
    'nhf',
    'pensionAccount',
    'pensionProvider',
    'payeAccount',
    'swiftCode',
    'sortCode',
];
let UserImportService = class UserImportService {
    constructor(staffModel, roleModel, entityService, levelService, branchService, departmentService, businessUnit) {
        this.staffModel = staffModel;
        this.roleModel = roleModel;
        this.entityService = entityService;
        this.levelService = levelService;
        this.branchService = branchService;
        this.departmentService = departmentService;
        this.businessUnit = businessUnit;
    }
    escapeRegex(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
    async readRows(source, fileName) {
        const normalizedName = String(fileName ?? '').toLowerCase();
        if (normalizedName.endsWith('.xls')) {
            throw new Error('Legacy .xls files are not supported. Please save as .xlsx or .csv.');
        }
        if (normalizedName.endsWith('.csv')) {
            return (0, spreadsheet_util_1.csvBufferToObjects)(source, { defval: '', trim: true }).rows;
        }
        try {
            const workbook = await (0, spreadsheet_util_1.loadWorkbook)(source, fileName);
            const sheet = (0, spreadsheet_util_1.getFirstWorksheet)(workbook);
            if (!sheet) {
                throw new Error('No worksheet found in uploaded file.');
            }
            return (0, spreadsheet_util_1.worksheetToObjects)(sheet, { defval: '', useText: true }).rows;
        }
        catch (error) {
            const fallback = (0, spreadsheet_util_1.csvBufferToObjects)(source, { defval: '', trim: true }).rows;
            if (!fallback.length) {
                throw error;
            }
            return fallback;
        }
    }
    removeMappedFields(row) {
        const rest = { ...row };
        STAFF_UPLOAD_MAPPED_FIELDS.forEach((key) => {
            delete rest[key];
        });
        return rest;
    }
    mergeAccountDetail(row, existingStaff) {
        const accountDetail = {};
        const baseAccountDetail = {};
        if (existingStaff?.employeeInformation && typeof existingStaff.employeeInformation === 'object') {
            ACCOUNT_DETAIL_FIELDS.forEach((field) => {
                const existingValue = existingStaff.employeeInformation?.accountDetail?.[field] ??
                    existingStaff.employeeInformation?.[field];
                if (existingValue !== undefined && existingValue !== null) {
                    baseAccountDetail[field] = existingValue;
                }
            });
        }
        ACCOUNT_DETAIL_FIELDS.forEach((field) => {
            const value = row[field];
            if (value !== undefined && value !== null && String(value).trim() !== '') {
                accountDetail[field] = typeof value === 'string' ? value.trim() : value;
            }
        });
        const merged = { ...baseAccountDetail, ...accountDetail };
        return Object.keys(merged).length ? merged : null;
    }
    async uploadStaff(source, fileName, options) {
        try {
            void options.user;
            const jsonData = await this.readRows(source, fileName);
            const skippedRows = [];
            const errors = [];
            let successCount = 0;
            const createRequiredFields = new Set(['firstName', 'lastName', 'branch', 'department', 'entity']);
            for (const [index, row] of jsonData.entries()) {
                const rowNumber = index + 2;
                const rawStaffId = row.staffId ?? row.staffID;
                const rawEmail = row.email ?? row.Email;
                const staffId = String(rawStaffId || '').trim();
                const email = String(rawEmail || '').trim();
                if (!staffId && !email) {
                    skippedRows.push({ row: rowNumber, reason: 'Missing staffId/email' });
                    continue;
                }
                let existingStaff = await this.staffModel
                    .findOne(staffId ? { staffId } : { email })
                    .select('employeeInformation')
                    .lean();
                if (!existingStaff && staffId && email) {
                    existingStaff = await this.staffModel
                        .findOne({ email })
                        .select('employeeInformation')
                        .lean();
                }
                const shouldCreate = !existingStaff;
                const entityCode = row.entity ? String(row.entity).trim() : '';
                const departmentName = row.department ? String(row.department).trim() : '';
                const businessUnitName = row.businessUnit ? String(row.businessUnit).trim() : '';
                const roleName = row.role ? String(row.role).trim() : '';
                const levelName = row.level ? String(row.level).trim() : '';
                const branchName = row.branch ? String(row.branch).trim() : '';
                const supervisorCode = row.supervisor ? String(row.supervisor).trim() : '';
                const supervisor2Code = row.supervisor2 ? String(row.supervisor2).trim() : '';
                const rowIssues = [];
                const addIssue = (field, message) => rowIssues.push({ field, message });
                const entity = entityCode ? await this.entityService.getSubsidiaryByShort(entityCode) : null;
                if (entityCode && !entity) {
                    addIssue('entity', `Entity '${entityCode}' not found`);
                }
                const entityIdentifier = entity?._id ?? entityCode ?? null;
                if (!entityIdentifier && (departmentName || roleName)) {
                    addIssue('entity', 'Entity code is required to map department/role');
                }
                const department = departmentName
                    ? await this.departmentService.getDepartmentByNameAndEntity(departmentName, entityIdentifier)
                        ?? await this.departmentService.getDepartmentByName(departmentName)
                    : null;
                if (departmentName && !department) {
                    addIssue('department', `Department '${departmentName}' not found${entityCode ? ` for entity '${entityCode}'` : ''}`);
                }
                const businessUnit = businessUnitName ? await this.businessUnit.getBusinessUnitByName(businessUnitName) : null;
                if (businessUnitName && !businessUnit) {
                    addIssue('businessUnit', `Business unit '${businessUnitName}' not found`);
                }
                const level = levelName ? await this.levelService.getLevelByNameAndEntity(levelName) : null;
                if (levelName && !level) {
                    addIssue('level', `Level '${levelName}' not found`);
                }
                const branch = branchName ? await this.branchService.getBranchByName(branchName) : null;
                if (branchName && !branch) {
                    addIssue('branch', `Branch '${branchName}' not found`);
                }
                const roleRecord = roleName
                    ? await this.resolveRoleByNameAndEntity(roleName, entityIdentifier)
                    : null;
                if (roleName && !roleRecord) {
                    addIssue('role', `Role '${roleName}' not found${entityCode ? ` for entity '${entityCode}'` : ''}`);
                }
                if (shouldCreate) {
                    if (!String(row.firstName ?? '').trim()) {
                        addIssue('firstName', 'First name is required');
                    }
                    if (!String(row.lastName ?? '').trim()) {
                        addIssue('lastName', 'Last name is required');
                    }
                    if (!entity?._id && !entityCode) {
                        addIssue('entity', 'Entity is required');
                    }
                    if (!department?._id && !departmentName) {
                        addIssue('department', 'Department is required');
                    }
                    if (!branch?._id && !branchName) {
                        addIssue('branch', 'Branch is required');
                    }
                }
                if (shouldCreate && rowIssues.some((issue) => createRequiredFields.has(issue.field))) {
                    for (const issue of rowIssues) {
                        errors.push({ row: rowNumber, staffId, field: issue.field, error: issue.message });
                    }
                    continue;
                }
                const startDate = row.startDate ? (0, user_date_util_1.parseStaffImportDate)(row.startDate) : null;
                const exitDate = row.exitDate ? (0, user_date_util_1.parseStaffImportDate)(row.exitDate) : null;
                const dateOfBirth = row.dateOfBirth ? (0, user_date_util_1.parseStaffImportDate)(row.dateOfBirth) : null;
                let supervisorId = null;
                let supervisor2Id = null;
                if (supervisorCode) {
                    const supervisor = await this.staffModel.findOne({ staffId: supervisorCode }).select('_id').lean();
                    if (supervisor?._id) {
                        supervisorId = new mongoose_2.default.Types.ObjectId(supervisor._id);
                    }
                    else {
                        addIssue('supervisor', `Supervisor with staffId '${supervisorCode}' not found`);
                    }
                }
                if (supervisor2Code && supervisor2Code.trim()) {
                    const supervisor2 = await this.staffModel.findOne({ staffId: supervisor2Code.trim() }).select('_id').lean();
                    if (supervisor2?._id) {
                        supervisor2Id = new mongoose_2.default.Types.ObjectId(supervisor2._id);
                    }
                    else {
                        addIssue('supervisor2', `Supervisor 2 with staffId '${supervisor2Code}' not found`);
                    }
                }
                const rest = this.removeMappedFields(row);
                let createStaffDto = {
                    staffId,
                    firstName: (0, user_name_util_1.toTitleCaseName)(row.firstName),
                    lastName: (0, user_name_util_1.toTitleCaseName)(row.lastName),
                    middleName: (0, user_name_util_1.toTitleCaseName)(row.middleName),
                    email,
                    phoneNumber: row.phoneNumber ? String(row.phoneNumber).trim() : '',
                    branch: branch?._id ? new mongoose_2.default.Types.ObjectId(branch._id) : null,
                    department: department?._id ? new mongoose_2.default.Types.ObjectId(department._id) : null,
                    businessUnit: businessUnit?._id ? new mongoose_2.default.Types.ObjectId(businessUnit._id) : null,
                    entity: entity?._id ? new mongoose_2.default.Types.ObjectId(entity._id) : null,
                    level: level?._id ? new mongoose_2.default.Types.ObjectId(level._id) : null,
                    role: roleRecord?._id ? new mongoose_2.default.Types.ObjectId(roleRecord._id) : null,
                    startDate: startDate || '',
                    exitDate: exitDate || '',
                    dateOfBirth: dateOfBirth || '',
                    addosserAccount: row.addosserAccount ? String(row.addosserAccount).trim() : '',
                    atlasAccount: row.atlasAccount ? String(row.atlasAccount).trim() : '',
                    aftaAccount: row.aftaAccount ? String(row.aftaAccount).trim() : '',
                    status: row.status ? String(row.status).trim() : 'Active',
                    orbitID: row.orbitID ? String(row.orbitID).trim() : '',
                    confirmed: row.confirmed !== undefined && row.confirmed !== null ? String(row.confirmed) : '',
                    transportLevel: row.transportLevel ? String(row.transportLevel).trim().toLowerCase() : '',
                    supervisorId,
                    supervisor2Id,
                    ...rest,
                };
                const mergedAccountDetail = this.mergeAccountDetail(row, existingStaff);
                if (mergedAccountDetail) {
                    createStaffDto.employeeInformation = {
                        ...(existingStaff?.employeeInformation || {}),
                        ...(createStaffDto.employeeInformation || {}),
                        accountDetail: mergedAccountDetail,
                    };
                }
                createStaffDto = Object.fromEntries(Object.entries(createStaffDto).filter(([key, value]) => key === 'staffId' || (value !== '' && value !== null && value !== undefined)));
                const result = await options.updateUploadedStaff(createStaffDto, { allowCreate: true });
                if (result) {
                    successCount++;
                }
                else {
                    addIssue('record', 'Staff record could not be created or updated.');
                }
                for (const issue of rowIssues) {
                    errors.push({ row: rowNumber, staffId, field: issue.field, error: issue.message });
                }
            }
            return {
                message: 'Upload complete',
                successCount,
                skippedRowsCount: skippedRows.length,
                skippedRows,
                errors,
            };
        }
        catch (error) {
            console.error('Error uploading staff XLSX:', error);
            throw error;
        }
    }
    async uploadSupervisors(source, fileName, options) {
        try {
            const rows = await this.readRows(source, fileName);
            const errors = [];
            const updates = [];
            for (const [index, row] of rows.entries()) {
                const { staffId, supervisorId } = row;
                if (!staffId) {
                    errors.push({ row: index + 2, error: 'Missing staffId' });
                    continue;
                }
                try {
                    const result = await options.updateSupervisor({ staffId, supervisorId });
                    updates.push(result.staff?.staffId || staffId);
                }
                catch (err) {
                    errors.push({ row: index + 2, error: err.message });
                }
            }
            return {
                message: 'Supervisor upload completed',
                updated: updates.length,
                failed: errors.length,
                errors,
            };
        }
        catch (e) {
            throw new Error(`uploadSupervisor failed: ${e.message}`);
        }
    }
};
exports.UserImportService = UserImportService;
exports.UserImportService = UserImportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __param(1, (0, mongoose_1.InjectModel)(role_schema_1.Role.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        subsidiary_service_1.SubsidiaryService,
        level_service_1.LevelService,
        branch_service_1.BranchService,
        department_service_1.DepartmentService,
        businessUnit_service_1.BusinessUnitService])
], UserImportService);
//# sourceMappingURL=user-import.service.js.map