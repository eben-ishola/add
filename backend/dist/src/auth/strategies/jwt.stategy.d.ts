import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { ExitClearanceDocument } from 'src/schemas/exit-clearance.schema';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly staffModel;
    private readonly clearanceModel;
    constructor(staffModel: Model<User>, clearanceModel: Model<ExitClearanceDocument>);
    validate(payload: any): Promise<any>;
    private sanitizeUser;
    private normalizeAndPopulateAdditionalRoles;
}
export {};
