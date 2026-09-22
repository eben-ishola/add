"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertCanManagePerformanceWorkflow = exports.canManagePerformanceWorkflow = exports.userHasPerformanceWorkflowRole = exports.userHasPerformanceAdminRole = exports.userHasPerformanceSuperAdminRole = exports.userHasPerformancePermission = void 0;
const common_1 = require("@nestjs/common");
const access_control_util_1 = require("../shared/access-control.util");
const SUPER_ADMIN_ROLE_NAMES = access_control_util_1.SUPER_ADMIN_ROLE_NAME_SET;
const ADMIN_ROLE_NAMES = new Set([
    'admin',
    'system admin',
    'system-admin',
    'systemadmin',
    'entity hr admin',
    'entity-hr-admin',
    'entityhradmin',
]);
const PERFORMANCE_WORKFLOW_ROLE_NAMES = new Set([
    'performance-manager',
    'performance manager',
    'performancemanager',
    'performance-officer',
    'performance officer',
    'performanceofficer',
    'performance-training-partner',
    'performance training partner',
    'performancetrainingpartner',
]);
const extractRoleNames = (roleLike) => {
    const names = [];
    const register = (value) => {
        if (typeof value === 'string' && value.trim()) {
            names.push(value.trim().toLowerCase());
        }
    };
    if (!roleLike)
        return names;
    if (typeof roleLike === 'string') {
        register(roleLike);
        return names;
    }
    register(roleLike?.name);
    register(roleLike?.label);
    if (roleLike?.role) {
        register(roleLike.role?.name);
        register(roleLike.role?.label);
    }
    return names;
};
const extractPermissionNames = (user) => {
    const names = new Set();
    const register = (source) => {
        if (!source)
            return;
        const values = Array.isArray(source) ? source : [source];
        values.forEach((permission) => {
            if (!permission)
                return;
            if (typeof permission === 'string') {
                names.add(permission.trim().toLowerCase());
            }
            else if (typeof permission?.name === 'string') {
                names.add(permission.name.trim().toLowerCase());
            }
        });
    };
    register(user?.permissions);
    register(user?.role?.permissions);
    if (Array.isArray(user?.roles)) {
        user.roles.forEach((role) => {
            register(role?.permissions);
            register(role?.role?.permissions);
        });
    }
    const additional = Array.isArray(user?.additionalRoles)
        ? user.additionalRoles
        : user?.additionalRoles
            ? [user.additionalRoles]
            : [];
    additional.forEach((assignment) => {
        const roleNode = assignment?.role ?? assignment;
        register(roleNode?.permissions);
    });
    return names;
};
const normalizeRoleNameTokens = (roleName) => {
    const base = String(roleName).trim().toLowerCase();
    if (!base)
        return [];
    const condensed = base.replace(/[\s_-]+/g, '');
    const hyphenated = base.replace(/[\s_]+/g, '-');
    return Array.from(new Set([base, condensed, hyphenated]));
};
const userHasPerformancePermission = (user, required) => {
    const permissions = extractPermissionNames(user);
    if (permissions.has('all'))
        return true;
    const list = Array.isArray(required) ? required : [required];
    return list.some((permission) => permissions.has(permission.toLowerCase()));
};
exports.userHasPerformancePermission = userHasPerformancePermission;
const userHasPerformanceSuperAdminRole = (user) => {
    const permissions = extractPermissionNames(user);
    if (permissions.has('all'))
        return true;
    for (const name of permissions) {
        if (SUPER_ADMIN_ROLE_NAMES.has(name))
            return true;
    }
    const additional = Array.isArray(user?.additionalRoles)
        ? user.additionalRoles.map((assignment) => assignment?.role ?? assignment)
        : [];
    const sources = [
        user?.role,
        ...(Array.isArray(user?.roles) ? user.roles : []),
        ...additional,
    ];
    return sources.some((roleLike) => extractRoleNames(roleLike).some((name) => SUPER_ADMIN_ROLE_NAMES.has(name)));
};
exports.userHasPerformanceSuperAdminRole = userHasPerformanceSuperAdminRole;
const userHasPerformanceAdminRole = (user) => {
    const permissions = extractPermissionNames(user);
    if (permissions.has('all'))
        return true;
    for (const name of permissions) {
        if (ADMIN_ROLE_NAMES.has(name))
            return true;
    }
    const additional = Array.isArray(user?.additionalRoles)
        ? user.additionalRoles.map((assignment) => assignment?.role ?? assignment)
        : [];
    const sources = [
        user?.role,
        ...(Array.isArray(user?.roles) ? user.roles : []),
        ...additional,
    ];
    return sources.some((roleLike) => extractRoleNames(roleLike).some((name) => normalizeRoleNameTokens(name).some((token) => ADMIN_ROLE_NAMES.has(token))));
};
exports.userHasPerformanceAdminRole = userHasPerformanceAdminRole;
const userHasPerformanceWorkflowRole = (user) => {
    const additional = Array.isArray(user?.additionalRoles)
        ? user.additionalRoles.map((assignment) => assignment?.role ?? assignment)
        : [];
    const sources = [
        user?.role,
        ...(Array.isArray(user?.roles) ? user.roles : []),
        ...additional,
    ];
    return sources.some((roleLike) => extractRoleNames(roleLike).some((name) => normalizeRoleNameTokens(name).some((token) => PERFORMANCE_WORKFLOW_ROLE_NAMES.has(token))));
};
exports.userHasPerformanceWorkflowRole = userHasPerformanceWorkflowRole;
const canManagePerformanceWorkflow = (user) => (0, exports.userHasPerformanceSuperAdminRole)(user) ||
    (0, exports.userHasPerformanceAdminRole)(user) ||
    (0, exports.userHasPerformancePermission)(user, ['performance management']) ||
    (0, exports.userHasPerformanceWorkflowRole)(user);
exports.canManagePerformanceWorkflow = canManagePerformanceWorkflow;
const assertCanManagePerformanceWorkflow = (user) => {
    if (!(0, exports.canManagePerformanceWorkflow)(user)) {
        throw new common_1.ForbiddenException('You do not have permission to manage performance workflow.');
    }
};
exports.assertCanManagePerformanceWorkflow = assertCanManagePerformanceWorkflow;
//# sourceMappingURL=performance-access.util.js.map