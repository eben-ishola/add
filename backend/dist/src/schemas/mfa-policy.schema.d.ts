import { Document } from 'mongoose';
export declare const MFA_POLICY_SINGLETON_KEY = "global";
export type MfaPolicyDocument = MfaPolicy & Document;
export declare class MfaPolicy {
    key: string;
    requireForAll: boolean;
    updatedBy?: string | null;
}
export declare const MfaPolicySchema: import("mongoose").Schema<MfaPolicy, import("mongoose").Model<MfaPolicy, any, any, any, Document<unknown, any, MfaPolicy, any, {}> & MfaPolicy & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, MfaPolicy, Document<unknown, {}, import("mongoose").FlatRecord<MfaPolicy>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<MfaPolicy> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
