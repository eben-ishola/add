import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { PayrollApproval } from 'src/schemas/payrollApproval.schema';
export type PayrollIdentifierHydrationHandlers = {
    normalizeEntityIdStrict: (value: any) => Promise<string>;
};
export declare class PayrollIdentifierHydrationService {
    private readonly staffModel;
    constructor(staffModel: Model<User>);
    hydratePayrollRowIdentifiers(rows: any[], entity: any, handlers: PayrollIdentifierHydrationHandlers): Promise<{
        rows: any[];
        changed: boolean;
    }>;
    refreshPayrollApprovalIdentifiers(approval: PayrollApproval, handlers: PayrollIdentifierHydrationHandlers): Promise<boolean>;
    private resolveEntityId;
    private buildStaffLookup;
    private resolveStaffForRow;
    private normalizePayrollText;
}
