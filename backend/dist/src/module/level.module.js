"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LevelModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const level_service_1 = require("../services/org/level.service");
const level_schema_1 = require("../schemas/level.schema");
const level_category_schema_1 = require("../schemas/level-category.schema");
const level_controller_1 = require("../controllers/org/level.controller");
const auth_module_1 = require("../auth/auth.module");
const notice_schema_1 = require("../schemas/notice.schema");
const notice_service_1 = require("../services/comms/notice.service");
const notice_module_1 = require("../events/notice.module");
let LevelModule = class LevelModule {
};
exports.LevelModule = LevelModule;
exports.LevelModule = LevelModule = __decorate([
    (0, common_1.Module)({
        imports: [
            notice_module_1.NoticeGatewayModule,
            mongoose_1.MongooseModule.forFeature([
                { name: level_schema_1.Level.name, schema: level_schema_1.LevelSchema },
                { name: level_category_schema_1.LevelCategory.name, schema: level_category_schema_1.LevelCategorySchema },
                { name: notice_schema_1.Notice.name, schema: notice_schema_1.NoticeSchema }
            ]),
            auth_module_1.AuthModule,
        ],
        providers: [level_service_1.LevelService, notice_service_1.NoticeService],
        exports: [level_service_1.LevelService, mongoose_1.MongooseModule],
        controllers: [level_controller_1.LevelController],
    })
], LevelModule);
//# sourceMappingURL=level.module.js.map