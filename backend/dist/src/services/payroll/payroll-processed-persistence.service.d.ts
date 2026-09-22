import { Model } from 'mongoose';
import { Payroll } from 'src/schemas/payroll.schema';
import { ProcessedPayroll } from 'src/schemas/processedPayroll.schema';
import { ExitService } from 'src/services/employee-lifecycle/exit.service';
export declare class PayrollProcessedPersistenceService {
    private readonly processedPayrollModel;
    private readonly payrollModel;
    private readonly exitService?;
    private readonly payrollApprovalModel?;
    constructor(processedPayrollModel: Model<ProcessedPayroll>, payrollModel: Model<Payroll>, exitService?: ExitService, payrollApprovalModel?: Model<any>);
    private resolvePayrollRunDate;
    persistProcessedPayroll(batchId: string, payrollData: any[], entity: string, periodDate?: Date): Promise<void>;
    private normalizePayrollData;
    private stripSalaryStatutoryAccounts;
    private loadEntityPayrollSettings;
}
