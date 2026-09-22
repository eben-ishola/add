"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyConfigModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const api_key_config_controller_1 = require("../controllers/system/api-key-config.controller");
const it_admin_guard_1 = require("../auth/guards/it-admin.guard");
const api_key_config_service_1 = require("../services/system/api-key-config.service");
const api_key_config_schema_1 = require("../schemas/api-key-config.schema");
let ApiKeyConfigModule = class ApiKeyConfigModule {
};
exports.ApiKeyConfigModule = ApiKeyConfigModule;
exports.ApiKeyConfigModule = ApiKeyConfigModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: api_key_config_schema_1.ApiKeyConfig.name, schema: api_key_config_schema_1.ApiKeyConfigSchema },
            ]),
        ],
        controllers: [api_key_config_controller_1.ApiKeyConfigController],
        providers: [api_key_config_service_1.ApiKeyConfigService, it_admin_guard_1.ItAdminGuard],
        exports: [api_key_config_service_1.ApiKeyConfigService],
    })
], ApiKeyConfigModule);
//# sourceMappingURL=api-key-config.module.js.map