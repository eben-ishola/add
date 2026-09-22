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
exports.IncentivesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const active_saver_schema_1 = require("../../schemas/active-saver.schema");
const budget_schema_1 = require("../../schemas/budget.schema");
const case_load_schema_1 = require("../../schemas/case-load.schema");
const daily_mobilization_schema_1 = require("../../schemas/daily-mobilization.schema");
const dmo_target_schema_1 = require("../../schemas/dmo-target.schema");
const dmo_incentive_schema_1 = require("../../schemas/dmo-incentive.schema");
const product_category_schema_1 = require("../../schemas/product-category.schema");
const roIncentive_schema_1 = require("../../schemas/roIncentive.schema");
const user_schema_1 = require("../../schemas/user.schema");
const visitation_schema_1 = require("../../schemas/visitation.schema");
const clampNumber = (value, min, max) => Math.min(Math.max(value, min), max);
const parseDateValue = (value) => {
    if (!value)
        return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const clampYear = (value, fallback) => {
    const year = Number(value);
    if (!Number.isFinite(year) || year < 1970)
        return fallback;
    return Math.round(year);
};
const clampMonth = (value, fallback) => {
    const month = Number(value);
    if (!Number.isFinite(month) || month < 1 || month > 12)
        return fallback;
    return Math.round(month);
};
const clampQuarter = (value, fallback) => {
    const quarter = Number(value);
    if (!Number.isFinite(quarter) || quarter < 1 || quarter > 4)
        return fallback;
    return Math.round(quarter);
};
const normalizeString = (value) => value === null || value === undefined ? '' : String(value).trim();
const isObjectIdValue = (value) => /^[a-f0-9]{24}$/i.test(value) && mongoose_2.Types.ObjectId.isValid(value);
const uniqueStrings = (values) => Array.from(new Set(values
    .map((value) => normalizeString(value))
    .filter((value) => value.length > 0)));
const resolveGroupSource = (value) => {
    const normalized = normalizeString(value).toLowerCase();
    if (!normalized)
        return null;
    if (/\bdmo\b/.test(normalized))
        return 'dmo';
    if (/\bro\b/.test(normalized))
        return 'ro';
    if (normalized.includes('saving'))
        return 'dmo';
    if (normalized.includes('retail'))
        return 'ro';
    if (normalized.includes('enterprise'))
        return 'ro';
    if (/\bsme\b/.test(normalized))
        return 'ro';
    return null;
};
const resolveGroupLabel = (value) => {
    const normalized = normalizeString(value);
    if (!normalized)
        return '';
    const lowered = normalized.toLowerCase();
    if (lowered === 'all')
        return '';
    return normalized;
};
const resolvePeriodRange = (query) => {
    const rawPeriod = String(query?.period ?? query?.frequency ?? '').toLowerCase();
    if (!rawPeriod)
        return null;
    const now = new Date();
    const fallbackYear = now.getFullYear();
    const fallbackMonth = now.getMonth() + 1;
    const fallbackQuarter = Math.floor(now.getMonth() / 3) + 1;
    if (rawPeriod.startsWith('month')) {
        const year = clampYear(query?.year, fallbackYear);
        const month = clampMonth(query?.month, fallbackMonth);
        const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
        const end = new Date(year, month, 0, 23, 59, 59, 999);
        return { start, end };
    }
    if (rawPeriod.startsWith('quart')) {
        const year = clampYear(query?.year, fallbackYear);
        const quarter = clampQuarter(query?.quarter ?? query?.q, fallbackQuarter);
        const startMonth = (quarter - 1) * 3;
        const start = new Date(year, startMonth, 1, 0, 0, 0, 0);
        const end = new Date(year, startMonth + 3, 0, 23, 59, 59, 999);
        return { start, end };
    }
    return null;
};
let IncentivesService = class IncentivesService {
    constructor(roIncentiveModel, dmoIncentiveModel, userModel, productCategoryModel, caseLoadModel, dmoTargetModel, activeSaverModel, dailyMobilizationModel, visitationModel, budgetModel) {
        this.roIncentiveModel = roIncentiveModel;
        this.dmoIncentiveModel = dmoIncentiveModel;
        this.userModel = userModel;
        this.productCategoryModel = productCategoryModel;
        this.caseLoadModel = caseLoadModel;
        this.dmoTargetModel = dmoTargetModel;
        this.activeSaverModel = activeSaverModel;
        this.dailyMobilizationModel = dailyMobilizationModel;
        this.visitationModel = visitationModel;
        this.budgetModel = budgetModel;
    }
    async resolveGroupHints(query) {
        const hints = [];
        const directHints = uniqueStrings([
            query?.group,
            query?.groupName,
            query?.unitGroup,
            query?.departmentGroup,
            query?.unitName,
            query?.departmentName,
        ]);
        hints.push(...directHints);
        const unitValue = normalizeString(query?.unit) ||
            normalizeString(query?.department) ||
            normalizeString(query?.dept);
        if (unitValue)
            hints.push(unitValue);
        return uniqueStrings(hints);
    }
    async resolveIncentiveSource(query) {
        const hints = await this.resolveGroupHints(query);
        for (const hint of hints) {
            const source = resolveGroupSource(hint);
            if (source)
                return source;
        }
        const explicitHints = uniqueStrings([
            query?.source,
            query?.incentiveType,
            query?.type,
            query?.mode,
        ]);
        for (const hint of explicitHints) {
            const source = resolveGroupSource(hint);
            if (source)
                return source;
        }
        return null;
    }
    buildGroupMatchConditions(query) {
        const groupValue = resolveGroupLabel(query?.group ?? query?.groupName ?? query?.segment ?? query?.category);
        if (!groupValue)
            return null;
        if (isObjectIdValue(groupValue))
            return null;
        const groupSource = resolveGroupSource(groupValue);
        if (groupSource === 'dmo') {
            return null;
        }
        const rx = new RegExp(`^${escapeRegExp(groupValue)}$`, 'i');
        return [
            { group: rx },
            { GROUP: rx },
            { groupName: rx },
            { GROUP_NAME: rx },
            { segment: rx },
            { SEGMENT: rx },
            { category: rx },
            { CATEGORY: rx },
            { businessUnit: rx },
            { BUSINESS_UNIT: rx },
            { unitGroup: rx },
            { departmentGroup: rx },
        ];
    }
    resolveUnitId(query) {
        const unitValue = normalizeString(query?.unit) ||
            normalizeString(query?.department) ||
            normalizeString(query?.dept) ||
            normalizeString(query?.groupId);
        if (unitValue)
            return unitValue;
        const groupValue = normalizeString(query?.group);
        return isObjectIdValue(groupValue) ? groupValue : '';
    }
    resolveEntityId(query) {
        const entityValue = normalizeString(query?.entity);
        return entityValue && isObjectIdValue(entityValue) ? entityValue : '';
    }
    buildOrbitIdMatchConditions(orbitIds, includeOrbitFields = true) {
        const rawIds = uniqueStrings(orbitIds);
        if (!rawIds.length)
            return null;
        const numericIds = rawIds
            .filter((value) => /^\d+$/.test(value))
            .map((value) => Number(value))
            .filter((value) => Number.isFinite(value));
        const values = [...rawIds, ...numericIds];
        const conditions = [{ USER_ID: { $in: values } }];
        if (includeOrbitFields) {
            conditions.push({ orbitID: { $in: rawIds } });
            conditions.push({ orbitId: { $in: rawIds } });
        }
        return conditions;
    }
    async resolveOrbitIdsForUnit(query) {
        const unitId = this.resolveUnitId(query);
        if (!unitId || !isObjectIdValue(unitId))
            return null;
        const entityId = this.resolveEntityId(query);
        const staffFilter = {
            $or: [{ department: unitId }, { businessUnit: unitId }],
        };
        if (entityId) {
            staffFilter.entity = entityId;
        }
        const staffRows = await this.userModel
            .find(staffFilter)
            .select('orbitID')
            .lean()
            .exec();
        return uniqueStrings(staffRows.map((staff) => staff?.orbitID));
    }
    async buildUnitMatchConditions(query) {
        const unitValue = this.resolveUnitId(query);
        if (!unitValue)
            return null;
        if (isObjectIdValue(unitValue)) {
            const objectId = new mongoose_2.Types.ObjectId(unitValue);
            return [
                { unitId: unitValue },
                { unitId: objectId },
                { departmentId: unitValue },
                { departmentId: objectId },
            ];
        }
        const orConditions = [];
        const unitRegex = new RegExp(`^${escapeRegExp(unitValue)}$`, 'i');
        orConditions.push({ unit: unitRegex });
        orConditions.push({ UNIT: unitRegex });
        orConditions.push({ unitName: unitRegex });
        orConditions.push({ department: unitRegex });
        orConditions.push({ DEPARTMENT: unitRegex });
        orConditions.push({ departmentName: unitRegex });
        orConditions.push({ unitId: unitValue });
        orConditions.push({ departmentId: unitValue });
        return orConditions;
    }
    mergeOrFilter(filter, orConditions) {
        if (!orConditions.length)
            return;
        if (filter.$or) {
            const existing = filter.$or;
            delete filter.$or;
            filter.$and = [...(filter.$and ?? []), { $or: existing }, { $or: orConditions }];
            return;
        }
        if (filter.$and) {
            filter.$and.push({ $or: orConditions });
            return;
        }
        filter.$or = orConditions;
    }
    async getIncentivesByGroup(query) {
        const resolvedSource = await this.resolveIncentiveSource(query);
        const source = resolvedSource ?? 'ro';
        const response = source === 'dmo'
            ? await this.getDmoIncentives(query)
            : await this.getRoIncentives(query);
        return { ...response, source };
    }
    async getRoIncentives(query) {
        const filter = {};
        const mode = normalizeString(query?.mode ?? query?.type);
        if (mode) {
            filter.MODE = { $regex: new RegExp(`^${escapeRegExp(mode)}$`, 'i') };
        }
        else {
            const periodHint = String(query?.period ?? query?.frequency ?? '').toLowerCase();
            if (periodHint.startsWith('month')) {
                filter.MODE = { $regex: /month/i };
            }
            else if (periodHint.startsWith('quart')) {
                filter.MODE = { $regex: /quart/i };
            }
        }
        const startDate = parseDateValue(query?.startDate);
        const endDate = parseDateValue(query?.endDate);
        if (startDate || endDate) {
            filter.FOR_MONTH = {
                ...(startDate ? { $gte: startDate } : {}),
                ...(endDate ? { $lte: endDate } : {}),
            };
        }
        else {
            const periodRange = resolvePeriodRange(query);
            if (periodRange) {
                filter.FOR_MONTH = {
                    $gte: periodRange.start,
                    $lte: periodRange.end,
                };
            }
        }
        const orbitIds = await this.resolveOrbitIdsForUnit(query);
        const unitConditions = await this.buildUnitMatchConditions(query);
        const groupConditions = this.buildGroupMatchConditions(query);
        const orbitConditions = orbitIds?.length
            ? this.buildOrbitIdMatchConditions(orbitIds, true)
            : null;
        const combinedConditions = [
            ...(orbitConditions ?? []),
            ...(unitConditions ?? []),
            ...(groupConditions ?? []),
        ];
        const hasUnitFilter = Boolean(normalizeString(query?.unit) ||
            normalizeString(query?.department) ||
            normalizeString(query?.dept) ||
            normalizeString(query?.group) ||
            normalizeString(query?.groupId));
        if (hasUnitFilter && combinedConditions.length === 0) {
            return { data: [] };
        }
        if (combinedConditions.length) {
            this.mergeOrFilter(filter, combinedConditions);
        }
        const limitValue = Number(query?.limit ?? 200);
        const limit = clampNumber(Number.isFinite(limitValue) ? limitValue : 200, 1, 2000);
        const records = await this.roIncentiveModel
            .find(filter)
            .sort({ FOR_MONTH: -1 })
            .limit(limit)
            .lean()
            .exec();
        return { data: records };
    }
    async getDmoIncentives(query) {
        const filter = {};
        const mode = normalizeString(query?.mode ?? query?.type);
        if (mode) {
            filter.MODE = { $regex: new RegExp(`^${escapeRegExp(mode)}$`, 'i') };
        }
        const startDate = parseDateValue(query?.startDate);
        const endDate = parseDateValue(query?.endDate);
        const periodRange = !startDate && !endDate ? resolvePeriodRange(query) : null;
        if (startDate || endDate || periodRange) {
            const range = {};
            const rangeStart = startDate ?? periodRange?.start;
            const rangeEnd = endDate ?? periodRange?.end;
            if (rangeStart) {
                range.$gte = rangeStart;
            }
            if (rangeEnd) {
                range.$lte = rangeEnd;
            }
            filter.$or = [
                { FOR_MONTH: range },
                { forMonth: range },
                { date: range },
                { createdAt: range },
            ];
        }
        const orbitIds = await this.resolveOrbitIdsForUnit(query);
        const unitConditions = await this.buildUnitMatchConditions(query);
        const groupConditions = this.buildGroupMatchConditions(query);
        const orbitConditions = orbitIds?.length
            ? this.buildOrbitIdMatchConditions(orbitIds, true)
            : null;
        const combinedConditions = [
            ...(orbitConditions ?? []),
            ...(unitConditions ?? []),
            ...(groupConditions ?? []),
        ];
        const hasUnitFilter = Boolean(normalizeString(query?.unit) ||
            normalizeString(query?.department) ||
            normalizeString(query?.dept) ||
            normalizeString(query?.group) ||
            normalizeString(query?.groupId));
        if (hasUnitFilter && combinedConditions.length === 0) {
            return { data: [] };
        }
        if (combinedConditions.length) {
            this.mergeOrFilter(filter, combinedConditions);
        }
        const limitValue = Number(query?.limit ?? 200);
        const limit = clampNumber(Number.isFinite(limitValue) ? limitValue : 200, 1, 2000);
        const records = await this.dmoIncentiveModel
            .find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()
            .exec();
        return { data: records };
    }
    async getProductCategories() {
        const records = await this.productCategoryModel.find().lean().exec();
        return { data: records };
    }
    async getCaseLoads() {
        const records = await this.caseLoadModel.find().lean().exec();
        return { data: records };
    }
    async getDmoTargets() {
        const records = await this.dmoTargetModel.find().lean().exec();
        return { data: records };
    }
    async getActiveSavers() {
        const records = await this.activeSaverModel.find().lean().exec();
        return { data: records };
    }
    async getDailyMobilizations() {
        const records = await this.dailyMobilizationModel.find().lean().exec();
        return { data: records };
    }
    async getVisitations() {
        const records = await this.visitationModel.find().lean().exec();
        return { data: records };
    }
    async getBudgets(type) {
        const normalized = String(type ?? '').trim();
        const filter = normalized
            ? { type: { $regex: new RegExp(`^${escapeRegExp(normalized)}$`, 'i') } }
            : {};
        const records = await this.budgetModel.find(filter).lean().exec();
        return { data: records };
    }
};
exports.IncentivesService = IncentivesService;
exports.IncentivesService = IncentivesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(roIncentive_schema_1.ROIncentive.name, 'incentives')),
    __param(1, (0, mongoose_1.InjectModel)(dmo_incentive_schema_1.DMOIncentive.name, 'incentives')),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(3, (0, mongoose_1.InjectModel)(product_category_schema_1.ProductCategory.name, 'savings')),
    __param(4, (0, mongoose_1.InjectModel)(case_load_schema_1.CaseLoad.name, 'savings')),
    __param(5, (0, mongoose_1.InjectModel)(dmo_target_schema_1.DMOTarget.name, 'savings')),
    __param(6, (0, mongoose_1.InjectModel)(active_saver_schema_1.ActiveSaver.name, 'savings')),
    __param(7, (0, mongoose_1.InjectModel)(daily_mobilization_schema_1.DailyMobilization.name, 'savings')),
    __param(8, (0, mongoose_1.InjectModel)(visitation_schema_1.Visitation.name, 'savings')),
    __param(9, (0, mongoose_1.InjectModel)(budget_schema_1.Budget.name, 'savings')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], IncentivesService);
//# sourceMappingURL=incentives.service.js.map