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
exports.MonitoringController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const health_service_1 = require("../../services/system/health.service");
const monitoring_service_1 = require("../../services/system/monitoring.service");
let MonitoringController = class MonitoringController {
    constructor(monitoringService, healthService) {
        this.monitoringService = monitoringService;
        this.healthService = healthService;
    }
    async getHealth() {
        return this.healthService.getHealth();
    }
    async logActivity(payload) {
        return this.monitoringService.logActivity(payload);
    }
    async clockInOut(payload) {
        return this.monitoringService.clockInOut(payload);
    }
    async getUserActivities(userId) {
    }
    async getNormalActivity(user, startDate, endDate, page = 1, limit = 10) {
        const start = startDate && !isNaN(Date.parse(startDate)) ? new Date(startDate) : new Date();
        const end = endDate && !isNaN(Date.parse(endDate)) ? new Date(endDate) : new Date();
        return await this.monitoringService.getNormalActivity(user, start, end, page, limit);
    }
    async getDetailedActivity(user, startDate, endDate, page = 1, limit = 10) {
        const start = new Date(startDate) || new Date();
        const end = new Date(endDate) || new Date();
        return await this.monitoringService.getDetailedActivity(user, start, end, page, limit);
    }
    async getSummarizedActivity(user, startDate, endDate, page = 1, limit = 10) {
        const start = new Date(startDate) || new Date();
        const end = new Date(endDate) || new Date();
        return await this.monitoringService.getSummarizedActivity(user, start, end, page, limit);
    }
    async getClockHistory(userId) {
        return this.monitoringService.getClockHistory(userId);
    }
    async uninstallAttempt(payload) {
        return this.monitoringService.handleUninstallAttempt(payload);
    }
    async verifyAdminPassword({ password }) {
        return this.monitoringService.verifyAdminPassword(password);
    }
    async confirmUninstall({ password }) {
        return this.monitoringService.confirmUninstall(password);
    }
    async getGroupedActivities(page = 1, limit = 10, startDate, endDate, user) {
        return this.monitoringService.findGroupedActivities(+page, +limit, startDate, endDate, user);
    }
    async getGroupedUser(page = 1, limit = 10, startDate, endDate) {
        return this.monitoringService.findUserActivities(+page, +limit, startDate, endDate);
    }
};
exports.MonitoringController = MonitoringController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getHealth", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('activities'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "logActivity", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('clock'),
    __param(0, (0, common_1.Body)()),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "clockInOut", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('activities/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getUserActivities", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('normal/:user'),
    __param(0, (0, common_1.Param)('user')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getNormalActivity", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('detailed/:user'),
    __param(0, (0, common_1.Param)('user')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getDetailedActivity", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('summarized/:user'),
    __param(0, (0, common_1.Param)('user')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getSummarizedActivity", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('clock/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getClockHistory", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('uninstall-attempt'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "uninstallAttempt", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('verify-admin-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "verifyAdminPassword", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('confirm-uninstall'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "confirmUninstall", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("grouped"),
    __param(0, (0, common_1.Query)("page")),
    __param(1, (0, common_1.Query)("limit")),
    __param(2, (0, common_1.Query)("startDate")),
    __param(3, (0, common_1.Query)("endDate")),
    __param(4, (0, common_1.Query)("user")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getGroupedActivities", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("groupedUser"),
    __param(0, (0, common_1.Query)("page")),
    __param(1, (0, common_1.Query)("limit")),
    __param(2, (0, common_1.Query)("startDate")),
    __param(3, (0, common_1.Query)("endDate")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getGroupedUser", null);
exports.MonitoringController = MonitoringController = __decorate([
    (0, common_1.Controller)(''),
    __metadata("design:paramtypes", [monitoring_service_1.MonitoringService,
        health_service_1.HealthService])
], MonitoringController);
//# sourceMappingURL=monitoring.controller.js.map