"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceSurveyModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const service_survey_controller_1 = require("../controllers/service-desk/service-survey.controller");
const service_survey_schema_1 = require("../schemas/service-survey.schema");
const service_survey_service_1 = require("../services/service-desk/service-survey.service");
const user_module_1 = require("./user.module");
let ServiceSurveyModule = class ServiceSurveyModule {
};
exports.ServiceSurveyModule = ServiceSurveyModule;
exports.ServiceSurveyModule = ServiceSurveyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: service_survey_schema_1.ServiceSurvey.name, schema: service_survey_schema_1.ServiceSurveySchema },
            ]),
            user_module_1.StaffModule,
        ],
        controllers: [service_survey_controller_1.ServiceSurveyController],
        providers: [service_survey_service_1.ServiceSurveyService],
        exports: [service_survey_service_1.ServiceSurveyService],
    })
], ServiceSurveyModule);
//# sourceMappingURL=service-survey.module.js.map