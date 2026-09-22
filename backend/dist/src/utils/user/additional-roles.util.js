"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeAdditionalRoleAssignments = void 0;
const mongoose_1 = require("mongoose");
const normalizeObjectIdValue = (value) => {
    if (value == null) {
        return null;
    }
    const candidate = typeof value === 'string'
        ? value
        : typeof value?.toHexString === 'function'
            ? value.toHexString()
            : typeof value?._id === 'string'
                ? value._id
                : typeof value?.id === 'string'
                    ? value.id
                    : typeof value?.$oid === 'string'
                        ? value.$oid
                        : typeof value?.toString === 'function'
                            ? value.toString()
                            : null;
    const trimmed = candidate?.trim?.() ?? '';
    if (!trimmed || !mongoose_1.Types.ObjectId.isValid(trimmed)) {
        return null;
    }
    return new mongoose_1.Types.ObjectId(trimmed);
};
const normalizeAdditionalRoleAssignments = (input) => {
    const list = Array.isArray(input) ? input : input ? [input] : [];
    let mutated = !Array.isArray(input);
    const normalized = [];
    list.forEach((entry) => {
        if (!entry) {
            mutated = true;
            return;
        }
        const roleCandidate = typeof entry === 'object'
            ? entry?.role ?? entry?.roleId ?? entry?.value ?? (typeof entry?.toString === 'function' ? entry.toString() : undefined)
            : entry;
        const role = normalizeObjectIdValue(roleCandidate);
        if (!role) {
            mutated = true;
            return;
        }
        const entityCandidate = typeof entry === 'object'
            ? entry?.entity ?? entry?.entityId ?? entry?.subsidiary ?? entry?.tenant ?? null
            : null;
        const entity = normalizeObjectIdValue(entityCandidate);
        const matchesExpectedShape = typeof entry === 'object' &&
            normalizeObjectIdValue(entry?.role)?.equals(role) &&
            ((entity == null && (entry?.entity == null || entry?.entity === '')) ||
                (entity != null && normalizeObjectIdValue(entry?.entity)?.equals(entity)));
        if (!matchesExpectedShape) {
            mutated = true;
        }
        normalized.push({ role, entity: entity ?? null });
    });
    const deduped = new Map();
    normalized.forEach((assignment) => {
        const key = `${assignment.role.toHexString()}::${assignment.entity?.toHexString() ?? ''}`;
        if (!deduped.has(key)) {
            deduped.set(key, assignment);
        }
        else {
            mutated = true;
        }
    });
    return { assignments: Array.from(deduped.values()), mutated };
};
exports.normalizeAdditionalRoleAssignments = normalizeAdditionalRoleAssignments;
//# sourceMappingURL=additional-roles.util.js.map