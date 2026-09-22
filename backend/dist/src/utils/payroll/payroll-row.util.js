"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertPayrollRowsHaveAccountAndLevelValue = exports.assertPayrollRowsRespectWorkingDaysValue = exports.resolvePayrollRowLevelValue = exports.resolvePayrollRowAccountValue = exports.normalizePayrollTextValue = void 0;
const common_1 = require("@nestjs/common");
const payroll_calculation_util_1 = require("./payroll-calculation.util");
const payroll_attendance_util_1 = require("./payroll-attendance.util");
const payroll_identity_util_1 = require("./payroll-identity.util");
const normalizePayrollTextValue = (value) => {
    if (value === null || value === undefined)
        return null;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed)
            return null;
        const lowered = trimmed.toLowerCase();
        if (lowered === 'null' || lowered === 'undefined')
            return null;
        return trimmed;
    }
    if (typeof value === 'number') {
        if (!Number.isFinite(value))
            return null;
        return String(value);
    }
    if (typeof value === 'object') {
        const nested = value?.name ??
            value?.level ??
            value?.value ??
            value?._id ??
            value?.id;
        if (nested !== undefined && nested !== null) {
            return (0, exports.normalizePayrollTextValue)(nested);
        }
    }
    try {
        const asString = String(value).trim();
        if (!asString)
            return null;
        if (asString === '[object Object]')
            return null;
        const lowered = asString.toLowerCase();
        if (lowered === 'null' || lowered === 'undefined')
            return null;
        return asString;
    }
    catch {
        return null;
    }
};
exports.normalizePayrollTextValue = normalizePayrollTextValue;
const resolvePayrollRowAccountValue = (row) => {
    if (!row)
        return null;
    const candidate = row?.account ??
        row?.accountNo ??
        row?.accountNumber ??
        row?.account_no ??
        row?.addosserAccount ??
        row?.atlasAccount ??
        row?.bankAccount ??
        row?.employeeAccount ??
        null;
    return (0, exports.normalizePayrollTextValue)(candidate);
};
exports.resolvePayrollRowAccountValue = resolvePayrollRowAccountValue;
const resolvePayrollRowLevelValue = (row) => {
    if (!row)
        return null;
    const candidate = row?.grade ??
        row?.level ??
        row?.levelName ??
        row?.level?.name ??
        row?.level?.level ??
        null;
    return (0, exports.normalizePayrollTextValue)(candidate);
};
exports.resolvePayrollRowLevelValue = resolvePayrollRowLevelValue;
const buildPayrollRowLabel = (row, index) => {
    const name = (0, exports.normalizePayrollTextValue)(row?.name);
    const staffId = (0, payroll_attendance_util_1.extractPayrollEmployeeIdFromRow)(row);
    return name && staffId
        ? `${name} (${staffId})`
        : name
            ? name
            : staffId
                ? staffId
                : `Row ${index + 1}`;
};
const assertPayrollRowsRespectWorkingDaysValue = (rows, defaultWorkingDays) => {
    if (!Array.isArray(rows) || !rows.length)
        return;
    const violations = [];
    rows.forEach((row, index) => {
        if (!row || typeof row !== 'object')
            return;
        if ((0, payroll_identity_util_1.parsePayrollBooleanFlag)(row?.prorationAllowOverage))
            return;
        const baseDays = (0, payroll_calculation_util_1.toSafePayrollNumber)(row?.prorateBase ?? row?.totalDays ?? row?.workingDays ?? defaultWorkingDays, defaultWorkingDays);
        if (!baseDays || baseDays <= 0)
            return;
        const workedRaw = row?.prorateValues ??
            row?.workedDays ??
            row?.daysWorked ??
            row?.attendanceDays ??
            row?.days;
        if (workedRaw === undefined || workedRaw === null || workedRaw === '')
            return;
        const workedDays = (0, payroll_calculation_util_1.toSafePayrollNumber)(workedRaw, baseDays);
        if (workedDays > baseDays) {
            violations.push({
                index,
                label: buildPayrollRowLabel(row, index),
                worked: workedDays,
                base: baseDays,
            });
        }
    });
    if (!violations.length)
        return;
    const sample = violations
        .slice(0, 5)
        .map((violation) => `${violation.label}: ${violation.worked} > ${violation.base}`)
        .join('; ');
    const more = violations.length > 5 ? ` and ${violations.length - 5} more` : '';
    throw new common_1.BadRequestException(`Worked days exceed working days for ${violations.length} row(s) without overage approval (${sample}${more}). ` +
        `Reduce the days, or set "Allow overage" on the affected row(s) to pay above the period baseline.`);
};
exports.assertPayrollRowsRespectWorkingDaysValue = assertPayrollRowsRespectWorkingDaysValue;
const assertPayrollRowsHaveAccountAndLevelValue = (rows) => {
    if (!Array.isArray(rows) || !rows.length)
        return;
    const missing = rows.reduce((acc, row, index) => {
        const hasAccount = Boolean((0, exports.resolvePayrollRowAccountValue)(row));
        const hasLevel = Boolean((0, exports.resolvePayrollRowLevelValue)(row));
        if (hasAccount && hasLevel)
            return acc;
        acc.push({
            index,
            label: buildPayrollRowLabel(row, index),
            missingAccount: !hasAccount,
            missingLevel: !hasLevel,
        });
        return acc;
    }, []);
    if (!missing.length)
        return;
    const missingAccountCount = missing.filter((row) => row.missingAccount).length;
    const missingLevelCount = missing.filter((row) => row.missingLevel).length;
    const issueParts = [];
    if (missingAccountCount) {
        issueParts.push(`account on ${missingAccountCount} row(s)`);
    }
    if (missingLevelCount) {
        issueParts.push(`level on ${missingLevelCount} row(s)`);
    }
    const sample = missing
        .slice(0, 5)
        .map((row) => {
        const problems = [
            row.missingAccount ? 'account' : null,
            row.missingLevel ? 'level' : null,
        ]
            .filter(Boolean)
            .join('/');
        return `${row.label} (${problems})`;
    })
        .join(', ');
    const sampleSuffix = sample ? ` Example: ${sample}.` : '';
    throw new common_1.BadRequestException(`Payroll submission blocked: missing ${issueParts.join(' and ')}. Fill in the account and level for all staff before submitting.${sampleSuffix}`);
};
exports.assertPayrollRowsHaveAccountAndLevelValue = assertPayrollRowsHaveAccountAndLevelValue;
//# sourceMappingURL=payroll-row.util.js.map