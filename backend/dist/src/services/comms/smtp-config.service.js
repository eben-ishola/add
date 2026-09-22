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
exports.SmtpConfigService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const smtp_config_schema_1 = require("../../schemas/smtp-config.schema");
let SmtpConfigService = class SmtpConfigService {
    constructor(smtpModel) {
        this.smtpModel = smtpModel;
    }
    sanitizeString(value) {
        if (typeof value !== 'string')
            return undefined;
        const trimmed = value.trim();
        return trimmed.length ? trimmed : '';
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
    toProvider(value) {
        if (typeof value !== 'string')
            return undefined;
        const normalized = value.trim().toLowerCase();
        if (!normalized)
            return undefined;
        const match = smtp_config_schema_1.MAIL_PROVIDERS.find((provider) => provider === normalized);
        if (!match) {
            throw new common_1.BadRequestException(`Mail provider must be one of: ${smtp_config_schema_1.MAIL_PROVIDERS.join(', ')}.`);
        }
        return match;
    }
    toNumber(value) {
        if (value === null || value === undefined || value === '')
            return undefined;
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed <= 0)
            return undefined;
        return Math.round(parsed);
    }
    stripSecrets(config) {
        if (!config)
            return null;
        const { password, ...rest } = config;
        return {
            ...rest,
            provider: rest.provider ?? 'smtp',
            providerPresets: smtp_config_schema_1.MAIL_PROVIDER_PRESETS,
            hasPassword: Boolean(password),
        };
    }
    async getConfig(options) {
        const record = await this.smtpModel.findOne().sort({ updatedAt: -1 }).lean().exec();
        if (options?.includeSecrets)
            return record ?? null;
        return this.stripSecrets(record ?? { provider: 'smtp' });
    }
    async updateConfig(payload) {
        const update = {};
        const enabled = this.toBoolean(payload.enabled);
        if (enabled !== undefined)
            update.enabled = enabled;
        const payrollEmailEnabled = this.toBoolean(payload.payrollEmailEnabled);
        if (payrollEmailEnabled !== undefined) {
            update.payrollEmailEnabled = payrollEmailEnabled;
        }
        const provider = this.toProvider(payload.provider);
        if (provider !== undefined)
            update.provider = provider;
        if (payload.host !== undefined) {
            update.host = this.sanitizeString(payload.host);
        }
        if (payload.port !== undefined) {
            const port = this.toNumber(payload.port);
            if (port !== undefined)
                update.port = port;
        }
        if (payload.secure !== undefined) {
            const secure = this.toBoolean(payload.secure);
            if (secure !== undefined)
                update.secure = secure;
        }
        if (payload.username !== undefined) {
            update.username = this.sanitizeString(payload.username);
        }
        if (payload.fromEmail !== undefined) {
            update.fromEmail = this.sanitizeString(payload.fromEmail);
        }
        if (payload.fromName !== undefined) {
            update.fromName = this.sanitizeString(payload.fromName);
        }
        if (payload.headerText !== undefined) {
            update.headerText = this.sanitizeString(payload.headerText);
        }
        if (payload.footerText !== undefined) {
            update.footerText = this.sanitizeString(payload.footerText);
        }
        if (payload.headerHtml !== undefined) {
            update.headerHtml = this.sanitizeString(payload.headerHtml);
        }
        if (payload.footerHtml !== undefined) {
            update.footerHtml = this.sanitizeString(payload.footerHtml);
        }
        if (typeof payload.password === 'string' && payload.password.trim().length) {
            update.password = payload.password.trim();
        }
        let record = await this.smtpModel.findOne().exec();
        if (record) {
            Object.assign(record, update);
            record = await record.save();
        }
        else {
            record = await this.smtpModel.create(update);
        }
        return this.stripSecrets(record.toObject());
    }
};
exports.SmtpConfigService = SmtpConfigService;
exports.SmtpConfigService = SmtpConfigService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(smtp_config_schema_1.SmtpConfig.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SmtpConfigService);
//# sourceMappingURL=smtp-config.service.js.map