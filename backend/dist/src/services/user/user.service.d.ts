import { UserCredentialService } from 'src/services/user/user-credential.service';
import { UserDirectoryService } from 'src/services/user/user-directory.service';
import { UserImportService } from 'src/services/user/user-import.service';
import { UserOnboardingService } from 'src/services/user/user-onboarding.service';
import { UserSupervisorService } from 'src/services/user/user-supervisor.service';
export declare class StaffService {
    private readonly userCredentialService;
    private readonly userDirectoryService;
    private readonly userImportService;
    private readonly userOnboardingService;
    private readonly userSupervisorService;
    constructor(userCredentialService: UserCredentialService, userDirectoryService: UserDirectoryService, userImportService: UserImportService, userOnboardingService: UserOnboardingService, userSupervisorService: UserSupervisorService);
    getStaffByRoleKeywords(keywords: string[], entity?: any): Promise<any[]>;
    createOrUpdateStaff(createStaffDto: any): Promise<any>;
    createStaff(createStaffDto: any): Promise<any>;
    updateUploadedStaff(createStaffDto: any, options?: {
        allowCreate?: boolean;
    }): Promise<any>;
    resetPassword(userId: string, preferredPassword?: string, actingUserId?: string): Promise<{
        emailed: boolean;
        expiresAt: string;
        generatedPassword?: undefined;
    } | {
        emailed: boolean;
        generatedPassword: string;
        expiresAt?: undefined;
    }>;
    updateStaff(createStaffDto: any): Promise<any>;
    resetRent(staffId: string): Promise<any>;
    updateSupervisor(data: any): Promise<any>;
    uploadSupervisor(source: string | Buffer, fileName?: string): Promise<any>;
    getWorkflowSummary(type?: 'enrollment' | 'update', entity?: string | null, supervisorId?: string | null): Promise<any[]>;
    approveUser(userId: any, approverId: any, type: 'supervisor' | 'audit' | 'it' | 'hr', action?: 'approve' | 'reject', payload?: Record<string, any>): Promise<any>;
    uploadXlsx(source: string | Buffer, fileName: string | undefined, user: any): Promise<any>;
    getBySupervisor(short: string, options?: {
        light?: boolean;
    }): Promise<any>;
    getStaffList(short: string, options?: {
        includeExitedInMonth?: string | Date;
        light?: boolean;
    }): Promise<any>;
    findFirstActiveByRoleNames(roleNames: string[], entity?: any): Promise<any>;
    findFirstActiveByProfileKey(profileKey: string, entity?: any): Promise<any>;
    findFirstActiveByPermission(permissionName: string, entity?: any): Promise<any>;
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
    getStaffById(staffId: string): Promise<any>;
    resolveStaffDirectory(staffIds: unknown, entity?: any, options?: {
        includeAccounts?: boolean;
    }): Promise<{
        data: any[];
        missing: string[];
    }>;
    getById(id: any): Promise<any>;
    getAttendanceIdentity(id: any): Promise<any>;
    deactivateExitedStaff(): Promise<any>;
    getStaffByLevel(payGrade: string, subsidiaryId: string): Promise<any>;
    getStaffByBranch(branch: string): Promise<any>;
    convertDate(input: any): Promise<Date | null>;
    getBirthdaysToday(): Promise<any[]>;
    getBirthdaysThisMonth(): Promise<any[]>;
    getWorkAnniversaryToday(): Promise<any[]>;
    getWorkAnniversaryThisMonth(): Promise<any[]>;
}
