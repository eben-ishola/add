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
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const defaults_1 = require("./defaults");
const app_constants_1 = require("../constants/app.constants");
const permission_schema_1 = require("../schemas/permission.schema");
const role_schema_1 = require("../schemas/role.schema");
const tax_config_schema_1 = require("../schemas/tax-config.schema");
const user_schema_1 = require("../schemas/user.schema");
let SeedService = SeedService_1 = class SeedService {
    constructor(permissionModel, roleModel, userModel, taxConfigModel) {
        this.permissionModel = permissionModel;
        this.roleModel = roleModel;
        this.userModel = userModel;
        this.taxConfigModel = taxConfigModel;
        this.logger = new common_1.Logger(SeedService_1.name);
    }
    async onModuleInit() {
        const permissionMap = await this.seedPermissions();
        await this.seedRoles(permissionMap, [...defaults_1.DEFAULT_ROLES, ...defaults_1.DEFAULT_SECONDARY_ROLES]);
        await this.seedAdditionalRoleAssignments();
        await this.seedTaxConfig();
    }
    async seedPermissions() {
        const existing = await this.permissionModel
            .find({
            name: { $in: defaults_1.DEFAULT_PERMISSIONS.map((permission) => permission.name) },
        })
            .lean();
        const existingNames = new Set(existing.map((doc) => doc.name));
        const toCreate = defaults_1.DEFAULT_PERMISSIONS.filter((permission) => !existingNames.has(permission.name));
        if (toCreate.length) {
            await this.permissionModel.insertMany(toCreate, { ordered: false }).catch((error) => {
                this.logger.warn(`Permission seeding warning: ${error.message}`);
            });
            this.logger.log(`Seeded ${toCreate.length} permission(s).`);
        }
        const permissions = await this.permissionModel
            .find({
            name: { $in: defaults_1.DEFAULT_PERMISSIONS.map((permission) => permission.name) },
        })
            .lean();
        const map = new Map();
        permissions.forEach((permission) => {
            map.set(permission.name, permission._id);
        });
        return map;
    }
    async seedRoles(permissionIdMap, roleSeeds = defaults_1.DEFAULT_ROLES) {
        const employeeFeaturePermission = permissionIdMap.get('employee feature');
        for (const roleSeed of roleSeeds) {
            const app = roleSeed.app ?? app_constants_1.DEFAULT_APP_NAME;
            const permissionIds = roleSeed.permissions
                .map((name) => permissionIdMap.get(name))
                .filter((id) => Boolean(id));
            if (employeeFeaturePermission) {
                permissionIds.push(employeeFeaturePermission);
            }
            const uniquePermissionIds = Array.from(new Set(permissionIds.map((id) => id.toHexString()))).map((id) => new mongoose_2.Types.ObjectId(id));
            if (!uniquePermissionIds.length) {
                continue;
            }
            const { scopes, profileKey } = this.resolveRoleMetadata(roleSeed);
            const setPayload = {
                app,
                scopes,
                profileKey,
            };
            if (roleSeed.description) {
                setPayload.description = roleSeed.description;
            }
            const update = {
                $set: setPayload,
                $addToSet: {
                    permissions: { $each: uniquePermissionIds },
                },
            };
            await this.roleModel
                .findOneAndUpdate({ name: roleSeed.name, app }, update, { new: true, upsert: true, setDefaultsOnInsert: true })
                .exec();
        }
        this.logger.log(`Ensured ${roleSeeds.length} role(s) are seeded.`);
    }
    async seedRolesForApps(apps) {
        const normalized = apps
            .map((app) => (typeof app === 'string' ? app.trim().toLowerCase() : ''))
            .filter((app) => Boolean(app));
        if (!normalized.length) {
            this.logger.warn('seedRolesForApps called without valid app names.');
            return;
        }
        const roleSeeds = defaults_1.DEFAULT_SECONDARY_ROLES.filter((role) => {
            if (!role.app)
                return false;
            const appName = role.app.trim().toLowerCase();
            return normalized.includes(appName);
        });
        if (!roleSeeds.length) {
            this.logger.warn(`No secondary roles found for apps: ${apps.join(', ')}`);
            return;
        }
        const permissionMap = await this.seedPermissions();
        await this.seedRoles(permissionMap, roleSeeds);
        this.logger.log(`Seeded ${roleSeeds.length} role(s) for apps: ${apps.join(', ')}`);
    }
    async seedAdditionalRoleAssignments(assignments = defaults_1.DEFAULT_ADDITIONAL_ROLE_ASSIGNMENTS) {
        if (!assignments.length) {
            return;
        }
        for (const assignment of assignments) {
            const staffId = assignment.staffId?.trim();
            const roleName = assignment.roleName?.trim();
            if (!staffId || !roleName) {
                continue;
            }
            const user = await this.userModel
                .findOne({ staffId: this.buildExactMatchRegex(staffId) })
                .select('_id staffId additionalRoles')
                .lean();
            if (!user) {
                this.logger.warn(`Staff '${staffId}' not found while assigning additional role '${roleName}'.`);
                continue;
            }
            const normalizedApp = this.normalizeAppName(assignment.app);
            const roleQuery = {
                name: this.buildExactMatchRegex(roleName),
            };
            if (assignment.app?.trim()) {
                roleQuery.app = normalizedApp;
            }
            else {
                roleQuery.$or = [
                    { app: normalizedApp },
                    { app: { $exists: false } },
                    { app: null },
                ];
            }
            const role = await this.roleModel
                .findOne(roleQuery)
                .select('_id name app')
                .lean();
            if (!role) {
                this.logger.warn(`Role '${roleName}' (app: ${normalizedApp}) not found for staff '${staffId}'.`);
                continue;
            }
            const roleId = this.normalizeObjectIdValue(role._id);
            if (!roleId) {
                this.logger.warn(`Unable to resolve role id for '${roleName}' while assigning to staff '${staffId}'.`);
                continue;
            }
            const { assignments: normalizedAssignmentsRaw, mutated: assignmentsMutated } = this.normalizeAdditionalRoleAssignments(user.additionalRoles);
            const { assignments: validatedAssignments, mutated: removedInvalid } = await this.removeAssignmentsWithMissingRoles(normalizedAssignmentsRaw);
            const normalizedAssignments = validatedAssignments.map((assignment) => ({
                role: assignment.role,
                entity: assignment.entity,
            }));
            const normalizedAssignmentsForUser = normalizedAssignments;
            const needsUpdate = assignmentsMutated || removedInvalid;
            const hasExistingAdditionalRoles = (Array.isArray(user.additionalRoles) && user.additionalRoles.length > 0) ||
                (!Array.isArray(user.additionalRoles) && Boolean(user.additionalRoles));
            const wouldClearAdditionalRoles = needsUpdate && !normalizedAssignments.length && hasExistingAdditionalRoles;
            if (needsUpdate && !wouldClearAdditionalRoles) {
                await this.userModel
                    .updateOne({ _id: user._id }, {
                    $set: {
                        additionalRoles: normalizedAssignments,
                    },
                })
                    .exec();
                user.additionalRoles = normalizedAssignmentsForUser;
                this.logger.log(normalizedAssignments.length
                    ? `Normalized additional roles for staff '${user.staffId}'.`
                    : `Cleared invalid additional roles for staff '${user.staffId}'.`);
            }
            else if (!needsUpdate) {
                user.additionalRoles = normalizedAssignmentsForUser;
            }
            else {
                this.logger.warn(`Skipped normalizing additional roles for staff '${user.staffId}' because it would remove existing assignments.`);
            }
            const additionalAssignments = this.normalizeAdditionalRoleAssignments(Array.isArray(user.additionalRoles) && user.additionalRoles.length ? user.additionalRoles : normalizedAssignments).assignments;
            const alreadyAssigned = additionalAssignments.some((entry) => {
                const existingRoleId = this.normalizeObjectIdValue(entry?.role);
                return existingRoleId?.equals(roleId);
            });
            if (alreadyAssigned) {
                continue;
            }
            const entityId = this.normalizeObjectIdValue(assignment.entityId) ?? null;
            await this.userModel
                .updateOne({ _id: user._id }, {
                $addToSet: {
                    additionalRoles: {
                        role: roleId,
                        entity: entityId,
                    },
                },
            })
                .exec();
            this.logger.log(`Assigned '${role.name}' as additional role to staff '${user.staffId}'.`);
        }
    }
    resolveRoleMetadata(roleSeed) {
        const normalizedName = roleSeed.name?.trim().toLowerCase();
        const normalizedScopes = (Array.isArray(roleSeed.scopes) && roleSeed.scopes.length
            ? roleSeed.scopes
            : normalizedName && defaults_1.ROLE_SCOPE_PRESETS[normalizedName]) ?? ['self'];
        const normalizedProfileKey = roleSeed.profileKey ??
            (normalizedName ? defaults_1.ROLE_PROFILE_PRESETS[normalizedName] : undefined) ??
            'profile';
        return { scopes: normalizedScopes, profileKey: normalizedProfileKey };
    }
    normalizeAppName(app) {
        if (typeof app === 'string') {
            const trimmed = app.trim();
            if (trimmed.length) {
                return trimmed;
            }
        }
        return app_constants_1.DEFAULT_APP_NAME;
    }
    buildExactMatchRegex(value) {
        return new RegExp(`^${this.escapeRegex(value)}$`, 'i');
    }
    escapeRegex(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    normalizeObjectIdValue(value) {
        if (value == null) {
            return null;
        }
        const raw = value?._id ?? value;
        const candidate = typeof raw === 'string'
            ? raw
            : typeof raw?.toString === 'function'
                ? raw.toString()
                : undefined;
        if (!candidate) {
            return null;
        }
        const trimmed = candidate.trim();
        if (!trimmed || !mongoose_2.Types.ObjectId.isValid(trimmed)) {
            return null;
        }
        return new mongoose_2.Types.ObjectId(trimmed);
    }
    normalizeAdditionalRoleAssignments(input) {
        const list = Array.isArray(input) ? input : input ? [input] : [];
        let mutated = !Array.isArray(input);
        const normalized = [];
        list.forEach((entry) => {
            if (!entry) {
                mutated = true;
                return;
            }
            const roleCandidate = typeof entry === 'object'
                ? entry?.role ?? entry?.roleId ?? entry?._id ?? entry?.id ?? entry
                : entry;
            const normalizedRoleId = this.normalizeObjectIdValue(roleCandidate);
            if (!normalizedRoleId) {
                mutated = true;
                return;
            }
            const entityCandidate = typeof entry === 'object'
                ? entry?.entity ?? entry?.entityId ?? entry?.subsidiary ?? entry?.tenant ?? null
                : null;
            const normalizedEntityId = this.normalizeObjectIdValue(entityCandidate) ?? null;
            const matchesExpectedShape = typeof entry === 'object' &&
                this.normalizeObjectIdValue(entry?.role)?.equals(normalizedRoleId) &&
                ((normalizedEntityId == null && (entry?.entity == null || entry?.entity === '')) ||
                    (normalizedEntityId != null &&
                        this.normalizeObjectIdValue(entry?.entity)?.equals(normalizedEntityId)));
            if (!matchesExpectedShape) {
                mutated = true;
            }
            normalized.push({
                role: normalizedRoleId,
                entity: normalizedEntityId,
            });
        });
        const deduped = new Map();
        normalized.forEach((assignment) => {
            const key = `${assignment.role.toHexString()}::${assignment.entity?.toHexString() ?? ''}`;
            if (!deduped.has(key)) {
                deduped.set(key, assignment);
            }
            else {
                mutated = true;
            }
        });
        return { assignments: Array.from(deduped.values()), mutated };
    }
    async removeAssignmentsWithMissingRoles(assignments) {
        if (!assignments.length) {
            return { assignments, mutated: false };
        }
        const uniqueRoleIds = Array.from(new Set(assignments.map((assignment) => assignment.role.toHexString()))).map((id) => new mongoose_2.Types.ObjectId(id));
        const roles = await this.roleModel
            .find({ _id: { $in: uniqueRoleIds } })
            .select('_id')
            .lean();
        const existingRoleIds = new Set(roles
            .map((role) => role?._id instanceof mongoose_2.Types.ObjectId ? role._id.toHexString() : role?._id?.toString?.() ?? '')
            .filter((id) => typeof id === 'string' && id.length > 0));
        const filtered = assignments.filter((assignment) => existingRoleIds.has(assignment.role.toHexString()));
        return {
            assignments: filtered,
            mutated: filtered.length !== assignments.length,
        };
    }
    async seedTaxConfig() {
        const defaultBrackets = [
            { minIncome: 0, maxIncome: 800000, rate: 0, baseTax: 0 },
            { minIncome: 800000, maxIncome: 3000000, rate: 0.15, baseTax: 0 },
            { minIncome: 3000000, maxIncome: 12000000, rate: 0.18, baseTax: 330000 },
            { minIncome: 12000000, maxIncome: 25000000, rate: 0.21, baseTax: 1950000 },
            { minIncome: 25000000, maxIncome: 50000000, rate: 0.23, baseTax: 4680000 },
            { minIncome: 50000000, maxIncome: null, rate: 0.25, baseTax: 10430000 },
        ];
        await this.taxConfigModel
            .updateOne({ entity: null }, {
            $set: {
                configName: 'Default Progressive PAYE',
                entity: null,
                isActive: true,
                currency: 'NGN',
                exemptLimit: null,
                useProgressiveTaxCalculation: true,
                brackets: defaultBrackets,
                effectiveFrom: new Date(),
            },
        }, { upsert: true })
            .exec();
        this.logger.log('Ensured default tax configuration is seeded.');
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(permission_schema_1.Permission.name)),
    __param(1, (0, mongoose_1.InjectModel)(role_schema_1.Role.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(3, (0, mongoose_1.InjectModel)(tax_config_schema_1.TaxConfig.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], SeedService);
//# sourceMappingURL=seed.service.js.map