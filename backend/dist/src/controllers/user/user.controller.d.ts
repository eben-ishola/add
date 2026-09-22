import { StaffService } from '../../services/user/user.service';
import { BranchService } from 'src/services/org/branch.service';
import { CreateStaffDto, UpdateStaffDto } from 'src/dto/staff-request.dto';
export declare class StaffController {
    private readonly staffService;
    private readonly branchService;
    constructor(staffService: StaffService, branchService: BranchService);
    private isHrAdminActor;
    private getDepartmentName;
    private assertCanActOnWorkflowStage;
    getExport(subsidiaryId?: string, branch?: string, department?: string, status?: string, confirmed?: string, searchText?: string, supervisorScope?: string): Promise<any>;
    createStaff(payload: CreateStaffDto): Promise<any>;
    getRecentlyJoined(subsidiaryId?: string, startDate?: string, endDate?: string, supervisorId?: string, supervisorScope?: string): Promise<any>;
    getRecentlyExit(subsidiaryId: string, startDate?: string, endDate?: string, supervisorId?: string, supervisorScope?: string): Promise<any>;
    getStaffTurnover(subsidiaryId: string, startDate?: string, endDate?: string): Promise<any>;
    getWorkflowSummary(type?: 'enrollment' | 'update', entity?: string, supervisorId?: string): Promise<any[]>;
    getBranch(entity?: string): Promise<any>;
    approveUser(body: {
        userId: string;
        type: 'supervisor' | 'audit' | 'it' | 'hr';
        action?: 'approve' | 'reject';
        payload?: Record<string, any>;
    }, user: any): Promise<any>;
    uploadXlsx(file: Express.Multer.File, user: any): Promise<any>;
    uploadSupervisor(file: Express.Multer.File, authHeader: string, user: any): Promise<any>;
    getStaffList(subsidiaryId: string, supervisorScope?: string, supervisorId?: string): Promise<any>;
    resolveStaffDirectory(body: {
        staffIds?: string[];
        staffId?: string[] | string;
        orbitIds?: string[];
        orbitId?: string[] | string;
        entity?: any;
        includeAccounts?: boolean;
    }): Promise<any>;
    getPaginatedStaff(query: any, user: any): Promise<any>;
    getBirthdaysToday(): Promise<any[]>;
    getBirthdaysThisMonth(): Promise<any[]>;
    getAnniversaryToday(): Promise<any[]>;
    getAnniversryThisMonth(): Promise<any[]>;
    getStaffByLevel(payGrade: string, authHeader: string, subsidiaryId: string): Promise<any>;
    updateStaff(payload: UpdateStaffDto, id: string): Promise<any>;
    updateRent(payload: any, id: string, files?: {
        rentReceipt?: Express.Multer.File[];
        rentSupporting?: Express.Multer.File[];
    }): Promise<any>;
    resetRent(id: string): Promise<any>;
    getById(staffId: string): Promise<any>;
    getStaffById(staffId: string): Promise<any>;
    resetPassword(id: string, body: {
        newPassword?: string;
    }, actingUser: any): Promise<{
        emailed: boolean;
        expiresAt: string;
        generatedPassword?: undefined;
    } | {
        emailed: boolean;
        generatedPassword: string;
        expiresAt?: undefined;
    }>;
}
