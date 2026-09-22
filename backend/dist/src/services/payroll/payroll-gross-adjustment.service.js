"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollGrossAdjustmentService = void 0;
const common_1 = require("@nestjs/common");
const payroll_calculation_util_1 = require("../../utils/payroll/payroll-calculation.util");
const payroll_identity_util_1 = require("../../utils/payroll/payroll-identity.util");
const RENT_RELIEF_CAP = 500000;
let PayrollGrossAdjustmentService = class PayrollGrossAdjustmentService {
    resolveGrossAdjustment(row) {
        const value = (0, payroll_calculation_util_1.roundPayrollAmount)((0, payroll_calculation_util_1.toSafePayrollNumber)(row?.grossAdjustment, 0), 2);
        return value > 0 ? value : 0;
    }
    isGrossAdjustmentApplied(row) {
        return (0, payroll_identity_util_1.parsePayrollBooleanFlag)(row?.grossAdjustmentApplied);
    }
    async applyGrossAdjustments(rows, entityId, handlers, options) {
        if (!Array.isArray(rows) || !rows.length) {
            return Array.isArray(rows) ? rows : [];
        }
        const pending = rows.some((row) => row &&
            typeof row === 'object' &&
            row.type === 'salary' &&
            !this.isGrossAdjustmentApplied(row) &&
            this.resolveGrossAdjustment(row) > 0);
        if (!pending) {
            return rows;
        }
        const settings = await handlers.loadSalaryBreakdownSettings(entityId);
        const periodDate = options?.periodDate;
        const applied = [];
        for (const row of rows) {
            applied.push(await this.applyToRow(row, settings, handlers, periodDate));
        }
        return applied;
    }
    async applyToRow(row, settings, handlers, periodDate) {
        if (!row || typeof row !== 'object' || row.type !== 'salary') {
            return row;
        }
        const adjustment = this.resolveGrossAdjustment(row);
        if (!adjustment || this.isGrossAdjustmentApplied(row)) {
            return row;
        }
        const baseMonthlyGross = (0, payroll_calculation_util_1.roundPayrollAmount)((0, payroll_calculation_util_1.toSafePayrollNumber)(row.gross, 0), 2);
        const baseAnnualGross = (0, payroll_calculation_util_1.roundPayrollAmount)(baseMonthlyGross * 12, 2);
        const toppedAnnualGross = (0, payroll_calculation_util_1.roundPayrollAmount)((baseMonthlyGross + adjustment) * 12, 2);
        const base = (0, payroll_calculation_util_1.buildAnnualSalaryBreakdown)(baseAnnualGross, settings);
        const topped = (0, payroll_calculation_util_1.buildAnnualSalaryBreakdown)(toppedAnnualGross, settings);
        const rentValue = (0, payroll_calculation_util_1.toSafePayrollNumber)((0, payroll_calculation_util_1.resolveEffectiveRentValue)(row, periodDate), 0);
        const rentRelief = rentValue > 0 ? Math.min((0, payroll_calculation_util_1.roundPayrollAmount)(0.2 * rentValue), RENT_RELIEF_CAP) : 0;
        const baseTax = await handlers.computeTaxForAnnualIncome(this.resolveTaxableIncome(baseAnnualGross, base.pensionAmount, base.nhfAmount, rentRelief));
        const toppedTax = await handlers.computeTaxForAnnualIncome(this.resolveTaxableIncome(toppedAnnualGross, topped.pensionAmount, topped.nhfAmount, rentRelief));
        const monthlyDelta = (annualDelta) => (0, payroll_calculation_util_1.roundPayrollAmount)(annualDelta / 12, 2);
        const pensionDelta = monthlyDelta(topped.pensionAmount - base.pensionAmount);
        const companyPensionDelta = monthlyDelta(topped.companyPensionAmount - base.companyPensionAmount);
        const nhfDelta = monthlyDelta(topped.nhfAmount - base.nhfAmount);
        const payeDelta = monthlyDelta(toppedTax - baseTax);
        const bump = (current, annualDelta) => (0, payroll_calculation_util_1.roundPayrollAmount)((0, payroll_calculation_util_1.toSafePayrollNumber)(current, 0) + monthlyDelta(annualDelta), 2);
        const components = (0, payroll_calculation_util_1.reconcileSalaryComponents)({
            basic: bump(row.basic, topped.basicAmount - base.basicAmount),
            housing: bump(row.housing, topped.housingAmount - base.housingAmount),
            transport: bump(row.transport, topped.transportAmount - base.transportAmount),
            dress: bump(row.dress, topped.dressAmount - base.dressAmount),
            utilities: bump(row.utilities, topped.utilitiesAmount - base.utilitiesAmount),
            lunch: bump(row.lunch, topped.lunchAmount - base.lunchAmount),
            telephone: bump(row.telephone, topped.telephoneAmount - base.telephoneAmount),
            gross: (0, payroll_calculation_util_1.roundPayrollAmount)(baseMonthlyGross + adjustment, 2),
        });
        const pension = (0, payroll_calculation_util_1.roundPayrollAmount)((0, payroll_calculation_util_1.toSafePayrollNumber)(row.pension, 0) + pensionDelta, 2);
        const nhf = (0, payroll_calculation_util_1.roundPayrollAmount)((0, payroll_calculation_util_1.toSafePayrollNumber)(row.nhf, 0) + nhfDelta, 2);
        const paye = (0, payroll_calculation_util_1.roundPayrollAmount)((0, payroll_calculation_util_1.toSafePayrollNumber)(row.paye, 0) + payeDelta, 2);
        const companyPensionSource = (0, payroll_calculation_util_1.toSafePayrollNumber)(row.monthlyCompanyPension ?? row.companyPension, 0);
        const companyPension = (0, payroll_calculation_util_1.roundPayrollAmount)(companyPensionSource + companyPensionDelta, 2);
        const netDelta = (0, payroll_calculation_util_1.roundPayrollAmount)(adjustment - pensionDelta - nhfDelta - payeDelta, 2);
        const monthlyNet = (0, payroll_calculation_util_1.roundPayrollAmount)((0, payroll_calculation_util_1.toSafePayrollNumber)(row.monthlyNet ?? row.netPay ?? row.amount, 0) + netDelta, 2);
        return {
            ...row,
            ...components,
            pension,
            nhf,
            paye,
            companyPension,
            monthlyCompanyPension: companyPension,
            monthlyNet,
            amount: monthlyNet,
            grossAdjustment: adjustment,
            grossAdjustmentApplied: true,
        };
    }
    resolveTaxableIncome(amountTendered, pensionAmount, nhfAmount, rentRelief) {
        const taxRelief = (0, payroll_calculation_util_1.roundPayrollAmount)(pensionAmount + nhfAmount + rentRelief);
        return Math.max((0, payroll_calculation_util_1.roundPayrollAmount)(amountTendered - taxRelief), 0);
    }
};
exports.PayrollGrossAdjustmentService = PayrollGrossAdjustmentService;
exports.PayrollGrossAdjustmentService = PayrollGrossAdjustmentService = __decorate([
    (0, common_1.Injectable)()
], PayrollGrossAdjustmentService);
//# sourceMappingURL=payroll-gross-adjustment.service.js.map