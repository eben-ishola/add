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
exports.ServiceSurveyController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const service_survey_service_1 = require("../../services/service-desk/service-survey.service");
let ServiceSurveyController = class ServiceSurveyController {
    constructor(serviceSurveyService) {
        this.serviceSurveyService = serviceSurveyService;
    }
    async submitExternal(payload) {
        return this.serviceSurveyService.createExternal({
            ...payload
        });
    }
    async createExternalReference(payload, req) {
        const user = req?.user ?? {};
        const respondentId = user?._id ?? user?.id ?? user?.userId;
        return this.serviceSurveyService.createExternalReference({
            ...payload,
            internalRespondent: respondentId ? String(respondentId) : undefined,
        });
    }
    async submitInternal(payload, req) {
        const user = req?.user ?? {};
        const respondentId = user?._id ?? user?.id ?? user?.userId;
        return this.serviceSurveyService.createInternal(payload, respondentId);
    }
    async findAll(type, serviceArea, from, to, page, limit, sort, assignment, req) {
        const userId = req?.user?._id ?? req?.user?.id ?? req?.user?.userId;
        return this.serviceSurveyService.findAll({
            customerType: type,
            serviceArea,
            from,
            to,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            sort,
            assignment,
            currentUserId: userId ? String(userId) : undefined,
        });
    }
    async summary(type) {
        return this.serviceSurveyService.getSummary(type);
    }
    async assignSurvey(id, req, body) {
        const userId = req?.user?._id ?? req?.user?.id ?? req?.user?.userId;
        return this.serviceSurveyService.assignSurvey(id, userId ? String(userId) : undefined, body?.respondentId);
    }
};
exports.ServiceSurveyController = ServiceSurveyController;
__decorate([
    (0, common_1.Post)('external'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ServiceSurveyController.prototype, "submitExternal", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('external/reference'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ServiceSurveyController.prototype, "createExternalReference", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('internal'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ServiceSurveyController.prototype, "submitInternal", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('serviceArea')),
    __param(2, (0, common_1.Query)('from')),
    __param(3, (0, common_1.Query)('to')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __param(6, (0, common_1.Query)('sort')),
    __param(7, (0, common_1.Query)('assignment')),
    __param(8, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ServiceSurveyController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ServiceSurveyController.prototype, "summary", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/assign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ServiceSurveyController.prototype, "assignSurvey", null);
exports.ServiceSurveyController = ServiceSurveyController = __decorate([
    (0, common_1.Controller)('service-surveys'),
    __metadata("design:paramtypes", [service_survey_service_1.ServiceSurveyService])
], ServiceSurveyController);
//# sourceMappingURL=service-survey.controller.js.map