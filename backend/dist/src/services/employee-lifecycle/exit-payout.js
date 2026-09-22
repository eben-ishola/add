"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveExitPayout = exports.clearedByPayrollRun = void 0;
const startOfDay = (value) => new Date(value.getFullYear(), value.getMonth(), value.getDate());
const toDate = (value) => {
    if (!value)
        return null;
    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};
const text = (value) => String(value ?? '').trim();
const clearedByPayrollRun = (input) => {
    if (text(input.clearanceStatus).toUpperCase() !== 'COMPLETED')
        return false;
    const completedAt = toDate(input.clearanceCompletedAt);
    const runDate = toDate(input.payrollRunDate);
    if (!completedAt)
        return false;
    if (!runDate)
        return true;
    return startOfDay(completedAt).getTime() <= startOfDay(runDate).getTime();
};
exports.clearedByPayrollRun = clearedByPayrollRun;
const resolveExitPayout = (input) => {
    const ownAccount = text(input.accountNumber);
    const name = text(input.staffName) || text(input.staffId) || 'Exiting staff';
    const baseNarration = text(input.baseNarration);
    if ((0, exports.clearedByPayrollRun)(input)) {
        return { accountNumber: ownAccount, narration: baseNarration, redirected: false };
    }
    const exitAccount = text(input.exitAccountNumber);
    if (!exitAccount) {
        return {
            accountNumber: ownAccount,
            narration: baseNarration,
            redirected: false,
            reason: 'No exit account number is configured for this entity.',
        };
    }
    return {
        accountNumber: exitAccount,
        narration: [name, baseNarration].filter(Boolean).join(' '),
        redirected: true,
        reason: 'Exit clearance was not completed on or before the payroll run date.',
    };
};
exports.resolveExitPayout = resolveExitPayout;
//# sourceMappingURL=exit-payout.js.map