"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPayslipApprovalApprover = exports.isPayslipApprovalReviewer = exports.canViewPayrollApproval = exports.canViewPayrollFinanceOrAudit = exports.isPayrollApprovalAuditViewer = exports.isPayrollApprovalPoster = exports.isPayrollApprovalApprover = exports.isPayrollApprovalReviewer = exports.isPayrollApprovalInitiator = exports.payrollListIncludesUserIdentifier = exports.getPayrollUserIdentifierSet = void 0;
const payroll_identity_util_1 = require("./payroll-identity.util");
const normalizeIdentifierToken = (value) => {
    const normalized = String(value ?? '').trim().toLowerCase();
    if (!normalized ||
        normalized === 'null' ||
        normalized === 'undefined' ||
        normalized === '[object object]') {
        return null;
    }
    return normalized;
};
const getPayrollUserIdentifierSet = (user) => {
    const identifiers = (0, payroll_identity_util_1.collectPayrollIdentifierValues)(user?.id, user?._id, user?.userId, user?.email)
        .map((value) => normalizeIdentifierToken(value))
        .filter((value) => Boolean(value));
    return new Set(identifiers);
};
exports.getPayrollUserIdentifierSet = getPayrollUserIdentifierSet;
const payrollListIncludesUserIdentifier = (values, identifierSet) => {
    if (!identifierSet.size || values == null)
        return false;
    const bucket = Array.isArray(values) ? values : [values];
    return bucket.some((entry) => {
        const candidates = (0, payroll_identity_util_1.collectPayrollIdentifierValues)(entry);
        return candidates.some((candidate) => {
            const normalized = String(candidate ?? '').trim();
            if (!normalized)
                return false;
            const tokens = normalized
                .split(',')
                .map((part) => normalizeIdentifierToken(part))
                .filter((part) => Boolean(part));
            return tokens.some((token) => identifierSet.has(token));
        });
    });
};
exports.payrollListIncludesUserIdentifier = payrollListIncludesUserIdentifier;
const isPayrollApprovalInitiator = (user, approval) => {
    const identifierSet = (0, exports.getPayrollUserIdentifierSet)(user);
    return (0, exports.payrollListIncludesUserIdentifier)([approval?.initiatorId, approval?.requestedBy], identifierSet);
};
exports.isPayrollApprovalInitiator = isPayrollApprovalInitiator;
const isPayrollApprovalReviewer = (user, approval) => {
    const identifierSet = (0, exports.getPayrollUserIdentifierSet)(user);
    if ((0, exports.payrollListIncludesUserIdentifier)(approval?.reviewerIds, identifierSet)) {
        return true;
    }
    return (0, exports.payrollListIncludesUserIdentifier)(approval?.reviewerApprovedBy, identifierSet);
};
exports.isPayrollApprovalReviewer = isPayrollApprovalReviewer;
const isPayrollApprovalApprover = (user, approval) => {
    const identifierSet = (0, exports.getPayrollUserIdentifierSet)(user);
    if ((0, exports.payrollListIncludesUserIdentifier)(approval?.approverIds, identifierSet)) {
        return true;
    }
    return (0, exports.payrollListIncludesUserIdentifier)(approval?.approverApprovedBy, identifierSet);
};
exports.isPayrollApprovalApprover = isPayrollApprovalApprover;
const isPayrollApprovalPoster = (user, approval) => {
    const identifierSet = (0, exports.getPayrollUserIdentifierSet)(user);
    if ((0, exports.payrollListIncludesUserIdentifier)(approval?.postingIds, identifierSet)) {
        return true;
    }
    return (0, exports.payrollListIncludesUserIdentifier)(approval?.postingApprovedBy, identifierSet);
};
exports.isPayrollApprovalPoster = isPayrollApprovalPoster;
const isPayrollApprovalAuditViewer = (user, approval) => {
    const identifierSet = (0, exports.getPayrollUserIdentifierSet)(user);
    return (0, exports.payrollListIncludesUserIdentifier)(approval?.auditViewerIds, identifierSet);
};
exports.isPayrollApprovalAuditViewer = isPayrollApprovalAuditViewer;
const canViewPayrollFinanceOrAudit = (user, approval, options) => {
    if (!approval)
        return false;
    const status = String(approval.status ?? '').toUpperCase();
    if (!options.financeAuditViewStatuses.has(status)) {
        return false;
    }
    return (options.hasFinanceScope(user) ||
        options.isAuditDepartment(user) ||
        (0, exports.isPayrollApprovalAuditViewer)(user, approval));
};
exports.canViewPayrollFinanceOrAudit = canViewPayrollFinanceOrAudit;
const canViewPayrollApproval = (user, approval, options) => {
    if (!approval)
        return false;
    if (options.hasSuperAdminRole(user))
        return true;
    if ((0, exports.isPayrollApprovalInitiator)(user, approval))
        return true;
    if ((0, exports.isPayrollApprovalReviewer)(user, approval))
        return true;
    if ((0, exports.canViewPayrollFinanceOrAudit)(user, approval, options))
        return true;
    if ((0, exports.isPayrollApprovalApprover)(user, approval) &&
        options.approverViewStatuses.has(String(approval.status))) {
        return true;
    }
    if ((0, exports.isPayrollApprovalPoster)(user, approval) &&
        options.posterViewStatuses.has(String(approval.status))) {
        return true;
    }
    return false;
};
exports.canViewPayrollApproval = canViewPayrollApproval;
const isPayslipApprovalReviewer = (user, approval) => {
    const userId = (0, payroll_identity_util_1.normalizePayrollUserId)(user?._id);
    if (!userId || !Array.isArray(approval?.reviewerIds))
        return false;
    return approval.reviewerIds.includes(userId);
};
exports.isPayslipApprovalReviewer = isPayslipApprovalReviewer;
const isPayslipApprovalApprover = (user, approval) => {
    const userId = (0, payroll_identity_util_1.normalizePayrollUserId)(user?._id);
    if (!userId || !Array.isArray(approval?.approverIds))
        return false;
    return approval.approverIds.includes(userId);
};
exports.isPayslipApprovalApprover = isPayslipApprovalApprover;
//# sourceMappingURL=payroll-approval-visibility.util.js.map