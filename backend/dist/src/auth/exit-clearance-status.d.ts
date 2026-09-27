import { Model } from 'mongoose';
export declare const latestClearanceStatus: (clearanceModel: Model<any> | undefined, userId: unknown) => Promise<string | null>;
export declare const exitClearanceClosed: (status: string | null) => boolean;
