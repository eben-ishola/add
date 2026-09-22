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
exports.BranchService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let BranchService = class BranchService {
    constructor(branchModel) {
        this.branchModel = branchModel;
    }
    resolveEntityCandidate(value) {
        if (value == null)
            return undefined;
        if (typeof value === 'string' || typeof value === 'number') {
            const trimmed = String(value).trim();
            return trimmed.length ? trimmed : undefined;
        }
        if (typeof value === 'object') {
            const nested = value?._id ?? value?.id ?? value?.entityId ?? value?.value;
            if (nested != null) {
                return this.resolveEntityCandidate(nested);
            }
            if (typeof value.toHexString === 'function') {
                return value.toHexString();
            }
        }
        return undefined;
    }
    ensureEntity(payload) {
        if (!payload || typeof payload !== 'object')
            return payload;
        const existing = this.resolveEntityCandidate(payload.entity);
        if (existing) {
            return payload.entity === existing ? payload : { ...payload, entity: existing };
        }
        const fallback = this.resolveEntityCandidate(payload.subsidiaryId ?? payload.subsidiary ?? payload.entityId);
        if (!fallback)
            return payload;
        return { ...payload, entity: fallback };
    }
    async createBranch(createUserDto) {
        try {
            const createdUser = new this.branchModel(this.ensureEntity(createUserDto));
            return createdUser.save();
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async findAllBranch(page, limit, searchText, entity) {
        try {
            const query = {};
            if (entity && String(entity).trim().length) {
                const raw = String(entity).trim();
                const maybeObjectId = mongoose_2.Types.ObjectId.isValid(raw) ? new mongoose_2.Types.ObjectId(raw) : null;
                query.$or = [
                    { entity: raw },
                    ...(maybeObjectId ? [{ entity: maybeObjectId }] : []),
                ];
            }
            if (searchText) {
                const conditions = [{ name: new RegExp(searchText, 'i') }];
                if (query.$or) {
                    query.$and = [...(query.$and ?? []), { $or: conditions }];
                }
                else {
                    query.$or = conditions;
                }
            }
            const totalItems = await this.branchModel.countDocuments(query);
            const totalPages = Math.ceil(totalItems / limit);
            const items = await this.branchModel
                .find(query)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean()
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
    async findBranches(entity) {
        try {
            const conditions = [{ entity }];
            if (mongoose_2.Types.ObjectId.isValid(entity)) {
                conditions.push({ entity: new mongoose_2.Types.ObjectId(entity) });
            }
            const branches = await this.branchModel
                .find({ $or: conditions })
                .lean()
                .exec();
            return { data: branches };
        }
        catch (error) {
            console.error('Error fetching branches:', error);
            throw error;
        }
    }
    async getBranchByName(name) {
        try {
            const Branchs = await this.branchModel.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } }).exec();
            return Branchs;
        }
        catch (error) {
            console.error("Error fetching Branchs:", error);
            return null;
        }
    }
    async updateBranch(id, updateBranchDto) {
        try {
            const updatedBranch = await this.branchModel
                .findByIdAndUpdate(id, this.ensureEntity(updateBranchDto), { new: true })
                .exec();
            if (!updatedBranch) {
                throw new Error('Branch not found');
            }
            return updatedBranch;
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
};
exports.BranchService = BranchService;
exports.BranchService = BranchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Branch')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], BranchService);
//# sourceMappingURL=branch.service.js.map