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
exports.PerformanceCoreValueSchema = exports.PerformanceCoreValue = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let PerformanceCoreValue = class PerformanceCoreValue {
};
exports.PerformanceCoreValue = PerformanceCoreValue;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Subsidiary', required: true }),
    __metadata("design:type", mongoose_2.default.Schema.Types.ObjectId)
], PerformanceCoreValue.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PerformanceCoreValue.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], PerformanceCoreValue.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0, min: 0, max: 100 }),
    __metadata("design:type", Number)
], PerformanceCoreValue.prototype, "weight", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], PerformanceCoreValue.prototype, "raters", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: true }),
    __metadata("design:type", Boolean)
], PerformanceCoreValue.prototype, "isActive", void 0);
exports.PerformanceCoreValue = PerformanceCoreValue = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PerformanceCoreValue);
exports.PerformanceCoreValueSchema = mongoose_1.SchemaFactory.createForClass(PerformanceCoreValue);
//# sourceMappingURL=performance-core-value.schema.js.map