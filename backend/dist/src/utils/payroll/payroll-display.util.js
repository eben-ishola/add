"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvePayrollStaffLabel = exports.resolvePayrollEntityLabel = exports.composePayrollUserName = exports.computePayrollSectionTotals = exports.collectPayrollParticipantIds = exports.normalizePayrollEmail = exports.buildPayrollPortalUrl = exports.getPayrollPortalBaseUrl = exports.resolvePayrollApprovalMonthLabel = exports.formatPayrollDisplayMonthLabel = void 0;
const payroll_period_util_1 = require("./payroll-period.util");
const config_1 = require("../../config");
const formatPayrollDisplayMonthLabel = (value) => (0, payroll_period_util_1.formatPayrollMonthLabel)(value);
exports.formatPayrollDisplayMonthLabel = formatPayrollDisplayMonthLabel;
const resolvePayrollApprovalMonthLabel = (approval) => {
    const candidate = approval?.processedAt ??
        approval?.postingApprovedAt ??
        approval?.approverApprovedAt ??
        approval?.reviewerApprovedAt ??
        approval?.gmdApprovedAt ??
        approval?.mdApprovedAt ??
        approval?.createdAt ??
        new Date();
    return (0, exports.formatPayrollDisplayMonthLabel)(candidate);
};
exports.resolvePayrollApprovalMonthLabel = resolvePayrollApprovalMonthLabel;
const getPayrollPortalBaseUrl = (env = process.env) => {
    const candidates = [
        env.HR_PORTAL_WEB_URL,
        env.HR_PORTAL_BASE_URL,
        env.FRONTEND_BASE_URL,
        env.FRONTEND_URL,
    ];
    const fallback = config_1.config.frontendUrl;
    const base = candidates.find((value) => typeof value === 'string' && value.trim().length > 0) ?? fallback;
    return base.replace(/\/+$/, '');
};
exports.getPayrollPortalBaseUrl = getPayrollPortalBaseUrl;
const buildPayrollPortalUrl = (path, env = process.env) => {
    const base = (0, exports.getPayrollPortalBaseUrl)(env);
    if (!path)
        return base;
    if (/^https?:\/\//i.test(path)) {
        return path;
    }
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};
exports.buildPayrollPortalUrl = buildPayrollPortalUrl;
const normalizePayrollEmail = (value) => {
    if (typeof value !== 'string')
        return null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
};
exports.normalizePayrollEmail = normalizePayrollEmail;
const collectPayrollParticipantIds = (approval) => {
    const recipients = new Set();
    const register = (value) => {
        if (value) {
            recipients.add(String(value));
        }
    };
    const registerList = (values) => {
        (values ?? []).forEach((value) => value && recipients.add(value));
    };
    register(approval?.requestedBy);
    register(approval?.initiatorId);
    registerList(approval?.reviewerIds);
    registerList(approval?.approverIds);
    registerList(approval?.auditViewerIds);
    return Array.from(recipients);
};
exports.collectPayrollParticipantIds = collectPayrollParticipantIds;
const computePayrollSectionTotals = (rows) => {
    const totals = { all: {} };
    const addValue = (bucket, key, value) => {
        if (!Number.isFinite(value))
            return;
        bucket[key] = (bucket[key] ?? 0) + value;
    };
    (rows ?? []).forEach((row) => {
        if (!row || typeof row !== 'object')
            return;
        const sectionKey = row.type ? String(row.type) : 'general';
        totals[sectionKey] = totals[sectionKey] ?? {};
        Object.entries(row).forEach(([key, rawValue]) => {
            if (key === 'type')
                return;
            const numeric = typeof rawValue === 'number'
                ? rawValue
                : typeof rawValue === 'string'
                    ? Number(rawValue)
                    : NaN;
            if (!Number.isFinite(numeric))
                return;
            addValue(totals[sectionKey], key, numeric);
            addValue(totals.all, key, numeric);
        });
    });
    return totals;
};
exports.computePayrollSectionTotals = computePayrollSectionTotals;
const composePayrollUserName = (user) => {
    if (!user)
        return undefined;
    const directName = [user?.name, user?.fullName, user?.displayName, user?.staffName]
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .find(Boolean);
    if (directName)
        return directName;
    const parts = [user?.firstName, user?.middleName, user?.lastName]
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter(Boolean);
    if (parts.length)
        return parts.join(' ');
    const fallback = [user?.email, user?.staffId, user?.userId]
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .find(Boolean);
    return fallback || undefined;
};
exports.composePayrollUserName = composePayrollUserName;
const resolvePayrollEntityLabel = (entityRef) => {
    const candidate = entityRef?.data ?? entityRef;
    if (candidate && typeof candidate === 'object') {
        const label = candidate?.name ??
            candidate?.short ??
            candidate?.title ??
            candidate?.code ??
            candidate?.abbr ??
            candidate?.label ??
            candidate?.entityName ??
            candidate?.subsidiaryName;
        if (label) {
            return String(label).trim();
        }
        const fallback = candidate?._id ?? candidate?.id ?? candidate?.entityId ?? candidate?.value;
        if (fallback) {
            return String(fallback).trim();
        }
    }
    if (typeof candidate === 'string') {
        const trimmed = candidate.trim();
        return trimmed ? trimmed : undefined;
    }
    return undefined;
};
exports.resolvePayrollEntityLabel = resolvePayrollEntityLabel;
const resolvePayrollStaffLabel = (directory, value) => {
    if (!value)
        return undefined;
    if (typeof value === 'object') {
        const directName = (0, exports.composePayrollUserName)(value);
        if (directName) {
            return directName;
        }
        const named = value?.name ??
            value?.fullName ??
            value?.label ??
            value?.title;
        if (named) {
            const trimmed = String(named).trim();
            if (trimmed)
                return trimmed;
        }
    }
    const candidate = typeof value === 'object'
        ? value?._id ?? value?.id ?? value?.userId ?? value
        : value;
    const key = typeof candidate === 'string' || typeof candidate === 'number'
        ? String(candidate).trim()
        : String(candidate ?? '').trim();
    if (!key)
        return undefined;
    const resolved = directory.get(key) ??
        directory.get(key.toLowerCase()) ??
        directory.get(key.toUpperCase());
    if (resolved)
        return resolved;
    if (typeof candidate === 'string') {
        const trimmed = candidate.trim();
        if (trimmed && /[a-z]/i.test(trimmed) && /\s+/.test(trimmed)) {
            return trimmed;
        }
    }
    return undefined;
};
exports.resolvePayrollStaffLabel = resolvePayrollStaffLabel;
//# sourceMappingURL=payroll-display.util.js.map