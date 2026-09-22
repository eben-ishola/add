import { ApiKeyConfigService } from 'src/services/system/api-key-config.service';
export declare class ApiKeyConfigController {
    private readonly apiKeyConfigService;
    constructor(apiKeyConfigService: ApiKeyConfigService);
    getControlApiConfig(): Promise<any>;
    updateControlApiConfig(body: any): Promise<any>;
}
