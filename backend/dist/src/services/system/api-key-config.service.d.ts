import { Model } from 'mongoose';
import { ApiKeyConfigDocument } from 'src/schemas/api-key-config.schema';
export declare const CONTROL_API_SERVICE_KEY = "control-api";
type UpdateControlApiConfigInput = {
    enabled?: boolean;
    baseUrl?: string;
    apiKey?: string;
};
type ResolvedControlApiSettings = {
    enabled: boolean;
    baseUrl: string;
    apiKey: string;
};
export declare class ApiKeyConfigService {
    private readonly apiKeyConfigModel;
    constructor(apiKeyConfigModel: Model<ApiKeyConfigDocument>);
    private sanitizeString;
    private toBoolean;
    private validateUrl;
    private stripSecrets;
    private findControlApiRecord;
    getControlApiConfig(options?: {
        includeSecrets?: boolean;
    }): Promise<any>;
    resolveControlApiSettings(): Promise<ResolvedControlApiSettings>;
    updateControlApiConfig(payload: UpdateControlApiConfigInput): Promise<any>;
}
export {};
