"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const config_1 = require("../config");
const payrollApproval_schema_1 = require("../schemas/payrollApproval.schema");
const payroll_schema_1 = require("../schemas/payroll.schema");
const normalizeText = (value) => {
    if (value === null || value === undefined)
        return '';
    const trimmed = String(value).trim();
    if (!trimmed)
        return '';
    const lower = trimmed.toLowerCase();
    if (lower === 'null' || lower === 'undefined')
        return '';
    return trimmed;
};
const parseArgs = () => {
    const args = process.argv.slice(2);
    const hasFlag = (flag) => args.includes(flag);
    const readValue = (flag) => {
        const withEquals = args.find((arg) => arg.startsWith(`${flag}=`));
        if (withEquals) {
            return withEquals.slice(flag.length + 1);
        }
        const index = args.indexOf(flag);
        if (index >= 0 && args[index + 1]) {
            return args[index + 1];
        }
        return undefined;
    };
    const statusRaw = normalizeText(readValue('--status'));
    const status = statusRaw
        ? statusRaw.split(',').map((value) => value.trim()).filter(Boolean)
        : undefined;
    const sinceRaw = normalizeText(readValue('--since'));
    const sinceDate = sinceRaw ? new Date(sinceRaw) : undefined;
    const limitValue = Number(readValue('--limit'));
    return {
        dryRun: hasFlag('--dry-run'),
        limit: Number.isFinite(limitValue) && limitValue > 0 ? limitValue : undefined,
        entity: normalizeText(readValue('--entity')) || undefined,
        status,
        since: sinceDate && !Number.isNaN(sinceDate.getTime()) ? sinceDate : undefined,
        approvalId: normalizeText(readValue('--approval')) || undefined,
    };
};
const toSafeNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
        return parsed;
    }
    return fallback;
};
const parseBooleanFlag = (value) => {
    if (value === true)
        return true;
    if (value === false || value === null || value === undefined)
        return false;
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        return ['1', 'true', 'yes', 'y', 'on'].includes(normalized);
    }
    return Boolean(value);
};
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
const resolvePayrollPeriodDate = (value) => {
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
    return new Date();
};
const isSamePayrollMonth = (left, right) => {
    if (!left)
        return false;
    return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
};
const shiftPayrollMonth = (source, offset) => new Date(source.getFullYear(), source.getMonth() + offset, 1);
const resolveProrationDetails = (item, defaultBase, options) => {
    const baseDays = toSafeNumber(item?.prorateBase ?? item?.totalDays ?? item?.workingDays ?? defaultBase, defaultBase);
    if (!baseDays || baseDays <= 0) {
        return {
            workedDays: baseDays || defaultBase || 0,
            baseDays: baseDays || defaultBase || 0,
            factor: 1,
        };
    }
    if (parseBooleanFlag(item?.prorationApplied)) {
        const workedDays = Math.max(toSafeNumber(item?.prorateValues, baseDays), 0);
        return { workedDays, baseDays, factor: 1 };
    }
    if (item?.prorationHandledOnClient) {
        const workedDays = Math.max(toSafeNumber(item?.prorateValues, baseDays), 0);
        const ratio = workedDays / baseDays;
        const allowOverage = parseBooleanFlag(item?.prorationAllowOverage);
        const factor = allowOverage ? Math.max(ratio, 0) : Math.min(Math.max(ratio, 0), 1);
        return { workedDays, baseDays, factor };
    }
    const periodDate = resolvePayrollPeriodDate(options?.periodDate);
    const includeAttendance = options?.includeAttendance !== false;
    const type = options?.type ?? item?.type;
    const periodStart = new Date(periodDate.getFullYear(), periodDate.getMonth(), 1);
    const periodEnd = new Date(periodDate.getFullYear(), periodDate.getMonth() + 1, 1);
    const startDate = resolveDateValue(item?.startDate);
    let exitDate = resolveDateValue(item?.exitDate);
    if (exitDate && exitDate.getFullYear() <= 1971) {
        exitDate = null;
    }
    if (startDate && exitDate && exitDate < startDate) {
        exitDate = null;
    }
    const joinCutoffDay = 9;
    let workedDays = null;
    let allowOverage = false;
    if (exitDate && exitDate < periodStart) {
        workedDays = 0;
    }
    else if (startDate && startDate >= periodEnd) {
        workedDays = 0;
    }
    else if (exitDate && isSamePayrollMonth(exitDate, periodDate)) {
        const exitDay = Math.min(exitDate.getDate(), baseDays);
        const joinDay = startDate && isSamePayrollMonth(startDate, periodDate)
            ? Math.min(startDate.getDate(), baseDays)
            : 0;
        const daysThroughExit = Math.max(exitDay, 0);
        workedDays = Math.max(Math.min(daysThroughExit - joinDay, baseDays), 0);
    }
    else if (startDate && isSamePayrollMonth(startDate, periodDate)) {
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
        isSamePayrollMonth(startDate, shiftPayrollMonth(periodDate, -1))) {
        const joinDay = Math.min(startDate.getDate(), baseDays);
        if (joinDay >= joinCutoffDay) {
            const extraDays = Math.max(baseDays - joinDay, 0);
            if (extraDays > 0) {
                workedDays = baseDays + extraDays;
                allowOverage = true;
            }
        }
    }
    if (workedDays === null) {
        workedDays = toSafeNumber(item?.prorateValues, baseDays);
    }
    if (includeAttendance) {
        const absentDays = toSafeNumber(item?.attendanceAbsentDays, 0);
        const latePenaltyDays = toSafeNumber(item?.attendanceLatePenaltyDays, 0);
        const attendanceDeductions = Math.max(absentDays, 0) + Math.max(latePenaltyDays, 0);
        if (attendanceDeductions) {
            workedDays = Math.max(workedDays - attendanceDeductions, 0);
        }
    }
    const ratio = workedDays / baseDays;
    const factor = allowOverage ? Math.max(ratio, 0) : Math.min(Math.max(ratio, 0), 1);
    return { workedDays, baseDays, factor };
};
const detectRowType = (row) => {
    const toNumber = (value) => {
        if (value === null || value === undefined || value === '') {
            return null;
        }
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    };
    const variableValue = toNumber(row?.variable);
    const bankValue = toNumber(row?.bankAmount);
    const individualValue = toNumber(row?.individualAmount);
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
        const parsed = toNumber(value);
        return parsed !== null && parsed !== 0;
    });
    if (hasSalaryValue)
        return 'salary';
    const reimbursableValue = toNumber(row?.reimbursable ?? row?.reimbursableAmount ?? row?.remibursableAmount);
    if (reimbursableValue !== null && reimbursableValue !== 0)
        return 'reimbursable';
    return 'reimbursable';
};
const resolvePayrollApprovalRows = (value) => {
    const unwrap = (candidate, depth) => {
        if (Array.isArray(candidate))
            return candidate;
        if (!candidate || depth > 2)
            return [];
        if (typeof candidate === 'string') {
            const trimmed = candidate.trim();
            if (!trimmed)
                return [];
            try {
                const parsed = JSON.parse(trimmed);
                return unwrap(parsed, depth + 1);
            }
            catch {
                return [];
            }
        }
        if (typeof candidate === 'object') {
            if (Array.isArray(candidate.data))
                return candidate.data;
            if (Array.isArray(candidate.rows))
                return candidate.rows;
            if (candidate.data)
                return unwrap(candidate.data, depth + 1);
            if (candidate.rows)
                return unwrap(candidate.rows, depth + 1);
        }
        return [];
    };
    return unwrap(value, 0);
};
const resolveApprovalPeriodDate = (approval) => {
    const candidate = approval?.processedAt ??
        approval?.postingApprovedAt ??
        approval?.approverApprovedAt ??
        approval?.reviewerApprovedAt ??
        approval?.createdAt ??
        new Date();
    return resolvePayrollPeriodDate(candidate);
};
const main = async () => {
    const options = parseArgs();
    const mongoUri = normalizeText(process.env.MONGO_URI) || normalizeText(config_1.config.mainDB);
    if (!mongoUri) {
        throw new Error('Missing MongoDB connection string (set MONGO_URI or config.mainDB).');
    }
    await mongoose_1.default.connect(mongoUri);
    const PayrollApprovalModel = mongoose_1.default.models[payrollApproval_schema_1.PayrollApproval.name] ||
        mongoose_1.default.model(payrollApproval_schema_1.PayrollApproval.name, payrollApproval_schema_1.PayrollApprovalSchema);
    const PayrollModel = mongoose_1.default.models[payroll_schema_1.Payroll.name] ||
        mongoose_1.default.model(payroll_schema_1.Payroll.name, payroll_schema_1.PayrollSchema);
    const workingDaysCache = new Map();
    const resolveWorkingDays = async (entity) => {
        const key = normalizeText(entity);
        if (key && workingDaysCache.has(key)) {
            return workingDaysCache.get(key);
        }
        const match = [];
        if (key) {
            match.push({ entity: key });
            if (mongoose_1.Types.ObjectId.isValid(key)) {
                match.push({ entity: new mongoose_1.Types.ObjectId(key) });
            }
        }
        const configDoc = match.length
            ? await PayrollModel.findOne({ $or: match }).lean()
            : await PayrollModel.findOne({}).lean();
        const resolvedConfig = Array.isArray(configDoc) ? configDoc[0] : configDoc;
        const workingDays = toSafeNumber(resolvedConfig?.workingDays ?? 30, 30);
        if (key) {
            workingDaysCache.set(key, workingDays);
        }
        return workingDays;
    };
    const query = {};
    if (options.entity) {
        query.entity = options.entity;
    }
    if (options.status?.length) {
        query.status = { $in: options.status };
    }
    if (options.since) {
        query.createdAt = { $gte: options.since };
    }
    if (options.approvalId) {
        query._id = options.approvalId;
    }
    const cursor = PayrollApprovalModel.find(query)
        .select({
        _id: 1,
        entity: 1,
        status: 1,
        data: 1,
        processedAt: 1,
        postingApprovedAt: 1,
        approverApprovedAt: 1,
        reviewerApprovedAt: 1,
        createdAt: 1,
    })
        .sort({ createdAt: 1, _id: 1 })
        .lean()
        .cursor();
    const summary = {
        scanned: 0,
        approvalsUpdated: 0,
        rowsUpdated: 0,
    };
    let pending = [];
    for await (const approval of cursor) {
        if (options.limit && summary.scanned >= options.limit) {
            break;
        }
        summary.scanned += 1;
        const rows = resolvePayrollApprovalRows(approval?.data);
        if (!rows.length) {
            continue;
        }
        const workingDays = await resolveWorkingDays(approval?.entity);
        const periodDate = resolveApprovalPeriodDate(approval);
        let touched = false;
        const updatedRows = rows.map((row) => {
            if (!row || typeof row !== 'object')
                return row;
            const needsValues = row.prorateValues === null || row.prorateValues === undefined;
            const needsBase = row.prorateBase === null || row.prorateBase === undefined;
            if (!needsValues && !needsBase)
                return row;
            const rowType = row.type ?? detectRowType(row);
            const prorationType = rowType === 'bank' || rowType === 'individual' ? 'variable' : rowType;
            const proration = resolveProrationDetails(row, workingDays, {
                type: prorationType,
                periodDate,
            });
            const updated = { ...row };
            if (needsValues) {
                updated.prorateValues = proration.workedDays;
            }
            if (needsBase) {
                updated.prorateBase = proration.baseDays;
            }
            touched = true;
            summary.rowsUpdated += 1;
            return updated;
        });
        if (!touched) {
            continue;
        }
        summary.approvalsUpdated += 1;
        if (!options.dryRun) {
            pending.push({
                updateOne: {
                    filter: { _id: approval._id },
                    update: { $set: { data: updatedRows } },
                },
            });
            if (pending.length >= 200) {
                await PayrollApprovalModel.bulkWrite(pending, { ordered: false });
                pending = [];
            }
        }
    }
    if (!options.dryRun && pending.length) {
        await PayrollApprovalModel.bulkWrite(pending, { ordered: false });
    }
    await mongoose_1.default.disconnect();
    console.log(JSON.stringify({
        dryRun: options.dryRun,
        entity: options.entity ?? null,
        status: options.status ?? null,
        since: options.since ? options.since.toISOString() : null,
        approvalId: options.approvalId ?? null,
        limit: options.limit ?? null,
        ...summary,
    }, null, 2));
};
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
//# sourceMappingURL=backfill-payroll-approval-proration.js.map