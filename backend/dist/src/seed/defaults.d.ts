export type AccessScope = 'group' | 'entity' | 'department' | 'self' | 'finance';
export type ProfileKey = 'profile' | 'supervisor' | 'admin' | 'super-admin';
export type RoleSeedDefinition = {
    name: string;
    permissions: string[];
    app?: string;
    scopes?: AccessScope[];
    profileKey?: ProfileKey;
    description?: string;
};
export type AdditionalRoleAssignmentSeed = {
    staffId: string;
    roleName: string;
    app?: string;
    entityId?: string | null;
};
export declare const ROLE_SCOPE_PRESETS: Record<string, AccessScope[]>;
export declare const ROLE_PROFILE_PRESETS: Record<string, ProfileKey>;
export type PermissionSeedDefinition = {
    name: string;
    description: string;
    domain?: string;
    action?: string;
};
export declare const PERMISSION_DOMAINS: {
    readonly GENERAL: "General";
    readonly PEOPLE_OPERATIONS: "People Operations";
    readonly PAYROLL: "Payroll & Compensation";
    readonly LEAVE_ATTENDANCE: "Leave & Attendance";
    readonly RECRUITMENT_ONBOARDING: "Recruitment & Onboarding";
    readonly PERFORMANCE_TRAINING: "Performance & Training";
    readonly SYSTEM_AUDIT: "System & Audit";
    readonly SERVICE_DESK: "Service Desk";
    readonly COMMUNICATIONS: "Communications & Engagement";
    readonly RECORDS_COMPLIANCE: "Records & Compliance";
};
export declare const DEFAULT_PERMISSIONS: PermissionSeedDefinition[];
export declare const DEFAULT_ROLES: RoleSeedDefinition[];
export declare const DEFAULT_SECONDARY_ROLES: RoleSeedDefinition[];
export declare const DEFAULT_ADDITIONAL_ROLE_ASSIGNMENTS: AdditionalRoleAssignmentSeed[];
