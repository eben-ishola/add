"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectUserForSource = exports.normalizeRequestSource = exports.REQUEST_SOURCES = exports.EXTERNAL_REQUEST_SOURCE = exports.MAIN_REQUEST_SOURCE = void 0;
exports.MAIN_REQUEST_SOURCE = 'main';
exports.EXTERNAL_REQUEST_SOURCE = 'others';
exports.REQUEST_SOURCES = [
    exports.MAIN_REQUEST_SOURCE,
    exports.EXTERNAL_REQUEST_SOURCE,
];
const normalizeRequestSource = (value) => typeof value === 'string' && value.trim().toLowerCase() === exports.MAIN_REQUEST_SOURCE
    ? exports.MAIN_REQUEST_SOURCE
    : exports.EXTERNAL_REQUEST_SOURCE;
exports.normalizeRequestSource = normalizeRequestSource;
const EXTERNAL_USER_FIELDS = [
    '_id',
    'id',
    'userId',
    'staffId',
    'orbitID',
    'email',
    'firstName',
    'lastName',
    'middleName',
    'status',
    'confirmed',
    'startDate',
    'entity',
    'department',
    'branch',
    'businessUnit',
    'supervisorId',
    'role',
    'assignedApps',
    'mfaEnabled',
    'mfaRequired',
    'mfaExempt',
    'accessScope',
    'mfaSetupPending',
    'mfaVerified',
];
const projectUserForSource = (user, source) => {
    if (source === exports.MAIN_REQUEST_SOURCE) {
        return user;
    }
    if (!user || typeof user !== 'object') {
        return user;
    }
    const projected = {};
    for (const field of EXTERNAL_USER_FIELDS) {
        const value = user[field];
        if (value !== undefined) {
            projected[field] = value;
        }
    }
    return projected;
};
exports.projectUserForSource = projectUserForSource;
//# sourceMappingURL=request-source.js.map