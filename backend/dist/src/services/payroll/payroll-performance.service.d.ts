import { Model } from 'mongoose';
import { PayrollPerformanceDocument } from 'src/schemas/payroll-performance.schema';
import { StaffService } from 'src/services/user/user.service';
import { SubsidiaryService } from 'src/services/org/subsidiary.service';
export declare class PayrollPerformanceService {
    private readonly payrollPerformanceModel;
    private readonly staffService;
    private readonly entityService;
    constructor(payrollPerformanceModel: Model<PayrollPerformanceDocument>, staffService: StaffService, entityService: SubsidiaryService);
    private normalizeEntityIdStrict;
    loadPerformanceScoreLookup(entityId: string | undefined, periodKey: string): Promise<Map<string, number>>;
    savePayrollPerformance(payload: any): Promise<any>;
    getPayrollPerformance(entity?: string, month?: string, staffId?: string): Promise<any>;
}
