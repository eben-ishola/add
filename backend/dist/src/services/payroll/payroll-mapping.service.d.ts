import { Model } from 'mongoose';
import { PayrollMap } from '../../schemas/payrollMap.schema';
import { SubsidiaryService } from 'src/services/org/subsidiary.service';
export declare class PayrollMappingService {
    private readonly payrollMapModel;
    private readonly entityService;
    constructor(payrollMapModel: Model<PayrollMap>, entityService: SubsidiaryService);
    private normalizeEntityIdStrict;
    mapPayroll(payload: any): Promise<any>;
    findMappingById(gradeLevel: string, entity: any): Promise<PayrollMap | null>;
    findMappingByLevel(gradeLevel: string, entity: any): Promise<PayrollMap | null>;
    findAllMap(page: number, entity: any, limit?: number): Promise<any>;
}
