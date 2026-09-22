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
exports.PayrollTaxService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const tax_config_schema_1 = require("../../schemas/tax-config.schema");
const payroll_tax_util_1 = require("../../utils/payroll/payroll-tax.util");
const payroll_calculation_util_1 = require("../../utils/payroll/payroll-calculation.util");
const payroll_identity_util_1 = require("../../utils/payroll/payroll-identity.util");
let PayrollTaxService = class PayrollTaxService {
    constructor(taxConfigModel) {
        this.taxConfigModel = taxConfigModel;
    }
    async loadActiveGlobalConfig() {
        const config = await this.taxConfigModel
            .findOne({
            isActive: true,
            $or: [{ entity: { $exists: false } }, { entity: null }],
        })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        return config;
    }
    async computeTaxForAnnualIncome(amount, config) {
        const cfg = config ?? await this.loadActiveGlobalConfig();
        return (0, payroll_tax_util_1.computeAnnualPayrollTax)(amount, cfg);
    }
    async computeMonthlyTax(amount, config) {
        const annual = await this.computeTaxForAnnualIncome(amount, config);
        return (0, payroll_calculation_util_1.roundPayrollAmount)(annual / 12);
    }
    async getTaxConfigs(entity) {
        const entityId = (0, payroll_identity_util_1.resolvePayrollEntityId)(entity);
        const scopeQuery = entityId
            ? { entity: entityId }
            : { $or: [{ entity: { $exists: false } }, { entity: null }] };
        const configs = await this.taxConfigModel
            .find(scopeQuery)
            .sort({ isActive: -1, createdAt: -1 })
            .lean()
            .exec();
        const fallbackConfig = entityId ? await this.loadActiveGlobalConfig() : null;
        const activeConfig = configs.find((cfg) => cfg.isActive) ?? (entityId ? fallbackConfig : null);
        return {
            status: 200,
            data: {
                entityId: entityId ?? null,
                configs,
                activeConfig,
                fallbackConfig,
            },
        };
    }
    async saveTaxConfig(payload) {
        const entityId = (0, payroll_identity_util_1.resolvePayrollEntityId)(payload?.entity);
        const update = (0, payroll_tax_util_1.sanitizePayrollTaxConfigUpdate)(payload);
        if (!update.configName) {
            throw new common_1.BadRequestException('Config name is required');
        }
        if (!update.currency) {
            throw new common_1.BadRequestException('Currency is required');
        }
        let document = null;
        if (payload?._id) {
            document = await this.taxConfigModel.findById(payload._id);
            if (!document) {
                throw new common_1.NotFoundException('Tax configuration not found');
            }
            for (const [key, value] of Object.entries(update)) {
                if (value === undefined)
                    continue;
                document.set(key, value);
            }
            if (entityId) {
                document.set('entity', entityId);
            }
            else {
                document.set('entity', undefined);
            }
            document.markModified('entity');
            document.markModified('brackets');
            await document.save();
        }
        else {
            const createPayload = { ...update };
            if (entityId) {
                createPayload.entity = entityId;
            }
            document = await this.taxConfigModel.create(createPayload);
        }
        if (document.isActive) {
            const scopeFilter = entityId
                ? { entity: entityId }
                : { $or: [{ entity: { $exists: false } }, { entity: null }] };
            await this.taxConfigModel.updateMany({ ...scopeFilter, _id: { $ne: document._id } }, { $set: { isActive: false } });
        }
        const plain = typeof document.toObject === 'function' ? document.toObject() : document;
        return {
            status: 200,
            data: plain,
        };
    }
};
exports.PayrollTaxService = PayrollTaxService;
exports.PayrollTaxService = PayrollTaxService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(tax_config_schema_1.TaxConfig.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PayrollTaxService);
//# sourceMappingURL=payroll-tax.service.js.map