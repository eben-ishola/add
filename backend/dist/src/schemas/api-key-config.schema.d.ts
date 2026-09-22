import { Document } from 'mongoose';
export type ApiKeyConfigDocument = ApiKeyConfig & Document;
export declare class ApiKeyConfig {
    serviceKey: string;
    displayName?: string;
    baseUrl?: string;
    apiKey?: string;
    enabled?: boolean;
}
export declare const ApiKeyConfigSchema: import("mongoose").Schema<ApiKeyConfig, import("mongoose").Model<ApiKeyConfig, any, any, any, Document<unknown, any, ApiKeyConfig, any, {}> & ApiKeyConfig & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ApiKeyConfig, Document<unknown, {}, import("mongoose").FlatRecord<ApiKeyConfig>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ApiKeyConfig> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
