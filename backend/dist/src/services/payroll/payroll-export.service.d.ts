import { Model } from 'mongoose';
import { ProcessedPayroll } from 'src/schemas/processedPayroll.schema';
import { StaffService } from 'src/services/user/user.service';
import { SubsidiaryService } from 'src/services/org/subsidiary.service';
export declare class PayrollExportService {
    private readonly processedPayrollModel;
    private readonly staffService;
    private readonly entityService;
    constructor(processedPayrollModel: Model<ProcessedPayroll>, staffService: StaffService, entityService: SubsidiaryService);
    private hasFinanceScope;
    private canViewUnapprovedPayslips;
    private normalizeEntityIdStrict;
    getPayslipsForUser(idOrUser: any, viewer?: any): Promise<any>;
    getProcessedPayrollByStaffId(staffId: string, user: any): Promise<any>;
    getProcessedPayroll(entity: string, month: string, type?: string): Promise<any>;
}
