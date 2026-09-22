"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveEffectiveRentValue = exports.normalizePayrollPercent = exports.reconcileSalaryComponents = exports.buildAnnualSalaryBreakdown = exports.payrollPercentOf = exports.roundPayrollAmount = exports.toSafePayrollNumber = exports.ensurePayrollNumber = void 0;
const ensurePayrollNumber = (value, fallback = 0) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === 'string') {
        const cleaned = value
            .replace(/,/g, '')
            .replace(/[^\d.-]/g, '')
            .replace(/(?!^)-/g, '')
            .replace(/(\..*)\./g, '$1')
            .trim();
        if (!cleaned)
            return fallback;
        const parsed = Number(cleaned);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    if (value instanceof Number) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
};
exports.ensurePayrollNumber = ensurePayrollNumber;
const toSafePayrollNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
        return parsed;
    }
    return fallback;
};
exports.toSafePayrollNumber = toSafePayrollNumber;
const roundPayrollAmount = (value, precision = 2) => {
    if (!Number.isFinite(value))
        return 0;
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
};
exports.roundPayrollAmount = roundPayrollAmount;
const payrollPercentOf = (amount, percent) => {
    if (!Number.isFinite(amount))
        return 0;
    return (0, exports.roundPayrollAmount)(amount * (percent / 100));
};
exports.payrollPercentOf = payrollPercentOf;
const buildAnnualSalaryBreakdown = (amountTendered, settings) => {
    const basicAmount = (0, exports.payrollPercentOf)(amountTendered, settings.basic);
    const housingAmount = (0, exports.payrollPercentOf)(amountTendered, settings.housing);
    const transportAmount = (0, exports.payrollPercentOf)(amountTendered, settings.transport);
    const dressAmount = (0, exports.payrollPercentOf)(amountTendered, settings.dress);
    const utilitiesAmount = (0, exports.payrollPercentOf)(amountTendered, settings.utilities);
    const lunchAmount = (0, exports.payrollPercentOf)(amountTendered, settings.lunch);
    const telephoneAmount = (0, exports.payrollPercentOf)(amountTendered, settings.telephone);
    const pensionBase = basicAmount + housingAmount + transportAmount;
    const pensionAmount = (0, exports.payrollPercentOf)(pensionBase, settings.pension);
    const companyPensionAmount = (0, exports.payrollPercentOf)(pensionBase, settings.companyPension);
    const nhfAmount = (0, exports.payrollPercentOf)(amountTendered, settings.nhf);
    return {
        basicAmount,
        housingAmount,
        transportAmount,
        dressAmount,
        utilitiesAmount,
        lunchAmount,
        telephoneAmount,
        pensionBase,
        pensionAmount,
        companyPensionAmount,
        nhfAmount,
    };
};
exports.buildAnnualSalaryBreakdown = buildAnnualSalaryBreakdown;
const reconcileSalaryComponents = (components) => {
    const values = {
        basic: (0, exports.ensurePayrollNumber)(components.basic, 0),
        housing: (0, exports.ensurePayrollNumber)(components.housing, 0),
        transport: (0, exports.ensurePayrollNumber)(components.transport, 0),
        dress: (0, exports.ensurePayrollNumber)(components.dress, 0),
        utilities: (0, exports.ensurePayrollNumber)(components.utilities, 0),
        lunch: (0, exports.ensurePayrollNumber)(components.lunch, 0),
        telephone: (0, exports.ensurePayrollNumber)(components.telephone, 0),
    };
    const gross = (0, exports.ensurePayrollNumber)(components.gross, 0);
    const sum = (0, exports.roundPayrollAmount)(Object.values(values).reduce((acc, val) => acc + val, 0));
    const gap = (0, exports.roundPayrollAmount)(gross - sum);
    if (gap !== 0) {
        const targetKey = Object.keys(values).reduce((best, key) => (Math.abs(values[key]) > Math.abs(values[best]) ? key : best), 'basic');
        values[targetKey] = (0, exports.roundPayrollAmount)(values[targetKey] + gap);
    }
    return { ...values, gross };
};
exports.reconcileSalaryComponents = reconcileSalaryComponents;
const normalizePayrollPercent = (value, fallback = 0) => {
    const parsed = (0, exports.ensurePayrollNumber)(value, fallback);
    if (!Number.isFinite(parsed))
        return fallback;
    return Math.min(Math.max(parsed, 0), 100);
};
exports.normalizePayrollPercent = normalizePayrollPercent;
const resolveEffectiveRentValue = (user, asOf = new Date()) => {
    const rentValue = (0, exports.ensurePayrollNumber)(user?.rent, 0);
    if (!rentValue || rentValue <= 0)
        return 0;
    const startRaw = user?.rentStartDate ?? user?.rentStart ?? user?.rentStartAt;
    const endRaw = user?.rentEndDate ?? user?.rentEnd ?? user?.rentEndAt;
    if (!startRaw || !endRaw)
        return 0;
    const start = new Date(startRaw);
    const end = new Date(endRaw);
    const reference = new Date(asOf);
    if (Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        Number.isNaN(reference.getTime())) {
        return 0;
    }
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const referenceDay = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
    if (endDay.getTime() < startDay.getTime())
        return 0;
    if (referenceDay.getTime() < startDay.getTime())
        return 0;
    if (referenceDay.getTime() > endDay.getTime())
        return 0;
    return rentValue;
};
exports.resolveEffectiveRentValue = resolveEffectiveRentValue;
//# sourceMappingURL=payroll-calculation.util.js.map