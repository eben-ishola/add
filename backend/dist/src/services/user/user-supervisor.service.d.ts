import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
export declare class UserSupervisorService {
    private readonly staffModel;
    constructor(staffModel: Model<User>);
    updateSupervisor(data: any): Promise<any>;
}
