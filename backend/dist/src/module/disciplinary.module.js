"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisciplinaryModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const disciplinary_controller_1 = require("../controllers/employee-lifecycle/disciplinary.controller");
const disciplinary_service_1 = require("../services/employee-lifecycle/disciplinary.service");
const mail_service_1 = require("../services/comms/mail.service");
const disciplinary_case_schema_1 = require("../schemas/disciplinary-case.schema");
const user_module_1 = require("./user.module");
let DisciplinaryModule = class DisciplinaryModule {
};
exports.DisciplinaryModule = DisciplinaryModule;
exports.DisciplinaryModule = DisciplinaryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: disciplinary_case_schema_1.DisciplinaryCase.name, schema: disciplinary_case_schema_1.DisciplinaryCaseSchema },
            ]),
            user_module_1.StaffModule,
        ],
        controllers: [disciplinary_controller_1.DisciplinaryController],
        providers: [disciplinary_service_1.DisciplinaryService, mail_service_1.MailService],
        exports: [disciplinary_service_1.DisciplinaryService],
    })
], DisciplinaryModule);
//# sourceMappingURL=disciplinary.module.js.map