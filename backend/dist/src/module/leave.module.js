"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveModule = void 0;
const common_1 = require("@nestjs/common");
const leave_service_1 = require("../services/employee-lifecycle/leave.service");
const leave_controller_1 = require("../controllers/employee-lifecycle/leave.controller");
const leave_schema_1 = require("../schemas/leave.schema");
const holiday_schema_1 = require("../schemas/holiday.schema");
const mongoose_1 = require("@nestjs/mongoose");
const mail_service_1 = require("../services/comms/mail.service");
const leaveMapping_schema_1 = require("../schemas/leaveMapping.schema");
const user_module_1 = require("./user.module");
const user_schema_1 = require("../schemas/user.schema");
const auth_module_1 = require("../auth/auth.module");
const notice_schema_1 = require("../schemas/notice.schema");
const level_schema_1 = require("../schemas/level.schema");
const level_category_schema_1 = require("../schemas/level-category.schema");
const notice_service_1 = require("../services/comms/notice.service");
const notice_module_1 = require("../events/notice.module");
const leave_policy_schema_1 = require("../schemas/leave-policy.schema");
const attendanceConfig_schema_1 = require("../schemas/attendanceConfig.schema");
const department_schema_1 = require("../schemas/department.schema");
let LeaveModule = class LeaveModule {
};
exports.LeaveModule = LeaveModule;
exports.LeaveModule = LeaveModule = __decorate([
    (0, common_1.Module)({
        imports: [
            notice_module_1.NoticeGatewayModule,
            mongoose_1.MongooseModule.forFeature([
                { name: leave_schema_1.Leave.name, schema: leave_schema_1.LeaveSchema },
                { name: holiday_schema_1.Holiday.name, schema: holiday_schema_1.HolidaySchema },
                { name: leaveMapping_schema_1.LeaveMapping.name, schema: leaveMapping_schema_1.LeaveMappingSchema },
                { name: leave_policy_schema_1.LeavePolicy.name, schema: leave_policy_schema_1.LeavePolicySchema },
                { name: attendanceConfig_schema_1.AttendanceConfig.name, schema: attendanceConfig_schema_1.AttendanceConfigSchema },
                { name: notice_schema_1.Notice.name, schema: notice_schema_1.NoticeSchema },
                { name: level_schema_1.Level.name, schema: level_schema_1.LevelSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: department_schema_1.Department.name, schema: department_schema_1.DepartmentSchema },
                { name: level_category_schema_1.LevelCategory.name, schema: level_category_schema_1.LevelCategorySchema },
            ]),
            auth_module_1.AuthModule,
            user_module_1.StaffModule,
        ],
        controllers: [leave_controller_1.LeaveController],
        providers: [
            leave_service_1.LeaveService,
            mail_service_1.MailService,
            notice_service_1.NoticeService,
        ],
        exports: [leave_service_1.LeaveService],
    })
], LeaveModule);
//# sourceMappingURL=leave.module.js.map