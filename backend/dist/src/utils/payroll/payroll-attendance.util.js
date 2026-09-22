"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePayrollHolidayList = exports.normalizePayrollHolidayDate = exports.hasPayrollLateAttendancePenalty = exports.resolvePayrollAttendanceSummaryForRow = exports.expandPayrollAttendanceIdentifiers = exports.mergePayrollAttendanceAliasSets = exports.collectPayrollAttendanceIdentifiers = exports.extractPayrollEmployeeIdFromRow = exports.parsePayrollPerformanceScore = void 0;
const moment = require("moment-timezone");
const payroll_identity_util_1 = require("./payroll-identity.util");
const PAYROLL_TIMEZONE = 'Africa/Lagos';
const parsePayrollPerformanceScore = (raw) => {
    if (raw === null || raw === undefined || raw === '')
        return null;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed))
        return null;
    if (parsed < 0 || parsed > 100)
        return null;
    return parsed;
};
exports.parsePayrollPerformanceScore = parsePayrollPerformanceScore;
const extractPayrollEmployeeIdFromRow = (row) => {
    if (!row)
        return null;
    const candidate = row?.employeeId ??
        row?.userId ??
        row?.staffObjectId ??
        row?.id ??
        row?.staffId;
    const resolved = typeof candidate === 'object'
        ? candidate?._id ?? candidate?.id ?? candidate?.toString?.()
        : candidate;
    const value = typeof resolved === 'string' ? resolved.trim() : String(resolved ?? '').trim();
    return value ? value : null;
};
exports.extractPayrollEmployeeIdFromRow = extractPayrollEmployeeIdFromRow;
const collectPayrollAttendanceIdentifiers = (row) => {
    if (!row || typeof row !== 'object')
        return [];
    return (0, payroll_identity_util_1.collectPayrollIdentifierValues)(row?.employeeId, row?.userId, row?.staffObjectId, row?.id, row?.staffId);
};
exports.collectPayrollAttendanceIdentifiers = collectPayrollAttendanceIdentifiers;
const mergePayrollAttendanceAliasSets = (aliasMap, values) => {
    const cleaned = values
        .map((value) => (typeof value === 'string' ? value.trim() : value))
        .filter((value) => Boolean(value && value !== 'undefined' && value !== 'null'));
    if (!cleaned.length)
        return;
    const merged = new Set();
    cleaned.forEach((value) => merged.add(value));
    cleaned.forEach((value) => {
        const existing = aliasMap.get(value);
        if (existing) {
            existing.forEach((alias) => merged.add(alias));
        }
    });
    merged.forEach((value) => {
        aliasMap.set(value, merged);
    });
};
exports.mergePayrollAttendanceAliasSets = mergePayrollAttendanceAliasSets;
const expandPayrollAttendanceIdentifiers = (identifiers, aliasMap) => {
    if (!aliasMap || !aliasMap.size)
        return identifiers;
    const expanded = new Set();
    identifiers.forEach((id) => {
        if (!id)
            return;
        expanded.add(id);
        const aliases = aliasMap.get(id);
        if (aliases) {
            aliases.forEach((alias) => expanded.add(alias));
        }
    });
    return Array.from(expanded);
};
exports.expandPayrollAttendanceIdentifiers = expandPayrollAttendanceIdentifiers;
const resolvePayrollAttendanceSummaryForRow = (attendanceSummary, row) => {
    const identifiers = (0, exports.collectPayrollAttendanceIdentifiers)(row);
    for (const id of identifiers) {
        const summary = attendanceSummary.get(id);
        if (summary)
            return summary;
    }
    return undefined;
};
exports.resolvePayrollAttendanceSummaryForRow = resolvePayrollAttendanceSummaryForRow;
const hasPayrollLateAttendancePenalty = (deductionIds, row) => {
    const identifiers = (0, exports.collectPayrollAttendanceIdentifiers)(row);
    return identifiers.some((id) => deductionIds.has(id));
};
exports.hasPayrollLateAttendancePenalty = hasPayrollLateAttendancePenalty;
const normalizePayrollHolidayDate = (value) => {
    if (!value)
        return null;
    if (value instanceof Date) {
        return moment(value).tz(PAYROLL_TIMEZONE).format('YYYY-MM-DD');
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed)
            return null;
        const parsed = moment(trimmed, ['DD-MM-YYYY', 'YYYY-MM-DD', moment.ISO_8601], true);
        if (!parsed.isValid())
            return null;
        return parsed.tz(PAYROLL_TIMEZONE).format('YYYY-MM-DD');
    }
    if (typeof value === 'object') {
        return (0, exports.normalizePayrollHolidayDate)(value?.date ?? value?.holidayDate);
    }
    return null;
};
exports.normalizePayrollHolidayDate = normalizePayrollHolidayDate;
const normalizePayrollHolidayList = (source) => {
    const list = Array.isArray(source)
        ? source
        : typeof source === 'string'
            ? source.split(/\r?\n/)
            : [];
    const normalized = list
        .map((value) => (0, exports.normalizePayrollHolidayDate)(value))
        .filter((value) => Boolean(value));
    return Array.from(new Set(normalized));
};
exports.normalizePayrollHolidayList = normalizePayrollHolidayList;
//# sourceMappingURL=payroll-attendance.util.js.map