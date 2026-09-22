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
exports.RemittanceController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const fs = require("fs");
const path = require("path");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const user_decorator_1 = require("../../auth/decorators/user.decorator");
const remittance_service_1 = require("../../services/compensation/remittance.service");
const ensureUploadDir = (target) => {
    fs.mkdirSync(target, { recursive: true });
};
let RemittanceController = class RemittanceController {
    constructor(remittanceService) {
        this.remittanceService = remittanceService;
    }
    async createRemittance(user, body, invoiceFile) {
        const remittance = await this.remittanceService.createRemittance(user, {
            type: body?.type,
            periodMonth: body?.periodMonth,
            invoiceNote: body?.invoiceNote ?? body?.note,
        }, invoiceFile?.filename);
        return { message: 'Remittance logged', data: remittance };
    }
    async addProof(id, body, proofFile) {
        const remittance = await this.remittanceService.addProof(id, {
            proofNote: body?.proofNote ?? body?.note,
        }, proofFile?.filename);
        return { message: 'Proof uploaded', data: remittance };
    }
    async listRemittances(type, month, status) {
        const data = await this.remittanceService.listRemittances({ type, month, status });
        return { data };
    }
};
exports.RemittanceController = RemittanceController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('invoiceFile', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const dest = path.join(process.cwd(), 'uploads', 'remittance');
                ensureUploadDir(dest);
                cb(null, dest);
            },
            filename: (req, file, cb) => {
                const sanitized = file.originalname.replace(/\s+/g, '_');
                cb(null, `${Date.now()}_${sanitized}`);
            },
        }),
    })),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], RemittanceController.prototype, "createRemittance", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/proof'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('proofFile', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const dest = path.join(process.cwd(), 'uploads', 'remittance');
                ensureUploadDir(dest);
                cb(null, dest);
            },
            filename: (req, file, cb) => {
                const sanitized = file.originalname.replace(/\s+/g, '_');
                cb(null, `${Date.now()}_${sanitized}`);
            },
        }),
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], RemittanceController.prototype, "addProof", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], RemittanceController.prototype, "listRemittances", null);
exports.RemittanceController = RemittanceController = __decorate([
    (0, common_1.Controller)('remittances'),
    __metadata("design:paramtypes", [remittance_service_1.RemittanceService])
], RemittanceController);
//# sourceMappingURL=remittance.controller.js.map