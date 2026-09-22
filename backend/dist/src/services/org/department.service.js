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
exports.DepartmentService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let DepartmentService = class DepartmentService {
    constructor(departmentModel, subsidiaryModel) {
        this.departmentModel = departmentModel;
        this.subsidiaryModel = subsidiaryModel;
    }
    async groupEntityIds() {
        if (!this.subsidiaryModel)
            return [];
        const rows = await this.subsidiaryModel
            .find({
            $or: [
                { short: { $regex: '^ail$', $options: 'i' } },
                { name: { $regex: '^addosser investment', $options: 'i' } },
            ],
        })
            .select('_id')
            .lean()
            .exec();
        return rows.map((row) => row?._id).filter(Boolean);
    }
    async createDepartment(createUserDto) {
        try {
            const payload = {
                name: createUserDto?.name?.trim(),
                groupEmail: createUserDto?.groupEmail?.trim()?.toLowerCase() ?? '',
                entity: createUserDto?.entity ?? null,
            };
            if (!payload.name) {
                throw new Error('Department name is required');
            }
            if (payload.entity === '') {
                payload.entity = null;
            }
            const entityVariants = [];
            if (payload.entity) {
                const entityStr = String(payload.entity).trim();
                entityVariants.push(entityStr);
                if (mongoose_2.Types.ObjectId.isValid(entityStr)) {
                    entityVariants.push(new mongoose_2.Types.ObjectId(entityStr));
                }
            }
            else {
                entityVariants.push(null);
                entityVariants.push(undefined);
            }
            const existing = await this.departmentModel.findOne({
                name: new RegExp(`^${payload.name}$`, 'i'),
                entity: { $in: entityVariants },
            });
            if (existing) {
                throw new Error('Department already exists for this entity');
            }
            const createdDepartment = new this.departmentModel(payload);
            return createdDepartment.save();
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async findAllDepartment(page = 1, limit = 10, searchText = '', entity) {
        try {
            const numericPage = Math.max(1, Number(page) || 1);
            const numericLimit = Math.max(1, Number(limit) || 10);
            const query = {};
            if (searchText && searchText.trim().length) {
                query.$or = [{ name: new RegExp(searchText.trim(), 'i') }];
            }
            if (entity && String(entity).trim().length) {
                const entityStr = String(entity).trim();
                const maybeObjectId = mongoose_2.Types.ObjectId.isValid(entityStr) ? new mongoose_2.Types.ObjectId(entityStr) : null;
                query.$or = [
                    ...(query.$or || []),
                    { entity: entityStr },
                    ...(maybeObjectId ? [{ entity: maybeObjectId }] : []),
                ];
            }
            const totalItems = await this.departmentModel.countDocuments(query);
            const totalPages = Math.ceil(totalItems / numericLimit) || 1;
            const items = await this.departmentModel
                .find(query)
                .populate('entity')
                .skip((numericPage - 1) * numericLimit)
                .limit(numericLimit)
                .sort({ name: 1 })
                .lean()
                .exec();
            return {
                status: 200,
                totalPages,
                rows: items,
                totalItems,
                currentPage: numericPage
            };
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async updateDepartment(id, updateDto) {
        try {
            const update = {};
            if (updateDto?.name !== undefined) {
                update.name = updateDto.name?.trim();
            }
            if (updateDto?.groupEmail !== undefined) {
                update.groupEmail = updateDto.groupEmail?.trim()?.toLowerCase() ?? '';
            }
            if (updateDto?.entity !== undefined) {
                update.entity = updateDto.entity || null;
            }
            if (!Object.keys(update).length) {
                return this.departmentModel.findById(id).lean();
            }
            return this.departmentModel
                .findByIdAndUpdate(id, { $set: update }, { new: true })
                .lean()
                .exec();
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async findDepartmentes(entity, includeGroup = false) {
        try {
            const query = {};
            if (entity && String(entity).trim().length) {
                const entityStr = String(entity).trim();
                const maybeObjectId = mongoose_2.Types.ObjectId.isValid(entityStr) ? new mongoose_2.Types.ObjectId(entityStr) : null;
                const clauses = [
                    { entity: entityStr },
                    ...(maybeObjectId ? [{ entity: maybeObjectId }] : []),
                ];
                if (includeGroup) {
                    clauses.push({ entity: null }, { entity: { $exists: false } });
                    const groupIds = await this.groupEntityIds();
                    groupIds.forEach((id) => clauses.push({ entity: id }));
                }
                query.$or = clauses;
            }
            const Departments = await this.departmentModel.find(query).populate('entity').exec();
            return { data: Departments };
        }
        catch (error) {
            console.error("Error fetching Departments:", error);
            return null;
        }
    }
    async getDepartmentByName(name) {
        try {
            const Departments = await this.departmentModel.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } }).exec();
            return Departments;
        }
        catch (error) {
            console.error("Error fetching Departments:", error);
            return null;
        }
    }
    async getDepartmentByNameAndEntity(name, entity) {
        try {
            const normalizedName = name?.trim();
            if (!normalizedName)
                return null;
            const candidates = [];
            const rawEntity = String(entity?._id ?? entity ?? '').trim();
            if (rawEntity) {
                candidates.push(rawEntity);
                if (mongoose_2.Types.ObjectId.isValid(rawEntity)) {
                    candidates.push(new mongoose_2.Types.ObjectId(rawEntity));
                }
            }
            const query = {
                name: { $regex: new RegExp(`^${escapeRegex(normalizedName)}$`, 'i') },
            };
            if (candidates.length) {
                query.entity = { $in: candidates };
            }
            return this.departmentModel.findOne(query).exec();
        }
        catch (error) {
            console.error("Error fetching Departments:", error);
            return null;
        }
    }
};
exports.DepartmentService = DepartmentService;
exports.DepartmentService = DepartmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Department')),
    __param(1, (0, common_1.Optional)()),
    __param(1, (0, mongoose_1.InjectModel)('Subsidiary')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], DepartmentService);
//# sourceMappingURL=department.service.js.map