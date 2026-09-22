"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLeaveAllowancePayrollApproval = exports.resolvePayrollApprovalRows = exports.normalizePayrollApprovalTypeToken = exports.resolvePayrollWorkflowType = void 0;
const LEAVE_ALLOWANCE_TYPE_TOKENS = new Set(['leave', 'leaveallowance']);
const resolvePayrollWorkflowType = (value) => {
    if (typeof value !== 'string')
        return 'payroll';
    const normalized = value.trim().toLowerCase().replace(/[\s_]+/g, '-');
    if (normalized === 'leave' ||
        normalized === 'leave-allowance' ||
        normalized === 'leaveallowance') {
        return 'leave-allowance';
    }
    return 'payroll';
};
exports.resolvePayrollWorkflowType = resolvePayrollWorkflowType;
const normalizePayrollApprovalTypeToken = (value) => {
    if (typeof value !== 'string')
        return null;
    const trimmed = value.trim().toLowerCase();
    if (!trimmed)
        return null;
    return trimmed.replace(/[^a-z]/g, '');
};
exports.normalizePayrollApprovalTypeToken = normalizePayrollApprovalTypeToken;
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
exports.resolvePayrollApprovalRows = resolvePayrollApprovalRows;
const isLeaveAllowancePayrollApproval = (approval) => {
    if (!approval || typeof approval !== 'object')
        return false;
    const approvalTypes = Array.isArray(approval?.types)
        ? approval.types
            .map((value) => (0, exports.normalizePayrollApprovalTypeToken)(value))
            .filter((value) => Boolean(value))
        : [];
    if (approvalTypes.length > 0) {
        return approvalTypes.some((type) => LEAVE_ALLOWANCE_TYPE_TOKENS.has(type));
    }
    const rows = (0, exports.resolvePayrollApprovalRows)(approval?.data);
    if (!rows.length)
        return false;
    const rowTypes = rows
        .map((row) => (0, exports.normalizePayrollApprovalTypeToken)(row?.type))
        .filter((value) => Boolean(value));
    if (rowTypes.length > 0) {
        return rowTypes.some((type) => LEAVE_ALLOWANCE_TYPE_TOKENS.has(type));
    }
    return false;
};
exports.isLeaveAllowancePayrollApproval = isLeaveAllowancePayrollApproval;
//# sourceMappingURL=payroll-approval-data.util.js.map