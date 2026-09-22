import { Model, Types } from 'mongoose';
import { Department } from 'src/schemas/department.schema';
export declare class DepartmentService {
    private readonly departmentModel;
    private readonly subsidiaryModel?;
    constructor(departmentModel: Model<Department>, subsidiaryModel?: Model<any>);
    private groupEntityIds;
    createDepartment(createUserDto: any): Promise<any>;
    findAllDepartment(page?: number, limit?: number, searchText?: string, entity?: string): Promise<any>;
    updateDepartment(id: string, updateDto: any): Promise<any>;
    findDepartmentes(entity?: string, includeGroup?: boolean): Promise<any>;
    getDepartmentByName(name: string): Promise<any>;
    getDepartmentByNameAndEntity(name: string, entity?: string | Types.ObjectId | null): Promise<any>;
}
