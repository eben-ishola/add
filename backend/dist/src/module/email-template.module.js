"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailTemplateModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const email_template_controller_1 = require("../controllers/comms/email-template.controller");
const email_template_service_1 = require("../services/comms/email-template.service");
const email_template_schema_1 = require("../schemas/email-template.schema");
let EmailTemplateModule = class EmailTemplateModule {
};
exports.EmailTemplateModule = EmailTemplateModule;
exports.EmailTemplateModule = EmailTemplateModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: email_template_schema_1.EmailTemplate.name, schema: email_template_schema_1.EmailTemplateSchema },
            ]),
        ],
        controllers: [email_template_controller_1.EmailTemplateController],
        providers: [email_template_service_1.EmailTemplateService],
        exports: [email_template_service_1.EmailTemplateService],
    })
], EmailTemplateModule);
//# sourceMappingURL=email-template.module.js.map