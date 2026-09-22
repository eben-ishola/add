import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from 'src/schemas/audit-log.schema';
import { Attendance } from 'src/schemas/attendance.schema';
import { Branch } from 'src/schemas/branch.schema';
import { BusinessUnit } from 'src/schemas/businessunit.schema';
import { Department } from 'src/schemas/department.schema';
import { Level } from 'src/schemas/level.schema';
import { Payroll } from 'src/schemas/payroll.schema';
import { PayrollMap } from 'src/schemas/payrollMap.schema';
import { PayrollWorkflowConfig } from 'src/schemas/payroll-workflow.schema';
import { Permission } from 'src/schemas/permission.schema';
import { Role } from 'src/schemas/role.schema';
import { Subsidiary } from 'src/schemas/subsidiary.schema';
import { TaxConfig } from 'src/schemas/tax-config.schema';
import { Territory } from 'src/schemas/territory.schema';
import { UserDocument } from 'src/schemas/user.schema';
type AuditLogFilters = {
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    actorId?: string;
    entity?: string;
    entityId?: string;
    scopeEntityId?: string;
    action?: string;
    method?: string;
    path?: string;
};
export declare class AuditLogService {
    private readonly auditModel;
    private readonly staffModel;
    private readonly subsidiaryModel;
    private readonly departmentModel;
    private readonly roleModel;
    private readonly permissionModel;
    private readonly branchModel;
    private readonly businessUnitModel;
    private readonly levelModel;
    private readonly territoryModel;
    private readonly mainSubsidiaryModel;
    private readonly attendanceModel;
    private readonly payrollModel;
    private readonly payrollMapModel;
    private readonly payrollWorkflowModel;
    private readonly taxConfigModel;
    private readonly logger;
    private static readonly SUPER_ADMIN_ROLE_NAMES;
    private static readonly ENTITY_ALIASES;
    constructor(auditModel: Model<AuditLogDocument>, staffModel: Model<UserDocument>, subsidiaryModel: Model<Subsidiary>, departmentModel: Model<Department>, roleModel: Model<Role>, permissionModel: Model<Permission>, branchModel: Model<Branch>, businessUnitModel: Model<BusinessUnit>, levelModel: Model<Level>, territoryModel: Model<Territory>, mainSubsidiaryModel: Model<Subsidiary>, attendanceModel: Model<Attendance>, payrollModel: Model<Payroll>, payrollMapModel: Model<PayrollMap>, payrollWorkflowModel: Model<PayrollWorkflowConfig>, taxConfigModel: Model<TaxConfig>);
    record(payload: Partial<AuditLog>): Promise<void>;
    buildActor(user: any): {
        id: string;
        name: string;
        email: any;
        roles: string[];
        profileKey: any;
    };
    private isAuditDepartment;
    assertCanView(user: any): void;
    findAll(filters: AuditLogFilters): Promise<{
        data: (import("mongoose").FlattenMaps<AuditLogDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<import("mongoose").FlattenMaps<AuditLogDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    private hydrateEntityNames;
    private extractEntityName;
    private extractNameFromPayload;
    private resolveEntityLookup;
    private resolveEntityLabel;
    private normalizeEntityKey;
    private normalizePath;
    private pickFirstStringField;
    private loadNameMap;
    private loadStaffNameMap;
    private loadSubsidiaryNameMap;
    private loadPayrollConfigs;
    private loadPayrollWorkflows;
    private loadPayrollMaps;
    private extractPermissionNames;
    private extractRoleNames;
    private normalizeId;
}
export {};
