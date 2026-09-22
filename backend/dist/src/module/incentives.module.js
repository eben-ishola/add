"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncentivesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const incentives_controller_1 = require("../controllers/compensation/incentives.controller");
const incentives_service_1 = require("../services/compensation/incentives.service");
const active_saver_schema_1 = require("../schemas/active-saver.schema");
const budget_schema_1 = require("../schemas/budget.schema");
const case_load_schema_1 = require("../schemas/case-load.schema");
const daily_mobilization_schema_1 = require("../schemas/daily-mobilization.schema");
const dmo_target_schema_1 = require("../schemas/dmo-target.schema");
const dmo_incentive_schema_1 = require("../schemas/dmo-incentive.schema");
const product_category_schema_1 = require("../schemas/product-category.schema");
const roIncentive_schema_1 = require("../schemas/roIncentive.schema");
const user_schema_1 = require("../schemas/user.schema");
const visitation_schema_1 = require("../schemas/visitation.schema");
let IncentivesModule = class IncentivesModule {
};
exports.IncentivesModule = IncentivesModule;
exports.IncentivesModule = IncentivesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: user_schema_1.User.name, schema: user_schema_1.UserSchema }]),
            mongoose_1.MongooseModule.forFeature([
                { name: roIncentive_schema_1.ROIncentive.name, schema: roIncentive_schema_1.ROIncentiveSchema },
                { name: dmo_incentive_schema_1.DMOIncentive.name, schema: dmo_incentive_schema_1.DMOIncentiveSchema },
            ], 'incentives'),
            mongoose_1.MongooseModule.forFeature([
                { name: product_category_schema_1.ProductCategory.name, schema: product_category_schema_1.ProductCategorySchema },
                { name: case_load_schema_1.CaseLoad.name, schema: case_load_schema_1.CaseLoadSchema },
                { name: dmo_target_schema_1.DMOTarget.name, schema: dmo_target_schema_1.DMOTargetSchema },
                { name: active_saver_schema_1.ActiveSaver.name, schema: active_saver_schema_1.ActiveSaverSchema },
                { name: visitation_schema_1.Visitation.name, schema: visitation_schema_1.VisitationSchema },
                { name: daily_mobilization_schema_1.DailyMobilization.name, schema: daily_mobilization_schema_1.DailyMobilizationSchema },
                { name: budget_schema_1.Budget.name, schema: budget_schema_1.BudgetSchema },
            ], 'savings'),
        ],
        controllers: [incentives_controller_1.IncentivesController],
        providers: [incentives_service_1.IncentivesService],
    })
], IncentivesModule);
//# sourceMappingURL=incentives.module.js.map