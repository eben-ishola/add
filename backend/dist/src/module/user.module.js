"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const user_service_1 = require("../services/user/user.service");
const user_credential_service_1 = require("../services/user/user-credential.service");
const user_directory_service_1 = require("../services/user/user-directory.service");
const user_import_service_1 = require("../services/user/user-import.service");
const user_milestone_service_1 = require("../services/user/user-milestone.service");
const user_onboarding_service_1 = require("../services/user/user-onboarding.service");
const user_supervisor_service_1 = require("../services/user/user-supervisor.service");
const user_exit_cleanup_service_1 = require("../services/user/user-exit-cleanup.service");
const user_controller_1 = require("../controllers/user/user.controller");
const user_schema_1 = require("../schemas/user.schema");
const level_service_1 = require("../services/org/level.service");
const level_schema_1 = require("../schemas/level.schema");
const level_category_schema_1 = require("../schemas/level-category.schema");
const branch_schema_1 = require("../schemas/branch.schema");
const subsidiary_schema_1 = require("../schemas/subsidiary.schema");
const subsidiary_service_1 = require("../services/org/subsidiary.service");
const branch_service_1 = require("../services/org/branch.service");
const auth_module_1 = require("../auth/auth.module");
const department_schema_1 = require("../schemas/department.schema");
const businessunit_schema_1 = require("../schemas/businessunit.schema");
const department_service_1 = require("../services/org/department.service");
const businessUnit_service_1 = require("../services/org/businessUnit.service");
const role_schema_1 = require("../schemas/role.schema");
const subsidiary_module_1 = require("./subsidiary.module");
const permission_schema_1 = require("../schemas/permission.schema");
const territory_schema_1 = require("../schemas/territory.schema");
const mail_service_1 = require("../services/comms/mail.service");
const notice_schema_1 = require("../schemas/notice.schema");
const notice_service_1 = require("../services/comms/notice.service");
const notice_module_1 = require("../events/notice.module");
const document_library_schema_1 = require("../schemas/document-library.schema");
const smtp_config_module_1 = require("./smtp-config.module");
const exit_module_1 = require("./exit.module");
let StaffModule = class StaffModule {
};
exports.StaffModule = StaffModule;
exports.StaffModule = StaffModule = __decorate([
    (0, common_1.Module)({
        imports: [
            notice_module_1.NoticeGatewayModule,
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: subsidiary_schema_1.Subsidiary.name, schema: subsidiary_schema_1.SubsidiarySchema },
                { name: department_schema_1.Department.name, schema: department_schema_1.DepartmentSchema },
                { name: businessunit_schema_1.BusinessUnit.name, schema: businessunit_schema_1.BusinessUnitSchema },
                { name: branch_schema_1.Branch.name, schema: branch_schema_1.BranchSchema },
                { name: level_schema_1.Level.name, schema: level_schema_1.LevelSchema },
                { name: level_category_schema_1.LevelCategory.name, schema: level_category_schema_1.LevelCategorySchema },
                { name: role_schema_1.Role.name, schema: role_schema_1.RoleSchema },
                { name: permission_schema_1.Permission.name, schema: permission_schema_1.PermissionSchema },
                { name: territory_schema_1.Territory.name, schema: territory_schema_1.TerritorySchema },
                { name: notice_schema_1.Notice.name, schema: notice_schema_1.NoticeSchema },
                { name: document_library_schema_1.DocumentLibrary.name, schema: document_library_schema_1.DocumentLibrarySchema },
            ]),
            auth_module_1.AuthModule,
            subsidiary_module_1.SubsidiaryModule,
            smtp_config_module_1.SmtpConfigModule,
            exit_module_1.ExitModule,
        ],
        providers: [
            user_service_1.StaffService,
            user_credential_service_1.UserCredentialService,
            user_directory_service_1.UserDirectoryService,
            user_import_service_1.UserImportService,
            user_milestone_service_1.UserMilestoneService,
            user_onboarding_service_1.UserOnboardingService,
            user_supervisor_service_1.UserSupervisorService,
            user_exit_cleanup_service_1.UserExitCleanupService,
            level_service_1.LevelService,
            branch_service_1.BranchService,
            subsidiary_service_1.SubsidiaryService,
            department_service_1.DepartmentService,
            businessUnit_service_1.BusinessUnitService,
            mail_service_1.MailService,
            notice_service_1.NoticeService,
        ],
        exports: [user_service_1.StaffService, user_directory_service_1.UserDirectoryService],
        controllers: [user_controller_1.StaffController],
    })
], StaffModule);
//# sourceMappingURL=user.module.js.map