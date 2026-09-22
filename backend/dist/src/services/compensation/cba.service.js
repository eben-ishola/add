"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CbaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CbaService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const config_1 = require("../../config");
let CbaService = CbaService_1 = class CbaService {
    constructor() {
        this.logger = new common_1.Logger(CbaService_1.name);
        this.requestTimeoutMs = Number(process.env.CBA_TIMEOUT_MS ?? 200000);
    }
    resolveCbaUrl() {
        const url = String(config_1.config.cbaUrl ?? '').trim();
        if (!url) {
            throw new common_1.ServiceUnavailableException('CBA service URL is not configured.');
        }
        return url;
    }
    resolveApiKey() {
        const apiKey = String(config_1.config.cbaApiKey ?? '').trim();
        if (!apiKey) {
            throw new common_1.ServiceUnavailableException('CBA API key is not configured.');
        }
        return apiKey;
    }
    extractUpstreamMessage(error) {
        const data = error?.response?.data;
        if (!data)
            return undefined;
        if (typeof data === 'string')
            return data.trim() || undefined;
        if (typeof data?.message === 'string' && data.message.trim())
            return data.message.trim();
        if (Array.isArray(data?.message) && data.message.length) {
            return data.message.map((m) => String(m)).join('; ');
        }
        if (typeof data?.error === 'string' && data.error.trim())
            return data.error.trim();
        return undefined;
    }
    unwrapRows(body) {
        return Array.isArray(body)
            ? body
            : Array.isArray(body?.data)
                ? body.data
                : Array.isArray(body?.rows)
                    ? body.rows
                    : Array.isArray(body?.data?.data)
                        ? body.data.data
                        :
                            Array.isArray(body?.value)
                                ? body.value
                                : [];
    }
    async requestCba(actions, data, label, requestLabel) {
        const url = this.resolveCbaUrl();
        const apiKey = this.resolveApiKey();
        const payload = { type: 'oracle', actions, id: { data } };
        const startedAt = Date.now();
        try {
            const response = await axios_1.default.post(url, payload, {
                headers: { 'x-api-key': apiKey },
                timeout: this.requestTimeoutMs,
            });
            const elapsedMs = Date.now() - startedAt;
            this.logger.log(`CBA ${actions} request completed in ${elapsedMs}ms`);
            const rows = this.unwrapRows(response?.data);
            this.logger.debug(`CBA ${actions} unwrapped ${rows.length} row(s).`);
            return rows;
        }
        catch (error) {
            const axiosError = error;
            const status = axiosError?.response?.status;
            const code = axiosError?.code;
            const isTimeout = code === 'ECONNABORTED' || /timeout/i.test(String(axiosError?.message ?? ''));
            const upstreamMessage = this.extractUpstreamMessage(axiosError);
            this.logger.error(`CBA ${actions} request failed. status=${status ?? 'n/a'} code=${code ?? 'n/a'} ` +
                `timeout=${isTimeout} upstream="${upstreamMessage ?? ''}"`);
            if (isTimeout) {
                throw new common_1.ServiceUnavailableException(`CBA service timed out after ${this.requestTimeoutMs}ms while fetching ${label}.`);
            }
            if (status === 401) {
                throw new common_1.UnauthorizedException(upstreamMessage ?? 'CBA service rejected the API key.');
            }
            if (status === 403) {
                throw new common_1.ForbiddenException(upstreamMessage ?? 'CBA service rejected access for this client.');
            }
            if (status === 400) {
                throw new common_1.BadRequestException(upstreamMessage ?? `CBA service rejected the ${requestLabel}.`);
            }
            throw new common_1.ServiceUnavailableException(upstreamMessage ?? `Unable to fetch ${label} from CBA service.`);
        }
    }
    async fetchGlExpenditure(input) {
        const account = String(input?.account ?? '').trim();
        const institution = String(input?.institution ?? '').trim();
        const start = String(input?.start ?? '').trim();
        const end = String(input?.end ?? '').trim();
        if (!account) {
            throw new common_1.BadRequestException('A GL account number is required.');
        }
        if (!institution) {
            throw new common_1.BadRequestException('An institution prefix is required.');
        }
        if (!start || !end) {
            throw new common_1.BadRequestException('A start and end date are required.');
        }
        if (Number.isNaN(Date.parse(start)) || Number.isNaN(Date.parse(end))) {
            throw new common_1.BadRequestException('Start and end must be valid dates.');
        }
        if (Date.parse(start) > Date.parse(end)) {
            throw new common_1.BadRequestException('The start date must fall before the end date.');
        }
        const asOracleDate = (value) => new Date(value).toLocaleDateString('en-US');
        const rows = await this.requestCba('expenseGL', {
            acct: account,
            inst: institution,
            start: asOracleDate(start),
            end: asOracleDate(end),
            tranType: 'DR',
        }, 'GL expenditure', 'GL expenditure request payload');
        const first = rows?.[0] ?? {};
        const raw = first?.totalDebit ?? first?.TOTALDEBIT ?? first?.total_debit ?? first?.SUM ?? 0;
        const major = Number(raw);
        const totalDebit = Number.isFinite(major) ? Math.round(major * 100) : 0;
        return { status: 200, totalDebit, data: rows };
    }
    async searchGlAccounts(input) {
        const name = String(input?.name ?? '').trim();
        const businessUnit = String(input?.businessUnit ?? '').trim();
        if (!name) {
            throw new common_1.BadRequestException('A search term is required to find a GL account.');
        }
        if (!businessUnit) {
            throw new common_1.BadRequestException('A business unit is required to find a GL account.');
        }
        const rows = await this.requestCba('searchGL', { name, bu: businessUnit }, 'GL accounts', 'GL search request payload');
        return { status: 200, data: rows };
    }
    async selectGlAccounts(input) {
        const subLedger = String(input?.subLedger ?? '').trim();
        const businessUnit = String(input?.businessUnit ?? '').trim();
        if (!subLedger) {
            throw new common_1.BadRequestException('A sub ledger is required to list GL accounts.');
        }
        if (!businessUnit) {
            throw new common_1.BadRequestException('A business unit is required to list GL accounts.');
        }
        const rows = await this.requestCba('selectGL', { sub: subLedger, bu: businessUnit }, 'GL accounts', 'GL select request payload');
        return { status: 200, data: rows };
    }
    async fetchSalaryCallOver(narration) {
        const trimmedNarration = narration?.trim();
        if (!trimmedNarration) {
            throw new common_1.BadRequestException('Narration is required for salary callover.');
        }
        const rows = await this.requestCba('salaryCallover', { narration: trimmedNarration }, 'callover data', 'callover request payload');
        return { status: 200, data: rows };
    }
};
exports.CbaService = CbaService;
exports.CbaService = CbaService = CbaService_1 = __decorate([
    (0, common_1.Injectable)()
], CbaService);
//# sourceMappingURL=cba.service.js.map