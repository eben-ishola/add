"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const procurement_module_1 = require("./module/procurement.module");
const schedule_1 = require("@nestjs/schedule");
const mongoose_1 = require("@nestjs/mongoose");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const payroll_module_1 = require("./module/payroll.module");
const user_module_1 = require("./module/user.module");
const cron_1 = require("./cron/cron");
const axios_1 = require("@nestjs/axios");
const auth_module_1 = require("./auth/auth.module");
const leave_module_1 = require("./module/leave.module");
const monitoring_module_1 = require("./module/monitoring.module");
const level_module_1 = require("./module/level.module");
const attendance_module_1 = require("./module/attendance.module");
const job_module_1 = require("./module/job.module");
const config_1 = require("./config");
const notice_service_1 = require("./services/comms/notice.service");
const mail_service_1 = require("./services/comms/mail.service");
const notice_schema_1 = require("./schemas/notice.schema");
const notice_module_1 = require("./events/notice.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const branch_service_1 = require("./services/org/branch.service");
const role_service_1 = require("./services/auth-access/role.service");
const permission_service_1 = require("./services/auth-access/permission.service");
const businessUnit_service_1 = require("./services/org/businessUnit.service");
const department_service_1 = require("./services/org/department.service");
const announcement_module_1 = require("./module/announcement.module");
const kpi_module_1 = require("./module/kpi.module");
const disciplinary_module_1 = require("./module/disciplinary.module");
const document_module_1 = require("./module/document.module");
const performance_module_1 = require("./module/performance.module");
const service_survey_module_1 = require("./module/service-survey.module");
const service_request_module_1 = require("./module/service-request.module");
const audit_log_module_1 = require("./module/audit-log.module");
const notice_controller_1 = require("./controllers/comms/notice.controller");
const permission_schema_1 = require("./schemas/permission.schema");
const role_schema_1 = require("./schemas/role.schema");
const tax_config_schema_1 = require("./schemas/tax-config.schema");
const branch_schema_1 = require("./schemas/branch.schema");
const businessunit_schema_1 = require("./schemas/businessunit.schema");
const territory_schema_1 = require("./schemas/territory.schema");
const department_schema_1 = require("./schemas/department.schema");
const subsidiary_module_1 = require("./module/subsidiary.module");
const subsidiary_schema_1 = require("./schemas/subsidiary.schema");
const app_access_module_1 = require("./module/app-access.module");
const staff_ride_module_1 = require("./module/staff-ride.module");
const exit_module_1 = require("./module/exit.module");
const smtp_config_module_1 = require("./module/smtp-config.module");
const email_template_module_1 = require("./module/email-template.module");
const api_key_config_module_1 = require("./module/api-key-config.module");
const incentives_module_1 = require("./module/incentives.module");
const notification_dispatch_module_1 = require("./module/notification-dispatch.module");
const attachDbLogging = (label) => (connection) => {
    connection.on('error', (error) => {
        console.error(`[MongoDB] ${label} connection error:`, error?.message ?? error);
    });
    connection.on('disconnected', () => {
        console.warn(`[MongoDB] ${label} disconnected.`);
    });
    return connection;
};
const buildOptionalDbOptions = (label) => ({
    connectionName: label,
    lazyConnection: true,
    serverSelectionTimeoutMS: 5000,
    bufferCommands: false,
    connectionFactory: attachDbLogging(label),
});
const buildPrimaryDbOptions = (label) => ({
    serverSelectionTimeoutMS: 5000,
    bufferCommands: false,
    autoIndex: true,
    connectionFactory: attachDbLogging(label),
});
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            notice_module_1.NoticeGatewayModule,
            procurement_module_1.ProcurementModule,
            schedule_1.ScheduleModule.forRoot(),
            mongoose_1.MongooseModule.forRoot(config_1.config.mainDB, buildPrimaryDbOptions('main')),
            mongoose_1.MongooseModule.forRoot(config_1.config.incentivesDB, buildOptionalDbOptions('incentives')),
            mongoose_1.MongooseModule.forRoot(config_1.config.savingsDB, buildOptionalDbOptions('savings')),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'uploads'),
                serveRoot: '/uploads',
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: notice_schema_1.Notice.name, schema: notice_schema_1.NoticeSchema },
                { name: permission_schema_1.Permission.name, schema: permission_schema_1.PermissionSchema },
                { name: role_schema_1.Role.name, schema: role_schema_1.RoleSchema },
                { name: tax_config_schema_1.TaxConfig.name, schema: tax_config_schema_1.TaxConfigSchema },
                { name: branch_schema_1.Branch.name, schema: branch_schema_1.BranchSchema },
                { name: businessunit_schema_1.BusinessUnit.name, schema: businessunit_schema_1.BusinessUnitSchema },
                { name: territory_schema_1.Territory.name, schema: territory_schema_1.TerritorySchema },
                { name: subsidiary_schema_1.Subsidiary.name, schema: subsidiary_schema_1.SubsidiarySchema },
                { name: department_schema_1.Department.name, schema: department_schema_1.DepartmentSchema },
            ]),
            notification_dispatch_module_1.NotificationDispatchModule,
            payroll_module_1.PayrollModule,
            user_module_1.StaffModule,
            axios_1.HttpModule,
            auth_module_1.AuthModule,
            leave_module_1.LeaveModule,
            level_module_1.LevelModule,
            monitoring_module_1.MonitoringModule,
            attendance_module_1.AttendanceModule,
            announcement_module_1.AnnouncementModule,
            kpi_module_1.KpiModule,
            job_module_1.JobModule,
            disciplinary_module_1.DisciplinaryModule,
            audit_log_module_1.AuditLogModule,
            document_module_1.DocumentModule,
            performance_module_1.PerformanceModule,
            service_survey_module_1.ServiceSurveyModule,
            subsidiary_module_1.SubsidiaryModule,
            service_request_module_1.ServiceRequestModule,
            smtp_config_module_1.SmtpConfigModule,
            email_template_module_1.EmailTemplateModule,
            api_key_config_module_1.ApiKeyConfigModule,
            app_access_module_1.AppAccessModule,
            staff_ride_module_1.StaffRideModule,
            exit_module_1.ExitModule,
            incentives_module_1.IncentivesModule
        ],
        controllers: [app_controller_1.AppController, notice_controller_1.NoticeController],
        providers: [
            app_service_1.AppService,
            cron_1.CronService,
            notice_service_1.NoticeService,
            mail_service_1.MailService,
            branch_service_1.BranchService,
            role_service_1.RoleService,
            permission_service_1.PermissionService,
            businessUnit_service_1.BusinessUnitService,
            department_service_1.DepartmentService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map