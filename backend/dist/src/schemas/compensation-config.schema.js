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
exports.CompensationConfigSchema = exports.CompensationConfig = exports.COMPENSATION_COMBINATION_COMPONENTS = exports.COMPENSATION_PERCENT_BASES = exports.COMPENSATION_PAY_TYPES = exports.COMPENSATION_VALUE_TYPES = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
exports.COMPENSATION_VALUE_TYPES = ['global', 'others'];
exports.COMPENSATION_PAY_TYPES = [
    'reimbursable',
    'individual_performance',
    'bank_performance',
    'salary',
    'percentage',
];
exports.COMPENSATION_PERCENT_BASES = [
    'basic',
    'transport',
    'housing',
    'combination',
    'gross',
    'net',
];
exports.COMPENSATION_COMBINATION_COMPONENTS = [
    'basic',
    'transport',
    'housing',
];
let CompensationConfig = class CompensationConfig extends mongoose_2.Document {
};
exports.CompensationConfig = CompensationConfig;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Subsidiary', required: true }),
    __metadata("design:type", mongoose_2.default.Schema.Types.ObjectId)
], CompensationConfig.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, trim: true }),
    __metadata("design:type", String)
], CompensationConfig.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true, default: '' }),
    __metadata("design:type", String)
], CompensationConfig.prototype, "glCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: exports.COMPENSATION_VALUE_TYPES, required: true }),
    __metadata("design:type", String)
], CompensationConfig.prototype, "valueType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], CompensationConfig.prototype, "globalAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: exports.COMPENSATION_PAY_TYPES, default: null }),
    __metadata("design:type", String)
], CompensationConfig.prototype, "payType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], CompensationConfig.prototype, "percent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: exports.COMPENSATION_PERCENT_BASES, default: null }),
    __metadata("design:type", String)
], CompensationConfig.prototype, "percentBase", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], CompensationConfig.prototype, "combinationComponents", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], CompensationConfig.prototype, "reviewerIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], CompensationConfig.prototype, "approverIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], CompensationConfig.prototype, "auditViewerIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], CompensationConfig.prototype, "postingIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], CompensationConfig.prototype, "financeIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: true }),
    __metadata("design:type", Boolean)
], CompensationConfig.prototype, "active", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], CompensationConfig.prototype, "createdBy", void 0);
exports.CompensationConfig = CompensationConfig = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], CompensationConfig);
exports.CompensationConfigSchema = mongoose_1.SchemaFactory.createForClass(CompensationConfig);
exports.CompensationConfigSchema.index({ entity: 1, title: 1 }, { unique: true });
//# sourceMappingURL=compensation-config.schema.js.map