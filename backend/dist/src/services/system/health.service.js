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
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const READY_STATE_LABELS = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
};
let HealthService = class HealthService {
    constructor(mainConnection) {
        this.mainConnection = mainConnection;
    }
    getHealth() {
        const mongoState = this.mainConnection.readyState;
        const mongoStatus = READY_STATE_LABELS[mongoState] ?? `unknown:${mongoState}`;
        const healthy = mongoState === 1;
        return {
            ok: healthy,
            status: healthy ? 'ok' : 'degraded',
            uptimeSeconds: Math.round(process.uptime()),
            timestamp: new Date().toISOString(),
            dependencies: {
                mongo: {
                    status: mongoStatus,
                    database: this.mainConnection.name,
                },
            },
        };
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [Function])
], HealthService);
//# sourceMappingURL=health.service.js.map