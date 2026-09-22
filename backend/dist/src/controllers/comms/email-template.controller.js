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
exports.EmailTemplateController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const audit_write_guard_1 = require("../../auth/guards/audit-write.guard");
const email_template_service_1 = require("../../services/comms/email-template.service");
let EmailTemplateController = class EmailTemplateController {
    constructor(emailTemplateService) {
        this.emailTemplateService = emailTemplateService;
    }
    async list() {
        return this.emailTemplateService.listTemplates();
    }
    async create(body) {
        return this.emailTemplateService.createTemplate(body ?? {});
    }
    async update(id, body) {
        return this.emailTemplateService.updateTemplate(id, body ?? {});
    }
    async remove(id) {
        return this.emailTemplateService.deleteTemplate(id);
    }
};
exports.EmailTemplateController = EmailTemplateController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmailTemplateController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(audit_write_guard_1.AuditWriteGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailTemplateController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(audit_write_guard_1.AuditWriteGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmailTemplateController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(audit_write_guard_1.AuditWriteGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailTemplateController.prototype, "remove", null);
exports.EmailTemplateController = EmailTemplateController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('email-templates'),
    __metadata("design:paramtypes", [email_template_service_1.EmailTemplateService])
], EmailTemplateController);
//# sourceMappingURL=email-template.controller.js.map