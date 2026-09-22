import { Model } from 'mongoose';
import { PayrollApproval } from 'src/schemas/payrollApproval.schema';
import { ProcessedPayroll } from 'src/schemas/processedPayroll.schema';
import { User } from 'src/schemas/user.schema';
export type PayoutAccountType = 'atlas' | 'addosser';
export declare class PayrollAccountSwitchService {
    private readonly payrollApprovalModel;
    private readonly processedPayrollModel;
    private readonly userModel;
    constructor(payrollApprovalModel: Model<PayrollApproval>, processedPayrollModel: Model<ProcessedPayroll>, userModel: Model<User>);
    private normalizeAccountType;
    private rowStaffId;
    private readAccount;
    private buildUserAccountLookup;
    private readAccountFromUser;
    switchApprovalAccountForAll(_user: any, approvalId: string, accountType: string): Promise<any>;
}
