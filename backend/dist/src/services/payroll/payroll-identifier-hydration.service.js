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
exports.PayrollIdentifierHydrationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../../schemas/user.schema");
const payroll_identity_util_1 = require("../../utils/payroll/payroll-identity.util");
const payroll_approval_data_util_1 = require("../../utils/payroll/payroll-approval-data.util");
const payroll_row_util_1 = require("../../utils/payroll/payroll-row.util");
let PayrollIdentifierHydrationService = class PayrollIdentifierHydrationService {
    constructor(staffModel) {
        this.staffModel = staffModel;
    }
    async hydratePayrollRowIdentifiers(rows, entity, handlers) {
        if (!Array.isArray(rows) || rows.length === 0) {
            return { rows: rows ?? [], changed: false };
        }
        const entityId = await this.resolveEntityId(entity, handlers);
        if (!entityId) {
            return { rows, changed: false };
        }
        const staffRows = await this.staffModel
            .find((0, payroll_identity_util_1.buildProcessedPayrollEntityMatch)(entityId))
            .select('_id staffId employeeInformation')
            .lean()
            .exec();
        if (!staffRows.length) {
            return { rows, changed: false };
        }
        const staffLookup = this.buildStaffLookup(staffRows);
        let changed = false;
        const updatedRows = rows.map((row) => {
            if (!row || typeof row !== 'object')
                return row;
            const rowType = String(row?.type ?? '').toLowerCase();
            const staff = this.resolveStaffForRow(row, staffLookup);
            const rowDetail = row?.accountDetail ?? row?.employeeInformation?.accountDetail ?? {};
            const staffDetail = staff?.employeeInformation?.accountDetail ?? {};
            const resolvedPension = this.normalizePayrollText(staffDetail?.pensionAccount ??
                staffDetail?.rsaNumber ??
                staff?.employeeInformation?.pensionAccount ??
                staff?.employeeInformation?.rsaNumber) ??
                this.normalizePayrollText(row?.pensionAccount ??
                    row?.rsaNumber ??
                    row?.rsaPin ??
                    row?.rsa ??
                    rowDetail?.pensionAccount ??
                    rowDetail?.rsaNumber);
            const resolvedNhf = this.normalizePayrollText(staffDetail?.nhfAccount ??
                staffDetail?.nhf ??
                staff?.employeeInformation?.nhfAccount ??
                staff?.employeeInformation?.nhf) ??
                this.normalizePayrollText(row?.nhfAccount ??
                    row?.nhfNumber ??
                    row?.nhfNo ??
                    row?.nhfPin ??
                    row?.nhf ??
                    rowDetail?.nhfAccount ??
                    rowDetail?.nhf);
            const resolvedPaye = this.normalizePayrollText(staffDetail?.payeAccount ??
                staffDetail?.taxProfileId ??
                staff?.employeeInformation?.payeAccount ??
                staff?.employeeInformation?.taxProfileId) ??
                this.normalizePayrollText(row?.payeAccount ??
                    row?.taxProfileId ??
                    row?.taxId ??
                    row?.taxID ??
                    row?.paye ??
                    rowDetail?.payeAccount ??
                    rowDetail?.taxProfileId);
            const next = { ...row };
            const canUpdatePension = !rowType || ['salary', 'pension', 'companypension'].includes(rowType);
            const canUpdateNhf = !rowType || ['salary', 'nhf'].includes(rowType);
            const canUpdatePaye = !rowType || ['salary', 'paye'].includes(rowType);
            if (canUpdatePension &&
                resolvedPension &&
                this.normalizePayrollText(row?.pensionAccount) !== resolvedPension) {
                next.pensionAccount = resolvedPension;
                changed = true;
            }
            if (canUpdatePension &&
                resolvedPension &&
                this.normalizePayrollText(row?.rsaNumber) !== resolvedPension) {
                next.rsaNumber = resolvedPension;
                changed = true;
            }
            if (canUpdateNhf &&
                resolvedNhf &&
                this.normalizePayrollText(row?.nhfAccount) !== resolvedNhf) {
                next.nhfAccount = resolvedNhf;
                changed = true;
            }
            if (canUpdatePaye &&
                resolvedPaye &&
                this.normalizePayrollText(row?.payeAccount) !== resolvedPaye) {
                next.payeAccount = resolvedPaye;
                changed = true;
            }
            if (canUpdatePaye &&
                resolvedPaye &&
                this.normalizePayrollText(row?.taxId) !== resolvedPaye) {
                next.taxId = resolvedPaye;
                changed = true;
            }
            if (canUpdatePaye &&
                resolvedPaye &&
                this.normalizePayrollText(row?.taxID) !== resolvedPaye) {
                next.taxID = resolvedPaye;
                changed = true;
            }
            if (canUpdatePaye &&
                resolvedPaye &&
                this.normalizePayrollText(row?.taxProfileId) !== resolvedPaye) {
                next.taxProfileId = resolvedPaye;
                changed = true;
            }
            return next;
        });
        return { rows: updatedRows, changed };
    }
    async refreshPayrollApprovalIdentifiers(approval, handlers) {
        const rawRows = Array.isArray(approval?.data)
            ? approval.data
            : (0, payroll_approval_data_util_1.resolvePayrollApprovalRows)(approval?.data);
        if (!rawRows.length)
            return false;
        const { rows: updatedRows, changed } = await this.hydratePayrollRowIdentifiers(rawRows, approval.entity, handlers);
        if (changed) {
            approval.data = updatedRows;
            approval.markModified('data');
        }
        return changed;
    }
    async resolveEntityId(entity, handlers) {
        try {
            return await handlers.normalizeEntityIdStrict(entity);
        }
        catch {
            return (0, payroll_identity_util_1.resolvePayrollEntityId)(entity);
        }
    }
    buildStaffLookup(staffRows) {
        const staffLookup = new Map();
        const registerKey = (value, staff) => {
            if (value === null || value === undefined)
                return;
            const key = String(value).trim();
            if (!key)
                return;
            if (!staffLookup.has(key)) {
                staffLookup.set(key, staff);
            }
            const lower = key.toLowerCase();
            if (!staffLookup.has(lower)) {
                staffLookup.set(lower, staff);
            }
        };
        staffRows.forEach((staff) => {
            registerKey(staff?._id, staff);
            registerKey(staff?.id, staff);
            registerKey(staff?.staffId, staff);
        });
        return staffLookup;
    }
    resolveStaffForRow(row, staffLookup) {
        const candidates = [
            row?.staffId,
            row?.staffID,
            row?.staffObjectId,
            row?.employeeId,
            row?.userId,
            row?.userID,
            row?.id,
            row?._id,
        ];
        for (const candidate of candidates) {
            if (candidate === null || candidate === undefined)
                continue;
            const key = String(candidate).trim();
            if (!key)
                continue;
            const direct = staffLookup.get(key);
            if (direct)
                return direct;
            const lowerMatch = staffLookup.get(key.toLowerCase());
            if (lowerMatch)
                return lowerMatch;
        }
        return null;
    }
    normalizePayrollText(value) {
        return (0, payroll_row_util_1.normalizePayrollTextValue)(value);
    }
};
exports.PayrollIdentifierHydrationService = PayrollIdentifierHydrationService;
exports.PayrollIdentifierHydrationService = PayrollIdentifierHydrationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PayrollIdentifierHydrationService);
//# sourceMappingURL=payroll-identifier-hydration.service.js.map