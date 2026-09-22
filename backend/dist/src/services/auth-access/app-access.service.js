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
exports.AppAccessService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const app_catalog_schema_1 = require("../../schemas/app-catalog.schema");
const user_schema_1 = require("../../schemas/user.schema");
const subsidiary_schema_1 = require("../../schemas/subsidiary.schema");
let AppAccessService = class AppAccessService {
    constructor(appModel, userModel, subsidiaryModel) {
        this.appModel = appModel;
        this.userModel = userModel;
        this.subsidiaryModel = subsidiaryModel;
    }
    async listCatalog(entity) {
        const entityId = await this.resolveEntityId(entity);
        if (!entityId) {
            throw new common_1.BadRequestException('entity is required to list catalog.');
        }
        const apps = await this.appModel.find({ entity: entityId }).sort({ name: 1 }).lean();
        return apps.map((app) => app.name);
    }
    async addToCatalog(name, entity) {
        const normalized = name?.trim();
        if (!normalized) {
            throw new common_1.BadRequestException('App name is required.');
        }
        const entityId = await this.resolveEntityId(entity);
        if (!entityId) {
            throw new common_1.BadRequestException('entity is required.');
        }
        const existing = await this.appModel.findOne({
            name: { $regex: new RegExp(`^${this.escapeRegex(normalized)}$`, 'i') },
            entity: entityId,
        });
        if (existing) {
            return existing;
        }
        return this.appModel.create({ name: normalized, entity: entityId });
    }
    async listEnrollments(search, entity, page, limit) {
        const entityId = await this.resolveEntityId(entity).catch(() => null);
        const query = {};
        if (search?.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [
                { firstName: regex },
                { lastName: regex },
                { email: regex },
                { staffId: regex },
            ];
        }
        if (entityId) {
            query.entity = entityId;
        }
        const pageNumber = Math.max(Number(page) || 1, 1);
        const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 200);
        const skip = (pageNumber - 1) * pageSize;
        const [users, total] = await Promise.all([
            this.userModel
                .find(query)
                .select('firstName lastName email staffId department assignedApps')
                .populate({ path: 'department', select: 'name' })
                .sort({ firstName: 1, lastName: 1 })
                .skip(skip)
                .limit(pageSize)
                .lean(),
            this.userModel.countDocuments(query),
        ]);
        const data = users.map((user) => ({
            id: String(user._id),
            name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
            email: user.email ?? '',
            staffId: user.staffId ?? '',
            department: typeof user?.department === 'string'
                ? user.department
                : user?.department?.name ?? '',
            apps: Array.isArray(user.assignedApps) ? user.assignedApps : [],
        }));
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        return {
            data,
            total,
            totalPages,
            page: pageNumber,
        };
    }
    async updateEnrollment(userId, apps) {
        if (!userId)
            throw new common_1.BadRequestException('userId is required.');
        if (!Array.isArray(apps))
            throw new common_1.BadRequestException('apps must be an array.');
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found.');
        }
        if (!user.entity) {
            throw new common_1.BadRequestException('User has no entity assigned.');
        }
        const cleanApps = Array.from(new Set(apps
            .map((app) => (typeof app === 'string' ? app.trim() : ''))
            .filter(Boolean)));
        if (cleanApps.length) {
            const entityId = await this.resolveEntityId(String(user.entity));
            if (!entityId) {
                throw new common_1.BadRequestException('Unable to resolve user entity for validation.');
            }
            for (const appName of cleanApps) {
                const exists = await this.appExistsInEntity(appName, entityId);
                if (!exists) {
                    throw new common_1.BadRequestException(`App "${appName}" does not exist for this entity.`);
                }
            }
        }
        user.assignedApps = cleanApps;
        await user.save();
        return {
            id: String(user._id),
            apps: user.assignedApps,
        };
    }
    escapeRegex(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    async resolveEntityId(input) {
        if (!input)
            return null;
        const trimmed = String(input).trim();
        if (!trimmed)
            return null;
        if (mongoose_2.Types.ObjectId.isValid(trimmed)) {
            return new mongoose_2.Types.ObjectId(trimmed);
        }
        const found = await this.subsidiaryModel.findOne({ short: trimmed }).select('_id').lean();
        if (found?._id) {
            return new mongoose_2.Types.ObjectId(String(found._id));
        }
        return null;
    }
    async appExistsInEntity(name, entityId) {
        const normalized = name?.trim();
        if (!normalized)
            return false;
        const existing = await this.appModel
            .findOne({
            entity: entityId,
            name: { $regex: new RegExp(`^${this.escapeRegex(normalized)}$`, 'i') },
        })
            .lean();
        return Boolean(existing);
    }
};
exports.AppAccessService = AppAccessService;
exports.AppAccessService = AppAccessService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(app_catalog_schema_1.AppCatalog.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(subsidiary_schema_1.Subsidiary.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AppAccessService);
//# sourceMappingURL=app-access.service.js.map