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
exports.LevelService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const normalizeEntityToken = (value) => {
    if (!value)
        return '';
    return String(value).trim().toLowerCase();
};
const compactEntityToken = (value) => value.replace(/[\s_-]+/g, '');
const isAfriqueSpatialEntity = (value) => {
    const normalized = compactEntityToken(normalizeEntityToken(value));
    if (!normalized)
        return false;
    if (normalized === 'afr')
        return true;
    return normalized.includes('afriquespatial');
};
const buildCssLevelFilter = (entity) => {
    return isAfriqueSpatialEntity(entity)
        ? { name: /css/i }
        : { name: { $not: /css/i } };
};
let LevelService = class LevelService {
    constructor(levelModel, levelCategoryModel) {
        this.levelModel = levelModel;
        this.levelCategoryModel = levelCategoryModel;
    }
    async createLevel(createUserDto) {
        try {
            const createdUser = new this.levelModel(createUserDto);
            return createdUser.save();
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async findAllLevel(page, limit, searchText, entity) {
        try {
            const filters = [];
            const trimmedSearch = searchText?.trim();
            if (trimmedSearch) {
                filters.push({
                    $or: [
                        { name: new RegExp(trimmedSearch, 'i') }
                    ],
                });
            }
            filters.push(buildCssLevelFilter(entity));
            const query = filters.length ? { $and: filters } : {};
            const totalItems = await this.levelModel.countDocuments(query);
            const totalPages = Math.ceil(totalItems / limit);
            const items = await this.levelModel
                .find(query)
                .populate('category')
                .sort({ name: 1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .exec();
            return {
                status: 200,
                totalPages,
                rows: items,
                totalItems,
                currentPage: page
            };
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async findLevels(entity) {
        try {
            const query = buildCssLevelFilter(entity);
            const levels = await this.levelModel
                .find(query)
                .populate('category')
                .sort({ name: 1 })
                .exec();
            return { status: 200, data: levels };
        }
        catch (error) {
            console.error("Error fetching levels:", error);
            return null;
        }
    }
    async getLevelByName(name) {
        try {
            const levels = await this.levelModel.findOne({ name }).exec();
            return { status: 200, data: levels };
        }
        catch (error) {
            console.error("Error fetching levels:", error);
            return null;
        }
    }
    async getById(level) {
        const levels = await this.levelModel.findOne({ _id: new mongoose_2.default.Types.ObjectId(level) }).exec();
        return levels;
    }
    async getLevelByNameAndEntity(name) {
        try {
            const levels = await this.levelModel.findOne({ name }).exec();
            return levels;
        }
        catch (error) {
            console.error("Error fetching levels:", error);
            return null;
        }
    }
    async findCategories() {
        try {
            const categories = await this.levelCategoryModel.find().sort({ name: 1 }).lean();
            return { status: 200, data: categories };
        }
        catch (error) {
            console.error("Error fetching level categories:", error);
            return { status: 500, message: error?.message ?? 'Failed to fetch categories' };
        }
    }
    async createCategory(payload) {
        try {
            const name = payload?.name?.trim();
            if (!name) {
                throw new Error('Category name is required');
            }
            const created = new this.levelCategoryModel({ name });
            const saved = await created.save();
            return { status: 201, data: saved };
        }
        catch (error) {
            throw new Error(error?.message ?? 'Unable to create category');
        }
    }
    async updateCategory(id, payload) {
        if (!id) {
            throw new Error('Category identifier is required');
        }
        const name = payload?.name?.trim();
        if (!name) {
            throw new Error('Category name is required');
        }
        const updated = await this.levelCategoryModel
            .findByIdAndUpdate(id, { $set: { name } }, { new: true })
            .lean();
        return { status: 200, data: updated };
    }
    async updateLevel(id, payload) {
        if (!id) {
            throw new Error('Level identifier is required');
        }
        const updates = {};
        if (typeof payload?.name === 'string' && payload.name.trim().length) {
            updates.name = payload.name.trim();
        }
        if (payload.category) {
            const normalized = payload.category?._id ??
                payload.category?.id ??
                payload.category;
            updates.category = new mongoose_2.default.Types.ObjectId(String(normalized));
        }
        else if (payload.category === '' || payload.category === null) {
            updates.category = null;
        }
        if (!Object.keys(updates).length) {
            throw new Error('Nothing to update');
        }
        const updated = await this.levelModel
            .findByIdAndUpdate(id, { $set: updates }, { new: true })
            .populate('category')
            .lean();
        return { status: 200, data: updated };
    }
};
exports.LevelService = LevelService;
exports.LevelService = LevelService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Level')),
    __param(1, (0, mongoose_1.InjectModel)('LevelCategory')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], LevelService);
//# sourceMappingURL=level.service.js.map