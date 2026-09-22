import { Model } from 'mongoose';
import { BusinessUnit } from 'src/schemas/businessunit.schema';
import { Subsidiary } from 'src/schemas/subsidiary.schema';
import { Territory } from 'src/schemas/territory.schema';
export declare class BusinessUnitService {
    private readonly businessunitModel;
    private readonly territoryModel;
    private readonly subsidiaryModel;
    constructor(businessunitModel: Model<BusinessUnit>, territoryModel: Model<Territory>, subsidiaryModel: Model<Subsidiary>);
    private normaliseType;
    private normaliseSubsidiary;
    private normaliseTerritory;
    private inheritSubsidiaryFromTerritory;
    createBusinessUnit(createUserDto: any): Promise<any>;
    findAllBusinessUnit(page: number, limit: number, searchText: string): Promise<any>;
    findBusinessUnites(): Promise<any>;
    getBusinessUnitByName(name: string): Promise<any>;
    updateBusinessUnit(id: string, updateBusinessUnitDto: any): Promise<any>;
    importBusinessUnits(rows: Array<Record<string, any>>): Promise<any>;
}
