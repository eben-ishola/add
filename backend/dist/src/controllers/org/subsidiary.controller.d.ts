import { SubsidiaryService } from '../../services/org/subsidiary.service';
import { BranchService } from 'src/services/org/branch.service';
export declare class SubsidiaryController {
    private readonly entityService;
    private readonly branchService;
    constructor(entityService: SubsidiaryService, branchService: BranchService);
    listSubsidiaries(): Promise<any>;
    createSubsidiary(createSubsidiaryDto: any): Promise<any>;
    findAllSubsidiarys(page: number, limit: number, searchText?: string): Promise<any>;
    findTerritory(page: number, limit: number, searchText?: string): Promise<any>;
    findSubsidiarys(id: any): Promise<any>;
    findSubsidiaryList(): Promise<any>;
    getSubsidiaryByName(name: string): Promise<any>;
    getBranches(entity?: string): Promise<any>;
    updateSubsidiary(id: string, updateSubsidiaryDto: any): Promise<any>;
    createTerritory(createTerritoryDto: any): Promise<any>;
    updateTerritory(id: string, updateTerritoryDto: any): Promise<any>;
}
