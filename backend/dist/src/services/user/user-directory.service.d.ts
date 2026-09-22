import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
export declare class UserDirectoryService {
    private readonly staffModel;
    constructor(staffModel: Model<User>);
    private extractObjectIdCandidate;
    private normalizeObjectId;
    private normalizeSupervisorScope;
    private resolvePayrollMonthRange;
    private extractPermissionNames;
    private userHasGlobalEntityAccess;
    private resolveEntityConstraint;
    private hasFilterValue;
    getStaffByRoleKeywords(keywords: string[], entity?: any): Promise<any[]>;
    getBySupervisor(short: string, options?: {
        light?: boolean;
    }): Promise<any>;
    getStaffList(short: string, options?: {
        includeExitedInMonth?: string | Date;
        light?: boolean;
    }): Promise<any>;
    getStaffList2(subsidiaryId: any, supervisorScope?: string | string[]): Promise<any>;
    exportUser(params: {
        subsidiaryId?: string;
        branch?: string;
        department?: string;
        status?: string;
        confirmed?: string;
        searchText?: string;
        supervisorScope?: string | string[];
    }): Promise<any>;
    getRecentlyJoined(subsidiaryId?: string, startDate?: string, endDate?: string, supervisorScope?: string | string[]): Promise<any>;
    getRecentlyExit(subsidiaryId?: string, startDate?: string, endDate?: string, supervisorScope?: string | string[]): Promise<any>;
    getStaffTurnover(subsidiaryId?: string, startDate?: string, endDate?: string): Promise<any>;
    getPaginatedStaff(quer: any, user?: any): Promise<any>;
    deactivateExitedStaff(): Promise<any>;
    getStaffByLevel(payGrade: string, subsidiaryId: string): Promise<any>;
    getStaffByBranch(branch: string): Promise<any>;
    getBirthdaysToday(): Promise<any[]>;
    getBirthdaysThisMonth(): Promise<any[]>;
    getWorkAnniversaryToday(): Promise<any[]>;
    getWorkAnniversaryThisMonth(): Promise<any[]>;
    findActiveStaffByRoleKeywords(keywords: string[], entity?: any): Promise<any[]>;
    getById(id: any): Promise<any>;
    getAttendanceIdentity(id: any): Promise<any>;
    findFirstActiveByRoleNames(roleNames: string[], entity?: any): Promise<any>;
    findFirstActiveByProfileKey(profileKey: string, entity?: any): Promise<any>;
    findFirstActiveByPermission(permissionName: string, entity?: any): Promise<any>;
    getStaffById(staffId: string): Promise<any>;
    resolveStaffDirectory(staffIds: unknown, entity?: any, options?: {
        includeAccounts?: boolean;
    }): Promise<{
        data: any[];
        missing: string[];
    }>;
}
