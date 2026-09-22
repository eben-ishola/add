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
exports.ApiKeyConfigController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const audit_write_guard_1 = require("../../auth/guards/audit-write.guard");
const it_admin_guard_1 = require("../../auth/guards/it-admin.guard");
const api_key_config_service_1 = require("../../services/system/api-key-config.service");
let ApiKeyConfigController = class ApiKeyConfigController {
    constructor(apiKeyConfigService) {
        this.apiKeyConfigService = apiKeyConfigService;
    }
    async getControlApiConfig() {
        return this.apiKeyConfigService.getControlApiConfig();
    }
    async updateControlApiConfig(body) {
        return this.apiKeyConfigService.updateControlApiConfig(body ?? {});
    }
};
exports.ApiKeyConfigController = ApiKeyConfigController;
__decorate([
    (0, common_1.Get)('control-api'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApiKeyConfigController.prototype, "getControlApiConfig", null);
__decorate([
    (0, common_1.Put)('control-api'),
    (0, common_1.UseGuards)(audit_write_guard_1.AuditWriteGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiKeyConfigController.prototype, "updateControlApiConfig", null);
exports.ApiKeyConfigController = ApiKeyConfigController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, it_admin_guard_1.ItAdminGuard),
    (0, common_1.Controller)('api-key-config'),
    __metadata("design:paramtypes", [api_key_config_service_1.ApiKeyConfigService])
], ApiKeyConfigController);
//# sourceMappingURL=api-key-config.controller.js.map