"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyConfigService = exports.CONTROL_API_SERVICE_KEY = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const config_1 = require("../../config");
const api_key_config_schema_1 = require("../../schemas/api-key-config.schema");
exports.CONTROL_API_SERVICE_KEY = 'control-api';
let ApiKeyConfigService = class ApiKeyConfigService {
    constructor(apiKeyConfigModel) {
        this.apiKeyConfigModel = apiKeyConfigModel;
    }
    sanitizeString(value) {
        if (typeof value !== 'string')
            return undefined;
        return value.trim();
    }
    toBoolean(value) {
        if (typeof value === 'boolean')
            return value;
        if (typeof value === 'string') {
            const normalized = value.trim().toLowerCase();
            if (normalized === 'true')
                return true;
            if (normalized === 'false')
                return false;
        }
        return undefined;
    }
    validateUrl(value) {
        if (!value)
            return;
        try {
            const parsed = new URL(value);
            if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                throw new Error();
            }
        }
        catch {
            throw new common_1.BadRequestException('Control API URL must be a valid HTTP or HTTPS URL.');
        }
    }
    stripSecrets(record, keySource) {
        if (!record)
            return null;
        const { apiKey, ...rest } = record;
        return {
            ...rest,
            hasApiKey: Boolean(apiKey),
            keySource,
        };
    }
    async findControlApiRecord() {
        return this.apiKeyConfigModel
            .findOne({ serviceKey: exports.CONTROL_API_SERVICE_KEY })
            .sort({ updatedAt: -1 })
            .lean()
            .exec();
    }
    async getControlApiConfig(options) {
        const record = await this.findControlApiRecord();
        const envBaseUrl = String(config_1.config.cbaUrl ?? '').trim();
        const envApiKey = String(config_1.config.cbaApiKey ?? '').trim();
        const resolved = {
            serviceKey: exports.CONTROL_API_SERVICE_KEY,
            displayName: 'Control API',
            enabled: record?.enabled ?? true,
            baseUrl: this.sanitizeString(record?.baseUrl) || envBaseUrl,
            apiKey: this.sanitizeString(record?.apiKey) || envApiKey,
            configSource: record ? 'database' : 'environment',
            urlSource: this.sanitizeString(record?.baseUrl) ? 'database' : envBaseUrl ? 'environment' : 'missing',
            updatedAt: record?.updatedAt,
            createdAt: record?.createdAt,
        };
        if (options?.includeSecrets)
            return resolved;
        const keySource = this.sanitizeString(record?.apiKey)
            ? 'database'
            : envApiKey
                ? 'environment'
                : 'missing';
        return this.stripSecrets(resolved, keySource);
    }
    async resolveControlApiSettings() {
        const resolved = await this.getControlApiConfig({ includeSecrets: true });
        return {
            enabled: resolved?.enabled ?? true,
            baseUrl: String(resolved?.baseUrl ?? '').trim(),
            apiKey: String(resolved?.apiKey ?? '').trim(),
        };
    }
    async updateControlApiConfig(payload) {
        const update = {
            serviceKey: exports.CONTROL_API_SERVICE_KEY,
            displayName: 'Control API',
        };
        const enabled = this.toBoolean(payload.enabled);
        if (enabled !== undefined)
            update.enabled = enabled;
        if (payload.baseUrl !== undefined) {
            const baseUrl = this.sanitizeString(payload.baseUrl) ?? '';
            this.validateUrl(baseUrl);
            update.baseUrl = baseUrl;
        }
        if (typeof payload.apiKey === 'string' && payload.apiKey.trim().length) {
            update.apiKey = payload.apiKey.trim();
        }
        let record = await this.apiKeyConfigModel
            .findOne({ serviceKey: exports.CONTROL_API_SERVICE_KEY })
            .exec();
        if (record) {
            Object.assign(record, update);
            record = await record.save();
        }
        else {
            record = await this.apiKeyConfigModel.create(update);
        }
        return this.getControlApiConfig();
    }
};
exports.ApiKeyConfigService = ApiKeyConfigService;
exports.ApiKeyConfigService = ApiKeyConfigService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(api_key_config_schema_1.ApiKeyConfig.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ApiKeyConfigService);
//# sourceMappingURL=api-key-config.service.js.map