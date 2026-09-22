"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditWriteGuard = void 0;
const common_1 = require("@nestjs/common");
const isRecord = (value) => Boolean(value) && typeof value === 'object';
const readString = (source, key) => {
    if (!isRecord(source))
        return undefined;
    const value = source[key];
    return typeof value === 'string' ? value : undefined;
};
let AuditWriteGuard = class AuditWriteGuard {
    canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const user = req?.user;
        if (!user)
            return true;
        if (!this.isAuditUser(user))
            return true;
        throw new common_1.ForbiddenException('Audit users have read-only access.');
    }
    isAuditUser(user) {
        const departmentValue = isRecord(user.department)
            ? user.department.name
            : user.department;
        const department = String(departmentValue ?? '').trim().toLowerCase();
        if (department.includes('audit'))
            return true;
        return this.collectRoleNames(user).some((name) => name.includes('audit'));
    }
    collectRoleNames(user) {
        const names = new Set();
        const register = (value) => {
            if (!value)
                return;
            if (typeof value === 'string') {
                const normalized = value.trim().toLowerCase();
                if (normalized)
                    names.add(normalized);
                return;
            }
            if (!isRecord(value))
                return;
            const role = isRecord(value.role) ? value.role : undefined;
            const candidates = [
                readString(value, 'name'),
                readString(value, 'label'),
                readString(value, 'roleName'),
                readString(role, 'name'),
                readString(role, 'label'),
            ];
            candidates.forEach((candidate) => {
                if (typeof candidate !== 'string')
                    return;
                const normalized = candidate.trim().toLowerCase();
                if (normalized)
                    names.add(normalized);
            });
        };
        register(user?.role);
        (Array.isArray(user?.roles) ? user.roles : []).forEach((role) => register(role));
        const additional = Array.isArray(user?.additionalRoles)
            ? user.additionalRoles
            : user?.additionalRoles
                ? [user.additionalRoles]
                : [];
        additional.forEach((assignment) => {
            const role = isRecord(assignment) ? assignment.role : undefined;
            register(role ?? assignment);
        });
        return Array.from(names);
    }
};
exports.AuditWriteGuard = AuditWriteGuard;
exports.AuditWriteGuard = AuditWriteGuard = __decorate([
    (0, common_1.Injectable)()
], AuditWriteGuard);
//# sourceMappingURL=audit-write.guard.js.map