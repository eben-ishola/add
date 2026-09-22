import { Model } from 'mongoose';
import { PayrollApproval } from 'src/schemas/payrollApproval.schema';
import { StaffService } from 'src/services/user/user.service';
import { SubsidiaryService } from 'src/services/org/subsidiary.service';
export declare class PayrollApprovalEnrichmentService {
    private readonly payrollApprovalModel;
    private readonly staffService;
    private readonly entityService;
    constructor(payrollApprovalModel: Model<PayrollApproval>, staffService: StaffService, entityService: SubsidiaryService);
    enrichPayrollApprovals(approvals: any[], entityHint?: any): Promise<any[]>;
}
