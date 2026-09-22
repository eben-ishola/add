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
exports.NotificationDispatchService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const moment = require("moment-timezone");
const notification_dispatch_schema_1 = require("../../schemas/notification-dispatch.schema");
const DEFAULT_CLAIM_TTL_DAYS = 120;
const MONGO_DUPLICATE_KEY = 11000;
const RUN_SLOT_MINUTES = 10;
const RUN_CLAIM_TTL_DAYS = 7;
let NotificationDispatchService = class NotificationDispatchService {
    constructor(dispatchModel) {
        this.dispatchModel = dispatchModel;
    }
    async claim(key, options) {
        const normalized = this.normalizeKey(key);
        if (!normalized)
            return false;
        const ttlDays = Number.isFinite(Number(options?.ttlDays))
            ? Number(options?.ttlDays)
            : DEFAULT_CLAIM_TTL_DAYS;
        const now = new Date();
        try {
            await this.dispatchModel.create({
                key: normalized,
                channel: options?.channel,
                context: options?.context,
                sentAt: now,
                expiresAt: new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000),
            });
            return true;
        }
        catch (error) {
            if (error?.code === MONGO_DUPLICATE_KEY || error?.code === '11000') {
                return false;
            }
            console.error('Notification dispatch claim failed', { key: normalized, error });
            return true;
        }
    }
    async claimScheduledRun(jobName, when) {
        const at = moment(when ?? new Date()).tz('Africa/Lagos');
        const bucketMinute = Math.floor(at.minute() / RUN_SLOT_MINUTES) * RUN_SLOT_MINUTES;
        const slot = at.clone().minute(bucketMinute).second(0).format('YYYY-MM-DDTHH:mm');
        return this.claim(this.buildKey('cron', jobName, slot), {
            channel: 'cron',
            ttlDays: RUN_CLAIM_TTL_DAYS,
        });
    }
    async release(key) {
        const normalized = this.normalizeKey(key);
        if (!normalized)
            return;
        try {
            await this.dispatchModel.deleteOne({ key: normalized }).exec();
        }
        catch (error) {
            console.error('Notification dispatch release failed', { key: normalized, error });
        }
    }
    async wasSent(key) {
        const normalized = this.normalizeKey(key);
        if (!normalized)
            return false;
        try {
            return Boolean(await this.dispatchModel.exists({ key: normalized }));
        }
        catch (error) {
            console.error('Notification dispatch lookup failed', { key: normalized, error });
            return false;
        }
    }
    buildKey(...segments) {
        return segments
            .map((segment) => String(segment ?? '').trim())
            .filter((segment) => segment.length > 0)
            .join(':');
    }
    normalizeKey(key) {
        return typeof key === 'string' ? key.trim() : '';
    }
};
exports.NotificationDispatchService = NotificationDispatchService;
exports.NotificationDispatchService = NotificationDispatchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_dispatch_schema_1.NotificationDispatch.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], NotificationDispatchService);
//# sourceMappingURL=notification-dispatch.service.js.map