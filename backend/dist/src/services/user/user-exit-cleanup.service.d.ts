import { OnApplicationBootstrap } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserDocument } from 'src/schemas/user.schema';
export declare class UserExitCleanupService implements OnApplicationBootstrap {
    private readonly userModel;
    private readonly logger;
    constructor(userModel: Model<UserDocument>);
    onApplicationBootstrap(): Promise<void>;
}
