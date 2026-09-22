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
exports.RemittanceService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const remittance_schema_1 = require("../../schemas/remittance.schema");
let RemittanceService = class RemittanceService {
    constructor(remittanceModel) {
        this.remittanceModel = remittanceModel;
    }
    normalizeMonth(month) {
        if (!month) {
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }
        const parsed = new Date(`${month}-01`);
        if (Number.isNaN(parsed.getTime())) {
            throw new common_1.BadRequestException('Invalid month format. Use YYYY-MM.');
        }
        return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`;
    }
    async createRemittance(user, payload, invoiceFileName) {
        if (!payload?.type || !['NHF', 'Pension'].includes(payload.type)) {
            throw new common_1.BadRequestException('Invalid remittance type. Use NHF or Pension.');
        }
        const periodMonth = this.normalizeMonth(payload.periodMonth);
        const requestedBy = user?._id ?? user?.id ?? user?.userId;
        const requestedByName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name;
        const remittance = await this.remittanceModel.create({
            type: payload.type,
            periodMonth,
            invoiceNote: payload.invoiceNote,
            invoiceFileName,
            status: 'INVOICE_SUBMITTED',
            requestedBy,
            requestedByName,
        });
        return remittance;
    }
    async addProof(id, payload, proofFileName) {
        const remittance = await this.remittanceModel.findById(id);
        if (!remittance) {
            throw new common_1.NotFoundException('Remittance not found');
        }
        remittance.proofNote = payload.proofNote;
        remittance.proofFileName = proofFileName ?? remittance.proofFileName;
        remittance.status = 'PROOF_SUBMITTED';
        await remittance.save();
        return remittance;
    }
    async listRemittances(query) {
        const filter = {};
        if (query?.type) {
            filter.type = query.type;
        }
        if (query?.month) {
            filter.periodMonth = this.normalizeMonth(query.month);
        }
        if (query?.status) {
            filter.status = query.status;
        }
        const results = await this.remittanceModel.find(filter).sort({ createdAt: -1 }).lean();
        return results;
    }
};
exports.RemittanceService = RemittanceService;
exports.RemittanceService = RemittanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(remittance_schema_1.Remittance.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], RemittanceService);
//# sourceMappingURL=remittance.service.js.map