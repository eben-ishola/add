import { Model } from 'mongoose';
import { Permission } from 'src/schemas/permission.schema';
export declare class PermissionService {
    private readonly permissionModel;
    constructor(permissionModel: Model<Permission>);
    createPermission(createPermissionDto: any): Promise<any>;
    findAllPermissions(page: number, limit: number, searchText: string): Promise<any>;
    findPermissions(): Promise<any>;
    getPermissionByName(name: string): Promise<any>;
    updatePermission(id: string, updatePermissionDto: any): Promise<any>;
}
