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
exports.PayrollPerformanceService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const payroll_performance_schema_1 = require("../../schemas/payroll-performance.schema");
const user_service_1 = require("../user/user.service");
const subsidiary_service_1 = require("../org/subsidiary.service");
const payroll_attendance_util_1 = require("../../utils/payroll/payroll-attendance.util");
const payroll_period_util_1 = require("../../utils/payroll/payroll-period.util");
const payroll_identity_util_1 = require("../../utils/payroll/payroll-identity.util");
let PayrollPerformanceService = class PayrollPerformanceService {
    constructor(payrollPerformanceModel, staffService, entityService) {
        this.payrollPerformanceModel = payrollPerformanceModel;
        this.staffService = staffService;
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
    async loadPerformanceScoreLookup(entityId, periodKey) {
        if (!periodKey)
            return new Map();
        const query = { periodKey };
        if (entityId) {
            Object.assign(query, (0, payroll_identity_util_1.buildProcessedPayrollEntityMatch)(entityId));
        }
        const records = await this.payrollPerformanceModel.find(query).lean().exec();
        const lookup = new Map();
        records.forEach((record) => {
            const score = (0, payroll_attendance_util_1.parsePayrollPerformanceScore)(record?.score);
            if (score === null)
                return;
            const register = (value) => {
                if (!value)
                    return;
                const key = String(value).trim();
                if (key) {
                    lookup.set(key, score);
                }
            };
            register(record?.staffId);
            register(record?.employeeId);
            register(record?.userId);
        });
        return lookup;
    }
    async savePayrollPerformance(payload) {
        const records = Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.records)
                ? payload.records
                : payload
                    ? [payload]
                    : [];
        if (!records.length) {
            throw new common_1.BadRequestException('No performance records provided.');
        }
        const fallbackMonth = payload?.month ?? payload?.period ?? payload?.periodKey;
        let fallbackEntity = null;
        if (payload?.entity) {
            fallbackEntity = await this.normalizeEntityIdStrict(payload.entity).catch(() => null);
        }
        const errors = [];
        const operations = [];
        for (let index = 0; index < records.length; index += 1) {
            const entry = records[index] ?? {};
            const rowNumber = index + 1;
            const staffId = String(entry?.staffId ?? entry?.employeeId ?? entry?.userId ?? '').trim();
            if (!staffId) {
                errors.push({ row: rowNumber, error: 'Missing staffId.' });
                continue;
            }
            const rawScore = entry?.score ?? entry?.performanceScore ?? entry?.rating;
            const score = (0, payroll_attendance_util_1.parsePayrollPerformanceScore)(rawScore);
            if (score === null) {
                errors.push({
                    row: rowNumber,
                    staffId,
                    error: 'Score must be a number between 0 and 100.',
                });
                continue;
            }
            const periodInput = entry?.month ?? entry?.period ?? entry?.periodKey ?? fallbackMonth;
            if (!periodInput) {
                errors.push({ row: rowNumber, staffId, error: 'Month is required.' });
                continue;
            }
            let periodKey = '';
            let periodLabel = '';
            let periodDate = null;
            try {
                const resolved = (0, payroll_period_util_1.resolvePerformancePeriod)(periodInput);
                periodKey = resolved.periodKey;
                periodLabel = resolved.periodLabel;
                periodDate = resolved.periodDate;
            }
            catch (error) {
                errors.push({
                    row: rowNumber,
                    staffId,
                    error: error?.message || 'Invalid month.',
                });
                continue;
            }
            let entityId = (0, payroll_identity_util_1.resolvePayrollEntityId)(entry?.entity) ?? fallbackEntity ?? null;
            let employeeId;
            let userId;
            if (!entityId) {
                const staff = await this.staffService.getStaffById(staffId).catch(() => null);
                if (staff) {
                    entityId = (0, payroll_identity_util_1.normalizePayrollEntityKey)(staff?.entity) ?? null;
                    employeeId = staff?._id ? String(staff._id) : undefined;
                    userId = staff?.userId ? String(staff.userId) : undefined;
                }
            }
            else if (!mongoose_2.Types.ObjectId.isValid(entityId)) {
                entityId = await this.normalizeEntityIdStrict(entityId).catch(() => entityId);
            }
            if (entityId) {
                if (entry?.employeeId) {
                    employeeId = String(entry.employeeId).trim() || undefined;
                }
                if (entry?.userId) {
                    userId = String(entry.userId).trim() || undefined;
                }
            }
            if (!entityId) {
                errors.push({
                    row: rowNumber,
                    staffId,
                    error: 'Entity is required or could not be resolved from staffId.',
                });
                continue;
            }
            const update = {
                staffId,
                score,
                periodKey,
                periodLabel,
                periodDate,
                entity: entityId,
            };
            if (employeeId) {
                update.employeeId = employeeId;
            }
            if (userId) {
                update.userId = userId;
            }
            operations.push({
                updateOne: {
                    filter: { staffId, periodKey, entity: entityId },
                    update: { $set: update },
                    upsert: true,
                },
            });
        }
        if (!operations.length) {
            throw new common_1.BadRequestException('No valid performance records to save.');
        }
        await this.payrollPerformanceModel.bulkWrite(operations, { ordered: false });
        return {
            status: 200,
            message: 'Performance scores saved.',
            processed: operations.length,
            errors,
        };
    }
    async getPayrollPerformance(entity, month, staffId) {
        const { periodKey, periodLabel } = (0, payroll_period_util_1.resolvePerformancePeriod)(month);
        const query = { periodKey };
        const entityId = (0, payroll_identity_util_1.resolvePayrollEntityId)(entity);
        if (entityId) {
            Object.assign(query, (0, payroll_identity_util_1.buildProcessedPayrollEntityMatch)(entityId));
        }
        if (staffId) {
            query.staffId = String(staffId).trim();
        }
        const data = await this.payrollPerformanceModel
            .find(query)
            .sort({ staffId: 1 })
            .lean()
            .exec();
        return {
            status: 200,
            periodKey,
            periodLabel,
            data,
        };
    }
};
exports.PayrollPerformanceService = PayrollPerformanceService;
exports.PayrollPerformanceService = PayrollPerformanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(payroll_performance_schema_1.PayrollPerformance.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        user_service_1.StaffService,
        subsidiary_service_1.SubsidiaryService])
], PayrollPerformanceService);
//# sourceMappingURL=payroll-performance.service.js.map