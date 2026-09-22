import { Model } from 'mongoose';
import { Branch } from 'src/schemas/branch.schema';
export declare class BranchService {
    private readonly branchModel;
    constructor(branchModel: Model<Branch>);
    private resolveEntityCandidate;
    private ensureEntity;
    createBranch(createUserDto: any): Promise<any>;
    findAllBranch(page: number, limit: number, searchText: string, entity?: string): Promise<any>;
    findBranches(entity: string): Promise<{
        data: any[];
    }>;
    getBranchByName(name: string): Promise<any>;
    updateBranch(id: string, updateBranchDto: any): Promise<any>;
}
