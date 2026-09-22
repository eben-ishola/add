"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppAccessModule = void 0;
const common_1 = require("@nestjs/common");
const it_staff_guard_1 = require("../auth/guards/it-staff.guard");
const mongoose_1 = require("@nestjs/mongoose");
const app_access_controller_1 = require("../controllers/auth-access/app-access.controller");
const app_access_service_1 = require("../services/auth-access/app-access.service");
const app_catalog_schema_1 = require("../schemas/app-catalog.schema");
const user_schema_1 = require("../schemas/user.schema");
const subsidiary_schema_1 = require("../schemas/subsidiary.schema");
let AppAccessModule = class AppAccessModule {
};
exports.AppAccessModule = AppAccessModule;
exports.AppAccessModule = AppAccessModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: app_catalog_schema_1.AppCatalog.name, schema: app_catalog_schema_1.AppCatalogSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: subsidiary_schema_1.Subsidiary.name, schema: subsidiary_schema_1.SubsidiarySchema },
            ]),
        ],
        controllers: [app_access_controller_1.AppAccessController],
        providers: [
            it_staff_guard_1.ItStaffGuard, app_access_service_1.AppAccessService
        ],
        exports: [app_access_service_1.AppAccessService],
    })
], AppAccessModule);
//# sourceMappingURL=app-access.module.js.map