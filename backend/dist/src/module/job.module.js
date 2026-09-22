"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const job_controller_1 = require("../controllers/jobs/job.controller");
const job_service_1 = require("../services/jobs/job.service");
const job_schema_1 = require("../schemas/job.schema");
const application_schema_1 = require("../schemas/application.schema");
const auth_module_1 = require("../auth/auth.module");
const mail_service_1 = require("../services/comms/mail.service");
const notice_service_1 = require("../services/comms/notice.service");
const notice_schema_1 = require("../schemas/notice.schema");
const notice_module_1 = require("../events/notice.module");
let JobModule = class JobModule {
};
exports.JobModule = JobModule;
exports.JobModule = JobModule = __decorate([
    (0, common_1.Module)({
        imports: [
            notice_module_1.NoticeGatewayModule,
            mongoose_1.MongooseModule.forFeature([
                { name: job_schema_1.Job.name, schema: job_schema_1.JobSchema },
                { name: application_schema_1.Application.name, schema: application_schema_1.ApplicationSchema },
                { name: notice_schema_1.Notice.name, schema: notice_schema_1.NoticeSchema }
            ]),
            auth_module_1.AuthModule
        ],
        controllers: [job_controller_1.JobController],
        providers: [job_service_1.JobService, mail_service_1.MailService, notice_service_1.NoticeService],
        exports: [job_service_1.JobService],
    })
], JobModule);
//# sourceMappingURL=job.module.js.map