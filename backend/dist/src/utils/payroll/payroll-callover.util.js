"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPayrollCalloverComparison = exports.buildAccountTotals = exports.extractPayrollAmount = exports.extractPayrollAccount = exports.extractCalloverAmount = exports.extractCalloverAccount = exports.parsePayrollAmount = exports.normalizePayrollAccount = void 0;
const CALLOVER_TOLERANCE = 0.01;
const normalizePayrollAccount = (value) => {
    if (value === null || value === undefined)
        return null;
    const text = String(value).trim();
    if (!text)
        return null;
    return text.replace(/[^0-9a-z]/gi, '').toUpperCase();
};
exports.normalizePayrollAccount = normalizePayrollAccount;
const parsePayrollAmount = (value) => {
    if (value === null || value === undefined || value === '')
        return 0;
    if (typeof value === 'number')
        return Number.isFinite(value) ? value : 0;
    const cleaned = String(value).replace(/,/g, '').trim();
    if (!cleaned)
        return 0;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
};
exports.parsePayrollAmount = parsePayrollAmount;
const extractCalloverAccount = (row) => {
    const raw = row?.acct_no ??
        row?.acctNo ??
        row?.accountNo ??
        row?.accountNumber ??
        row?.account ??
        row?.ACCT_NO ??
        row?.ACCTNO ??
        row?.ACCOUNT_NO ??
        row?.ACCOUNTNUMBER ??
        row?.ACCOUNT ??
        null;
    return (0, exports.normalizePayrollAccount)(raw);
};
exports.extractCalloverAccount = extractCalloverAccount;
const extractCalloverAmount = (row) => {
    const raw = row?.txn_amt ??
        row?.txnAmt ??
        row?.amount ??
        row?.gross ??
        row?.TXN_AMT ??
        row?.TXNAMT ??
        row?.AMOUNT ??
        row?.GROSS ??
        null;
    return (0, exports.parsePayrollAmount)(raw);
};
exports.extractCalloverAmount = extractCalloverAmount;
const extractPayrollAccount = (row) => {
    const raw = row?.accountNo ??
        row?.accountNumber ??
        row?.account ??
        row?.acct_no ??
        row?.acctNo ??
        row?.addosserAccount ??
        row?.atlasAccount ??
        null;
    return (0, exports.normalizePayrollAccount)(raw);
};
exports.extractPayrollAccount = extractPayrollAccount;
const normalizePayrollType = (value) => {
    if (value === null || value === undefined)
        return '';
    const text = String(value).trim().toLowerCase();
    if (!text)
        return '';
    return text.replace(/[\s_-]+/g, '');
};
const pickFirst = (...values) => {
    for (const value of values) {
        if (value === null || value === undefined || value === '')
            continue;
        return value;
    }
    return null;
};
const extractPayrollAmount = (row, typeOverride) => {
    const type = normalizePayrollType(typeOverride ??
        row?.type ??
        row?.payrollType ??
        row?.payType ??
        row?.payroll_type ??
        row?.paymentType ??
        row?.category);
    let raw = null;
    switch (type) {
        case 'salary':
            raw = pickFirst(row?.monthlyNet, row?.netPay, row?.net, row?.amount, row?.total);
            break;
        case 'bank':
            raw = pickFirst(row?.bankAmount, row?.bank_amount, row?.bank, row?.amount, row?.netPay, row?.net, row?.gross, row?.grossPay, row?.monthlyNet, row?.monthlyGross, row?.total);
            break;
        case 'individual':
            raw = pickFirst(row?.individualAmount, row?.individual_amount, row?.individual, row?.amount, row?.netPay, row?.net, row?.gross, row?.grossPay, row?.monthlyNet, row?.monthlyGross, row?.total);
            break;
        case 'reimbursable':
            raw = pickFirst(row?.reimbursable, row?.reimbursableAmount, row?.remibursableAmount, row?.amount, row?.netPay, row?.net, row?.gross, row?.grossPay, row?.monthlyNet, row?.monthlyGross, row?.total);
            break;
        default:
            raw = pickFirst(row?.amount, row?.netPay, row?.net, row?.gross, row?.grossPay, row?.monthlyNet, row?.monthlyGross, row?.total);
            break;
    }
    return (0, exports.parsePayrollAmount)(raw);
};
exports.extractPayrollAmount = extractPayrollAmount;
const buildAccountTotals = (rows, extractAccount, extractAmount) => {
    const totals = new Map();
    rows.forEach((row) => {
        const account = extractAccount(row);
        if (!account)
            return;
        const amount = extractAmount(row);
        if (!Number.isFinite(amount) || amount === 0) {
            if (!totals.has(account)) {
                totals.set(account, 0);
            }
            return;
        }
        totals.set(account, (totals.get(account) ?? 0) + amount);
    });
    return totals;
};
exports.buildAccountTotals = buildAccountTotals;
const buildPayrollCalloverComparison = (calloverRows, payrollRows, typeOverride) => {
    const calloverTotals = (0, exports.buildAccountTotals)(calloverRows, exports.extractCalloverAccount, exports.extractCalloverAmount);
    const payrollTotals = (0, exports.buildAccountTotals)(payrollRows, exports.extractPayrollAccount, (row) => (0, exports.extractPayrollAmount)(row, typeOverride));
    const comparison = [];
    const pendingCallover = new Map(calloverTotals);
    payrollTotals.forEach((payrollAmount, account) => {
        const calloverAmount = pendingCallover.get(account);
        if (calloverAmount === undefined) {
            if (Math.abs(payrollAmount) <= CALLOVER_TOLERANCE) {
                comparison.push({
                    account,
                    payrollAmount,
                    calloverAmount: 0,
                    difference: 0,
                    status: 'matched',
                    flag: false,
                });
            }
            else {
                comparison.push({
                    account,
                    payrollAmount,
                    calloverAmount: 0,
                    difference: -payrollAmount,
                    status: 'missing',
                    flag: true,
                });
            }
            return;
        }
        pendingCallover.delete(account);
        const matched = Math.abs(Math.abs(calloverAmount) - Math.abs(payrollAmount)) <=
            CALLOVER_TOLERANCE;
        const status = matched ? 'matched' : 'mismatch';
        comparison.push({
            account,
            payrollAmount,
            calloverAmount,
            difference: calloverAmount - payrollAmount,
            status,
            flag: !matched,
        });
    });
    pendingCallover.forEach((calloverAmount, account) => {
        if (Math.abs(calloverAmount) <= CALLOVER_TOLERANCE) {
            comparison.push({
                account,
                payrollAmount: 0,
                calloverAmount,
                difference: 0,
                status: 'matched',
                flag: false,
            });
        }
        else {
            comparison.push({
                account,
                payrollAmount: 0,
                calloverAmount,
                difference: calloverAmount,
                status: 'unexpected',
                flag: true,
            });
        }
    });
    const summary = comparison.reduce((acc, row) => {
        if (row.status === 'matched')
            acc.matched += 1;
        if (row.status === 'mismatch')
            acc.mismatched += 1;
        if (row.status === 'missing')
            acc.missing += 1;
        if (row.status === 'unexpected')
            acc.unexpected += 1;
        return acc;
    }, {
        calloverCount: calloverRows.length,
        payrollCount: payrollRows.length,
        matched: 0,
        mismatched: 0,
        missing: 0,
        unexpected: 0,
        hasIssues: false,
        comparisonSkipped: false,
    });
    summary.hasIssues =
        summary.mismatched > 0 || summary.missing > 0 || summary.unexpected > 0;
    return { comparison, summary };
};
exports.buildPayrollCalloverComparison = buildPayrollCalloverComparison;
//# sourceMappingURL=payroll-callover.util.js.map