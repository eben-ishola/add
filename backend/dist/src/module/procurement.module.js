"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcurementModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const auth_module_1 = require("../auth/auth.module");
const notice_module_1 = require("../events/notice.module");
const procurement_controller_1 = require("../controllers/procurement/procurement.controller");
const procurement_service_1 = require("../services/procurement/procurement.service");
const procurement_reminder_service_1 = require("../services/procurement/procurement-reminder.service");
const notification_dispatch_module_1 = require("./notification-dispatch.module");
const it_staff_guard_1 = require("../auth/guards/it-staff.guard");
const procurement_admin_guard_1 = require("../auth/guards/procurement-admin.guard");
const super_admin_guard_1 = require("../auth/guards/super-admin.guard");
const cba_service_1 = require("../services/compensation/cba.service");
const procurement_requisition_schema_1 = require("../schemas/procurement-requisition.schema");
const procurement_workflow_schema_1 = require("../schemas/procurement-workflow.schema");
const user_schema_1 = require("../schemas/user.schema");
const expense_account_schema_1 = require("../schemas/expense-account.schema");
const expense_budget_schema_1 = require("../schemas/expense-budget.schema");
const subsidiary_schema_1 = require("../schemas/subsidiary.schema");
const department_schema_1 = require("../schemas/department.schema");
const notice_schema_1 = require("../schemas/notice.schema");
const smtp_config_schema_1 = require("../schemas/smtp-config.schema");
const notice_service_1 = require("../services/comms/notice.service");
const mail_service_1 = require("../services/comms/mail.service");
const smtp_config_service_1 = require("../services/comms/smtp-config.service");
const workflow_notifier_service_1 = require("../services/comms/workflow-notifier.service");
let ProcurementModule = class ProcurementModule {
};
exports.ProcurementModule = ProcurementModule;
exports.ProcurementModule = ProcurementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: procurement_requisition_schema_1.ProcurementRequisition.name, schema: procurement_requisition_schema_1.ProcurementRequisitionSchema },
                { name: procurement_workflow_schema_1.ProcurementWorkflowConfig.name, schema: procurement_workflow_schema_1.ProcurementWorkflowConfigSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: expense_account_schema_1.ExpenseAccount.name, schema: expense_account_schema_1.ExpenseAccountSchema },
                { name: expense_budget_schema_1.ExpenseBudget.name, schema: expense_budget_schema_1.ExpenseBudgetSchema },
                { name: subsidiary_schema_1.Subsidiary.name, schema: subsidiary_schema_1.SubsidiarySchema },
                { name: department_schema_1.Department.name, schema: department_schema_1.DepartmentSchema },
                { name: notice_schema_1.Notice.name, schema: notice_schema_1.NoticeSchema },
                { name: smtp_config_schema_1.SmtpConfig.name, schema: smtp_config_schema_1.SmtpConfigSchema },
            ]),
            notice_module_1.NoticeGatewayModule,
            notification_dispatch_module_1.NotificationDispatchModule,
            auth_module_1.AuthModule,
        ],
        controllers: [procurement_controller_1.ProcurementController],
        providers: [
            procurement_service_1.ProcurementService,
            procurement_reminder_service_1.ProcurementReminderService,
            super_admin_guard_1.SuperAdminGuard,
            it_staff_guard_1.ItStaffGuard,
            procurement_admin_guard_1.ProcurementAdminGuard,
            cba_service_1.CbaService,
            workflow_notifier_service_1.WorkflowNotifier,
            notice_service_1.NoticeService,
            mail_service_1.MailService,
            smtp_config_service_1.SmtpConfigService,
        ],
        exports: [procurement_service_1.ProcurementService],
    })
], ProcurementModule);
//# sourceMappingURL=procurement.module.js.map