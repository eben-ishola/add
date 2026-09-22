"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationDispatchModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const notification_dispatch_schema_1 = require("../schemas/notification-dispatch.schema");
const notification_dispatch_service_1 = require("../services/comms/notification-dispatch.service");
let NotificationDispatchModule = class NotificationDispatchModule {
};
exports.NotificationDispatchModule = NotificationDispatchModule;
exports.NotificationDispatchModule = NotificationDispatchModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: notification_dispatch_schema_1.NotificationDispatch.name, schema: notification_dispatch_schema_1.NotificationDispatchSchema },
            ]),
        ],
        providers: [notification_dispatch_service_1.NotificationDispatchService],
        exports: [notification_dispatch_service_1.NotificationDispatchService],
    })
], NotificationDispatchModule);
//# sourceMappingURL=notification-dispatch.module.js.map