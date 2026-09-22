"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payrollUserHasSuperAdminRole = exports.payrollUserHasPermission = exports.isPayrollAuditDepartment = exports.extractPayrollPermissionNames = exports.extractPayrollRoleNames = exports.PAYROLL_AUDIT_READ_PERMISSIONS = void 0;
exports.PAYROLL_AUDIT_READ_PERMISSIONS = new Set([
    'view processed payroll',
    'view payroll',
]);
const extractPayrollRoleNames = (roleLike) => {
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
        register(roleLike?.role?.name);
        register(roleLike?.role?.label);
    }
    return names;
};
exports.extractPayrollRoleNames = extractPayrollRoleNames;
const extractPayrollPermissionNames = (user) => {
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
exports.extractPayrollPermissionNames = extractPayrollPermissionNames;
const isPayrollAuditDepartment = (user) => {
    const department = String(user?.department?.name ?? user?.department ?? '')
        .trim()
        .toLowerCase();
    return department.includes('audit');
};
exports.isPayrollAuditDepartment = isPayrollAuditDepartment;
const payrollUserHasPermission = (user, required) => {
    const permissions = (0, exports.extractPayrollPermissionNames)(user);
    if (permissions.has('all'))
        return true;
    const list = Array.isArray(required) ? required : [required];
    if (list.some((perm) => permissions.has(perm.toLowerCase()))) {
        return true;
    }
    if ((0, exports.isPayrollAuditDepartment)(user)) {
        return list.some((perm) => exports.PAYROLL_AUDIT_READ_PERMISSIONS.has(perm.toLowerCase()));
    }
    return false;
};
exports.payrollUserHasPermission = payrollUserHasPermission;
const payrollUserHasSuperAdminRole = (user, superAdminRoleNames) => {
    const permissions = (0, exports.extractPayrollPermissionNames)(user);
    if (permissions.has('all'))
        return true;
    for (const name of permissions) {
        if (superAdminRoleNames.has(name)) {
            return true;
        }
    }
    const additional = Array.isArray(user?.additionalRoles)
        ? user.additionalRoles.map((assignment) => assignment?.role ?? assignment)
        : [];
    const sources = [
        user?.role,
        ...(Array.isArray(user?.roles) ? user.roles : []),
        ...additional,
    ];
    return sources.some((roleLike) => (0, exports.extractPayrollRoleNames)(roleLike).some((name) => superAdminRoleNames.has(name)));
};
exports.payrollUserHasSuperAdminRole = payrollUserHasSuperAdminRole;
//# sourceMappingURL=payroll-access.util.js.map