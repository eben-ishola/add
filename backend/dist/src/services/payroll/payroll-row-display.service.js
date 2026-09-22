"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollRowDisplayService = void 0;
const common_1 = require("@nestjs/common");
const payroll_calculation_util_1 = require("../../utils/payroll/payroll-calculation.util");
const payroll_identity_util_1 = require("../../utils/payroll/payroll-identity.util");
const payroll_row_util_1 = require("../../utils/payroll/payroll-row.util");
const payroll_proration_util_1 = require("../../utils/payroll/payroll-proration.util");
const payroll_display_util_1 = require("../../utils/payroll/payroll-display.util");
let PayrollRowDisplayService = class PayrollRowDisplayService {
    async buildApprovalDisplayData(rows, entity, periodDate, handlers) {
        if (!Array.isArray(rows) || !rows.length) {
            return { rows: [], types: [] };
        }
        const entityId = await handlers.normalizeEntityIdStrict(entity);
        const { workingDays, performanceBrackets } = await handlers.loadEntityPayrollSettings(entityId);
        const normalized = this.normalizePayrollData(rows, { workingDays, performanceBrackets })
            .map((row, index) => {
            const raw = rows[index];
            const hasExplicitProration = raw?.prorateValues !== undefined &&
                raw?.prorateValues !== null ||
                raw?.prorateBase !== undefined &&
                    raw?.prorateBase !== null ||
                raw?.proratePercent !== undefined &&
                    raw?.proratePercent !== null;
            return { ...row, __explicitProration: hasExplicitProration };
        });
        const expanded = this.expandApprovalDisplayRows(normalized, workingDays, performanceBrackets, periodDate);
        const types = Array.from(new Set(expanded.map((item) => item?.type).filter(Boolean)));
        return { rows: expanded, types };
    }
    normalizePayrollData(data, options) {
        if (!Array.isArray(data))
            return [];
        return data.map((item) => {
            const type = item.type || this.detectRowType(item);
            const workingDays = options?.workingDays ?? 30;
            const normalizeIdentifier = (value) => this.normalizePayrollText(value) ?? undefined;
            const pensionAccount = normalizeIdentifier(item?.pensionAccount ?? item?.rsaNumber ?? item?.rsaPin ?? item?.rsa);
            const pensionProvider = normalizeIdentifier(item?.pensionProvider ?? item?.pfaCode ?? item?.pfaName ?? item?.pfa);
            const nhfAccount = normalizeIdentifier(item?.nhfAccount ?? item?.nhfNumber ?? item?.nhfNo ?? item?.nhfPin);
            const payeAccount = normalizeIdentifier(item?.payeAccount ?? item?.taxProfileId ?? item?.taxId ?? item?.taxID);
            const prorateValues = this.toSafeNumber(item.prorateValues, workingDays);
            const prorateBase = this.toSafeNumber(item.prorateBase ?? item.totalDays ?? item.workingDays ?? workingDays, workingDays);
            const performanceScore = item.performanceScore !== undefined && item.performanceScore !== null
                ? this.toSafeNumber(item.performanceScore)
                : undefined;
            const resolvedPerformancePercent = type === 'variable'
                ? this.resolvePerformancePercent(performanceScore, options?.performanceBrackets)
                : undefined;
            const proratePercent = type === 'variable'
                ? this.normalizePercent(item.proratePercent ?? resolvedPerformancePercent ?? 100, 100)
                : undefined;
            return {
                ...item,
                type,
                pensionAccount,
                pensionProvider,
                nhfAccount,
                payeAccount,
                rsaNumber: normalizeIdentifier(item?.rsaNumber),
                rsaPin: normalizeIdentifier(item?.rsaPin),
                rsa: normalizeIdentifier(item?.rsa),
                taxId: normalizeIdentifier(item?.taxId ?? item?.taxID),
                prorateValues,
                prorateBase,
                performanceScore,
                performancePercent: type === 'variable' ? proratePercent : undefined,
                proratePercent,
                basic: this.toSafeNumber(item.basic),
                housing: this.toSafeNumber(item.housing),
                transport: this.toSafeNumber(item.transport),
                dress: this.toSafeNumber(item.dress),
                utilities: this.toSafeNumber(item.utilities),
                lunch: this.toSafeNumber(item.lunch),
                telephone: this.toSafeNumber(item.telephone),
                gross: this.toSafeNumber(item.gross),
                pension: this.toSafeNumber(item.pension),
                monthlyCompanyPension: this.toSafeNumber(item.monthlyCompanyPension ?? item.companyPension),
                nhf: this.toSafeNumber(item.nhf),
                paye: this.toSafeNumber(item.paye),
                amount: this.toSafeNumber(item.amount),
                monthlyNet: this.toSafeNumber(item.monthlyNet),
                loanDeduction: this.toSafeNumber(item.loanDeduction),
                reimbursable: this.toSafeNumber(item.reimbursable),
                variable: this.toSafeNumber(item.variable),
                ...(item?.netAdjustment !== undefined && item?.netAdjustment !== null
                    ? { netAdjustment: this.round(this.toSafeNumber(item.netAdjustment), 2) }
                    : {}),
                ...(item?.grossAdjustment !== undefined && item?.grossAdjustment !== null
                    ? { grossAdjustment: this.round(this.toSafeNumber(item.grossAdjustment), 2) }
                    : {}),
            };
        });
    }
    resolveNetAdjustment(row) {
        return this.round(this.toSafeNumber(row?.netAdjustment, 0), 2);
    }
    isNetAdjustmentApplied(row) {
        return (0, payroll_identity_util_1.parsePayrollBooleanFlag)(row?.netAdjustmentApplied);
    }
    applyProrationForDisplay(rows, workingDays, performanceBrackets, periodDate) {
        return rows.map((row) => {
            if (!row || typeof row !== 'object')
                return row;
            const type = row.type ?? this.detectRowType(row);
            const prorationType = type === 'bank' || type === 'individual' ? 'variable' : type;
            const proration = (0, payroll_proration_util_1.resolvePayrollProrationDetails)(row, workingDays, {
                type: prorationType,
                periodDate,
            });
            const factor = proration.factor;
            const prorateValues = proration.workedDays;
            const prorateBase = proration.baseDays;
            const netAdjustment = this.resolveNetAdjustment(row);
            const pendingNetAdjustment = this.isNetAdjustmentApplied(row) ? 0 : netAdjustment;
            if (type === 'salary') {
                const rest = this.withoutVariablePerformanceFields(row);
                const basic = this.round(this.toSafeNumber(row.basic) * factor, 2);
                const housing = this.round(this.toSafeNumber(row.housing) * factor, 2);
                const transport = this.round(this.toSafeNumber(row.transport) * factor, 2);
                const dress = this.round(this.toSafeNumber(row.dress) * factor, 2);
                const utilities = this.round(this.toSafeNumber(row.utilities) * factor, 2);
                const lunch = this.round(this.toSafeNumber(row.lunch) * factor, 2);
                const telephone = this.round(this.toSafeNumber(row.telephone) * factor, 2);
                const gross = this.round(this.toSafeNumber(row.gross) * factor, 2);
                const reconciled = (0, payroll_calculation_util_1.reconcileSalaryComponents)({
                    basic,
                    housing,
                    transport,
                    dress,
                    utilities,
                    lunch,
                    telephone,
                    gross,
                });
                const pension = this.round(this.toSafeNumber(row.pension) * factor, 2);
                const companyPension = this.round(this.toSafeNumber(row.monthlyCompanyPension ?? row.companyPension) * factor, 2);
                const monthlyCompanyPension = this.round(this.toSafeNumber(row.monthlyCompanyPension ?? row.companyPension) * factor, 2);
                const nhf = this.round(this.toSafeNumber(row.nhf) * factor, 2);
                const paye = this.round(this.toSafeNumber(row.paye) * factor, 2);
                let monthlyNet = this.round(this.toSafeNumber(row.monthlyNet) * factor, 2);
                const roundingGap = this.round(gross - (pension + nhf + paye + monthlyNet), 2);
                if (roundingGap !== 0) {
                    monthlyNet = this.round(monthlyNet + roundingGap, 2);
                }
                monthlyNet = this.round(monthlyNet + pendingNetAdjustment, 2);
                return {
                    ...rest,
                    type: 'salary',
                    prorateValues,
                    prorateBase,
                    ...reconciled,
                    pension,
                    companyPension,
                    monthlyCompanyPension,
                    nhf,
                    paye,
                    monthlyNet,
                    amount: monthlyNet,
                    ...(netAdjustment ? { netAdjustment, netAdjustmentApplied: true } : {}),
                };
            }
            if (type === 'reimbursable') {
                const rest = this.withoutVariablePerformanceFields(row);
                const reimbursable = this.round(this.round(this.toSafeNumber(row.reimbursable) * factor, 2) + pendingNetAdjustment, 2);
                return {
                    ...rest,
                    type: 'reimbursable',
                    prorateValues,
                    prorateBase,
                    reimbursable,
                    amount: reimbursable,
                    ...(netAdjustment ? { netAdjustment, netAdjustmentApplied: true } : {}),
                };
            }
            if (type === 'variable') {
                const resolvedPercent = this.normalizePercent(row.proratePercent ??
                    this.resolvePerformancePercent(row.performanceScore, performanceBrackets) ??
                    100, 100);
                const variableBase = this.round(this.toSafeNumber(row.variable) * factor, 2);
                return {
                    ...row,
                    type: 'variable',
                    prorateValues,
                    prorateBase,
                    variable: variableBase,
                    proratePercent: resolvedPercent,
                    performancePercent: resolvedPercent,
                };
            }
            if (type === 'bank' || type === 'individual') {
                const resolvedPercent = this.normalizePercent(row.proratePercent ??
                    row.performancePercent ??
                    this.resolvePerformancePercent(row.performanceScore, performanceBrackets) ??
                    100, 100);
                return {
                    ...row,
                    type,
                    prorateValues,
                    prorateBase,
                    proratePercent: type === 'individual'
                        ? (row.proratePercent ?? resolvedPercent)
                        : row.proratePercent,
                    performancePercent: type === 'individual'
                        ? (row.performancePercent ?? resolvedPercent)
                        : row.performancePercent,
                };
            }
            return row;
        });
    }
    computeSectionTotals(rows) {
        return (0, payroll_display_util_1.computePayrollSectionTotals)(rows);
    }
    detectRowType(row) {
        return (0, payroll_proration_util_1.detectPayrollRowType)(row);
    }
    toSafeNumber(value, fallback = 0) {
        return (0, payroll_calculation_util_1.toSafePayrollNumber)(value, fallback);
    }
    normalizePercent(value, fallback = 0) {
        return (0, payroll_calculation_util_1.normalizePayrollPercent)(value, fallback);
    }
    resolvePerformancePercent(score, brackets) {
        return (0, payroll_proration_util_1.resolvePayrollPerformancePercent)(score, brackets);
    }
    round(value, precision = 2) {
        return (0, payroll_calculation_util_1.roundPayrollAmount)(value, precision);
    }
    normalizePayrollText(value) {
        return (0, payroll_row_util_1.normalizePayrollTextValue)(value);
    }
    withoutVariablePerformanceFields(row) {
        const next = { ...row };
        delete next.proratePercent;
        delete next.performancePercent;
        delete next.performanceScore;
        return next;
    }
    expandApprovalDisplayRows(normalized, workingDays, performanceBrackets, periodDate) {
        const expanded = [];
        normalized.forEach((row) => {
            if (!row || typeof row !== 'object')
                return;
            const type = row.type ?? this.detectRowType(row);
            const proration = (0, payroll_proration_util_1.resolvePayrollProrationDetails)(row, workingDays, {
                type,
                periodDate,
                respectProvided: true,
            });
            const factor = proration.factor;
            const withProration = {
                ...row,
                type,
                prorateValues: proration.workedDays,
                prorateBase: proration.baseDays,
            };
            if (type === 'salary') {
                expanded.push(this.expandSalaryDisplayRow(withProration, factor));
                return;
            }
            if (type === 'reimbursable') {
                const netAdjustment = this.resolveNetAdjustment(withProration);
                const reimbursableBase = this.toSafeNumber(withProration.reimbursable ??
                    withProration.reimbursableAmount ??
                    withProration.remibursableAmount ??
                    withProration.amount, 0) - (this.isNetAdjustmentApplied(withProration) ? netAdjustment : 0);
                const reimbursable = this.round(this.round(reimbursableBase * factor, 2) + netAdjustment, 2);
                expanded.push({
                    ...withProration,
                    type: 'reimbursable',
                    reimbursable,
                    amount: reimbursable,
                    ...(netAdjustment ? { netAdjustment, netAdjustmentApplied: true } : {}),
                });
                return;
            }
            if (type === 'bank' || type === 'individual') {
                expanded.push(withProration);
                return;
            }
            if (type !== 'variable') {
                expanded.push(withProration);
                return;
            }
            this.expandVariableDisplayRow(expanded, withProration, factor, performanceBrackets);
        });
        return expanded;
    }
    expandSalaryDisplayRow(row, factor) {
        const netAdjustment = this.resolveNetAdjustment(row);
        const netBase = this.toSafeNumber(row.monthlyNet ?? row.netPay ?? row.net ?? row.amount, 0) -
            (this.isNetAdjustmentApplied(row) ? netAdjustment : 0);
        const basic = this.round(this.toSafeNumber(row.basic) * factor, 2);
        const housing = this.round(this.toSafeNumber(row.housing) * factor, 2);
        const transport = this.round(this.toSafeNumber(row.transport) * factor, 2);
        const dress = this.round(this.toSafeNumber(row.dress) * factor, 2);
        const utilities = this.round(this.toSafeNumber(row.utilities) * factor, 2);
        const lunch = this.round(this.toSafeNumber(row.lunch) * factor, 2);
        const telephone = this.round(this.toSafeNumber(row.telephone) * factor, 2);
        const gross = this.round(this.toSafeNumber(row.gross) * factor, 2);
        const reconciled = (0, payroll_calculation_util_1.reconcileSalaryComponents)({
            basic,
            housing,
            transport,
            dress,
            utilities,
            lunch,
            telephone,
            gross,
        });
        const pension = this.round(this.toSafeNumber(row.pension) * factor, 2);
        const companyPension = this.round(this.toSafeNumber(row.monthlyCompanyPension ?? row.companyPension) * factor, 2);
        const monthlyCompanyPension = this.round(this.toSafeNumber(row.monthlyCompanyPension ?? row.companyPension) * factor, 2);
        const nhf = this.round(this.toSafeNumber(row.nhf) * factor, 2);
        const paye = this.round(this.toSafeNumber(row.paye) * factor, 2);
        let monthlyNet = this.round(netBase * factor, 2);
        const roundingGap = this.round(reconciled.gross - (pension + nhf + paye + monthlyNet), 2);
        if (roundingGap !== 0) {
            monthlyNet = this.round(monthlyNet + roundingGap, 2);
        }
        monthlyNet = this.round(monthlyNet + netAdjustment, 2);
        return {
            ...row,
            type: 'salary',
            ...reconciled,
            pension,
            companyPension,
            monthlyCompanyPension,
            nhf,
            paye,
            monthlyNet,
            amount: monthlyNet,
            ...(netAdjustment ? { netAdjustment, netAdjustmentApplied: true } : {}),
        };
    }
    expandVariableDisplayRow(expanded, row, factor, performanceBrackets) {
        const baseVariable = this.toSafeNumber((0, payroll_identity_util_1.parsePayrollBooleanFlag)(row.prorationApplied)
            ? row.variable
            : row.baseVariable ?? row.variable, 0);
        const variableBase = this.round(baseVariable * factor, 2);
        const resolvedPercent = this.normalizePercent(row.proratePercent ??
            row.performancePercent ??
            this.resolvePerformancePercent(row.performanceScore, performanceBrackets) ??
            100, 100);
        const netAdjustment = this.resolveNetAdjustment(row);
        const hasBankAmount = row.bankAmount !== undefined && row.bankAmount !== null;
        const hasIndividualAmount = row.individualAmount !== undefined && row.individualAmount !== null;
        const derivedBankAmount = this.round(variableBase / 2, 2);
        const derivedIndividualAmount = this.round(this.round((variableBase / 2) * (resolvedPercent / 100), 2) + netAdjustment, 2);
        const bankAmount = hasBankAmount
            ? this.toSafeNumber(row.bankAmount, derivedBankAmount)
            : derivedBankAmount;
        const individualAmount = hasIndividualAmount
            ? this.toSafeNumber(row.individualAmount, derivedIndividualAmount)
            : derivedIndividualAmount;
        expanded.push({
            ...row,
            type: 'bank',
            variable: variableBase,
            amount: bankAmount,
            bankAmount,
            baseVariable,
            prorateValues: row.prorateValues,
            prorateBase: row.prorateBase,
            proratePercent: undefined,
            performancePercent: undefined,
            netAdjustment: undefined,
        });
        expanded.push({
            ...row,
            type: 'individual',
            variable: variableBase,
            amount: individualAmount,
            bankAmount,
            individualAmount,
            baseVariable,
            prorateValues: row.prorateValues,
            prorateBase: row.prorateBase,
            proratePercent: row.proratePercent ?? resolvedPercent,
            performancePercent: row.performancePercent ?? resolvedPercent,
            ...(netAdjustment ? { netAdjustment, netAdjustmentApplied: true } : {}),
        });
    }
};
exports.PayrollRowDisplayService = PayrollRowDisplayService;
exports.PayrollRowDisplayService = PayrollRowDisplayService = __decorate([
    (0, common_1.Injectable)()
], PayrollRowDisplayService);
//# sourceMappingURL=payroll-row-display.service.js.map