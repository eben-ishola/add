"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const mongoose_1 = require("@nestjs/mongoose");
const auth_module_1 = require("../auth/auth.module");
const audit_log_controller_1 = require("../controllers/system/audit-log.controller");
const audit_log_interceptor_1 = require("../interceptors/audit-log.interceptor");
const audit_log_schema_1 = require("../schemas/audit-log.schema");
const attendance_schema_1 = require("../schemas/attendance.schema");
const branch_schema_1 = require("../schemas/branch.schema");
const businessunit_schema_1 = require("../schemas/businessunit.schema");
const department_schema_1 = require("../schemas/department.schema");
const level_schema_1 = require("../schemas/level.schema");
const payroll_schema_1 = require("../schemas/payroll.schema");
const payrollMap_schema_1 = require("../schemas/payrollMap.schema");
const payroll_workflow_schema_1 = require("../schemas/payroll-workflow.schema");
const permission_schema_1 = require("../schemas/permission.schema");
const role_schema_1 = require("../schemas/role.schema");
const subsidiary_schema_1 = require("../schemas/subsidiary.schema");
const tax_config_schema_1 = require("../schemas/tax-config.schema");
const territory_schema_1 = require("../schemas/territory.schema");
const user_schema_1 = require("../schemas/user.schema");
const audit_log_service_1 = require("../services/system/audit-log.service");
let AuditLogModule = class AuditLogModule {
};
exports.AuditLogModule = AuditLogModule;
exports.AuditLogModule = AuditLogModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: audit_log_schema_1.AuditLog.name, schema: audit_log_schema_1.AuditLogSchema },
                { name: attendance_schema_1.Attendance.name, schema: attendance_schema_1.AttendanceSchema },
                { name: payroll_schema_1.Payroll.name, schema: payroll_schema_1.PayrollSchema },
                { name: payrollMap_schema_1.PayrollMap.name, schema: payrollMap_schema_1.PayrollMapSchema },
                { name: payroll_workflow_schema_1.PayrollWorkflowConfig.name, schema: payroll_workflow_schema_1.PayrollWorkflowConfigSchema },
                { name: tax_config_schema_1.TaxConfig.name, schema: tax_config_schema_1.TaxConfigSchema },
                { name: subsidiary_schema_1.Subsidiary.name, schema: subsidiary_schema_1.SubsidiarySchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: subsidiary_schema_1.Subsidiary.name, schema: subsidiary_schema_1.SubsidiarySchema },
                { name: department_schema_1.Department.name, schema: department_schema_1.DepartmentSchema },
                { name: role_schema_1.Role.name, schema: role_schema_1.RoleSchema },
                { name: permission_schema_1.Permission.name, schema: permission_schema_1.PermissionSchema },
                { name: branch_schema_1.Branch.name, schema: branch_schema_1.BranchSchema },
                { name: businessunit_schema_1.BusinessUnit.name, schema: businessunit_schema_1.BusinessUnitSchema },
                { name: level_schema_1.Level.name, schema: level_schema_1.LevelSchema },
                { name: territory_schema_1.Territory.name, schema: territory_schema_1.TerritorySchema },
            ]),
            auth_module_1.AuthModule,
        ],
        controllers: [audit_log_controller_1.AuditLogController],
        providers: [
            audit_log_service_1.AuditLogService,
            audit_log_interceptor_1.AuditLogInterceptor,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: audit_log_interceptor_1.AuditLogInterceptor,
            },
        ],
        exports: [audit_log_service_1.AuditLogService],
    })
], AuditLogModule);
//# sourceMappingURL=audit-log.module.js.map