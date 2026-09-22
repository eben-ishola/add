"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeNameFields = exports.toTitleCaseName = exports.NAME_FIELDS = void 0;
exports.NAME_FIELDS = ['firstName', 'middleName', 'lastName'];
const toTitleCaseName = (value) => {
    if (value === null || value === undefined)
        return '';
    const text = String(value).trim().replace(/\s+/g, ' ');
    if (!text)
        return '';
    return text
        .toLocaleLowerCase()
        .replace(/(^|[\s\-'’.])(\p{L})/gu, (_match, boundary, letter) => boundary + letter.toLocaleUpperCase());
};
exports.toTitleCaseName = toTitleCaseName;
const normalizeNameFields = (payload) => {
    if (!payload || typeof payload !== 'object')
        return payload;
    for (const field of exports.NAME_FIELDS) {
        if (field in payload) {
            const raw = payload[field];
            if (raw === null || raw === undefined || raw === '')
                continue;
            payload[field] = (0, exports.toTitleCaseName)(raw);
        }
    }
    return payload;
};
exports.normalizeNameFields = normalizeNameFields;
//# sourceMappingURL=user-name.util.js.map