"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePayrollPerformanceBrackets = exports.resolvePayrollPerformancePercent = exports.resolvePayrollProrationFactor = exports.resolvePayrollProrationDetails = exports.detectPayrollRowType = void 0;
const payroll_calculation_util_1 = require("./payroll-calculation.util");
const payroll_period_util_1 = require("./payroll-period.util");
const payroll_identity_util_1 = require("./payroll-identity.util");
const DEFAULT_PAYROLL_PERFORMANCE_BRACKETS = [
    { minScore: 90, maxScore: 100, percent: 100 },
    { minScore: 80, maxScore: 89, percent: 90 },
    { minScore: 70, maxScore: 79, percent: 80 },
    { minScore: 60, maxScore: 69, percent: 70 },
    { minScore: 0, maxScore: 59, percent: 0 },
];
const toNumberOrNull = (value) => {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};
const detectPayrollRowType = (row) => {
    const variableValue = toNumberOrNull(row?.variable);
    const bankValue = toNumberOrNull(row?.bankAmount);
    const individualValue = toNumberOrNull(row?.individualAmount);
    const hasVariableValue = (variableValue !== null && variableValue !== 0) ||
        (bankValue !== null && bankValue !== 0) ||
        (individualValue !== null && individualValue !== 0);
    if (hasVariableValue)
        return 'variable';
    const salaryValues = [
        row?.monthlyNet,
        row?.basic,
        row?.gross,
        row?.housing,
        row?.transport,
        row?.utilities,
        row?.lunch,
        row?.telephone,
    ];
    const hasSalaryValue = salaryValues.some((value) => {
        const parsed = toNumberOrNull(value);
        return parsed !== null && parsed !== 0;
    });
    if (hasSalaryValue)
        return 'salary';
    const reimbursableValue = toNumberOrNull(row?.reimbursable ?? row?.reimbursableAmount ?? row?.remibursableAmount);
    if (reimbursableValue !== null && reimbursableValue !== 0)
        return 'reimbursable';
    return 'reimbursable';
};
exports.detectPayrollRowType = detectPayrollRowType;
const resolvePayrollProrationDetails = (item, defaultBase, options) => {
    const baseDays = (0, payroll_calculation_util_1.toSafePayrollNumber)(item?.prorateBase ?? item?.totalDays ?? item?.workingDays ?? defaultBase, defaultBase);
    if (!baseDays || baseDays <= 0) {
        return { workedDays: baseDays || defaultBase || 0, baseDays: baseDays || defaultBase || 0, factor: 1 };
    }
    if ((0, payroll_identity_util_1.parsePayrollBooleanFlag)(item?.prorationApplied)) {
        const workedDays = Math.max((0, payroll_calculation_util_1.toSafePayrollNumber)(item?.prorateValues, baseDays), 0);
        return { workedDays, baseDays, factor: 1 };
    }
    const hasExplicitValues = options?.respectProvided &&
        (0, payroll_identity_util_1.parsePayrollBooleanFlag)(item?.__explicitProration ?? item?.prorationHandledOnClient);
    if (hasExplicitValues) {
        const workedDays = Math.max((0, payroll_calculation_util_1.toSafePayrollNumber)(item?.prorateValues, baseDays), 0);
        const ratio = baseDays ? workedDays / baseDays : 1;
        const allowOverage = (0, payroll_identity_util_1.parsePayrollBooleanFlag)(item?.prorationAllowOverage);
        const factor = allowOverage ? Math.max(ratio, 0) : Math.min(Math.max(ratio, 0), 1);
        return { workedDays, baseDays, factor };
    }
    if (item?.prorationHandledOnClient) {
        const workedDays = Math.max((0, payroll_calculation_util_1.toSafePayrollNumber)(item?.prorateValues, baseDays), 0);
        const ratio = workedDays / baseDays;
        const allowOverage = (0, payroll_identity_util_1.parsePayrollBooleanFlag)(item?.prorationAllowOverage);
        const factor = allowOverage ? Math.max(ratio, 0) : Math.min(Math.max(ratio, 0), 1);
        return { workedDays, baseDays, factor };
    }
    const periodDate = (0, payroll_period_util_1.resolvePayrollPeriodDate)(options?.periodDate);
    const includeAttendance = options?.includeAttendance !== false;
    const type = options?.type ?? item?.type ?? (0, exports.detectPayrollRowType)(item);
    const periodStart = new Date(periodDate.getFullYear(), periodDate.getMonth(), 1);
    const periodEnd = new Date(periodDate.getFullYear(), periodDate.getMonth() + 1, 1);
    const startDate = (0, payroll_period_util_1.resolveDateValue)(item?.startDate);
    let exitDate = (0, payroll_period_util_1.resolveDateValue)(item?.exitDate);
    if (exitDate && exitDate.getFullYear() <= 1971) {
        exitDate = null;
    }
    if (startDate && exitDate && exitDate < startDate) {
        exitDate = null;
    }
    const joinCutoffDay = 9;
    const salaryCarryForwardCutoffDay = 24;
    let workedDays = null;
    let allowOverage = false;
    if (exitDate && exitDate < periodStart) {
        workedDays = 0;
    }
    else if (startDate && startDate >= periodEnd) {
        workedDays = 0;
    }
    else if (exitDate && (0, payroll_period_util_1.isSamePayrollMonth)(exitDate, periodDate)) {
        const exitDay = Math.min(exitDate.getDate(), baseDays);
        const joinDay = startDate && (0, payroll_period_util_1.isSamePayrollMonth)(startDate, periodDate)
            ? Math.min(startDate.getDate(), baseDays)
            : 0;
        const daysThroughExit = Math.max(exitDay, 0);
        const inclusiveJoinDay = joinDay > 0 ? 1 : 0;
        workedDays = Math.max(Math.min(daysThroughExit - joinDay + inclusiveJoinDay, baseDays), 0);
    }
    else if (startDate && (0, payroll_period_util_1.isSamePayrollMonth)(startDate, periodDate)) {
        const joinDay = Math.min(startDate.getDate(), baseDays);
        const daysWorked = Math.max(baseDays - joinDay + 1, 0);
        if ((type === 'variable' || type === 'reimbursable') && joinDay >= joinCutoffDay) {
            workedDays = 0;
        }
        else {
            workedDays = daysWorked;
        }
    }
    else if ((type === 'variable' || type === 'reimbursable') &&
        startDate &&
        (0, payroll_period_util_1.isSamePayrollMonth)(startDate, (0, payroll_period_util_1.shiftPayrollMonth)(periodDate, -1))) {
        const joinDay = Math.min(startDate.getDate(), baseDays);
        if (joinDay >= joinCutoffDay) {
            const extraDays = Math.max(baseDays - joinDay, 0);
            if (extraDays > 0) {
                workedDays = baseDays + extraDays;
                allowOverage = true;
            }
        }
    }
    else if (type === 'salary' &&
        startDate &&
        (0, payroll_period_util_1.isSamePayrollMonth)(startDate, (0, payroll_period_util_1.shiftPayrollMonth)(periodDate, -1))) {
        const joinDay = Math.min(startDate.getDate(), baseDays);
        if (joinDay >= salaryCarryForwardCutoffDay) {
            const carryForwardDays = Math.max(baseDays - joinDay + 1, 0);
            if (carryForwardDays > 0) {
                workedDays = baseDays + carryForwardDays;
                allowOverage = true;
            }
        }
    }
    if (workedDays === null) {
        workedDays = (0, payroll_calculation_util_1.toSafePayrollNumber)(item?.prorateValues, baseDays);
    }
    if (includeAttendance) {
        const absentDays = (0, payroll_calculation_util_1.toSafePayrollNumber)(item?.attendanceAbsentDays, 0);
        const latePenaltyDays = (0, payroll_calculation_util_1.toSafePayrollNumber)(item?.attendanceLatePenaltyDays, 0);
        const attendanceDeductions = Math.max(absentDays, 0) + Math.max(latePenaltyDays, 0);
        if (attendanceDeductions) {
            workedDays = Math.max(workedDays - attendanceDeductions, 0);
        }
    }
    const ratio = workedDays / baseDays;
    const factor = allowOverage
        ? Math.max(ratio, 0)
        : Math.min(Math.max(ratio, 0), 1);
    return { workedDays, baseDays, factor };
};
exports.resolvePayrollProrationDetails = resolvePayrollProrationDetails;
const resolvePayrollProrationFactor = (item, defaultBase, options) => (0, exports.resolvePayrollProrationDetails)(item, defaultBase, options).factor;
exports.resolvePayrollProrationFactor = resolvePayrollProrationFactor;
const resolvePayrollPerformancePercent = (score, brackets) => {
    if (score === undefined || Number.isNaN(score)) {
        return undefined;
    }
    const numericScore = Number(score);
    const source = (brackets && brackets.length ? brackets : DEFAULT_PAYROLL_PERFORMANCE_BRACKETS).slice();
    source.sort((a, b) => b.minScore - a.minScore);
    for (const bracket of source) {
        if (numericScore >= bracket.minScore &&
            (bracket.maxScore === undefined ||
                bracket.maxScore === null ||
                numericScore <= bracket.maxScore)) {
            return (0, payroll_calculation_util_1.normalizePayrollPercent)(bracket.percent, 0);
        }
    }
    const lastBracket = source[source.length - 1];
    return lastBracket ? (0, payroll_calculation_util_1.normalizePayrollPercent)(lastBracket.percent, 0) : undefined;
};
exports.resolvePayrollPerformancePercent = resolvePayrollPerformancePercent;
const normalizePayrollPerformanceBrackets = (data) => {
    const source = Array.isArray(data) && data.length ? data : DEFAULT_PAYROLL_PERFORMANCE_BRACKETS;
    const cleaned = source
        .map((item) => {
        const minScore = Number(item?.minScore);
        if (!Number.isFinite(minScore)) {
            return null;
        }
        const maxScoreRaw = item?.maxScore;
        const maxScore = maxScoreRaw === null || maxScoreRaw === undefined ? null : Number(maxScoreRaw);
        if (maxScore !== null && !Number.isFinite(maxScore)) {
            return null;
        }
        return {
            minScore,
            maxScore,
            percent: (0, payroll_calculation_util_1.normalizePayrollPercent)(item?.percent, 0),
        };
    })
        .filter(Boolean);
    if (!cleaned.length) {
        return DEFAULT_PAYROLL_PERFORMANCE_BRACKETS;
    }
    cleaned.sort((a, b) => b.minScore - a.minScore);
    return cleaned;
};
exports.normalizePayrollPerformanceBrackets = normalizePayrollPerformanceBrackets;
//# sourceMappingURL=payroll-proration.util.js.map