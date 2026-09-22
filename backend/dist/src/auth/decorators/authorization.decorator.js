"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireRoles = exports.RequirePermissions = exports.REQUIRED_ROLES_KEY = exports.REQUIRED_PERMISSIONS_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.REQUIRED_PERMISSIONS_KEY = 'authz:requiredPermissions';
exports.REQUIRED_ROLES_KEY = 'authz:requiredRoles';
const normalizeValues = (values) => (Array.isArray(values) ? values : [values])
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
const RequirePermissions = (permissions, options = {}) => (0, common_1.SetMetadata)(exports.REQUIRED_PERMISSIONS_KEY, {
    values: normalizeValues(permissions),
    mode: options.mode ?? 'any',
    message: options.message,
});
exports.RequirePermissions = RequirePermissions;
const RequireRoles = (roles, options = {}) => (0, common_1.SetMetadata)(exports.REQUIRED_ROLES_KEY, {
    values: normalizeValues(roles),
    mode: options.mode ?? 'any',
    message: options.message,
});
exports.RequireRoles = RequireRoles;
//# sourceMappingURL=authorization.decorator.js.map