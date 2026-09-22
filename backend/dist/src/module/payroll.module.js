"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollModule = void 0;
const common_1 = require("@nestjs/common");
const super_admin_guard_1 = require("../auth/guards/super-admin.guard");
const mongoose_1 = require("@nestjs/mongoose");
const payroll_controller_1 = require("../controllers/payroll/payroll.controller");
const payroll_service_1 = require("../services/payroll/payroll.service");
const payroll_tax_service_1 = require("../services/payroll/payroll-tax.service");
const payroll_notification_service_1 = require("../services/payroll/payroll-notification.service");
const payroll_mapping_service_1 = require("../services/payroll/payroll-mapping.service");
const payroll_performance_service_1 = require("../services/payroll/payroll-performance.service");
const payroll_export_service_1 = require("../services/payroll/payroll-export.service");
const payroll_payslip_approval_service_1 = require("../services/payroll/payroll-payslip-approval.service");
const payroll_approval_enrichment_service_1 = require("../services/payroll/payroll-approval-enrichment.service");
const payroll_workflow_config_service_1 = require("../services/payroll/payroll-workflow-config.service");
const payroll_approval_transition_service_1 = require("../services/payroll/payroll-approval-transition.service");
const payroll_processed_persistence_service_1 = require("../services/payroll/payroll-processed-persistence.service");
const payroll_run_service_1 = require("../services/payroll/payroll-run.service");
const payroll_attendance_service_1 = require("../services/payroll/payroll-attendance.service");
const payroll_row_display_service_1 = require("../services/payroll/payroll-row-display.service");
const payroll_gross_adjustment_service_1 = require("../services/payroll/payroll-gross-adjustment.service");
const payroll_identifier_hydration_service_1 = require("../services/payroll/payroll-identifier-hydration.service");
const payroll_approval_read_service_1 = require("../services/payroll/payroll-approval-read.service");
const payroll_account_switch_service_1 = require("../services/payroll/payroll-account-switch.service");
const payroll_schema_1 = require("../schemas/payroll.schema");
const payrollMap_schema_1 = require("../schemas/payrollMap.schema");
const processedPayroll_schema_1 = require("../schemas/processedPayroll.schema");
const payroll_performance_schema_1 = require("../schemas/payroll-performance.schema");
const subsidiary_service_1 = require("../services/org/subsidiary.service");
const level_service_1 = require("../services/org/level.service");
const branch_service_1 = require("../services/org/branch.service");
const auth_module_1 = require("../auth/auth.module");
const user_module_1 = require("./user.module");
const department_service_1 = require("../services/org/department.service");
const businessUnit_service_1 = require("../services/org/businessUnit.service");
const notice_schema_1 = require("../schemas/notice.schema");
const notice_service_1 = require("../services/comms/notice.service");
const notice_module_1 = require("../events/notice.module");
const payrollApproval_schema_1 = require("../schemas/payrollApproval.schema");
const payslipApproval_schema_1 = require("../schemas/payslipApproval.schema");
const tax_config_schema_1 = require("../schemas/tax-config.schema");
const payroll_workflow_schema_1 = require("../schemas/payroll-workflow.schema");
const subsidiary_schema_1 = require("../schemas/subsidiary.schema");
const remittance_schema_1 = require("../schemas/remittance.schema");
const remittance_service_1 = require("../services/compensation/remittance.service");
const remittance_controller_1 = require("../controllers/compensation/remittance.controller");
const attendance_schema_1 = require("../schemas/attendance.schema");
const attendanceConfig_schema_1 = require("../schemas/attendanceConfig.schema");
const mail_service_1 = require("../services/comms/mail.service");
const exit_module_1 = require("./exit.module");
const cba_service_1 = require("../services/compensation/cba.service");
const leave_schema_1 = require("../schemas/leave.schema");
const holiday_schema_1 = require("../schemas/holiday.schema");
const disciplinary_case_schema_1 = require("../schemas/disciplinary-case.schema");
const transport_allowance_schema_1 = require("../schemas/transport-allowance.schema");
const transport_allowance_setting_schema_1 = require("../schemas/transport-allowance-setting.schema");
const transport_allowance_controller_1 = require("../controllers/compensation/transport-allowance.controller");
const transport_allowance_service_1 = require("../services/compensation/transport-allowance.service");
const department_schema_1 = require("../schemas/department.schema");
const role_schema_1 = require("../schemas/role.schema");
const user_schema_1 = require("../schemas/user.schema");
const branch_schema_1 = require("../schemas/branch.schema");
const territory_schema_1 = require("../schemas/territory.schema");
const level_schema_1 = require("../schemas/level.schema");
const level_category_schema_1 = require("../schemas/level-category.schema");
const businessunit_schema_1 = require("../schemas/businessunit.schema");
const transport_workflow_schema_1 = require("../schemas/transport-workflow.schema");
const transport_allowance_approval_schema_1 = require("../schemas/transport-allowance-approval.schema");
const inconvenience_allowance_schema_1 = require("../schemas/inconvenience-allowance.schema");
const inconvenience_allowance_setting_schema_1 = require("../schemas/inconvenience-allowance-setting.schema");
const inconvenience_workflow_schema_1 = require("../schemas/inconvenience-workflow.schema");
const inconvenience_allowance_approval_schema_1 = require("../schemas/inconvenience-allowance-approval.schema");
const inconvenience_allowance_controller_1 = require("../controllers/compensation/inconvenience-allowance.controller");
const inconvenience_allowance_service_1 = require("../services/compensation/inconvenience-allowance.service");
const leave_allowance_workflow_schema_1 = require("../schemas/leave-allowance-workflow.schema");
const leave_allowance_approval_schema_1 = require("../schemas/leave-allowance-approval.schema");
const compensation_others_schema_1 = require("../schemas/compensation-others.schema");
const compensation_others_service_1 = require("../services/compensation/compensation-others.service");
const compensation_others_controller_1 = require("../controllers/compensation/compensation-others.controller");
const compensation_config_schema_1 = require("../schemas/compensation-config.schema");
const compensation_config_service_1 = require("../services/compensation/compensation-config.service");
const compensation_config_controller_1 = require("../controllers/compensation/compensation-config.controller");
const workflow_notifier_service_1 = require("../services/comms/workflow-notifier.service");
let PayrollModule = class PayrollModule {
};
exports.PayrollModule = PayrollModule;
exports.PayrollModule = PayrollModule = __decorate([
    (0, common_1.Module)({
        imports: [
            notice_module_1.NoticeGatewayModule,
            exit_module_1.ExitModule,
            mongoose_1.MongooseModule.forFeature([{ name: 'Payroll', schema: payroll_schema_1.PayrollSchema },
                { name: 'PayrollMap', schema: payrollMap_schema_1.PayrollMapSchema },
                { name: 'ProcessedPayroll', schema: processedPayroll_schema_1.ProcessedPayrollSchema },
                { name: payroll_performance_schema_1.PayrollPerformance.name, schema: payroll_performance_schema_1.PayrollPerformanceSchema },
                { name: payrollApproval_schema_1.PayrollApproval.name, schema: payrollApproval_schema_1.PayrollApprovalSchema },
                { name: payslipApproval_schema_1.PayslipApproval.name, schema: payslipApproval_schema_1.PayslipApprovalSchema },
                { name: payroll_workflow_schema_1.PayrollWorkflowConfig.name, schema: payroll_workflow_schema_1.PayrollWorkflowConfigSchema },
                { name: leave_allowance_workflow_schema_1.LeaveAllowanceWorkflowConfig.name, schema: leave_allowance_workflow_schema_1.LeaveAllowanceWorkflowConfigSchema },
                { name: leave_allowance_approval_schema_1.LeaveAllowanceApproval.name, schema: leave_allowance_approval_schema_1.LeaveAllowanceApprovalSchema },
                { name: tax_config_schema_1.TaxConfig.name, schema: tax_config_schema_1.TaxConfigSchema },
                { name: notice_schema_1.Notice.name, schema: notice_schema_1.NoticeSchema },
                { name: subsidiary_schema_1.Subsidiary.name, schema: subsidiary_schema_1.SubsidiarySchema },
                { name: remittance_schema_1.Remittance.name, schema: remittance_schema_1.RemittanceSchema },
                { name: attendance_schema_1.Attendance.name, schema: attendance_schema_1.AttendanceSchema },
                { name: attendanceConfig_schema_1.AttendanceConfig.name, schema: attendanceConfig_schema_1.AttendanceConfigSchema },
                { name: leave_schema_1.Leave.name, schema: leave_schema_1.LeaveSchema },
                { name: holiday_schema_1.Holiday.name, schema: holiday_schema_1.HolidaySchema },
                { name: disciplinary_case_schema_1.DisciplinaryCase.name, schema: disciplinary_case_schema_1.DisciplinaryCaseSchema },
                { name: transport_allowance_schema_1.TransportAllowance.name, schema: transport_allowance_schema_1.TransportAllowanceSchema },
                { name: transport_allowance_setting_schema_1.TransportAllowanceSetting.name, schema: transport_allowance_setting_schema_1.TransportAllowanceSettingSchema },
                { name: transport_workflow_schema_1.TransportWorkflowConfig.name, schema: transport_workflow_schema_1.TransportWorkflowConfigSchema },
                { name: transport_allowance_approval_schema_1.TransportAllowanceApproval.name, schema: transport_allowance_approval_schema_1.TransportAllowanceApprovalSchema },
                { name: inconvenience_allowance_schema_1.InconvenienceAllowance.name, schema: inconvenience_allowance_schema_1.InconvenienceAllowanceSchema },
                { name: inconvenience_allowance_setting_schema_1.InconvenienceAllowanceSetting.name, schema: inconvenience_allowance_setting_schema_1.InconvenienceAllowanceSettingSchema },
                { name: inconvenience_workflow_schema_1.InconvenienceWorkflowConfig.name, schema: inconvenience_workflow_schema_1.InconvenienceWorkflowConfigSchema },
                { name: inconvenience_allowance_approval_schema_1.InconvenienceAllowanceApproval.name, schema: inconvenience_allowance_approval_schema_1.InconvenienceAllowanceApprovalSchema },
                { name: department_schema_1.Department.name, schema: department_schema_1.DepartmentSchema },
                { name: role_schema_1.Role.name, schema: role_schema_1.RoleSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: compensation_others_schema_1.CompensationOthers.name, schema: compensation_others_schema_1.CompensationOthersSchema },
                { name: compensation_config_schema_1.CompensationConfig.name, schema: compensation_config_schema_1.CompensationConfigSchema },
                { name: branch_schema_1.Branch.name, schema: branch_schema_1.BranchSchema },
                { name: territory_schema_1.Territory.name, schema: territory_schema_1.TerritorySchema },
                { name: level_schema_1.Level.name, schema: level_schema_1.LevelSchema },
                { name: level_category_schema_1.LevelCategory.name, schema: level_category_schema_1.LevelCategorySchema },
                { name: businessunit_schema_1.BusinessUnit.name, schema: businessunit_schema_1.BusinessUnitSchema },
            ]),
            auth_module_1.AuthModule,
            user_module_1.StaffModule
        ],
        controllers: [transport_allowance_controller_1.TransportAllowanceController, inconvenience_allowance_controller_1.InconvenienceAllowanceController, remittance_controller_1.RemittanceController, payroll_controller_1.PayrollController, compensation_others_controller_1.CompensationOthersController, compensation_config_controller_1.CompensationConfigController],
        providers: [
            payroll_service_1.PayrollService,
            payroll_tax_service_1.PayrollTaxService,
            payroll_notification_service_1.PayrollNotificationService,
            payroll_mapping_service_1.PayrollMappingService,
            payroll_performance_service_1.PayrollPerformanceService,
            payroll_export_service_1.PayrollExportService,
            payroll_payslip_approval_service_1.PayrollPayslipApprovalService,
            payroll_approval_enrichment_service_1.PayrollApprovalEnrichmentService,
            payroll_workflow_config_service_1.PayrollWorkflowConfigService,
            payroll_approval_transition_service_1.PayrollApprovalTransitionService,
            payroll_processed_persistence_service_1.PayrollProcessedPersistenceService,
            payroll_run_service_1.PayrollRunService,
            payroll_attendance_service_1.PayrollAttendanceService,
            payroll_row_display_service_1.PayrollRowDisplayService,
            payroll_gross_adjustment_service_1.PayrollGrossAdjustmentService,
            payroll_identifier_hydration_service_1.PayrollIdentifierHydrationService,
            payroll_approval_read_service_1.PayrollApprovalReadService,
            payroll_account_switch_service_1.PayrollAccountSwitchService,
            subsidiary_service_1.SubsidiaryService,
            level_service_1.LevelService,
            branch_service_1.BranchService,
            department_service_1.DepartmentService,
            businessUnit_service_1.BusinessUnitService,
            mail_service_1.MailService,
            notice_service_1.NoticeService,
            remittance_service_1.RemittanceService,
            cba_service_1.CbaService,
            transport_allowance_service_1.TransportAllowanceService,
            inconvenience_allowance_service_1.InconvenienceAllowanceService,
            super_admin_guard_1.SuperAdminGuard,
            compensation_others_service_1.CompensationOthersService,
            compensation_config_service_1.CompensationConfigService,
            workflow_notifier_service_1.WorkflowNotifier,
        ],
    })
], PayrollModule);
//# sourceMappingURL=payroll.module.js.map