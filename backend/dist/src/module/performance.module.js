"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const performance_controller_1 = require("../controllers/performance/performance.controller");
const performance_kpi_result_controller_1 = require("../controllers/performance/performance-kpi-result.controller");
const performance_review_schema_1 = require("../schemas/performance-review.schema");
const kpi_schema_1 = require("../schemas/kpi.schema");
const performance_kpi_result_schema_1 = require("../schemas/performance-kpi-result.schema");
const performance_workflow_schema_1 = require("../schemas/performance-workflow.schema");
const performance_core_value_schema_1 = require("../schemas/performance-core-value.schema");
const performance_appraisal_cycle_schema_1 = require("../schemas/performance-appraisal-cycle.schema");
const performance_service_1 = require("../services/performance/performance.service");
const performance_core_value_service_1 = require("../services/performance/performance-core-value.service");
const performance_cycle_service_1 = require("../services/performance/performance-cycle.service");
const performance_kpi_snapshot_service_1 = require("../services/performance/performance-kpi-snapshot.service");
const performance_notification_service_1 = require("../services/performance/performance-notification.service");
const performance_review_service_1 = require("../services/performance/performance-review.service");
const performance_scoring_service_1 = require("../services/performance/performance-scoring.service");
const performance_workflow_config_service_1 = require("../services/performance/performance-workflow-config.service");
const performance_kpi_result_service_1 = require("../services/performance/performance-kpi-result.service");
const user_schema_1 = require("../schemas/user.schema");
const notice_schema_1 = require("../schemas/notice.schema");
const notice_service_1 = require("../services/comms/notice.service");
const notice_module_1 = require("../events/notice.module");
const mail_service_1 = require("../services/comms/mail.service");
let PerformanceModule = class PerformanceModule {
};
exports.PerformanceModule = PerformanceModule;
exports.PerformanceModule = PerformanceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            notice_module_1.NoticeGatewayModule,
            mongoose_1.MongooseModule.forFeature([
                { name: performance_review_schema_1.PerformanceReview.name, schema: performance_review_schema_1.PerformanceReviewSchema },
                { name: kpi_schema_1.PerformanceKpi.name, schema: kpi_schema_1.PerformanceKpiSchema },
                { name: performance_kpi_result_schema_1.PerformanceKpiResult.name, schema: performance_kpi_result_schema_1.PerformanceKpiResultSchema },
                { name: performance_workflow_schema_1.PerformanceWorkflowConfig.name, schema: performance_workflow_schema_1.PerformanceWorkflowConfigSchema },
                { name: performance_core_value_schema_1.PerformanceCoreValue.name, schema: performance_core_value_schema_1.PerformanceCoreValueSchema },
                { name: performance_appraisal_cycle_schema_1.PerformanceAppraisalCycle.name, schema: performance_appraisal_cycle_schema_1.PerformanceAppraisalCycleSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: notice_schema_1.Notice.name, schema: notice_schema_1.NoticeSchema },
            ]),
        ],
        controllers: [performance_controller_1.PerformanceController, performance_kpi_result_controller_1.PerformanceKpiResultController],
        providers: [
            performance_service_1.PerformanceService,
            performance_core_value_service_1.PerformanceCoreValueService,
            performance_cycle_service_1.PerformanceCycleService,
            performance_kpi_snapshot_service_1.PerformanceKpiSnapshotService,
            performance_notification_service_1.PerformanceNotificationService,
            performance_review_service_1.PerformanceReviewService,
            performance_scoring_service_1.PerformanceScoringService,
            performance_workflow_config_service_1.PerformanceWorkflowConfigService,
            performance_kpi_result_service_1.PerformanceKpiResultService,
            notice_service_1.NoticeService,
            mail_service_1.MailService,
        ],
        exports: [
            performance_service_1.PerformanceService,
            performance_core_value_service_1.PerformanceCoreValueService,
            performance_cycle_service_1.PerformanceCycleService,
            performance_kpi_snapshot_service_1.PerformanceKpiSnapshotService,
            performance_notification_service_1.PerformanceNotificationService,
            performance_review_service_1.PerformanceReviewService,
            performance_scoring_service_1.PerformanceScoringService,
            performance_workflow_config_service_1.PerformanceWorkflowConfigService,
            performance_kpi_result_service_1.PerformanceKpiResultService,
        ],
    })
], PerformanceModule);
//# sourceMappingURL=performance.module.js.map