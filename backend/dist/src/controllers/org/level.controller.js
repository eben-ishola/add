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
exports.LevelController = void 0;
const common_1 = require("@nestjs/common");
const level_service_1 = require("../../services/org/level.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const audit_write_guard_1 = require("../../auth/guards/audit-write.guard");
let LevelController = class LevelController {
    constructor(levelService) {
        this.levelService = levelService;
    }
    async createLevel(createLevelDto) {
        try {
            return await this.levelService.createLevel(createLevelDto);
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async findAllLevels(page = 1, limit = 10, searchText = '', entity) {
        try {
            return await this.levelService.findAllLevel(page, limit, searchText, entity);
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async findLevels(entity) {
        try {
            return await this.levelService.findLevels(entity);
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getLevelByName(name) {
        try {
            return await this.levelService.getLevelByName(name);
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async getCategories() {
        return this.levelService.findCategories();
    }
    async createCategory(payload) {
        return this.levelService.createCategory(payload);
    }
    async updateCategory(id, payload) {
        return this.levelService.updateCategory(id, payload);
    }
    async updateLevel(id, payload) {
        return this.levelService.updateLevel(id, payload);
    }
};
exports.LevelController = LevelController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LevelController.prototype, "createLevel", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('findAll'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('searchText')),
    __param(3, (0, common_1.Query)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], LevelController.prototype, "findAllLevels", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('findLevels'),
    __param(0, (0, common_1.Query)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LevelController.prototype, "findLevels", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('getLevelByName'),
    __param(0, (0, common_1.Query)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LevelController.prototype, "getLevelByName", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LevelController.prototype, "getCategories", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('categories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LevelController.prototype, "createCategory", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('categories/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LevelController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LevelController.prototype, "updateLevel", null);
exports.LevelController = LevelController = __decorate([
    (0, common_1.Controller)('levels'),
    __metadata("design:paramtypes", [level_service_1.LevelService])
], LevelController);
//# sourceMappingURL=level.controller.js.map