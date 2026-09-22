"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPER_ADMIN_ROLE_NAME_SET_WITH_MD = exports.SUPER_ADMIN_ROLE_NAME_SET = exports.userIsHrDepartment = exports.userIsItStaff = exports.userIsItAdmin = exports.userIsItDepartment = exports.userIsSuperAdmin = exports.SUPER_ADMIN_ROLE_TOKENS = exports.assertUserScope = exports.userHasScope = exports.deriveUserScopes = exports.collectRoleScopes = exports.userCanLeaveFinanceComment = exports.userDepartmentIncludes = exports.userHasRole = exports.userHasPermission = exports.collectUserRoleNames = exports.collectUserPermissionNames = exports.collectPermissionNames = void 0;
const common_1 = require("@nestjs/common");
const SCOPE_VALUES = ['group', 'entity', 'department', 'self', 'finance'];
const ROLE_SCOPE_PRESETS = {
    'super-admin': ['group'],
    'super admin': ['group'],
    'hr-super-admin': ['group'],
    'hr super admin': ['group'],
    gmd: ['group'],
    'group-hr-director': ['group'],
    'group hr director': ['group'],
    md: ['entity'],
    'managing-director': ['entity'],
    admin: ['group'],
    'entity hr admin': ['entity'],
    'entity-hr-admin': ['entity'],
    'people-operations-manager': ['entity'],
    'leave-manager': ['entity'],
    'leave-attendance-manager': ['entity'],
    'workflow-hr': ['entity'],
    'workflow hr': ['entity'],
    supervisor: ['department'],
    'head of department': ['department'],
    'head-of-department': ['department'],
    employee: ['self'],
    'payroll-officer': ['entity', 'finance'],
    'payroll officer': ['entity', 'finance'],
    'payroll controller': ['entity', 'finance'],
    'payroll-controller': ['entity', 'finance'],
    'finance officer': ['entity', 'finance'],
    'finance-officer': ['entity', 'finance'],
    recruiter: ['entity'],
    'recruitment-onboarding-lead': ['entity'],
    'performance-manager': ['entity'],
    'performance manager': ['entity'],
    'performance-officer': ['entity'],
    'performance officer': ['entity'],
    'performance-training-partner': ['entity'],
    'performance training partner': ['entity'],
    'it-officer': ['group'],
    'system-auditor': ['entity'],
    'service-desk-agent': ['entity'],
    'document-controller': ['entity'],
    'hr-portal-operations-backup': ['entity'],
    'hr-portal-service-ally': ['entity'],
    'hr-portal-analytics-viewer': ['entity'],
    'hr-portal-ess-support': ['entity'],
};
const ROLE_PERMISSION_PRESETS = {
    admin: ['all'],
};
const toArray = (value) => {
    if (Array.isArray(value))
        return value;
    return value ? [value] : [];
};
const normalizePermissionValue = (permission) => {
    if (!permission)
        return undefined;
    if (typeof permission === 'string')
        return permission.trim().toLowerCase();
    if (typeof permission?.name === 'string') {
        const name = permission.name.trim();
        return name.length ? name.toLowerCase() : undefined;
    }
    return undefined;
};
const collectPermissionNames = (source) => {
    if (!source)
        return [];
    const values = Array.isArray(source) ? source : [source];
    return values
        .map((value) => normalizePermissionValue(value))
        .filter((permission) => Boolean(permission));
};
exports.collectPermissionNames = collectPermissionNames;
const normalizeScopeValue = (value) => {
    if (typeof value !== 'string')
        return undefined;
    const normalized = value.trim().toLowerCase();
    return SCOPE_VALUES.find((scope) => scope === normalized);
};
const extractRoleName = (roleLike) => {
    if (!roleLike)
        return undefined;
    if (typeof roleLike === 'string')
        return roleLike;
    if (typeof roleLike?.name === 'string')
        return roleLike.name;
    if (typeof roleLike?.label === 'string')
        return roleLike.label;
    if (typeof roleLike?.role?.name === 'string')
        return roleLike.role.name;
    return undefined;
};
const normalizeRoleName = (value) => {
    if (typeof value !== 'string')
        return undefined;
    const normalized = value.trim().toLowerCase();
    return normalized || undefined;
};
const collectUserPermissionNames = (user) => {
    const permissions = new Set();
    const register = (source) => {
        (0, exports.collectPermissionNames)(source).forEach((permission) => permissions.add(permission));
    };
    register(user?.permissions);
    register(user?.role?.permissions);
    toArray(user?.roles).forEach((role) => {
        register(role?.permissions);
        register(role?.role?.permissions);
    });
    toArray(user?.additionalRoles).forEach((assignment) => {
        register(assignment?.permissions);
        register(assignment?.role?.permissions);
    });
    (0, exports.collectUserRoleNames)(user).forEach((roleName) => {
        ROLE_PERMISSION_PRESETS[roleName]?.forEach((permission) => permissions.add(permission));
    });
    return permissions;
};
exports.collectUserPermissionNames = collectUserPermissionNames;
const collectUserRoleNames = (user) => {
    const roles = new Set();
    const register = (roleLike) => {
        const roleName = normalizeRoleName(extractRoleName(roleLike));
        if (roleName)
            roles.add(roleName);
    };
    register(user?.role);
    toArray(user?.roles).forEach(register);
    toArray(user?.additionalRoles).forEach((assignment) => {
        register(assignment?.role ?? assignment);
    });
    return roles;
};
exports.collectUserRoleNames = collectUserRoleNames;
const userHasPermission = (user, required, mode = 'any') => {
    const permissions = (0, exports.collectUserPermissionNames)(user);
    if (permissions.has('all'))
        return true;
    const list = toArray(required)
        .map((permission) => permission.trim().toLowerCase())
        .filter(Boolean);
    if (!list.length)
        return true;
    return mode === 'all'
        ? list.every((permission) => permissions.has(permission))
        : list.some((permission) => permissions.has(permission));
};
exports.userHasPermission = userHasPermission;
const userHasRole = (user, required, mode = 'any') => {
    const roles = (0, exports.collectUserRoleNames)(user);
    const list = toArray(required)
        .map((role) => role.trim().toLowerCase())
        .filter(Boolean);
    if (!list.length)
        return true;
    return mode === 'all'
        ? list.every((role) => roles.has(role))
        : list.some((role) => roles.has(role));
};
exports.userHasRole = userHasRole;
const userDepartmentIncludes = (user, token) => {
    const normalizedToken = token.trim().toLowerCase();
    if (!normalizedToken)
        return false;
    const departmentValue = typeof user?.department === 'object' && user?.department !== null
        ? user.department.name
        : user?.department;
    const department = String(departmentValue ?? '').trim().toLowerCase();
    return department.includes(normalizedToken);
};
exports.userDepartmentIncludes = userDepartmentIncludes;
const userCanLeaveFinanceComment = (user) => (0, exports.userDepartmentIncludes)(user, 'finance') || (0, exports.userDepartmentIncludes)(user, 'fincon');
exports.userCanLeaveFinanceComment = userCanLeaveFinanceComment;
const collectRoleScopes = (roleLike) => {
    if (!roleLike)
        return [];
    const roleName = extractRoleName(roleLike)?.trim().toLowerCase();
    if (roleName === 'system-auditor') {
        return ROLE_SCOPE_PRESETS[roleName] ?? ['entity'];
    }
    const roleScopes = roleLike ?? {};
    const rawScopes = (Array.isArray(roleScopes.scopes) && roleScopes.scopes.length
        ? roleScopes.scopes
        : Array.isArray(roleScopes.role?.scopes)
            ? roleScopes.role.scopes
            : null) ?? [];
    const normalized = rawScopes
        .map((scope) => normalizeScopeValue(scope))
        .filter((scope) => Boolean(scope));
    if (normalized.length) {
        return Array.from(new Set(normalized));
    }
    if (roleName && ROLE_SCOPE_PRESETS[roleName]) {
        return ROLE_SCOPE_PRESETS[roleName];
    }
    return [];
};
exports.collectRoleScopes = collectRoleScopes;
const deriveUserScopes = (user) => {
    const scopes = new Set();
    const permissions = (0, exports.collectUserPermissionNames)(user);
    const register = (roleLike) => {
        (0, exports.collectRoleScopes)(roleLike).forEach((scope) => scopes.add(scope));
    };
    register(user?.role);
    toArray(user?.roles).forEach(register);
    toArray(user?.additionalRoles).forEach((assignment) => register(assignment?.role ?? assignment));
    if (permissions.has('all')) {
        SCOPE_VALUES.forEach((scope) => scopes.add(scope));
        scopes.add('group');
        scopes.add('entity');
        scopes.add('department');
    }
    if (!scopes.size) {
        scopes.add('self');
    }
    return scopes;
};
exports.deriveUserScopes = deriveUserScopes;
const userHasScope = (user, required) => {
    const scopes = (0, exports.deriveUserScopes)(user);
    const list = Array.isArray(required) ? required : [required];
    return list.some((scope) => scopes.has(scope));
};
exports.userHasScope = userHasScope;
const assertUserScope = (user, required, message = 'You do not have permission to perform this action.') => {
    if (!(0, exports.userHasScope)(user, required)) {
        throw new common_1.ForbiddenException(message);
    }
};
exports.assertUserScope = assertUserScope;
exports.SUPER_ADMIN_ROLE_TOKENS = [
    'super admin',
    'super-admin',
    'superadmin',
    'hr super admin',
    'hr-super-admin',
    'hrsuperadmin',
    'group hr director',
    'group-hr-director',
    'grouphrdirector',
];
const userIsSuperAdmin = (user) => (0, exports.userHasPermission)(user, ['all', ...exports.SUPER_ADMIN_ROLE_TOKENS]) ||
    (0, exports.userHasRole)(user, [...exports.SUPER_ADMIN_ROLE_TOKENS]);
exports.userIsSuperAdmin = userIsSuperAdmin;
const userIsItDepartment = (user) => {
    const departmentValue = typeof user?.department === 'object' && user?.department !== null
        ? user.department.name
        : user?.department;
    const department = String(departmentValue ?? '').trim().toLowerCase();
    return department === 'it' || department.includes('information technology');
};
exports.userIsItDepartment = userIsItDepartment;
const userIsItAdmin = (user) => (0, exports.userIsSuperAdmin)(user) && (0, exports.userIsItDepartment)(user);
exports.userIsItAdmin = userIsItAdmin;
const userIsItStaff = (user) => (0, exports.userIsSuperAdmin)(user) || (0, exports.userIsItDepartment)(user);
exports.userIsItStaff = userIsItStaff;
const HR_DEPARTMENT_PATTERN = /(^|[^a-z])hr([^a-z]|$)|human\s*resource/;
const userIsHrDepartment = (user) => {
    const departmentValue = typeof user?.department === 'object' && user?.department !== null
        ? user.department.name
        : user?.department;
    const department = String(departmentValue ?? '').trim().toLowerCase();
    return HR_DEPARTMENT_PATTERN.test(department);
};
exports.userIsHrDepartment = userIsHrDepartment;
exports.SUPER_ADMIN_ROLE_NAME_SET = new Set(exports.SUPER_ADMIN_ROLE_TOKENS);
exports.SUPER_ADMIN_ROLE_NAME_SET_WITH_MD = new Set([
    ...exports.SUPER_ADMIN_ROLE_TOKENS,
]);
//# sourceMappingURL=access-control.util.js.map