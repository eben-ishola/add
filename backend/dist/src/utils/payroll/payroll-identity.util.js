"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildProcessedPayrollEntityMatch = exports.buildPayrollStaffIdentityQuery = exports.collectPayrollIdentifierValues = exports.normalizePayrollUserIdList = exports.normalizePayrollUserId = exports.parsePayrollBooleanFlag = exports.resolvePayrollEntityId = exports.normalizePayrollEntityKey = void 0;
const mongoose_1 = require("mongoose");
const normalizePayrollEntityKey = (value) => {
    if (!value) {
        return null;
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length ? trimmed : null;
    }
    if (value instanceof mongoose_1.Types.ObjectId) {
        return value.toHexString();
    }
    if (typeof value === 'object') {
        const candidate = value?._id ?? value?.id ?? value?.value ?? value?.entity;
        if (candidate) {
            return (0, exports.normalizePayrollEntityKey)(candidate);
        }
    }
    return null;
};
exports.normalizePayrollEntityKey = normalizePayrollEntityKey;
const resolvePayrollEntityId = (input) => {
    if (!input) {
        return undefined;
    }
    if (typeof input === 'string' && input.trim()) {
        return input;
    }
    if (mongoose_1.Types.ObjectId.isValid(input)) {
        return new mongoose_1.Types.ObjectId(input).toHexString();
    }
    if (typeof input === 'object') {
        const candidate = input._id ?? input.id;
        if (!candidate) {
            return undefined;
        }
        if (typeof candidate === 'string' && candidate.trim()) {
            return candidate;
        }
        if (mongoose_1.Types.ObjectId.isValid(candidate)) {
            return new mongoose_1.Types.ObjectId(candidate).toHexString();
        }
    }
    return undefined;
};
exports.resolvePayrollEntityId = resolvePayrollEntityId;
const parsePayrollBooleanFlag = (value) => {
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
exports.parsePayrollBooleanFlag = parsePayrollBooleanFlag;
const normalizePayrollUserId = (value) => {
    if (value == null)
        return null;
    const candidate = typeof value === 'object'
        ? value?._id ??
            value?.id ??
            value?.userId ??
            value?.employeeId ??
            value
        : value;
    const normalized = String(candidate ?? '').trim();
    if (!normalized ||
        normalized.toLowerCase() === 'undefined' ||
        normalized.toLowerCase() === 'null') {
        return null;
    }
    if (!mongoose_1.Types.ObjectId.isValid(normalized)) {
        return null;
    }
    return normalized;
};
exports.normalizePayrollUserId = normalizePayrollUserId;
const normalizePayrollUserIdList = (values) => {
    const list = Array.isArray(values) ? values : values ? [values] : [];
    const unique = new Set();
    list.forEach((value) => {
        const normalized = (0, exports.normalizePayrollUserId)(value);
        if (normalized) {
            unique.add(normalized);
        }
    });
    return Array.from(unique);
};
exports.normalizePayrollUserIdList = normalizePayrollUserIdList;
const collectPayrollIdentifierValues = (...values) => {
    const identifiers = new Set();
    const seen = new Set();
    const addValue = (value) => {
        if (value === null || value === undefined)
            return;
        let current = value;
        while (current !== null && current !== undefined) {
            if (typeof current === 'object') {
                if (seen.has(current))
                    return;
                seen.add(current);
                if (current instanceof mongoose_1.Types.ObjectId) {
                    identifiers.add(current.toHexString());
                    return;
                }
                if (typeof current.toHexString === 'function') {
                    try {
                        const hex = current.toHexString();
                        if (hex) {
                            identifiers.add(String(hex));
                            return;
                        }
                    }
                    catch {
                    }
                }
                const candidate = current?._id ??
                    current?.id ??
                    current?.userId ??
                    current?.staffId ??
                    current?.staffID ??
                    current?.employeeId ??
                    current?.email ??
                    current?.value;
                if (candidate && candidate !== current) {
                    current = candidate;
                    continue;
                }
                const fallback = typeof current.toString === 'function' ? current.toString() : '';
                if (fallback &&
                    fallback !== '[object Object]' &&
                    fallback.toLowerCase() !== 'undefined' &&
                    fallback.toLowerCase() !== 'null') {
                    identifiers.add(fallback);
                }
                return;
            }
            const str = String(current).trim();
            if (!str || str.toLowerCase() === 'undefined' || str.toLowerCase() === 'null')
                return;
            identifiers.add(str);
            return;
        }
    };
    values.forEach(addValue);
    return Array.from(identifiers);
};
exports.collectPayrollIdentifierValues = collectPayrollIdentifierValues;
const buildPayrollStaffIdentityQuery = (identifiers) => {
    if (!identifiers.length)
        return {};
    return {
        $or: [
            { staffId: { $in: identifiers } },
            { employeeId: { $in: identifiers } },
            { userId: { $in: identifiers } },
            { staffObjectId: { $in: identifiers } },
        ],
    };
};
exports.buildPayrollStaffIdentityQuery = buildPayrollStaffIdentityQuery;
const buildProcessedPayrollEntityMatch = (entityId) => {
    if (!entityId)
        return {};
    const matches = [entityId];
    if (mongoose_1.Types.ObjectId.isValid(entityId)) {
        matches.push(new mongoose_1.Types.ObjectId(entityId));
    }
    return { entity: { $in: matches } };
};
exports.buildProcessedPayrollEntityMatch = buildProcessedPayrollEntityMatch;
//# sourceMappingURL=payroll-identity.util.js.map