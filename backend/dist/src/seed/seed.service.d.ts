import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { PermissionDocument } from 'src/schemas/permission.schema';
import { RoleDocument } from 'src/schemas/role.schema';
import { TaxConfigDocument } from 'src/schemas/tax-config.schema';
import { UserDocument } from 'src/schemas/user.schema';
export declare class SeedService implements OnModuleInit {
    private readonly permissionModel;
    private readonly roleModel;
    private readonly userModel;
    private readonly taxConfigModel;
    private readonly logger;
    constructor(permissionModel: Model<PermissionDocument>, roleModel: Model<RoleDocument>, userModel: Model<UserDocument>, taxConfigModel: Model<TaxConfigDocument>);
    onModuleInit(): Promise<void>;
    private seedPermissions;
    private seedRoles;
    seedRolesForApps(apps: string[]): Promise<void>;
    private seedAdditionalRoleAssignments;
    private resolveRoleMetadata;
    private normalizeAppName;
    private buildExactMatchRegex;
    private escapeRegex;
    private normalizeObjectIdValue;
    private normalizeAdditionalRoleAssignments;
    private removeAssignmentsWithMissingRoles;
    private seedTaxConfig;
}
