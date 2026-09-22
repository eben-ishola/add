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
exports.PermissionService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let PermissionService = class PermissionService {
    constructor(permissionModel) {
        this.permissionModel = permissionModel;
    }
    async createPermission(createPermissionDto) {
        try {
            const createdPermission = new this.permissionModel(createPermissionDto);
            return createdPermission.save();
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async findAllPermissions(page, limit, searchText) {
        try {
            let query = {};
            if (searchText) {
                query = {
                    $or: [
                        { name: new RegExp(searchText, 'i') },
                        { action: new RegExp(searchText, 'i') },
                        { description: new RegExp(searchText, 'i') },
                    ],
                };
            }
            const totalItems = await this.permissionModel.countDocuments(query);
            const totalPages = Math.ceil(totalItems / limit);
            const items = await this.permissionModel
                .find(query)
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
    async findPermissions() {
        try {
            const permissions = await this.permissionModel.find().exec();
            return { data: permissions };
        }
        catch (error) {
            console.error('Error fetching Permissions:', error);
            return null;
        }
    }
    async getPermissionByName(name) {
        try {
            const permission = await this.permissionModel.findOne({
                name: { $regex: new RegExp(`^${name}$`, 'i') },
            }).exec();
            return permission;
        }
        catch (error) {
            console.error('Error fetching Permission:', error);
            return null;
        }
    }
    async updatePermission(id, updatePermissionDto) {
        try {
            const updatedPermission = await this.permissionModel
                .findByIdAndUpdate(id, updatePermissionDto, { new: true })
                .exec();
            if (!updatedPermission) {
                throw new Error('Permission not found');
            }
            return updatedPermission;
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
};
exports.PermissionService = PermissionService;
exports.PermissionService = PermissionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Permission')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PermissionService);
//# sourceMappingURL=permission.service.js.map