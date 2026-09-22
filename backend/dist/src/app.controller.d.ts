import { AppService } from './app.service';
import { NoticeService } from './services/comms/notice.service';
import { BranchService } from './services/org/branch.service';
import { BusinessUnitService } from './services/org/businessUnit.service';
import { DepartmentService } from './services/org/department.service';
import { PermissionService } from './services/auth-access/permission.service';
import { RoleService } from './services/auth-access/role.service';
export declare class AppController {
    private readonly appService;
    private readonly noticeService;
    private readonly branchService;
    private readonly roleService;
    private readonly permissionService;
    private readonly businessUnitService;
    private readonly departmentService;
    constructor(appService: AppService, noticeService: NoticeService, branchService: BranchService, roleService: RoleService, permissionService: PermissionService, businessUnitService: BusinessUnitService, departmentService: DepartmentService);
    getRecent(user: any): Promise<import("./schemas/notice.schema").Notice[]>;
    getHello(): string;
    getAllDepartments(entity?: string, includeGroup?: string): Promise<any>;
    getDepartments(page?: number, limit?: number, search?: string, entity?: string): Promise<any>;
    createDepartment(payload: any): Promise<any>;
    updateDepartment(id: string, payload: any): Promise<any>;
    getAllBusinessUnits(): Promise<any>;
    getAllRolesPublic(app?: string): Promise<any>;
    getPortalRoles(app?: string): Promise<{
        primary: (import("mongoose").FlattenMaps<{
            name: string;
            entity: string;
            app: string;
            description?: string;
            permissions: string[];
            scopes: import("./schemas/role.schema").RoleAccessScope[];
            profileKey: import("./schemas/role.schema").RoleProfileKey;
        }> & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        })[];
        additional: import("./schemas/role.schema").Role[];
    }>;
    getNonPortalRolesPublic(entity?: string, page?: string, limit?: string, search?: string): Promise<any>;
    getRolesList(entity?: string): Promise<any>;
    getAllBranchesPublic(entity?: string): Promise<any>;
    findRemote(query: any): Promise<any>;
    findIdleTime(): Promise<any>;
    findAllBranches(page?: number, limit?: number, searchText?: string, entity?: string): Promise<any>;
    findAllRoles(page?: number, limit?: number, searchText?: string, app?: string): Promise<any>;
    findAllPermissions(page?: number, limit?: number, searchText?: string): Promise<any>;
    findPermissions(): Promise<any>;
    findAllBusinessUnits(page?: number, limit?: number, searchText?: string): Promise<any>;
    createBranch(createBranchDto: any): Promise<any>;
    createRole(createRoleDto: any): Promise<any>;
    createPermission(createPermissionDto: any): Promise<any>;
    createBusinessUnit(createBusinessUnitDto: any): Promise<any>;
    editBusinessUnit(id: string, updateBusinessUnitDto: any): Promise<any>;
    importBusinessUnitTerritories(file: Express.Multer.File): Promise<any>;
    editPermission(id: string, updatePermissionDto: any): Promise<any>;
    editRole(id: string, updateRoleDto: any): Promise<any>;
    editBranch(id: string, updateBranchDto: any): Promise<any>;
    uploadFile(file?: Express.Multer.File): Promise<{
        url: string | null;
    }>;
    markAsRead(id: string): Promise<void>;
}
