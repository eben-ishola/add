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
exports.PayrollMapSchema = exports.PayrollMap = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let PayrollMap = class PayrollMap extends mongoose_2.Document {
};
exports.PayrollMap = PayrollMap;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PayrollMap.prototype, "level", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], PayrollMap.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], PayrollMap.prototype, "afta", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PayrollMap.prototype, "entity", void 0);
exports.PayrollMap = PayrollMap = __decorate([
    (0, mongoose_1.Schema)()
], PayrollMap);
exports.PayrollMapSchema = mongoose_1.SchemaFactory.createForClass(PayrollMap);
exports.PayrollMapSchema.index({ entity: 1, level: 1 });
//# sourceMappingURL=payrollMap.schema.js.map