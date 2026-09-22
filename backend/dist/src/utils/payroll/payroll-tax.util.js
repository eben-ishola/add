"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizePayrollTaxConfigUpdate = exports.computeMonthlyPayrollTax = exports.computeAnnualPayrollTax = exports.sanitizePayrollTaxBrackets = exports.sanitizePayrollTaxBracket = void 0;
const payroll_calculation_util_1 = require("./payroll-calculation.util");
const hasValue = (value) => value !== undefined && value !== null && value !== '';
const parseOptionalDate = (value) => {
    if (!value)
        return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};
const sanitizePayrollTaxBracket = (raw) => {
    const minIncome = (0, payroll_calculation_util_1.ensurePayrollNumber)(raw?.minIncome, 0);
    const maxIncome = hasValue(raw?.maxIncome)
        ? (0, payroll_calculation_util_1.ensurePayrollNumber)(raw?.maxIncome, 0)
        : null;
    const rateValue = (0, payroll_calculation_util_1.ensurePayrollNumber)(raw?.rate, 0);
    const normalizedRate = rateValue > 1 ? rateValue / 100 : rateValue;
    const baseTax = (0, payroll_calculation_util_1.ensurePayrollNumber)(raw?.baseTax, 0);
    return {
        minIncome,
        maxIncome,
        rate: (0, payroll_calculation_util_1.roundPayrollAmount)(normalizedRate, 6),
        baseTax: (0, payroll_calculation_util_1.roundPayrollAmount)(baseTax),
    };
};
exports.sanitizePayrollTaxBracket = sanitizePayrollTaxBracket;
const sanitizePayrollTaxBrackets = (brackets) => (Array.isArray(brackets) ? brackets : [])
    .map((item) => (0, exports.sanitizePayrollTaxBracket)(item))
    .filter((item) => Number.isFinite(item.minIncome))
    .sort((a, b) => a.minIncome - b.minIncome);
exports.sanitizePayrollTaxBrackets = sanitizePayrollTaxBrackets;
const computeAnnualPayrollTax = (amount, config) => {
    const income = Math.max((0, payroll_calculation_util_1.roundPayrollAmount)(amount), 0);
    if (income <= 0 || !config)
        return 0;
    if (config.exemptLimit && income <= config.exemptLimit)
        return 0;
    const brackets = (0, exports.sanitizePayrollTaxBrackets)(config.brackets);
    for (const bracket of brackets) {
        const max = bracket.maxIncome == null ? Number.POSITIVE_INFINITY : bracket.maxIncome;
        if (income > bracket.minIncome - 1 && income <= max) {
            const taxableInBracket = Math.max(0, income - bracket.minIncome);
            return Number((0, payroll_calculation_util_1.roundPayrollAmount)(bracket.baseTax + taxableInBracket * bracket.rate));
        }
    }
    return 0;
};
exports.computeAnnualPayrollTax = computeAnnualPayrollTax;
const computeMonthlyPayrollTax = (amount, config) => (0, payroll_calculation_util_1.roundPayrollAmount)((0, exports.computeAnnualPayrollTax)(amount, config) / 12);
exports.computeMonthlyPayrollTax = computeMonthlyPayrollTax;
const sanitizePayrollTaxConfigUpdate = (payload) => {
    const update = {
        configName: typeof payload?.configName === 'string' && payload.configName.trim()
            ? payload.configName.trim()
            : 'Default tax configuration',
        currency: typeof payload?.currency === 'string' && payload.currency.trim()
            ? payload.currency.trim()
            : 'NGN',
        isActive: payload?.isActive === undefined ? true : Boolean(payload.isActive),
        useProgressiveTaxCalculation: payload?.useProgressiveTaxCalculation === undefined
            ? true
            : Boolean(payload.useProgressiveTaxCalculation),
        brackets: (0, exports.sanitizePayrollTaxBrackets)(payload?.brackets),
    };
    if (payload?.exemptLimit !== undefined) {
        update.exemptLimit =
            payload.exemptLimit === null || payload.exemptLimit === ''
                ? null
                : (0, payroll_calculation_util_1.ensurePayrollNumber)(payload.exemptLimit, 0);
    }
    const effectiveFrom = parseOptionalDate(payload?.effectiveFrom);
    if (effectiveFrom) {
        update.effectiveFrom = effectiveFrom;
    }
    else if (payload?.effectiveFrom === null) {
        update.effectiveFrom = null;
    }
    const effectiveTo = parseOptionalDate(payload?.effectiveTo);
    if (effectiveTo) {
        update.effectiveTo = effectiveTo;
    }
    else if (payload?.effectiveTo === null) {
        update.effectiveTo = null;
    }
    if (payload?.yearPassed !== undefined) {
        update.yearPassed =
            payload.yearPassed === null || payload.yearPassed === ''
                ? null
                : Number(payload.yearPassed);
    }
    return update;
};
exports.sanitizePayrollTaxConfigUpdate = sanitizePayrollTaxConfigUpdate;
//# sourceMappingURL=payroll-tax.util.js.map