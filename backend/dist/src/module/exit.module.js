"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExitModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const exit_controller_1 = require("../controllers/employee-lifecycle/exit.controller");
const exit_request_schema_1 = require("../schemas/exit-request.schema");
const exit_clearance_schema_1 = require("../schemas/exit-clearance.schema");
const user_schema_1 = require("../schemas/user.schema");
const exit_workflow_schema_1 = require("../schemas/exit-workflow.schema");
const department_schema_1 = require("../schemas/department.schema");
const payroll_schema_1 = require("../schemas/payroll.schema");
const exit_interview_schema_1 = require("../schemas/exit-interview.schema");
const mail_service_1 = require("../services/comms/mail.service");
const exit_service_1 = require("../services/employee-lifecycle/exit.service");
let ExitModule = class ExitModule {
};
exports.ExitModule = ExitModule;
exports.ExitModule = ExitModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: exit_request_schema_1.ExitRequest.name, schema: exit_request_schema_1.ExitRequestSchema },
                { name: exit_clearance_schema_1.ExitClearance.name, schema: exit_clearance_schema_1.ExitClearanceSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: department_schema_1.Department.name, schema: department_schema_1.DepartmentSchema },
                { name: exit_workflow_schema_1.ExitWorkflowConfig.name, schema: exit_workflow_schema_1.ExitWorkflowConfigSchema },
                { name: 'Payroll', schema: payroll_schema_1.PayrollSchema },
                { name: exit_interview_schema_1.ExitInterview.name, schema: exit_interview_schema_1.ExitInterviewSchema },
            ]),
        ],
        controllers: [exit_controller_1.ExitController],
        providers: [exit_service_1.ExitService, mail_service_1.MailService],
        exports: [exit_service_1.ExitService],
    })
], ExitModule);
//# sourceMappingURL=exit.module.js.map