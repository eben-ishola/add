"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRequestModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const auth_module_1 = require("../auth/auth.module");
const service_request_controller_1 = require("../controllers/service-desk/service-request.controller");
const notice_module_1 = require("../events/notice.module");
const service_request_schema_1 = require("../schemas/service-request.schema");
const notice_schema_1 = require("../schemas/notice.schema");
const notice_service_1 = require("../services/comms/notice.service");
const service_request_service_1 = require("../services/service-desk/service-request.service");
const user_module_1 = require("./user.module");
const mail_service_1 = require("../services/comms/mail.service");
let ServiceRequestModule = class ServiceRequestModule {
};
exports.ServiceRequestModule = ServiceRequestModule;
exports.ServiceRequestModule = ServiceRequestModule = __decorate([
    (0, common_1.Module)({
        imports: [
            notice_module_1.NoticeGatewayModule,
            mongoose_1.MongooseModule.forFeature([
                { name: service_request_schema_1.ServiceRequest.name, schema: service_request_schema_1.ServiceRequestSchema },
                { name: notice_schema_1.Notice.name, schema: notice_schema_1.NoticeSchema },
            ]),
            auth_module_1.AuthModule,
            user_module_1.StaffModule,
        ],
        controllers: [service_request_controller_1.ServiceRequestController],
        providers: [
            service_request_service_1.ServiceRequestService,
            notice_service_1.NoticeService,
            mail_service_1.MailService,
        ],
        exports: [service_request_service_1.ServiceRequestService],
    })
], ServiceRequestModule);
//# sourceMappingURL=service-request.module.js.map