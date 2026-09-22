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
exports.SubsidiaryController = void 0;
const common_1 = require("@nestjs/common");
const subsidiary_service_1 = require("../../services/org/subsidiary.service");
const branch_service_1 = require("../../services/org/branch.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const audit_write_guard_1 = require("../../auth/guards/audit-write.guard");
let SubsidiaryController = class SubsidiaryController {
    constructor(entityService, branchService) {
        this.entityService = entityService;
        this.branchService = branchService;
    }
    async listSubsidiaries() {
        try {
            const response = await this.entityService.findSubsidiaryList();
            return response?.data ?? [];
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    async createSubsidiary(createSubsidiaryDto) {
        return await this.entityService.createSubsidiary(createSubsidiaryDto);
    }
    async findAllSubsidiarys(page, limit, searchText = '') {
        return await this.entityService.findAllEntities(page, limit, searchText);
    }
    async findTerritory(page, limit, searchText = '') {
        return await this.entityService.findAllTerritory(page, limit, searchText);
    }
    async findSubsidiarys(id) {
        return await this.entityService.findSubsidiaryById(id);
    }
    async findSubsidiaryList() {
        return await this.entityService.findSubsidiaryList();
    }
    async getSubsidiaryByName(name) {
        return await this.entityService.getSubsidiaryByName(name);
    }
    async getBranches(entity) {
        return await this.branchService.findBranches(entity);
    }
    async updateSubsidiary(id, updateSubsidiaryDto) {
        return await this.entityService.updateSubsidiary(id, updateSubsidiaryDto);
    }
    async createTerritory(createTerritoryDto) {
        return await this.entityService.createTerritory(createTerritoryDto);
    }
    async updateTerritory(id, updateTerritoryDto) {
        return await this.entityService.updateTerritory(id, updateTerritoryDto);
    }
};
exports.SubsidiaryController = SubsidiaryController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubsidiaryController.prototype, "listSubsidiaries", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubsidiaryController.prototype, "createSubsidiary", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('findAll'),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('searchText')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], SubsidiaryController.prototype, "findAllSubsidiarys", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('findTerritory'),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('searchText')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], SubsidiaryController.prototype, "findTerritory", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('findSubsidiary/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubsidiaryController.prototype, "findSubsidiarys", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('findSubsidiaryList'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubsidiaryController.prototype, "findSubsidiaryList", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('getSubsidiaryByName'),
    __param(0, (0, common_1.Query)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubsidiaryController.prototype, "getSubsidiaryByName", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('branches'),
    __param(0, (0, common_1.Query)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubsidiaryController.prototype, "getBranches", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('entity/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SubsidiaryController.prototype, "updateSubsidiary", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('territory'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubsidiaryController.prototype, "createTerritory", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, audit_write_guard_1.AuditWriteGuard),
    (0, common_1.Post)('territory/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SubsidiaryController.prototype, "updateTerritory", null);
exports.SubsidiaryController = SubsidiaryController = __decorate([
    (0, common_1.Controller)('subsidiaries'),
    __metadata("design:paramtypes", [subsidiary_service_1.SubsidiaryService,
        branch_service_1.BranchService])
], SubsidiaryController);
//# sourceMappingURL=subsidiary.controller.js.map