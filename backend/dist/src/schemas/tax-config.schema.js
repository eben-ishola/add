"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxConfigSchema = exports.TaxConfig = exports.TaxBracketSchema = exports.TaxBracket = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let TaxBracket = class TaxBracket {
};
exports.TaxBracket = TaxBracket;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], TaxBracket.prototype, "minIncome", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: null }),
    __metadata("design:type", Number)
], TaxBracket.prototype, "maxIncome", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], TaxBracket.prototype, "rate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], TaxBracket.prototype, "baseTax", void 0);
exports.TaxBracket = TaxBracket = __decorate([
    (0, mongoose_1.Schema)()
], TaxBracket);
exports.TaxBracketSchema = mongoose_1.SchemaFactory.createForClass(TaxBracket);
let TaxConfig = class TaxConfig {
};
exports.TaxConfig = TaxConfig;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TaxConfig.prototype, "configName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Entity', required: false }),
    __metadata("design:type", Object)
], TaxConfig.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: true }),
    __metadata("design:type", Boolean)
], TaxConfig.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TaxConfig.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: null }),
    __metadata("design:type", Number)
], TaxConfig.prototype, "exemptLimit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.TaxBracketSchema], default: [] }),
    __metadata("design:type", Array)
], TaxConfig.prototype, "brackets", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Boolean)
], TaxConfig.prototype, "useProgressiveTaxCalculation", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Date)
], TaxConfig.prototype, "effectiveFrom", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Date)
], TaxConfig.prototype, "effectiveTo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Number)
], TaxConfig.prototype, "yearPassed", void 0);
exports.TaxConfig = TaxConfig = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], TaxConfig);
exports.TaxConfigSchema = mongoose_1.SchemaFactory.createForClass(TaxConfig);
//# sourceMappingURL=tax-config.schema.js.map