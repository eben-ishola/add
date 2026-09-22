import { Model } from 'mongoose';
import { NotificationDispatchDocument } from 'src/schemas/notification-dispatch.schema';
export type NotificationClaimOptions = {
    channel?: string;
    context?: Record<string, any>;
    ttlDays?: number;
};
export declare class NotificationDispatchService {
    private readonly dispatchModel;
    constructor(dispatchModel: Model<NotificationDispatchDocument>);
    claim(key: string, options?: NotificationClaimOptions): Promise<boolean>;
    claimScheduledRun(jobName: string, when?: Date): Promise<boolean>;
    release(key: string): Promise<void>;
    wasSent(key: string): Promise<boolean>;
    buildKey(...segments: Array<string | number | null | undefined>): string;
    private normalizeKey;
}
