import { Model } from 'mongoose';
import { Subsidiary } from '../../schemas/subsidiary.schema';
import { Territory } from 'src/schemas/territory.schema';
export declare class SubsidiaryService {
    private readonly entityModel;
    private readonly territoryModel;
    constructor(entityModel: Model<Subsidiary>, territoryModel: Model<Territory>);
    createSubsidiary(createSubsidiaryDto: any): Promise<Subsidiary>;
    findAllEntities(page: number, limit: number, searchText: string): Promise<any>;
    findAllTerritory(page: number, limit: number, searchText: string): Promise<any>;
    getSubsidiaryByName(name: string): Promise<any>;
    getSubsidiaryByShort(name: string): Promise<any>;
    findSubsidiaryById(id: string): Promise<any>;
    findSubsidiaryList(): Promise<any>;
    updateSubsidiary(id: string, updateSubsidiaryDto: any): Promise<any>;
    createTerritory(createTerritoryDto: any): Promise<any>;
    updateTerritory(id: string, updateTerritoryDto: any): Promise<any>;
    private normalizePagination;
    private buildSearchQuery;
}
