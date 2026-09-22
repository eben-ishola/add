"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubsidiaryModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const subsidiary_service_1 = require("../services/org/subsidiary.service");
const subsidiary_schema_1 = require("../schemas/subsidiary.schema");
const branch_service_1 = require("../services/org/branch.service");
const branch_schema_1 = require("../schemas/branch.schema");
const auth_module_1 = require("../auth/auth.module");
const notice_schema_1 = require("../schemas/notice.schema");
const notice_service_1 = require("../services/comms/notice.service");
const notice_module_1 = require("../events/notice.module");
const territory_schema_1 = require("../schemas/territory.schema");
const subsidiary_controller_1 = require("../controllers/org/subsidiary.controller");
let SubsidiaryModule = class SubsidiaryModule {
};
exports.SubsidiaryModule = SubsidiaryModule;
exports.SubsidiaryModule = SubsidiaryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            notice_module_1.NoticeGatewayModule,
            mongoose_1.MongooseModule.forFeature([{ name: subsidiary_schema_1.Subsidiary.name, schema: subsidiary_schema_1.SubsidiarySchema },
                { name: branch_schema_1.Branch.name, schema: branch_schema_1.BranchSchema },
                { name: territory_schema_1.Territory.name, schema: territory_schema_1.TerritorySchema },
                { name: notice_schema_1.Notice.name, schema: notice_schema_1.NoticeSchema }]),
            auth_module_1.AuthModule
        ],
        controllers: [subsidiary_controller_1.SubsidiaryController],
        providers: [subsidiary_service_1.SubsidiaryService, branch_service_1.BranchService, notice_service_1.NoticeService],
        exports: [subsidiary_service_1.SubsidiaryService],
    })
], SubsidiaryModule);
//# sourceMappingURL=subsidiary.module.js.map