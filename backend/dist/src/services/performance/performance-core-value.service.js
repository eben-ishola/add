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
exports.PerformanceCoreValueService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const performance_core_value_schema_1 = require("../../schemas/performance-core-value.schema");
const performance_access_util_1 = require("../../utils/performance/performance-access.util");
let PerformanceCoreValueService = class PerformanceCoreValueService {
    constructor(coreValueModel) {
        this.coreValueModel = coreValueModel;
    }
    normalizeEntityIdStrict(value) {
        const candidate = value?._id ??
            value?.id ??
            value?.entityId ??
            value?.value ??
            (typeof value === 'string' || typeof value === 'number' ? value : undefined);
        if (!candidate) {
            throw new common_1.BadRequestException('Entity is required.');
        }
        const normalized = String(candidate).trim();
        if (!mongoose_2.Types.ObjectId.isValid(normalized)) {
            throw new common_1.BadRequestException('Entity is invalid.');
        }
        return new mongoose_2.Types.ObjectId(normalized).toHexString();
    }
    normalizeRaters(values) {
        const list = Array.isArray(values) ? values : values ? [values] : [];
        const allowed = new Set(['employee', 'line-manager', 'peer', 'subordinate']);
        const unique = new Set();
        list.forEach((value) => {
            if (!value)
                return;
            const normalized = String(value).trim().toLowerCase();
            if (normalized && allowed.has(normalized)) {
                unique.add(normalized);
            }
        });
        return Array.from(unique);
    }
    normalizeWeight(value) {
        if (value === null || value === undefined || value === '')
            return 0;
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) {
            throw new common_1.BadRequestException('Weight must be a number between 0 and 100.');
        }
        if (parsed < 0 || parsed > 100) {
            throw new common_1.BadRequestException('Weight must be between 0 and 100.');
        }
        return parsed;
    }
    async listCoreValues(user, entity) {
        const canManage = (0, performance_access_util_1.canManagePerformanceWorkflow)(user);
        const query = {};
        if (entity || !canManage) {
            const fallbackEntity = entity ??
                user?.entity ??
                user?.selectedSubsidiary ??
                user?.subsidiary;
            if (!fallbackEntity) {
                throw new common_1.BadRequestException('Entity is required.');
            }
            const entityId = this.normalizeEntityIdStrict(fallbackEntity);
            query.entity = new mongoose_2.Types.ObjectId(entityId);
            if (!canManage && entity) {
                const userEntity = this.normalizeEntityIdStrict(user?.entity ?? user?.selectedSubsidiary ?? user?.subsidiary ?? fallbackEntity);
                if (userEntity !== entityId) {
                    throw new common_1.ForbiddenException('You do not have permission to access core values for this entity.');
                }
            }
        }
        const data = await this.coreValueModel
            .find(query)
            .sort({ createdAt: 1 })
            .lean()
            .exec();
        return { status: 200, data };
    }
    async createCoreValue(user, payload) {
        (0, performance_access_util_1.assertCanManagePerformanceWorkflow)(user);
        const entityId = this.normalizeEntityIdStrict(payload?.entity);
        const title = String(payload?.title ?? '').trim();
        if (!title) {
            throw new common_1.BadRequestException('Title is required.');
        }
        const weight = this.normalizeWeight(payload?.weight);
        const description = String(payload?.description ?? '').trim();
        const raters = this.normalizeRaters(payload?.raters);
        const isActive = payload?.isActive !== false;
        const record = await this.coreValueModel.create({
            entity: new mongoose_2.Types.ObjectId(entityId),
            title,
            description,
            weight,
            raters,
            isActive,
        });
        return { status: 200, data: record };
    }
    async updateCoreValue(user, id, payload) {
        (0, performance_access_util_1.assertCanManagePerformanceWorkflow)(user);
        const updates = {};
        if (payload?.title !== undefined) {
            const title = String(payload?.title ?? '').trim();
            if (!title) {
                throw new common_1.BadRequestException('Title is required.');
            }
            updates.title = title;
        }
        if (payload?.description !== undefined) {
            updates.description = String(payload?.description ?? '').trim();
        }
        if (payload?.weight !== undefined) {
            updates.weight = this.normalizeWeight(payload?.weight);
        }
        if (payload?.raters !== undefined) {
            updates.raters = this.normalizeRaters(payload?.raters);
        }
        if (payload?.isActive !== undefined) {
            updates.isActive = payload?.isActive !== false;
        }
        const record = await this.coreValueModel
            .findByIdAndUpdate(id, { $set: updates }, { new: true })
            .lean()
            .exec();
        if (!record) {
            throw new common_1.NotFoundException('Core value not found.');
        }
        return { status: 200, data: record };
    }
    async deleteCoreValue(user, id) {
        (0, performance_access_util_1.assertCanManagePerformanceWorkflow)(user);
        const record = await this.coreValueModel.findByIdAndDelete(id).lean().exec();
        if (!record) {
            throw new common_1.NotFoundException('Core value not found.');
        }
        return { status: 200, deleted: true };
    }
};
exports.PerformanceCoreValueService = PerformanceCoreValueService;
exports.PerformanceCoreValueService = PerformanceCoreValueService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(performance_core_value_schema_1.PerformanceCoreValue.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PerformanceCoreValueService);
//# sourceMappingURL=performance-core-value.service.js.map