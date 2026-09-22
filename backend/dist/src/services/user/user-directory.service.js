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
exports.UserDirectoryService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const moment = require("moment-timezone");
const index_utils_1 = require("../../utils/index.utils");
const access_control_util_1 = require("../../utils/shared/access-control.util");
const calendar_date_util_1 = require("../../utils/shared/calendar-date.util");
const STAFF_SAFE_PROJECTION = '-password -__v';
const STAFF_DIRECTORY_FIELDS = [
    'firstName',
    'lastName',
    'middleName',
    'email',
    'staffId',
    'staffID',
    'userId',
    'userID',
    'position',
    'jobTitle',
    'role',
    'level',
    'transportLevel',
    'inconvenienceLevel',
    'department',
    'entity',
    'addosserAccount',
    'atlasAccount',
    'aftaAccount',
];
const STAFF_DIRECTORY_PROJECTION = STAFF_DIRECTORY_FIELDS.join(' ');
const STAFF_ATTENDANCE_FIELDS = [
    'firstName',
    'lastName',
    'middleName',
    'branch',
    'additionalBranch',
    'department',
    'businessUnit',
];
const STAFF_ATTENDANCE_PROJECTION = STAFF_ATTENDANCE_FIELDS.join(' ');
const STAFF_LIST_FIELDS = [
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
    'previousLevel',
    'levelChangedAt',
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
    'avatar',
    'avatarUrl',
    'photo',
    'profileImage',
    'profilePhoto',
    'profileThumbnail',
    'profileThumbnailUrl',
    'thumbnail',
    'thumbnailUrl',
    'employeeInformation.photo',
    'employeeInformation.passportPhoto',
    'employeeInformation.profileImage',
    'employeeInformation.profilePhoto',
    'employeeInformation.profileThumbnail',
    'employeeInformation.profileThumbnailUrl',
    'employeeInformation.thumbnail',
    'employeeInformation.thumbnailUrl',
    'employeeInformation.documents',
    'supervisorId',
    'supervisor2Id',
    'allowMultiBranch',
    'rent',
    'rentStartDate',
    'rentEndDate',
    'rentStart',
    'rentEnd',
    'additionalRoles',
];
const STAFF_LIST_PROJECTION = STAFF_LIST_FIELDS.join(' ');
const STAFF_SUMMARY_POPULATE = [
    { path: 'branch', options: { lean: true } },
    { path: 'additionalBranch', select: 'name entity latitude longitude', options: { lean: true } },
    {
        path: 'level',
        options: { lean: true },
        populate: { path: 'category', options: { lean: true } },
    },
    { path: 'department', options: { lean: true } },
    {
        path: 'businessUnit',
        options: { lean: true },
        populate: { path: 'territory', options: { lean: true } },
    },
    { path: 'entity', options: { lean: true } },
    {
        path: 'role',
        options: { lean: true },
        skipInvalidIds: true,
        populate: { path: 'permissions', options: { lean: true }, skipInvalidIds: true },
    },
    {
        path: 'additionalRoles',
        options: { lean: true },
        populate: [
            {
                path: 'role',
                options: { lean: true },
                skipInvalidIds: true,
                populate: { path: 'permissions', options: { lean: true }, skipInvalidIds: true },
            },
            { path: 'entity', options: { lean: true }, skipInvalidIds: true },
        ],
    },
];
const STAFF_SUPERVISOR_POPULATE = [
    {
        path: 'supervisorId',
        select: STAFF_SAFE_PROJECTION,
        options: { lean: true },
        skipInvalidIds: true,
    },
    {
        path: 'supervisor2Id',
        select: STAFF_SAFE_PROJECTION,
        options: { lean: true },
        skipInvalidIds: true,
    },
];
const STAFF_DIRECTORY_POPULATE = [
    { path: 'department', select: 'name entity', options: { lean: true } },
    { path: 'entity', select: 'name short', options: { lean: true } },
    { path: 'role', select: 'name', options: { lean: true }, skipInvalidIds: true },
    { path: 'level', select: 'name', options: { lean: true } },
];
const STAFF_ATTENDANCE_POPULATE = [
    { path: 'branch', select: 'name entity', options: { lean: true } },
    { path: 'additionalBranch', select: 'name entity latitude longitude', options: { lean: true } },
    { path: 'department', select: 'name entity', options: { lean: true } },
    { path: 'businessUnit', select: 'BU_NM BU_ID BU_NO', options: { lean: true } },
];
const STAFF_LIST_POPULATE = [
    { path: 'branch', select: 'name entity', options: { lean: true } },
    { path: 'additionalBranch', select: 'name entity latitude longitude', options: { lean: true } },
    { path: 'department', select: 'name entity', options: { lean: true } },
    { path: 'businessUnit', select: 'BU_NM BU_ID BU_NO territory', options: { lean: true } },
    { path: 'level', select: 'name category', options: { lean: true } },
    { path: 'previousLevel', select: 'name category', options: { lean: true }, skipInvalidIds: true },
    { path: 'entity', select: 'name short', options: { lean: true } },
    {
        path: 'role',
        select: 'name app profileKey description',
        options: { lean: true },
        skipInvalidIds: true,
    },
    {
        path: 'additionalRoles',
        options: { lean: true },
        populate: [
            {
                path: 'role',
                select: 'name app profileKey description',
                options: { lean: true },
                skipInvalidIds: true,
            },
            { path: 'entity', select: 'name short', options: { lean: true }, skipInvalidIds: true },
        ],
    },
];
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
const STAFF_MILESTONE_LOOKUPS = [
    {
        $lookup: {
            from: 'departments',
            localField: 'department',
            foreignField: '_id',
            as: 'department',
        },
    },
    {
        $lookup: {
            from: 'roles',
            localField: 'role',
            foreignField: '_id',
            as: 'role',
        },
    },
    {
        $lookup: {
            from: 'entities',
            localField: 'entity',
            foreignField: '_id',
            as: 'entity',
        },
    },
];
const buildStaffMilestoneProjection = (dateField) => ({
    firstName: 1,
    lastName: 1,
    email: 1,
    [dateField]: {
        $dateToString: {
            format: '%Y-%m-%d',
            date: `$${dateField}`,
            timezone: 'Africa/Lagos',
        },
    },
    years: {
        $subtract: [
            { $year: { date: '$$NOW', timezone: 'Africa/Lagos' } },
            { $year: { date: '$startDate', timezone: 'Africa/Lagos' } },
        ],
    },
    department: { $arrayElemAt: ['$department.name', 0] },
    role: { $arrayElemAt: ['$role.name', 0] },
    entity: { $arrayElemAt: ['$entity.name', 0] },
});
const STAFF_MILESTONE_DATE_UPPER_BOUND = new Date('9999-12-31T23:59:59.999Z');
let UserDirectoryService = class UserDirectoryService {
    constructor(staffModel) {
        this.staffModel = staffModel;
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
    normalizeSupervisorScope(scope) {
        const values = Array.isArray(scope)
            ? scope
            : scope
                ? String(scope)
                    .split(',')
                    .map((value) => value.trim())
                    .filter((value) => value.length > 0)
                : [];
        const unique = new Map();
        values
            .map((value) => this.normalizeObjectId(value))
            .filter((id) => Boolean(id))
            .forEach((id) => unique.set(id.toHexString(), id));
        return Array.from(unique.values());
    }
    resolvePayrollMonthRange(value) {
        if (!value)
            return null;
        if (value instanceof Date && !Number.isNaN(value.getTime())) {
            const start = new Date(value.getFullYear(), value.getMonth(), 1);
            const end = new Date(value.getFullYear(), value.getMonth() + 1, 1);
            return { start, end };
        }
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed)
                return null;
            if (/^\d{4}[-/]\d{1,2}$/.test(trimmed)) {
                const [yearPart, monthPart] = trimmed.split(/[-/]/);
                const year = Number(yearPart);
                const month = Number(monthPart);
                if (Number.isFinite(year) && Number.isFinite(month)) {
                    const start = new Date(year, month - 1, 1);
                    const end = new Date(year, month, 1);
                    return { start, end };
                }
            }
            const parsed = new Date(trimmed);
            if (!Number.isNaN(parsed.getTime())) {
                const start = new Date(parsed.getFullYear(), parsed.getMonth(), 1);
                const end = new Date(parsed.getFullYear(), parsed.getMonth() + 1, 1);
                return { start, end };
            }
        }
        return null;
    }
    extractPermissionNames(user) {
        const sources = [];
        const register = (input) => {
            if (!input)
                return;
            if (Array.isArray(input))
                sources.push(...input);
            else
                sources.push(input);
        };
        register(user?.permissions);
        register(user?.role?.permissions);
        const registerAdditional = (assignment) => {
            if (!assignment)
                return;
            register(assignment?.permissions);
            register(assignment?.role?.permissions);
        };
        if (Array.isArray(user?.additionalRoles)) {
            user.additionalRoles.forEach(registerAdditional);
        }
        else {
            registerAdditional(user?.additionalRoles);
        }
        return sources
            .map((permission) => {
            if (!permission)
                return null;
            if (typeof permission === 'string')
                return permission;
            if (typeof permission?.name === 'string')
                return permission.name;
            return null;
        })
            .filter((name) => Boolean(name))
            .map((name) => name.toLowerCase());
    }
    userHasGlobalEntityAccess(user) {
        const scopeSet = (0, access_control_util_1.deriveUserScopes)(user);
        if (scopeSet.has('group')) {
            return true;
        }
        const names = this.extractPermissionNames(user);
        const globalFlags = new Set([
            'all',
            'super admin',
            'hr super admin',
            'view subsidiaries',
            'view all subsidiaries',
            'all entities',
        ]);
        return names.some((name) => globalFlags.has(name));
    }
    resolveEntityConstraint(user, requestedEntityId) {
        if (this.userHasGlobalEntityAccess(user)) {
            return requestedEntityId;
        }
        const userEntity = user?.entity;
        const normalizedUserEntity = requestedEntityId || this.normalizeObjectId(userEntity?._id ?? userEntity);
        if (!normalizedUserEntity) {
            return requestedEntityId;
        }
        if (requestedEntityId && !normalizedUserEntity.equals(requestedEntityId)) {
            throw new common_1.ForbiddenException('You do not have permission to view this entity.');
        }
        return normalizedUserEntity;
    }
    hasFilterValue(value) {
        if (value == null)
            return false;
        const trimmed = String(value).trim();
        if (!trimmed)
            return false;
        const lowered = trimmed.toLowerCase();
        return lowered !== 'all' && lowered !== 'null' && lowered !== 'undefined';
    }
    async getStaffByRoleKeywords(keywords, entity) {
        return this.findActiveStaffByRoleKeywords(keywords, entity);
    }
    async getBySupervisor(short, options) {
        try {
            const supervisorId = (0, index_utils_1.toObjectId)(short);
            const useLight = options?.light === true;
            const projection = useLight ? STAFF_ATTENDANCE_PROJECTION : STAFF_SAFE_PROJECTION;
            const populate = useLight
                ? STAFF_ATTENDANCE_POPULATE
                : [
                    { path: 'branch', options: { lean: true } },
                    { path: 'level', options: { lean: true } },
                ];
            return this.staffModel
                .find({
                $or: [
                    { supervisorId: { $in: [short, supervisorId] } },
                    { supervisor2Id: { $in: [short, supervisorId] } },
                ],
                status: 'Active',
            })
                .select(projection)
                .populate(populate)
                .lean();
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async getStaffList(short, options) {
        try {
            const useLight = options?.light === true;
            const projection = useLight ? STAFF_ATTENDANCE_PROJECTION : STAFF_SAFE_PROJECTION;
            const populate = useLight
                ? STAFF_ATTENDANCE_POPULATE
                : [
                    { path: 'branch', options: { lean: true } },
                    { path: 'level', options: { lean: true } },
                ];
            const entityId = this.normalizeObjectId(short);
            const matchConditions = [];
            if (entityId) {
                const rawEntity = this.extractObjectIdCandidate(short)?.trim();
                const entityConditions = [{ entity: entityId }];
                if (rawEntity && rawEntity !== String(entityId)) {
                    entityConditions.push({ entity: rawEntity });
                }
                matchConditions.push(entityConditions.length === 1 ? entityConditions[0] : { $or: entityConditions });
            }
            const exitWindow = this.resolvePayrollMonthRange(options?.includeExitedInMonth);
            if (exitWindow) {
                matchConditions.push({
                    $or: [
                        { status: 'Active' },
                        { exitDate: { $gte: exitWindow.start, $lt: exitWindow.end } },
                    ],
                });
            }
            else {
                matchConditions.push({ status: 'Active' });
            }
            const query = matchConditions.length === 1
                ? matchConditions[0]
                : { $and: matchConditions };
            return this.staffModel
                .find(query)
                .select(projection)
                .populate(populate)
                .lean();
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async getStaffList2(subsidiaryId, supervisorScope) {
        try {
            const matchConditions = [{ status: 'Active' }];
            if (subsidiaryId) {
                const normalizedEntityId = this.normalizeObjectId(subsidiaryId);
                const entityConditions = [];
                if (normalizedEntityId) {
                    entityConditions.push({ entity: normalizedEntityId });
                    entityConditions.push({ entity: subsidiaryId });
                }
                if (entityConditions.length === 1) {
                    matchConditions.push(entityConditions[0]);
                }
                else if (entityConditions.length > 1) {
                    matchConditions.push({ $or: entityConditions });
                }
            }
            const supervisorIds = this.normalizeSupervisorScope(supervisorScope);
            if (supervisorIds.length) {
                matchConditions.push({
                    $or: [
                        { supervisorId: { $in: supervisorIds } },
                        { supervisor2Id: { $in: supervisorIds } },
                    ],
                });
            }
            const query = matchConditions.length === 1
                ? matchConditions[0]
                : { $and: matchConditions };
            return this.staffModel
                .find(query)
                .select(STAFF_DIRECTORY_PROJECTION)
                .populate(STAFF_DIRECTORY_POPULATE)
                .lean();
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async exportUser(params) {
        const pipeline = [];
        const matchConditions = [];
        const normalizedStatus = String(params?.status ?? '').trim();
        if (this.hasFilterValue(normalizedStatus)) {
            matchConditions.push({ status: normalizedStatus });
        }
        if (this.hasFilterValue(params?.subsidiaryId)) {
            const normalizedEntityId = this.normalizeObjectId(params?.subsidiaryId);
            const entityConditions = [];
            if (normalizedEntityId) {
                entityConditions.push({ entity: normalizedEntityId });
            }
            entityConditions.push({ entity: params?.subsidiaryId });
            if (entityConditions.length === 1) {
                matchConditions.push(entityConditions[0]);
            }
            else {
                matchConditions.push({ $or: entityConditions });
            }
        }
        if (this.hasFilterValue(params?.branch)) {
            matchConditions.push({ branch: { $in: [params.branch, (0, index_utils_1.toObjectId)(params.branch)] } });
        }
        if (this.hasFilterValue(params?.department)) {
            matchConditions.push({
                department: { $in: [params.department, (0, index_utils_1.toObjectId)(params.department)] },
            });
        }
        if (this.hasFilterValue(params?.confirmed)) {
            matchConditions.push({ confirmed: String(params.confirmed).trim() });
        }
        const searchValue = params?.searchText?.trim();
        if (searchValue) {
            const regex = new RegExp(searchValue, 'i');
            matchConditions.push({
                $or: [
                    { firstName: regex },
                    { lastName: regex },
                    { middleName: regex },
                    { email: regex },
                    { staffId: regex },
                ],
            });
        }
        const supervisorIds = this.normalizeSupervisorScope(params?.supervisorScope);
        if (supervisorIds.length) {
            matchConditions.push({
                $or: [
                    { supervisorId: { $in: supervisorIds } },
                    { supervisor2Id: { $in: supervisorIds } },
                ],
            });
        }
        if (matchConditions.length === 1) {
            pipeline.push({ $match: matchConditions[0] });
        }
        else if (matchConditions.length > 1) {
            pipeline.push({ $match: { $and: matchConditions } });
        }
        pipeline.push({
            $lookup: {
                from: 'branches',
                localField: 'branch',
                foreignField: '_id',
                as: 'branches',
            },
        }, {
            $lookup: {
                from: 'businessunits',
                localField: 'businessUnit',
                foreignField: '_id',
                as: 'businessunits',
            },
        }, {
            $lookup: {
                from: 'roles',
                localField: 'role',
                foreignField: '_id',
                as: 'roles',
            },
        }, {
            $lookup: {
                from: 'subsidiaries',
                localField: 'entity',
                foreignField: '_id',
                as: 'subsidiaries',
            },
        }, {
            $lookup: {
                from: 'departments',
                localField: 'department',
                foreignField: '_id',
                as: 'departments',
            },
        }, {
            $lookup: {
                from: 'levels',
                localField: 'level',
                foreignField: '_id',
                as: 'levels',
            },
        }, {
            $lookup: {
                from: 'users',
                localField: 'supervisorId',
                foreignField: '_id',
                as: 'supervisor',
            },
        }, {
            $lookup: {
                from: 'users',
                localField: 'supervisor2Id',
                foreignField: '_id',
                as: 'supervisor2',
            },
        }, {
            $addFields: {
                branch: { $ifNull: [{ $arrayElemAt: ['$branches.name', 0] }, null] },
                role: { $ifNull: [{ $arrayElemAt: ['$roles.name', 0] }, null] },
                businessUnit: { $ifNull: [{ $arrayElemAt: ['$businessunits.BU_NM', 0] }, null] },
                entity: { $ifNull: [{ $arrayElemAt: ['$subsidiaries.short', 0] }, null] },
                department: { $ifNull: [{ $arrayElemAt: ['$departments.name', 0] }, null] },
                level: { $ifNull: [{ $arrayElemAt: ['$levels.name', 0] }, null] },
                supervisor: { $ifNull: [{ $arrayElemAt: ['$supervisor.staffId', 0] }, null] },
                supervisor2: { $ifNull: [{ $arrayElemAt: ['$supervisor2.staffId', 0] }, null] },
                nhfAccount: {
                    $ifNull: [
                        '$employeeInformation.accountDetail.nhf',
                        '$employeeInformation.accountDetail.nhfAccount',
                        '$employeeInformation.nhf',
                        '$employeeInformation.nhfAccount',
                    ],
                },
                payeAccount: {
                    $ifNull: [
                        '$employeeInformation.accountDetail.payeAccount',
                        '$employeeInformation.accountDetail.taxProfileId',
                        '$employeeInformation.payeAccount',
                        '$employeeInformation.taxProfileId',
                    ],
                },
                pensionAccount: {
                    $ifNull: [
                        '$employeeInformation.accountDetail.pensionAccount',
                        '$employeeInformation.accountDetail.rsaNumber',
                        '$employeeInformation.pensionAccount',
                        '$employeeInformation.rsaNumber',
                    ],
                },
                pensionProvider: {
                    $ifNull: [
                        '$employeeInformation.accountDetail.pensionProvider',
                        '$employeeInformation.accountDetail.pfa',
                        '$employeeInformation.pensionProvider',
                        '$employeeInformation.pfa',
                    ],
                },
            },
        }, {
            $project: {
                _id: 0,
                firstName: 1,
                lastName: 1,
                middleName: 1,
                branch: 1,
                role: 1,
                department: 1,
                businessUnit: 1,
                entity: 1,
                level: 1,
                startDate: 1,
                exitDate: 1,
                addosserAccount: 1,
                atlasAccount: 1,
                aftaAccount: 1,
                staffId: 1,
                email: 1,
                status: 1,
                orbitID: 1,
                supervisor: 1,
                supervisor2: 1,
                __rest: { $mergeObjects: '$$ROOT' },
            },
        }, {
            $replaceRoot: {
                newRoot: {
                    $mergeObjects: [
                        {
                            firstName: '$firstName',
                            lastName: '$lastName',
                            middleName: '$middleName',
                            branch: '$branch',
                            role: '$role',
                            department: '$department',
                            businessUnit: '$businessUnit',
                            entity: '$entity',
                            level: '$level',
                            startDate: '$startDate',
                            exitDate: '$exitDate',
                            addosserAccount: '$addosserAccount',
                            atlasAccount: '$atlasAccount',
                            aftaAccount: '$aftaAccount',
                            staffId: '$staffId',
                            email: '$email',
                            status: '$status',
                            orbitID: '$orbitID',
                            supervisor: '$supervisor',
                            supervisor2: '$supervisor2',
                        },
                        '$__rest',
                    ],
                },
            },
        });
        return this.staffModel.aggregate(pipeline);
    }
    async getRecentlyJoined(subsidiaryId, startDate, endDate, supervisorScope) {
        try {
            const matchConditions = [{ status: 'Active' }];
            const normalizedSubsidiary = this.normalizeObjectId(subsidiaryId);
            if (normalizedSubsidiary) {
                matchConditions.push({ entity: normalizedSubsidiary });
            }
            const supervisorIds = this.normalizeSupervisorScope(supervisorScope);
            if (supervisorIds.length) {
                matchConditions.push({
                    $or: [
                        { supervisorId: { $in: supervisorIds } },
                        { supervisor2Id: { $in: supervisorIds } },
                    ],
                });
            }
            const now = new Date();
            const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
            const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0);
            matchConditions.push({ startDate: { $gte: start, $lte: end } });
            const query = matchConditions.length === 1
                ? matchConditions[0]
                : { $and: matchConditions };
            return this.staffModel
                .find(query)
                .select(STAFF_LIST_PROJECTION)
                .populate([
                { path: 'department', select: 'name entity', options: { lean: true } },
                ...STAFF_SUPERVISOR_LITE_POPULATE,
            ])
                .sort({ startDate: -1 })
                .lean();
        }
        catch (e) {
            throw new Error(`getRecentlyJoined failed: ${e.message}`);
        }
    }
    async getRecentlyExit(subsidiaryId, startDate, endDate, supervisorScope) {
        try {
            const matchConditions = [];
            const normalizedSubsidiary = this.normalizeObjectId(subsidiaryId);
            if (normalizedSubsidiary) {
                matchConditions.push({ entity: normalizedSubsidiary });
            }
            const supervisorIds = this.normalizeSupervisorScope(supervisorScope);
            if (supervisorIds.length) {
                matchConditions.push({
                    $or: [
                        { supervisorId: { $in: supervisorIds } },
                        { supervisor2Id: { $in: supervisorIds } },
                    ],
                });
            }
            const now = new Date();
            const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
            const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0);
            matchConditions.push({ exitDate: { $gte: start, $lte: end } });
            const query = matchConditions.length === 1
                ? matchConditions[0]
                : { $and: matchConditions };
            return this.staffModel
                .find(query)
                .select(STAFF_LIST_PROJECTION)
                .populate([
                { path: 'department', select: 'name entity', options: { lean: true } },
                ...STAFF_SUPERVISOR_LITE_POPULATE,
            ])
                .sort({ exitDate: -1 })
                .lean();
        }
        catch (e) {
            throw new Error(`getRecentlyExit failed: ${e.message}`);
        }
    }
    async getStaffTurnover(subsidiaryId, startDate, endDate) {
        try {
            const query = {};
            const normalizedSubsidiary = this.normalizeObjectId(subsidiaryId);
            if (normalizedSubsidiary) {
                query.entity = normalizedSubsidiary;
            }
            const now = new Date();
            const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
            const end = endDate ? new Date(endDate) : now;
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            const activeAt = (asOf) => ({
                ...query,
                $and: [
                    {
                        $or: [
                            { startDate: { $lte: asOf } },
                            { startDate: null },
                            { startDate: '' },
                            { startDate: { $exists: false } },
                        ],
                    },
                    {
                        $or: [
                            { exitDate: null },
                            { exitDate: '' },
                            { exitDate: { $exists: false } },
                            { exitDate: { $gt: asOf } },
                        ],
                    },
                ],
            });
            const exitedCount = await this.staffModel.countDocuments({
                ...query,
                exitDate: { $gte: start, $lte: end },
            });
            const startCount = await this.staffModel.countDocuments(activeAt(start));
            const endCount = await this.staffModel.countDocuments(activeAt(end));
            const avgCount = (startCount + endCount) / 2;
            const turnoverRate = avgCount > 0 ? (exitedCount / avgCount) * 100 : 0;
            return {
                period: `${(0, calendar_date_util_1.formatCalendarDate)(start)} to ${(0, calendar_date_util_1.formatCalendarDate)(end)}`,
                exitedCount,
                startCount,
                endCount,
                avgCount,
                turnoverRate: `${Number(turnoverRate.toFixed(2))}%`,
            };
        }
        catch (e) {
            throw new Error(`getStaffTurnover failed: ${e.message}`);
        }
    }
    async getPaginatedStaff(quer, user) {
        try {
            const { page = 1, limit = 12, searchText, subsidiaryId, department, branch, confirmed, status, supervisorScope, } = quer;
            const pageNumber = Math.max(Number(page) || 1, 1);
            const pageSize = Math.max(Number(limit) || 0, 1);
            const skip = (pageNumber - 1) * pageSize;
            const normalizedStatus = String(status ?? '').trim();
            const query = {};
            if (normalizedStatus && normalizedStatus.toLowerCase() !== 'all') {
                query.status = normalizedStatus;
            }
            else if (!normalizedStatus) {
                query.status = 'Active';
            }
            const requestedEntityId = this.normalizeObjectId(subsidiaryId);
            const enforcedEntityId = this.resolveEntityConstraint(user, requestedEntityId);
            if (requestedEntityId) {
                query.entity = { $in: [requestedEntityId] };
            }
            if (!requestedEntityId && enforcedEntityId) {
                query.entity = enforcedEntityId;
            }
            if (department && department !== 'all') {
                query.department = { $in: [department, (0, index_utils_1.toObjectId)(department)] };
            }
            if (branch && branch !== 'all') {
                query.branch = { $in: [branch, (0, index_utils_1.toObjectId)(branch)] };
            }
            if (confirmed && confirmed !== 'all') {
                query.confirmed = confirmed;
            }
            if (searchText?.trim()) {
                const regex = new RegExp(searchText.trim(), 'i');
                query.$or = [
                    { firstName: regex },
                    { lastName: regex },
                    { middleName: regex },
                    { email: regex },
                    { staffId: regex },
                ];
            }
            const supervisorIds = this.normalizeSupervisorScope(supervisorScope);
            if (supervisorIds.length) {
                const supervisorFilter = {
                    $or: [
                        { supervisorId: { $in: supervisorIds } },
                        { supervisor2Id: { $in: supervisorIds } },
                    ],
                };
                query.$and = [...(query.$and ?? []), supervisorFilter];
            }
            if (query.entity &&
                typeof query.entity === 'object' &&
                '$in' in query.entity) {
                const cleanedValues = query.entity.$in
                    .map((value) => this.normalizeObjectId(value))
                    .filter((value) => Boolean(value));
                if (cleanedValues.length) {
                    query.entity.$in = cleanedValues;
                }
                else {
                    delete query.entity;
                }
            }
            if (typeof query.entity === 'string') {
                const normalisedEntity = query.entity.trim().toLowerCase();
                if (!normalisedEntity ||
                    normalisedEntity === 'undefined' ||
                    normalisedEntity === 'null' ||
                    normalisedEntity === 'all') {
                    delete query.entity;
                }
            }
            const [totalItems, data] = await Promise.all([
                this.staffModel.countDocuments(query),
                this.staffModel
                    .find(query)
                    .select(STAFF_LIST_PROJECTION)
                    .populate(STAFF_LIST_POPULATE)
                    .sort({ firstName: 1, lastName: 1 })
                    .collation({ locale: 'en', strength: 2 })
                    .skip(skip)
                    .limit(pageSize)
                    .lean(),
            ]);
            return {
                currentPage: pageNumber,
                totalPages: Math.ceil(totalItems / pageSize),
                totalItems,
                data,
            };
        }
        catch (e) {
            throw new Error(`getPaginatedStaff failed: ${e.message}`);
        }
    }
    async deactivateExitedStaff() {
        const now = new Date();
        return this.staffModel.updateMany({
            exitDate: {
                $gte: new Date('2020-01-01'),
                $lte: now,
            },
            status: 'Inactive',
        }, {
            $set: { status: 'Inactive' },
        });
    }
    async getStaffByLevel(payGrade, subsidiaryId) {
        try {
            const query = { level: payGrade, status: 'Active' };
            const normalizedSubsidiary = this.normalizeObjectId(subsidiaryId);
            if (normalizedSubsidiary) {
                query.entity = normalizedSubsidiary;
            }
            else if (subsidiaryId) {
                return [];
            }
            return this.staffModel
                .find(query)
                .select(STAFF_LIST_PROJECTION)
                .lean();
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async getStaffByBranch(branch) {
        try {
            return this.staffModel
                .find({ branch, status: 'Active' })
                .select(STAFF_SAFE_PROJECTION)
                .lean();
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async getBirthdaysToday() {
        const today = moment().tz('Africa/Lagos').format('MM-DD');
        return this.staffModel.aggregate([
            {
                $match: {
                    status: { $regex: '^active$', $options: 'i' },
                    dateOfBirth: {
                        $exists: true,
                        $type: 'date',
                        $lte: STAFF_MILESTONE_DATE_UPPER_BOUND,
                    },
                },
            },
            {
                $addFields: {
                    lagosBirthday: {
                        $dateToString: {
                            date: '$dateOfBirth',
                            format: '%m-%d',
                            timezone: 'Africa/Lagos',
                        },
                    },
                },
            },
            { $match: { lagosBirthday: today } },
            ...STAFF_MILESTONE_LOOKUPS,
            { $project: buildStaffMilestoneProjection('dateOfBirth') },
        ]);
    }
    async getBirthdaysThisMonth() {
        const currentMonth = moment().tz('Africa/Lagos').format('MM');
        return this.staffModel.aggregate([
            {
                $match: {
                    status: { $regex: '^active$', $options: 'i' },
                    dateOfBirth: {
                        $exists: true,
                        $type: 'date',
                        $lte: STAFF_MILESTONE_DATE_UPPER_BOUND,
                    },
                },
            },
            {
                $addFields: {
                    lagosBirthMonth: {
                        $dateToString: {
                            date: '$dateOfBirth',
                            format: '%m',
                            timezone: 'Africa/Lagos',
                        },
                    },
                },
            },
            { $match: { lagosBirthMonth: currentMonth } },
            ...STAFF_MILESTONE_LOOKUPS,
            { $project: buildStaffMilestoneProjection('dateOfBirth') },
        ]);
    }
    async getWorkAnniversaryToday() {
        const today = moment().tz('Africa/Lagos').format('MM-DD');
        return this.staffModel.aggregate([
            {
                $match: {
                    startDate: {
                        $exists: true,
                        $type: 'date',
                        $lte: STAFF_MILESTONE_DATE_UPPER_BOUND,
                    },
                },
            },
            {
                $addFields: {
                    lagosStartDay: {
                        $dateToString: {
                            date: '$startDate',
                            format: '%m-%d',
                            timezone: 'Africa/Lagos',
                        },
                    },
                },
            },
            { $match: { lagosStartDay: today } },
            ...STAFF_MILESTONE_LOOKUPS,
            { $project: buildStaffMilestoneProjection('startDate') },
        ]);
    }
    async getWorkAnniversaryThisMonth() {
        const currentMonth = moment().tz('Africa/Lagos').format('MM');
        return this.staffModel.aggregate([
            {
                $match: {
                    startDate: {
                        $exists: true,
                        $type: 'date',
                        $lte: STAFF_MILESTONE_DATE_UPPER_BOUND,
                    },
                },
            },
            {
                $addFields: {
                    lagosStartMonth: {
                        $dateToString: {
                            date: '$startDate',
                            format: '%m',
                            timezone: 'Africa/Lagos',
                        },
                    },
                },
            },
            { $match: { lagosStartMonth: currentMonth } },
            ...STAFF_MILESTONE_LOOKUPS,
            { $project: buildStaffMilestoneProjection('startDate') },
        ]);
    }
    async findActiveStaffByRoleKeywords(keywords, entity) {
        const lowered = keywords.map((name) => name.toLowerCase());
        const query = { status: 'Active' };
        if (entity) {
            query.$or = [{ entity }, { entity: (0, index_utils_1.toObjectId)(entity) }];
        }
        const staff = await this.staffModel
            .find(query)
            .select(STAFF_SAFE_PROJECTION)
            .populate(STAFF_SUMMARY_POPULATE)
            .lean();
        return staff.filter((member) => {
            const roleName = member?.role?.name;
            return roleName && lowered.some((target) => roleName.toLowerCase().includes(target));
        });
    }
    async getById(id) {
        try {
            const rawId = this.extractObjectIdCandidate(id);
            const trimmed = rawId?.toString?.().trim?.() ?? '';
            const lowered = trimmed.toLowerCase();
            const isMeaningful = trimmed.length > 0 &&
                lowered !== 'undefined' &&
                lowered !== 'null' &&
                lowered !== 'all' &&
                lowered !== 'nan';
            const orConditions = [];
            if (isMeaningful) {
                if (mongoose_2.default.Types.ObjectId.isValid(trimmed)) {
                    orConditions.push({ _id: new mongoose_2.default.Types.ObjectId(trimmed) });
                }
                orConditions.push({ staffId: trimmed });
                orConditions.push({ email: trimmed });
                orConditions.push({ userId: trimmed });
            }
            if (!orConditions.length) {
                throw new Error('Invalid ID');
            }
            return this.staffModel
                .findOne({ $or: orConditions })
                .select(STAFF_SAFE_PROJECTION)
                .populate([
                ...STAFF_SUMMARY_POPULATE,
                ...STAFF_SUPERVISOR_POPULATE,
            ])
                .lean();
        }
        catch (e) {
            throw new Error(`Invalid ID or query failed: ${e.message}`);
        }
    }
    async getAttendanceIdentity(id) {
        const rawId = this.extractObjectIdCandidate(id);
        const trimmed = rawId?.toString?.().trim?.() ?? '';
        if (!trimmed)
            return null;
        const projection = 'firstName lastName middleName staffId';
        if (mongoose_2.default.Types.ObjectId.isValid(trimmed)) {
            return this.staffModel.findById(trimmed).select(projection).lean();
        }
        return this.staffModel
            .findOne({
            $or: [{ staffId: trimmed }, { email: trimmed }, { userId: trimmed }],
        })
            .select(projection)
            .lean();
    }
    async findFirstActiveByRoleNames(roleNames, entity) {
        try {
            const lowered = roleNames.map((name) => name.toLowerCase());
            const query = { status: 'Active' };
            if (entity) {
                query.$or = [{ entity }, { entity: (0, index_utils_1.toObjectId)(entity) }];
            }
            const staff = await this.staffModel
                .find(query)
                .select(STAFF_SAFE_PROJECTION)
                .populate([
                ...STAFF_SUMMARY_POPULATE,
                ...STAFF_SUPERVISOR_POPULATE,
            ])
                .lean();
            const candidate = staff.find((member) => {
                const roleName = member?.role?.name;
                return roleName && lowered.some((target) => roleName.toLowerCase().includes(target));
            });
            if (!candidate) {
                return null;
            }
            return this.getById(candidate._id);
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async findFirstActiveByProfileKey(profileKey, entity) {
        try {
            const target = profileKey?.trim().toLowerCase();
            if (!target)
                return null;
            const query = { status: 'Active' };
            if (entity) {
                query.$or = [{ entity }, { entity: (0, index_utils_1.toObjectId)(entity) }];
            }
            const staff = await this.staffModel
                .find(query)
                .select(STAFF_SAFE_PROJECTION)
                .populate([...STAFF_SUMMARY_POPULATE, ...STAFF_SUPERVISOR_POPULATE])
                .lean();
            const candidate = staff.find((member) => {
                const key = String(member?.role?.profileKey ?? '').trim().toLowerCase();
                return key === target;
            });
            if (!candidate)
                return null;
            return this.getById(candidate._id);
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async findFirstActiveByPermission(permissionName, entity) {
        try {
            const target = permissionName?.trim().toLowerCase();
            if (!target) {
                return null;
            }
            const query = { status: 'Active' };
            if (entity) {
                query.$or = [{ entity }, { entity: (0, index_utils_1.toObjectId)(entity) }];
            }
            const population = [
                ...STAFF_SUMMARY_POPULATE,
                ...STAFF_SUPERVISOR_POPULATE,
                {
                    path: 'role',
                    skipInvalidIds: true,
                    populate: { path: 'permissions', options: { lean: true }, skipInvalidIds: true },
                },
            ];
            const staff = await this.staffModel
                .find(query)
                .select(STAFF_SAFE_PROJECTION)
                .populate(population)
                .lean();
            const candidate = staff.find((member) => {
                const permissions = this.extractPermissionNames(member);
                return permissions.some((perm) => perm === target);
            });
            if (!candidate) {
                return null;
            }
            return this.getById(candidate._id);
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async getStaffById(staffId) {
        try {
            const conditions = [
                { staffId: String(staffId) },
            ];
            if (mongoose_2.default.Types.ObjectId.isValid(staffId)) {
                conditions.push({ staffId: new mongoose_2.default.Types.ObjectId(staffId) });
            }
            return this.staffModel
                .findOne({ $or: conditions })
                .select(STAFF_SAFE_PROJECTION)
                .lean();
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async resolveStaffDirectory(staffIds, entity, options) {
        const list = Array.isArray(staffIds) ? staffIds : staffIds ? [staffIds] : [];
        const normalized = list
            .map((value) => String(value ?? '').trim())
            .filter((value) => value.length > 0);
        const unique = Array.from(new Set(normalized));
        if (!unique.length) {
            return { data: [], missing: [] };
        }
        const candidateIds = new Set();
        unique.forEach((value) => {
            candidateIds.add(value);
            candidateIds.add(value.toLowerCase());
            candidateIds.add(value.toUpperCase());
        });
        const objectIds = unique
            .filter((value) => mongoose_2.default.Types.ObjectId.isValid(value))
            .map((value) => new mongoose_2.default.Types.ObjectId(value));
        const query = {
            $or: [
                { staffId: { $in: Array.from(candidateIds) } },
                { email: { $in: Array.from(candidateIds) } },
                { userId: { $in: Array.from(candidateIds) } },
                { orbitID: { $in: Array.from(candidateIds) } },
                ...(objectIds.length ? [{ _id: { $in: objectIds } }] : []),
            ],
        };
        const normalizedEntity = this.normalizeObjectId(entity);
        if (normalizedEntity) {
            query.entity = normalizedEntity;
        }
        const selectFields = [
            'staffId',
            'firstName',
            'middleName',
            'lastName',
            'email',
            'userId',
            'orbitID',
            ...(options?.includeAccounts ? ['addosserAccount', 'atlasAccount', 'aftaAccount'] : []),
        ]
            .filter(Boolean)
            .join(' ');
        const staff = await this.staffModel.find(query).select(selectFields).lean();
        const data = (staff ?? []).map((member) => {
            const firstName = typeof member?.firstName === 'string' ? member.firstName.trim() : '';
            const middleName = typeof member?.middleName === 'string' ? member.middleName.trim() : '';
            const lastName = typeof member?.lastName === 'string' ? member.lastName.trim() : '';
            const name = [firstName, middleName, lastName].filter(Boolean).join(' ').trim();
            const orbitID = typeof member?.orbitID === 'string' ? member.orbitID.trim() : '';
            const addosserAccount = typeof member?.addosserAccount === 'string' ? member.addosserAccount.trim() : '';
            const atlasAccount = typeof member?.atlasAccount === 'string' ? member.atlasAccount.trim() : '';
            const aftaAccount = typeof member?.aftaAccount === 'string' ? member.aftaAccount.trim() : '';
            return {
                staffId: String(member?.staffId ?? '').trim(),
                userId: String(member?.userId ?? '').trim(),
                email: String(member?.email ?? '').trim(),
                name: name || String(member?.staffId ?? '').trim(),
                staffObjectId: member?._id ? String(member._id) : undefined,
                orbitID: orbitID || undefined,
                ...(options?.includeAccounts
                    ? {
                        addosserAccount: addosserAccount || undefined,
                        atlasAccount: atlasAccount || undefined,
                        aftaAccount: aftaAccount || undefined,
                    }
                    : {}),
            };
        });
        const foundKeys = new Set();
        (staff ?? []).forEach((member) => {
            if (member?.staffId) {
                const key = String(member.staffId).trim().toLowerCase();
                if (key)
                    foundKeys.add(key);
            }
            if (member?._id) {
                const key = String(member._id).trim().toLowerCase();
                if (key)
                    foundKeys.add(key);
            }
            if (member?.email) {
                const key = String(member.email).trim().toLowerCase();
                if (key)
                    foundKeys.add(key);
            }
            if (member?.userId) {
                const key = String(member.userId).trim().toLowerCase();
                if (key)
                    foundKeys.add(key);
            }
            if (member?.orbitID) {
                const key = String(member.orbitID).trim().toLowerCase();
                if (key)
                    foundKeys.add(key);
            }
        });
        const missing = unique.filter((value) => !foundKeys.has(value.trim().toLowerCase()));
        return { data, missing };
    }
};
exports.UserDirectoryService = UserDirectoryService;
exports.UserDirectoryService = UserDirectoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UserDirectoryService);
//# sourceMappingURL=user-directory.service.js.map