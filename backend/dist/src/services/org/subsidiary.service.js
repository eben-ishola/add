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
exports.SubsidiaryService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const subsidiary_schema_1 = require("../../schemas/subsidiary.schema");
const territory_schema_1 = require("../../schemas/territory.schema");
const index_utils_1 = require("../../utils/index.utils");
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;
const SUBSIDIARY_SAFE_PROJECTION = '-__v';
let SubsidiaryService = class SubsidiaryService {
    constructor(entityModel, territoryModel) {
        this.entityModel = entityModel;
        this.territoryModel = territoryModel;
    }
    async createSubsidiary(createSubsidiaryDto) {
        try {
            const createdSubsidiary = new this.entityModel(createSubsidiaryDto);
            const saved = await createdSubsidiary.save();
            return saved;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async findAllEntities(page, limit, searchText) {
        try {
            const { pageNumber, pageSize, skip } = this.normalizePagination(page, limit);
            const query = this.buildSearchQuery(searchText);
            const [totalItems, rows] = await Promise.all([
                this.entityModel.countDocuments(query),
                this.entityModel
                    .find(query)
                    .select(SUBSIDIARY_SAFE_PROJECTION)
                    .skip(skip)
                    .limit(pageSize)
                    .lean(),
            ]);
            const totalPages = Math.ceil(totalItems / pageSize);
            return {
                status: 200,
                totalPages,
                rows,
                totalItems,
                currentPage: pageNumber,
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async findAllTerritory(page, limit, searchText) {
        try {
            const { pageNumber, pageSize, skip } = this.normalizePagination(page, limit);
            const query = this.buildSearchQuery(searchText);
            const [totalItems, rows] = await Promise.all([
                this.territoryModel.countDocuments(query),
                this.territoryModel
                    .find(query)
                    .select(SUBSIDIARY_SAFE_PROJECTION)
                    .skip(skip)
                    .limit(pageSize)
                    .lean(),
            ]);
            const totalPages = Math.ceil(totalItems / pageSize);
            return {
                status: 200,
                totalPages,
                rows,
                totalItems,
                currentPage: pageNumber,
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getSubsidiaryByName(name) {
        try {
            const entity = await this.entityModel.findOne({ name }).select(SUBSIDIARY_SAFE_PROJECTION).lean();
            return entity;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getSubsidiaryByShort(name) {
        try {
            const entity = await this.entityModel.findOne({ short: name }).select(SUBSIDIARY_SAFE_PROJECTION).lean();
            return entity;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async findSubsidiaryById(id) {
        try {
            const entity = await this.entityModel.findOne({ _id: (0, index_utils_1.toObjectId)(id) })
                .select(SUBSIDIARY_SAFE_PROJECTION)
                .lean();
            if (!entity) {
                return { status: 404, message: 'Subsidiary not found' };
            }
            return { status: 200, data: entity };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async findSubsidiaryList() {
        try {
            const entities = await this.entityModel.find().lean();
            return { status: 200, data: entities };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async updateSubsidiary(id, updateSubsidiaryDto) {
        try {
            const updatedSubsidiary = await this.entityModel.findByIdAndUpdate(id, { $set: updateSubsidiaryDto }, { new: true }).select(SUBSIDIARY_SAFE_PROJECTION).lean();
            if (!updatedSubsidiary) {
                return { status: 404, message: 'Subsidiary not found' };
            }
            return { status: 200, data: updatedSubsidiary };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async createTerritory(createTerritoryDto) {
        try {
            const createdTerritory = new this.territoryModel(createTerritoryDto);
            const saved = await createdTerritory.save();
            return { status: 201, data: saved };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async updateTerritory(id, updateTerritoryDto) {
        try {
            const updatedTerritory = await this.territoryModel.findByIdAndUpdate(id, { $set: updateTerritoryDto }, { new: true }).select(SUBSIDIARY_SAFE_PROJECTION).lean();
            if (!updatedTerritory) {
                return { status: 404, message: 'Territory not found' };
            }
            return { status: 200, data: updatedTerritory };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    normalizePagination(page, limit) {
        const pageNumber = Math.max(Number(page) || DEFAULT_PAGE, DEFAULT_PAGE);
        const rawLimit = Number(limit) || DEFAULT_PAGE_SIZE;
        const pageSize = Math.min(Math.max(rawLimit, 1), MAX_PAGE_SIZE);
        const skip = (pageNumber - 1) * pageSize;
        return { pageNumber, pageSize, skip };
    }
    buildSearchQuery(searchText) {
        const text = searchText?.trim();
        if (!text)
            return {};
        const regex = new RegExp(text, 'i');
        return {
            $or: [
                { name: regex },
                { short: regex },
            ],
        };
    }
};
exports.SubsidiaryService = SubsidiaryService;
exports.SubsidiaryService = SubsidiaryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(subsidiary_schema_1.Subsidiary.name)),
    __param(1, (0, mongoose_1.InjectModel)(territory_schema_1.Territory.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], SubsidiaryService);
//# sourceMappingURL=subsidiary.service.js.map