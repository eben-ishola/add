"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringModule = void 0;
const common_1 = require("@nestjs/common");
const monitoring_controller_1 = require("../controllers/system/monitoring.controller");
const monitoring_service_1 = require("../services/system/monitoring.service");
const health_service_1 = require("../services/system/health.service");
const activity_schema_1 = require("../schemas/activity.schema");
const mongoose_1 = require("@nestjs/mongoose");
const clock_schema_1 = require("../schemas/clock.schema");
const auth_module_1 = require("../auth/auth.module");
let MonitoringModule = class MonitoringModule {
};
exports.MonitoringModule = MonitoringModule;
exports.MonitoringModule = MonitoringModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: activity_schema_1.Activity.name, schema: activity_schema_1.ActivitySchema },
                { name: clock_schema_1.Clock.name, schema: clock_schema_1.ClockSchema }]),
            auth_module_1.AuthModule,
        ],
        controllers: [monitoring_controller_1.MonitoringController],
        providers: [monitoring_service_1.MonitoringService, health_service_1.HealthService],
    })
], MonitoringModule);
//# sourceMappingURL=monitoring.module.js.map