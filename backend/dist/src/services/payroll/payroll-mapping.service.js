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
exports.PayrollMappingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const subsidiary_service_1 = require("../org/subsidiary.service");
const payroll_calculation_util_1 = require("../../utils/payroll/payroll-calculation.util");
const payroll_identity_util_1 = require("../../utils/payroll/payroll-identity.util");
let PayrollMappingService = class PayrollMappingService {
    constructor(payrollMapModel, entityService) {
        this.payrollMapModel = payrollMapModel;
        this.entityService = entityService;
    }
    async normalizeEntityIdStrict(value) {
        const resolved = (0, payroll_identity_util_1.resolvePayrollEntityId)(value);
        if (!resolved) {
            throw new common_1.BadRequestException('Entity is required');
        }
        const normalized = String(resolved).trim();
        if (mongoose_2.Types.ObjectId.isValid(normalized)) {
            return new mongoose_2.Types.ObjectId(normalized).toHexString();
        }
        const entity = await this.entityService.getSubsidiaryByShort(normalized).catch(() => null);
        if (entity?._id) {
            return String(entity._id);
        }
        throw new common_1.BadRequestException('Entity is required');
    }
    async mapPayroll(payload) {
        try {
            const rawEntity = payload?.entity ?? payload?.entityShort;
            const rawLevel = payload?.level;
            if (!rawEntity || !rawLevel) {
                return { status: 400, message: 'Entity and level are required' };
            }
            const level = String(rawLevel).trim();
            if (!level) {
                return { status: 400, message: 'Level is required' };
            }
            let entityId;
            try {
                entityId = await this.normalizeEntityIdStrict(rawEntity);
            }
            catch {
                return { status: 400, message: 'Entity is required' };
            }
            const entityObjectId = new mongoose_2.Types.ObjectId(entityId);
            const hasAmount = payload?.amount !== undefined &&
                payload?.amount !== null &&
                String(payload.amount).trim() !== '';
            const hasAfta = Object.prototype.hasOwnProperty.call(payload ?? {}, 'afta');
            const updatePayload = {};
            if (hasAmount) {
                const amountValue = (0, payroll_calculation_util_1.ensurePayrollNumber)(payload.amount, NaN);
                if (!Number.isFinite(amountValue)) {
                    return { status: 400, message: 'Amount must be a number' };
                }
                updatePayload.amount = amountValue;
            }
            if (hasAfta) {
                updatePayload.afta = (0, payroll_calculation_util_1.ensurePayrollNumber)(payload?.afta, 0);
            }
            if (payload._id) {
                if (!Object.keys(updatePayload).length) {
                    return { status: 400, message: 'No update fields provided' };
                }
                await this.payrollMapModel.updateOne({ _id: payload._id }, { $set: { ...updatePayload, level, entity: entityObjectId } });
                return { status: 200, message: 'Updated by _id' };
            }
            const entityQuery = {
                $or: [{ entity: entityId }, { entity: entityObjectId }],
            };
            const existing = await this.payrollMapModel.findOne({
                level,
                ...entityQuery,
            });
            if (existing) {
                if (!Object.keys(updatePayload).length) {
                    return { status: 400, message: 'No update fields provided' };
                }
                await this.payrollMapModel.updateOne({ _id: existing._id }, { $set: updatePayload });
                return {
                    status: 200,
                    message: 'Updated existing (entity + level)',
                };
            }
            if (!hasAmount) {
                return { status: 400, message: 'Amount is required to create payroll mapping' };
            }
            const mappingPayload = {
                level,
                entity: entityObjectId,
                amount: updatePayload.amount,
            };
            if (hasAfta) {
                mappingPayload.afta = updatePayload.afta;
            }
            const created = await this.payrollMapModel.create(mappingPayload);
            return {
                status: 200,
                message: 'Created new payroll mapping',
                data: created,
            };
        }
        catch (error) {
            return { status: 500, message: error.message };
        }
    }
    async findMappingById(gradeLevel, entity) {
        return this.payrollMapModel.findOne({ _id: gradeLevel, entity }).exec();
    }
    async findMappingByLevel(gradeLevel, entity) {
        const entityId = await this.normalizeEntityIdStrict(entity);
        return this.payrollMapModel
            .findOne({
            level: gradeLevel,
            entity: new mongoose_2.Types.ObjectId(entityId),
        })
            .exec();
    }
    async findAllMap(page = 1, entity, limit) {
        try {
            const entityId = await this.normalizeEntityIdStrict(entity);
            const entityObjectId = new mongoose_2.Types.ObjectId(entityId);
            const query = {
                $or: [{ entity: entityId }, { entity: entityObjectId }],
            };
            const pageSize = limit && limit > 0 ? limit : 10;
            const skip = (page - 1) * pageSize;
            const [payrollData, totalItems] = await Promise.all([
                this.payrollMapModel.find(query).skip(skip).limit(pageSize).lean().exec(),
                this.payrollMapModel.countDocuments(query).exec(),
            ]);
            const response = await this.entityService.findSubsidiaryList();
            const subsidiaries = response.data ?? [];
            const subsidiaryDirectory = new Map();
            subsidiaries.forEach((sub) => {
                if (!sub)
                    return;
                const id = (0, payroll_identity_util_1.normalizePayrollEntityKey)(sub?._id);
                if (id) {
                    subsidiaryDirectory.set(id, sub);
                }
            });
            const updatedData = payrollData.map((payroll) => {
                const entityKey = (0, payroll_identity_util_1.normalizePayrollEntityKey)(payroll?.entity);
                if (entityKey) {
                    const match = subsidiaryDirectory.get(entityKey);
                    if (match) {
                        return {
                            ...payroll,
                            entity: match,
                        };
                    }
                }
                return payroll;
            });
            const totalPages = Math.ceil(totalItems / pageSize);
            return {
                status: 200,
                data: updatedData,
                totalItems,
                currentPage: page,
                totalPages,
            };
        }
        catch (error) {
            console.error('Error in findAllMap:', error);
            throw new Error('Failed to fetch payroll mappings');
        }
    }
};
exports.PayrollMappingService = PayrollMappingService;
exports.PayrollMappingService = PayrollMappingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('PayrollMap')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        subsidiary_service_1.SubsidiaryService])
], PayrollMappingService);
//# sourceMappingURL=payroll-mapping.service.js.map