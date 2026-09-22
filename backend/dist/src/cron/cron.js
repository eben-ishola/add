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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const socket_io_client_1 = require("socket.io-client");
const user_service_1 = require("../services/user/user.service");
const performance_kpi_result_service_1 = require("../services/performance/performance-kpi-result.service");
const performance_service_1 = require("../services/performance/performance.service");
const notification_dispatch_service_1 = require("../services/comms/notification-dispatch.service");
const config_1 = require("../config");
const formatPeriod = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};
const resolvePeriodWithOffset = (date, offset) => {
    const safeOffset = Number.isFinite(Number(offset)) ? Number(offset) : 0;
    const periodDate = new Date(date.getFullYear(), date.getMonth() + safeOffset, 1);
    return formatPeriod(periodDate);
};
const resolveScheduledDay = (date, value) => {
    const fallback = 1;
    const numeric = Number(value);
    const raw = Number.isFinite(numeric) ? numeric : fallback;
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const normalized = Math.min(Math.max(Math.trunc(raw), 1), daysInMonth);
    return normalized || fallback;
};
let CronService = class CronService {
    constructor(httpService, staffService, performanceKpiResultService, performanceService, dispatchService) {
        this.httpService = httpService;
        this.staffService = staffService;
        this.performanceKpiResultService = performanceKpiResultService;
        this.performanceService = performanceService;
        this.dispatchService = dispatchService;
    }
    async handleCron() {
        if (!(await this.dispatchService.claimScheduledRun('daily-maintenance')))
            return;
        try {
            await this.staffService.deactivateExitedStaff();
        }
        catch (error) {
            console.error('Unable to deactivate exited staff', error);
        }
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        if (tomorrow.getMonth() !== today.getMonth()) {
            const claimKey = `idle-time-summary:${formatPeriod(today)}`;
            if (!(await this.dispatchService.claim(claimKey, { channel: 'email' }))) {
                return;
            }
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get('https://hrmsapi.addosser.com/idleTime'));
                const data = response.data;
                const socket = (0, socket_io_client_1.io)('http://localhost:3101');
                data.forEach((user) => {
                    const payload = {
                        to: user.email,
                        templateType: 'active-hrms',
                        templateVariables: {
                            firstName: user.email.split('.')[0],
                            totalActiveTime: user.activeTime,
                            totalIdleTime: user.idleTime,
                            logo: 'https://intranet.addosser.com/img/logo.png',
                        },
                    };
                    socket.emit('email', payload);
                });
                socket.close();
            }
            catch (error) {
                console.error('Error in cron job:', error);
                await this.dispatchService.release(claimKey);
            }
        }
    }
    async handlePerformanceKpiCron() {
        if (!(await this.dispatchService.claimScheduledRun('performance-kpi')))
            return;
        const today = new Date();
        const openDay = resolveScheduledDay(today, config_1.config.performanceKpiOpenDay);
        const apiDay = resolveScheduledDay(today, config_1.config.performanceKpiApiImportDay);
        if (today.getDate() === openDay) {
            try {
                await this.performanceKpiResultService.openMonthlyResults(formatPeriod(today));
            }
            catch (error) {
                console.error('Unable to open monthly KPI results', error);
            }
        }
        if (today.getDate() === apiDay &&
            typeof config_1.config.performanceKpiApiUrl === 'string' &&
            config_1.config.performanceKpiApiUrl.trim()) {
            const period = resolvePeriodWithOffset(today, config_1.config.performanceKpiApiPeriodOffsetMonths);
            try {
                const headers = config_1.config.performanceKpiApiToken
                    ? { Authorization: `Bearer ${config_1.config.performanceKpiApiToken}` }
                    : undefined;
                const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(config_1.config.performanceKpiApiUrl, { headers }));
                const payload = response?.data;
                const results = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload?.results)
                        ? payload.results
                        : Array.isArray(payload?.data)
                            ? payload.data
                            : [];
                if (!results.length) {
                    return;
                }
                await this.performanceKpiResultService.importApiResults({
                    period,
                    results,
                });
            }
            catch (error) {
                console.error('Unable to import KPI API results', error);
            }
        }
    }
    async handleOutstandingAppraisalNudges() {
        if (!(await this.dispatchService.claimScheduledRun('appraisal-nudges')))
            return;
        try {
            const summary = await this.performanceService.notifyOutstandingReviews();
            if (summary.outstanding) {
                console.log(`Appraisal nudge: notified ${summary.notified}/${summary.outstanding} (failed=${summary.failed}) across ${summary.cycles} active cycle(s)`);
            }
        }
        catch (error) {
            console.error('Unable to send appraisal nudges', error);
        }
    }
};
exports.CronService = CronService;
__decorate([
    (0, schedule_1.Cron)('0 22 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronService.prototype, "handleCron", null);
__decorate([
    (0, schedule_1.Cron)('0 5 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronService.prototype, "handlePerformanceKpiCron", null);
__decorate([
    (0, schedule_1.Cron)('0 14 * * 1,3,5'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronService.prototype, "handleOutstandingAppraisalNudges", null);
exports.CronService = CronService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        user_service_1.StaffService,
        performance_kpi_result_service_1.PerformanceKpiResultService,
        performance_service_1.PerformanceService,
        notification_dispatch_service_1.NotificationDispatchService])
], CronService);
//# sourceMappingURL=cron.js.map