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
var RoleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const role_schema_1 = require("../../schemas/role.schema");
const app_constants_1 = require("../../constants/app.constants");
let RoleService = RoleService_1 = class RoleService {
    constructor(roleModel) {
        this.roleModel = roleModel;
        this.logger = new common_1.Logger(RoleService_1.name);
        this.defaultApp = app_constants_1.DEFAULT_APP_NAME;
        this.defaultProfileKey = 'profile';
    }
    async onModuleInit() {
        try {
            await this.sanitizeRolePermissions();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.warn(`Role permission cleanup skipped: ${message}`);
        }
    }
    normalizeApp(app) {
        if (typeof app === 'string') {
            const trimmed = app.trim();
            if (trimmed.length) {
                return trimmed;
            }
        }
        return this.defaultApp;
    }
    buildAppCondition(app) {
        const normalized = this.normalizeApp(app);
        if (app?.trim()) {
            return { app: normalized };
        }
        return {
            $or: [
                { app: normalized },
                { app: { $exists: false } },
                { app: null },
            ],
        };
    }
    buildQuery(app, searchText) {
        const conditions = [];
        const appCondition = this.buildAppCondition(app);
        if (Object.keys(appCondition).length) {
            conditions.push(appCondition);
        }
        if (searchText) {
            const regex = new RegExp(searchText, 'i');
            conditions.push({
                $or: [
                    { name: regex },
                    { description: regex },
                ],
            });
        }
        if (conditions.length === 0) {
            return {};
        }
        if (conditions.length === 1) {
            return conditions[0];
        }
        return { $and: conditions };
    }
    normalizeProfileKey(profileKey) {
        if (typeof profileKey === 'string') {
            const normalized = profileKey.trim().toLowerCase();
            if (role_schema_1.ROLE_PROFILE_KEYS.includes(normalized)) {
                return normalized;
            }
        }
        return this.defaultProfileKey;
    }
    normalizeScopes(scopes) {
        if (!Array.isArray(scopes)) {
            return ['self'];
        }
        const normalized = scopes
            .map((scope) => {
            if (typeof scope !== 'string')
                return null;
            const candidate = scope.trim().toLowerCase();
            return role_schema_1.ROLE_ACCESS_SCOPES.includes(candidate) ? candidate : null;
        })
            .filter((scope) => Boolean(scope));
        return normalized.length ? Array.from(new Set(normalized)) : ['self'];
    }
    extractObjectIdCandidate(value) {
        if (value == null)
            return null;
        if (typeof value === 'string')
            return value;
        if (typeof value === 'number' && Number.isFinite(value))
            return String(value);
        if (value instanceof mongoose_2.Types.ObjectId) {
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
        if (mongoose_2.Types.ObjectId.isValid(trimmed)) {
            return new mongoose_2.Types.ObjectId(trimmed);
        }
        return null;
    }
    normalizePermissionIds(input) {
        if (input == null) {
            return { ids: [], mutated: false };
        }
        const list = Array.isArray(input) ? input : [input];
        let mutated = !Array.isArray(input);
        const seen = new Set();
        const ids = [];
        list.forEach((entry) => {
            const resolved = this.normalizeObjectId(entry);
            if (!resolved) {
                mutated = true;
                return;
            }
            const hex = resolved.toHexString();
            if (seen.has(hex)) {
                mutated = true;
                return;
            }
            seen.add(hex);
            ids.push(resolved);
        });
        return { ids, mutated };
    }
    async sanitizeRolePermissions() {
        const roles = await this.roleModel.find({}, { permissions: 1 }).lean();
        if (!roles.length)
            return;
        const ops = roles.flatMap((role) => {
            const { ids, mutated } = this.normalizePermissionIds(role?.permissions);
            if (!mutated)
                return [];
            return [
                {
                    updateOne: {
                        filter: { _id: role._id },
                        update: { permissions: ids },
                    },
                },
            ];
        });
        if (!ops.length)
            return;
        await this.roleModel.bulkWrite(ops, { ordered: false });
        this.logger.warn(`Sanitized invalid permission references for ${ops.length} role(s).`);
    }
    buildNonPortalQuery(entity, searchText) {
        const conditions = [
            { $or: [{ app: "nonPortal" }] },
        ];
        if (entity?.trim()) {
            const entityStr = entity.trim();
            const maybeId = mongoose_2.Types.ObjectId.isValid(entityStr) ? new mongoose_2.Types.ObjectId(entityStr) : null;
            conditions.push({
                $or: [
                    { entity: entityStr },
                    ...(maybeId ? [{ entity: maybeId }] : []),
                ],
            });
        }
        if (searchText?.trim()) {
            const regex = new RegExp(searchText.trim(), 'i');
            conditions.push({
                $or: [
                    { name: regex },
                    { description: regex },
                ],
            });
        }
        return conditions.length === 1 ? conditions[0] : { $and: conditions };
    }
    async createRole(createRoleDto) {
        try {
            const payload = {
                ...createRoleDto,
                app: this.normalizeApp(createRoleDto?.app),
                profileKey: this.normalizeProfileKey(createRoleDto?.profileKey),
                scopes: this.normalizeScopes(createRoleDto?.scopes),
            };
            if (Object.prototype.hasOwnProperty.call(payload, 'permissions')) {
                payload.permissions = this.normalizePermissionIds(payload.permissions).ids;
            }
            const createdRole = new this.roleModel(payload);
            return createdRole.save();
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async findAllRoles(page, limit, searchText, app) {
        try {
            const query = this.buildQuery(app, searchText);
            const totalItems = await this.roleModel.countDocuments(query);
            const totalPages = Math.ceil(totalItems / limit);
            const items = await this.roleModel
                .find(query)
                .sort({ name: 1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .exec();
            return {
                status: 200,
                totalPages,
                rows: items,
                totalItems,
                currentPage: page,
            };
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async findRoles(app) {
        try {
            const roles = await this.roleModel
                .find(app ? this.buildQuery(app) : {})
                .sort({ name: 1 })
                .exec();
            return { data: roles };
        }
        catch (error) {
            console.error('Error fetching Roles:', error);
            return null;
        }
    }
    async findNonPortalRoles(entity, page = 1, limit = 10, searchText) {
        try {
            const normalizedPage = Number.isFinite(page) && page > 0 ? page : 1;
            const normalizedLimit = Number.isFinite(limit) && limit > 0 ? limit : 10;
            const query = this.buildNonPortalQuery(entity, searchText);
            const totalItems = await this.roleModel.countDocuments(query);
            const totalPages = Math.ceil(totalItems / normalizedLimit);
            const items = await this.roleModel
                .find(query)
                .populate('entity')
                .sort({ name: 1 })
                .skip((normalizedPage - 1) * normalizedLimit)
                .limit(normalizedLimit)
                .exec();
            return {
                status: 200,
                totalPages,
                rows: items,
                totalItems,
                currentPage: normalizedPage,
            };
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async nonPortalRoles(entity) {
        try {
            const roles = await this.roleModel
                .find(this.buildNonPortalQuery(entity))
                .sort({ name: 1 })
                .exec();
            return { data: roles };
        }
        catch (error) {
            console.error('Error fetching Roles:', error);
            return null;
        }
    }
    async fetchPrimaryAndAdditionalRoles(app) {
        const primary = await this.roleModel
            .find(this.buildQuery(this.defaultApp))
            .sort({ name: 1 })
            .lean();
        let additional = [];
        if (app && app.trim()) {
            const normalized = this.normalizeApp(app);
            if (normalized !== this.defaultApp) {
                additional = await this.roleModel
                    .find(this.buildQuery(normalized))
                    .sort({ name: 1 })
                    .lean();
            }
        }
        return {
            primary,
            additional,
        };
    }
    async getRoleByName(name, app) {
        try {
            const baseQuery = this.buildAppCondition(app);
            const query = {
                ...baseQuery,
                name: { $regex: new RegExp(`^${name}$`, 'i') },
            };
            const role = await this.roleModel.findOne(query).exec();
            return role;
        }
        catch (error) {
            console.error('Error fetching Role:', error);
            return null;
        }
    }
    async updateRole(id, updateRoleDto) {
        try {
            const payload = {
                ...updateRoleDto,
                app: this.normalizeApp(updateRoleDto?.app),
            };
            if (Object.prototype.hasOwnProperty.call(updateRoleDto, 'profileKey')) {
                payload.profileKey = this.normalizeProfileKey(updateRoleDto.profileKey);
            }
            if (Object.prototype.hasOwnProperty.call(updateRoleDto, 'scopes')) {
                payload.scopes = this.normalizeScopes(updateRoleDto.scopes);
            }
            if (Object.prototype.hasOwnProperty.call(updateRoleDto, 'permissions')) {
                payload.permissions = this.normalizePermissionIds(updateRoleDto.permissions).ids;
            }
            const updatedRole = await this.roleModel
                .findByIdAndUpdate(id, payload, { new: true })
                .exec();
            if (!updatedRole) {
                throw new Error('Role not found');
            }
            return updatedRole;
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
};
exports.RoleService = RoleService;
exports.RoleService = RoleService = RoleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Role')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], RoleService);
//# sourceMappingURL=role.service.js.map