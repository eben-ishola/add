"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const user_module_1 = require("./user.module");
const attendance_controller_1 = require("../controllers/employee-lifecycle/attendance.controller");
const attendance_schema_1 = require("../schemas/attendance.schema");
const attendanceConfig_schema_1 = require("../schemas/attendanceConfig.schema");
const holiday_schema_1 = require("../schemas/holiday.schema");
const leave_schema_1 = require("../schemas/leave.schema");
const attendance_service_1 = require("../services/employee-lifecycle/attendance.service");
const auth_module_1 = require("../auth/auth.module");
const notice_schema_1 = require("../schemas/notice.schema");
const notice_service_1 = require("../services/comms/notice.service");
const notice_module_1 = require("../events/notice.module");
const disciplinary_module_1 = require("./disciplinary.module");
const mail_service_1 = require("../services/comms/mail.service");
let AttendanceModule = class AttendanceModule {
};
exports.AttendanceModule = AttendanceModule;
exports.AttendanceModule = AttendanceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            notice_module_1.NoticeGatewayModule,
            mongoose_1.MongooseModule.forFeature([
                { name: attendance_schema_1.Attendance.name, schema: attendance_schema_1.AttendanceSchema },
                { name: attendanceConfig_schema_1.AttendanceConfig.name, schema: attendanceConfig_schema_1.AttendanceConfigSchema },
                { name: holiday_schema_1.Holiday.name, schema: holiday_schema_1.HolidaySchema },
                { name: leave_schema_1.Leave.name, schema: leave_schema_1.LeaveSchema },
                { name: notice_schema_1.Notice.name, schema: notice_schema_1.NoticeSchema }
            ]),
            auth_module_1.AuthModule,
            user_module_1.StaffModule,
            disciplinary_module_1.DisciplinaryModule,
        ],
        providers: [attendance_service_1.AttendanceService, notice_service_1.NoticeService, mail_service_1.MailService],
        controllers: [attendance_controller_1.AttendanceController],
    })
], AttendanceModule);
//# sourceMappingURL=attendance.module.js.map