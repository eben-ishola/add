"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shiftPayrollMonth = exports.isSamePayrollMonth = exports.resolvePayrollPeriodDate = exports.resolveDateValue = exports.resolvePerformancePeriod = exports.resolvePayslipPeriodWindow = exports.formatPayrollMonthLabel = exports.buildPayrollPeriodKey = void 0;
const common_1 = require("@nestjs/common");
const SHORT_MONTHS = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
];
const buildPayrollPeriodKey = (date) => {
    const month = SHORT_MONTHS[date.getMonth()] ?? '';
    return `${month}-${date.getFullYear()}`.toLowerCase();
};
exports.buildPayrollPeriodKey = buildPayrollPeriodKey;
const formatPayrollMonthLabel = (value) => {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) {
        return new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
    }
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};
exports.formatPayrollMonthLabel = formatPayrollMonthLabel;
const resolvePayslipPeriodWindow = (raw) => {
    const input = raw?.periodKey ?? raw?.period ?? raw?.month ?? raw;
    if (!input) {
        throw new common_1.BadRequestException('Payroll period is required');
    }
    const normalized = String(input).trim().toLowerCase();
    let year = null;
    let monthIndex = null;
    if (/^\d{4}[-/]\d{1,2}$/.test(normalized)) {
        const [yearPart, monthPart] = normalized.split(/[-/]/);
        year = Number(yearPart);
        monthIndex = Number(monthPart) - 1;
    }
    else if (/^[a-z]{3}-\d{4}$/.test(normalized)) {
        const [monthPart, yearPart] = normalized.split('-');
        const idx = SHORT_MONTHS.indexOf(monthPart);
        if (idx >= 0) {
            monthIndex = idx;
            year = Number(yearPart);
        }
    }
    else {
        const parsed = new Date(input);
        if (!Number.isNaN(parsed.getTime())) {
            year = parsed.getFullYear();
            monthIndex = parsed.getMonth();
        }
    }
    if (year === null || monthIndex === null || monthIndex < 0 || monthIndex > 11) {
        throw new common_1.BadRequestException('Invalid payroll period');
    }
    const periodDate = new Date(year, monthIndex, 1);
    const periodKey = (0, exports.buildPayrollPeriodKey)(periodDate);
    const periodLabel = periodDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const start = new Date(year, monthIndex, 1);
    const end = new Date(year, monthIndex + 1, 1);
    return { periodKey, periodLabel, periodDate, start, end };
};
exports.resolvePayslipPeriodWindow = resolvePayslipPeriodWindow;
const resolvePerformancePeriod = (raw, now = new Date()) => {
    if (!raw) {
        const periodDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const periodKey = (0, exports.buildPayrollPeriodKey)(periodDate);
        const periodLabel = periodDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        return { periodKey, periodLabel, periodDate };
    }
    const { periodKey, periodLabel, periodDate } = (0, exports.resolvePayslipPeriodWindow)(raw);
    return { periodKey, periodLabel, periodDate };
};
exports.resolvePerformancePeriod = resolvePerformancePeriod;
const resolveDateValue = (value) => {
    if (!value)
        return null;
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        const asString = String(value);
        if (/^\d{8}$/.test(asString)) {
            const year = Number(asString.slice(0, 4));
            const month = Number(asString.slice(4, 6));
            const day = Number(asString.slice(6, 8));
            if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
                const parsed = new Date(year, month - 1, day);
                return Number.isNaN(parsed.getTime()) ? null : parsed;
            }
        }
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed)
            return null;
        if (/^\d{8}$/.test(trimmed)) {
            const year = Number(trimmed.slice(0, 4));
            const month = Number(trimmed.slice(4, 6));
            const day = Number(trimmed.slice(6, 8));
            if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
                const parsed = new Date(year, month - 1, day);
                return Number.isNaN(parsed.getTime()) ? null : parsed;
            }
        }
        const parsed = new Date(trimmed);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    try {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    catch {
        return null;
    }
};
exports.resolveDateValue = resolveDateValue;
const resolvePayrollPeriodDate = (value, now = new Date()) => {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value;
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (/^\d{4}[-/]\d{1,2}$/.test(trimmed)) {
            const [yearPart, monthPart] = trimmed.split(/[-/]/);
            const year = Number(yearPart);
            const month = Number(monthPart);
            if (Number.isFinite(year) && Number.isFinite(month)) {
                return new Date(year, month - 1, 1);
            }
        }
        const parsed = new Date(trimmed);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed;
        }
    }
    return now;
};
exports.resolvePayrollPeriodDate = resolvePayrollPeriodDate;
const isSamePayrollMonth = (left, right) => {
    if (!left)
        return false;
    return (left.getFullYear() === right.getFullYear() &&
        left.getMonth() === right.getMonth());
};
exports.isSamePayrollMonth = isSamePayrollMonth;
const shiftPayrollMonth = (source, offset) => new Date(source.getFullYear(), source.getMonth() + offset, 1);
exports.shiftPayrollMonth = shiftPayrollMonth;
//# sourceMappingURL=payroll-period.util.js.map