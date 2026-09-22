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
exports.CompensationConfigService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const compensation_config_schema_1 = require("../../schemas/compensation-config.schema");
const access_control_util_1 = require("../../utils/shared/access-control.util");
const payroll_service_1 = require("../payroll/payroll.service");
let CompensationConfigService = class CompensationConfigService {
    constructor(configModel, payrollMapModel, payrollService) {
        this.configModel = configModel;
        this.payrollMapModel = payrollMapModel;
        this.payrollService = payrollService;
    }
    assertFinance(user) {
        if (!(0, access_control_util_1.userHasScope)(user, ['finance', 'group'])) {
            throw new common_1.ForbiddenException('Only finance can manage compensation configurations.');
        }
    }
    normalizeEntityId(value) {
        const raw = String(value ?? '').trim();
        if (!raw || !mongoose_2.default.Types.ObjectId.isValid(raw)) {
            throw new common_1.BadRequestException('A valid entity is required.');
        }
        return new mongoose_2.default.Types.ObjectId(raw).toHexString();
    }
    normalizeIdList(items) {
        if (!Array.isArray(items))
            return [];
        return Array.from(new Set(items
            .map((value) => String(value ?? '').trim())
            .filter((value) => value &&
            value.toLowerCase() !== 'null' &&
            value.toLowerCase() !== 'undefined')));
    }
    buildUpdate(payload) {
        const title = String(payload?.title ?? '').trim();
        if (!title)
            throw new common_1.BadRequestException('A payment title is required.');
        const valueType = String(payload?.valueType ?? '').trim();
        if (!compensation_config_schema_1.COMPENSATION_VALUE_TYPES.includes(valueType)) {
            throw new common_1.BadRequestException('A valid value type is required.');
        }
        const update = {
            title,
            glCode: String(payload?.glCode ?? '').trim(),
            valueType,
            globalAmount: 0,
            payType: null,
            percent: 0,
            percentBase: null,
            combinationComponents: [],
        };
        if (valueType === 'global') {
            const amount = Number(payload?.globalAmount);
            if (!Number.isFinite(amount) || amount < 0) {
                throw new common_1.BadRequestException('A valid global amount is required.');
            }
            update.globalAmount = amount;
        }
        else {
            const payType = String(payload?.payType ?? '').trim();
            if (!compensation_config_schema_1.COMPENSATION_PAY_TYPES.includes(payType)) {
                throw new common_1.BadRequestException('A valid pay type is required.');
            }
            update.payType = payType;
            if (payType === 'percentage') {
                const percent = Number(payload?.percent);
                if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
                    throw new common_1.BadRequestException('Percentage must be between 0 and 100.');
                }
                update.percent = percent;
                const percentBase = String(payload?.percentBase ?? '').trim();
                if (!compensation_config_schema_1.COMPENSATION_PERCENT_BASES.includes(percentBase)) {
                    throw new common_1.BadRequestException('A valid percentage component is required.');
                }
                update.percentBase = percentBase;
                if (percentBase === 'combination') {
                    const combination = this.normalizeIdList(payload?.combinationComponents).filter((c) => compensation_config_schema_1.COMPENSATION_COMBINATION_COMPONENTS.includes(c));
                    if (!combination.length) {
                        throw new common_1.BadRequestException('Select at least one component for a combination.');
                    }
                    update.combinationComponents = combination;
                }
            }
        }
        const reviewerIds = this.normalizeIdList(payload?.reviewers);
        const approverIds = this.normalizeIdList(payload?.approvers);
        const postingIds = this.normalizeIdList(payload?.posters ?? payload?.postingIds);
        const auditViewerIds = this.normalizeIdList(payload?.auditViewers);
        if (!reviewerIds.length) {
            throw new common_1.BadRequestException('At least one reviewer must be selected.');
        }
        if (!approverIds.length) {
            throw new common_1.BadRequestException('At least one approver must be selected.');
        }
        if (!postingIds.length) {
            throw new common_1.BadRequestException('At least one poster must be selected.');
        }
        update.reviewerIds = reviewerIds;
        update.approverIds = approverIds;
        update.postingIds = postingIds;
        update.auditViewerIds = auditViewerIds;
        update.financeIds = this.normalizeIdList(payload?.finance ?? payload?.financeIds);
        if (payload?.active !== undefined)
            update.active = Boolean(payload.active);
        return update;
    }
    async list(user, entity) {
        this.assertFinance(user);
        const query = {};
        if (entity) {
            query.entity = new mongoose_2.default.Types.ObjectId(this.normalizeEntityId(entity));
        }
        const data = await this.configModel
            .find(query)
            .populate('entity', 'name short code')
            .sort({ title: 1 })
            .lean();
        return { status: 200, data };
    }
    async getById(user, id) {
        this.assertFinance(user);
        if (!mongoose_2.default.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid id.');
        }
        const config = await this.configModel
            .findById(id)
            .populate('entity', 'name short code')
            .lean();
        if (!config)
            throw new common_1.NotFoundException('Compensation config not found.');
        return { status: 200, data: config };
    }
    async save(user, payload) {
        this.assertFinance(user);
        const entityId = this.normalizeEntityId(payload?.entity);
        const update = this.buildUpdate(payload);
        update.entity = new mongoose_2.default.Types.ObjectId(entityId);
        const actorId = user?._id ?? user?.id ?? user?.userId;
        const filter = payload?.id && mongoose_2.default.Types.ObjectId.isValid(payload.id)
            ? { _id: new mongoose_2.default.Types.ObjectId(payload.id) }
            : { entity: update.entity, title: update.title };
        const existing = await this.configModel.findOne(filter);
        try {
            let config;
            if (existing) {
                Object.assign(existing, update);
                config = await existing.save();
            }
            else {
                config = await this.configModel.create({
                    ...update,
                    createdBy: actorId && mongoose_2.default.Types.ObjectId.isValid(String(actorId))
                        ? new mongoose_2.default.Types.ObjectId(String(actorId))
                        : undefined,
                });
            }
            const data = await this.configModel
                .findById(config._id)
                .populate('entity', 'name short code')
                .lean();
            return { status: 200, data };
        }
        catch (err) {
            if (err?.code === 11000) {
                throw new common_1.BadRequestException('A configuration with this title already exists for this entity.');
            }
            throw err;
        }
    }
    async computeAmounts(user, id, entity, staff) {
        this.assertFinance(user);
        if (!mongoose_2.default.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid id.');
        }
        const config = await this.configModel.findById(id).lean();
        if (!config) {
            throw new common_1.NotFoundException('Compensation config not found.');
        }
        const entityId = this.normalizeEntityId(entity);
        const round2 = (value) => Math.round((value || 0) * 100) / 100;
        const resolveAmount = (payroll) => {
            if (config.valueType === 'global') {
                return {
                    amount: round2(Number(config.globalAmount) || 0),
                    manual: false,
                };
            }
            if (!payroll) {
                return {
                    amount: 0,
                    manual: true,
                };
            }
            switch (config.payType) {
                case 'salary':
                    return {
                        amount: round2(payroll.gross),
                        manual: false,
                    };
                case 'reimbursable':
                    return {
                        amount: round2(payroll.monthlyReimbursable),
                        manual: false,
                    };
                case 'bank_performance':
                    return {
                        amount: round2(payroll.monthlyVariable / 2),
                        manual: false,
                    };
                case 'individual_performance':
                    return {
                        amount: round2(payroll.monthlyVariable / 2),
                        manual: true,
                    };
                case 'percentage': {
                    const percent = Number(config.percent) || 0;
                    let base = 0;
                    switch (config.percentBase) {
                        case 'gross':
                            base = payroll.gross / 12;
                            break;
                        case 'net':
                            base = payroll.monthlyNet;
                            break;
                        case 'basic':
                        case 'housing':
                        case 'transport':
                            base = Number(payroll[config.percentBase]) || 0;
                            break;
                        case 'combination':
                            base = (config.combinationComponents ?? []).reduce((sum, component) => sum + (Number(payroll[component]) || 0), 0);
                            break;
                        default:
                            base = 0;
                    }
                    return {
                        amount: round2((base * percent) / 100),
                        manual: false,
                    };
                }
                default:
                    return {
                        amount: 0,
                        manual: true,
                    };
            }
        };
        const payrollByLevel = new Map();
        const getPayroll = async (levelName) => {
            const key = String(levelName ?? '').trim().toLowerCase();
            if (payrollByLevel.has(key)) {
                return payrollByLevel.get(key);
            }
            const gross = await this.payrollService.getInitialGrossPay(levelName, entityId);
            let payroll = null;
            if (config.payType === 'percentage' &&
                config.percentBase === 'gross') {
                payroll = {
                    gross,
                };
            }
            else if (config.payType === 'salary') {
                payroll = {
                    gross,
                };
            }
            else if (gross > 0) {
                payroll = await this.payrollService.calculatePayroll(gross, entityId, null);
            }
            payrollByLevel.set(key, payroll);
            return payroll;
        };
        const data = [];
        for (const entry of staff ?? []) {
            let payroll = null;
            if (config.valueType !== 'global') {
                payroll = await getPayroll(entry.levelName ?? '');
            }
            const { amount, manual } = resolveAmount(payroll);
            data.push({
                userId: String(entry.userId ?? ''),
                amount,
                manual,
            });
        }
        return {
            status: 200,
            data,
        };
    }
    async remove(user, id) {
        this.assertFinance(user);
        if (!mongoose_2.default.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid id.');
        }
        const deleted = await this.configModel.findByIdAndDelete(id);
        if (!deleted)
            throw new common_1.NotFoundException('Compensation config not found.');
        return { status: 200, message: 'Compensation config deleted.' };
    }
};
exports.CompensationConfigService = CompensationConfigService;
exports.CompensationConfigService = CompensationConfigService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(compensation_config_schema_1.CompensationConfig.name)),
    __param(1, (0, mongoose_1.InjectModel)('PayrollMap')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        payroll_service_1.PayrollService])
], CompensationConfigService);
//# sourceMappingURL=compensation-config.service.js.map