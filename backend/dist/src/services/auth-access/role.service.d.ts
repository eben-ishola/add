import { OnModuleInit } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Role, RoleAccessScope, RoleProfileKey } from 'src/schemas/role.schema';
export declare class RoleService implements OnModuleInit {
    private readonly roleModel;
    constructor(roleModel: Model<Role>);
    private readonly logger;
    private readonly defaultApp;
    private readonly defaultProfileKey;
    onModuleInit(): Promise<void>;
    private normalizeApp;
    private buildAppCondition;
    private buildQuery;
    private normalizeProfileKey;
    private normalizeScopes;
    private extractObjectIdCandidate;
    private normalizeObjectId;
    private normalizePermissionIds;
    private sanitizeRolePermissions;
    private buildNonPortalQuery;
    createRole(createRoleDto: any): Promise<any>;
    findAllRoles(page: number, limit: number, searchText: string, app?: string): Promise<any>;
    findRoles(app?: string): Promise<any>;
    findNonPortalRoles(entity?: string, page?: number, limit?: number, searchText?: string): Promise<any>;
    nonPortalRoles(entity?: string): Promise<any>;
    fetchPrimaryAndAdditionalRoles(app?: string): Promise<{
        primary: (import("mongoose").FlattenMaps<{
            name: string;
            entity: string;
            app: string;
            description?: string;
            permissions: string[];
            scopes: RoleAccessScope[];
            profileKey: RoleProfileKey;
        }> & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
        additional: Role[];
    }>;
    getRoleByName(name: string, app?: string): Promise<any>;
    updateRole(id: string, updateRoleDto: any): Promise<any>;
}
