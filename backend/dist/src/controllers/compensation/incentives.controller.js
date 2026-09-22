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
exports.IncentivesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const incentives_service_1 = require("../../services/compensation/incentives.service");
let IncentivesController = class IncentivesController {
    constructor(incentivesService) {
        this.incentivesService = incentivesService;
    }
    async getIncentives(query) {
        return this.incentivesService.getIncentivesByGroup(query);
    }
    async getRoIncentivesByPeriod(query) {
        return this.incentivesService.getRoIncentives(query);
    }
    async getDmoIncentives(query) {
        return this.incentivesService.getDmoIncentives(query);
    }
    async getProductCategory() {
        return this.incentivesService.getProductCategories();
    }
    async getCaseLoad() {
        return this.incentivesService.getCaseLoads();
    }
    async getVisitation() {
        return this.incentivesService.getVisitations();
    }
    async getDmoTarget() {
        return this.incentivesService.getDmoTargets();
    }
    async getActiveSavers() {
        return this.incentivesService.getActiveSavers();
    }
    async getDailyMobilization() {
        return this.incentivesService.getDailyMobilizations();
    }
    async getBudgets(type) {
        return this.incentivesService.getBudgets(type);
    }
};
exports.IncentivesController = IncentivesController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IncentivesController.prototype, "getIncentives", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('ro'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IncentivesController.prototype, "getRoIncentivesByPeriod", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('dmo'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IncentivesController.prototype, "getDmoIncentives", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('savings/productCategory'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IncentivesController.prototype, "getProductCategory", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('savings/caseload'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IncentivesController.prototype, "getCaseLoad", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('savings/visitation'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IncentivesController.prototype, "getVisitation", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('savings/dmotarget'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IncentivesController.prototype, "getDmoTarget", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('savings/activesavers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IncentivesController.prototype, "getActiveSavers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('savings/dailymobilization'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IncentivesController.prototype, "getDailyMobilization", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('savings/budgets/:type'),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IncentivesController.prototype, "getBudgets", null);
exports.IncentivesController = IncentivesController = __decorate([
    (0, common_1.Controller)('incentives'),
    __metadata("design:paramtypes", [incentives_service_1.IncentivesService])
], IncentivesController);
//# sourceMappingURL=incentives.controller.js.map