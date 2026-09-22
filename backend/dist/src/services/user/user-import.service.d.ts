import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { Role } from 'src/schemas/role.schema';
import { SubsidiaryService } from 'src/services/org/subsidiary.service';
import { LevelService } from 'src/services/org/level.service';
import { BranchService } from 'src/services/org/branch.service';
import { DepartmentService } from 'src/services/org/department.service';
import { BusinessUnitService } from 'src/services/org/businessUnit.service';
type StaffUploadPersistence = {
    updateUploadedStaff: (createStaffDto: any, options?: {
        allowCreate?: boolean;
    }) => Promise<any>;
};
type SupervisorUploadPersistence = {
    updateSupervisor: (data: any) => Promise<any>;
};
export declare class UserImportService {
    private readonly staffModel;
    private readonly roleModel;
    private readonly entityService;
    private readonly levelService;
    private readonly branchService;
    private readonly departmentService;
    private readonly businessUnit;
    constructor(staffModel: Model<User>, roleModel: Model<Role>, entityService: SubsidiaryService, levelService: LevelService, branchService: BranchService, departmentService: DepartmentService, businessUnit: BusinessUnitService);
    private escapeRegex;
    private extractObjectIdCandidate;
    private normalizeObjectId;
    private normalizeEntityCandidates;
    private resolveRoleByNameAndEntity;
    private readRows;
    private removeMappedFields;
    private mergeAccountDetail;
    uploadStaff(source: string | Buffer, fileName: string | undefined, options: StaffUploadPersistence & {
        user?: any;
    }): Promise<any>;
    uploadSupervisors(source: string | Buffer, fileName: string | undefined, options: SupervisorUploadPersistence): Promise<any>;
}
export {};
