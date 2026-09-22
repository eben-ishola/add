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
exports.TransportAllowanceSchema = exports.TransportAllowance = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let TransportAllowance = class TransportAllowance {
};
exports.TransportAllowance = TransportAllowance;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Subsidiary', required: true }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], TransportAllowance.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Department', required: true }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], TransportAllowance.prototype, "department", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], TransportAllowance.prototype, "staff", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], TransportAllowance.prototype, "staffId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], TransportAllowance.prototype, "staffName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], TransportAllowance.prototype, "addosserAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], TransportAllowance.prototype, "year", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], TransportAllowance.prototype, "month", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], TransportAllowance.prototype, "weekOfMonth", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 5 }),
    __metadata("design:type", Number)
], TransportAllowance.prototype, "baseDays", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 5 }),
    __metadata("design:type", Number)
], TransportAllowance.prototype, "days", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], TransportAllowance.prototype, "baseAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], TransportAllowance.prototype, "proratedAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Branch' }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], TransportAllowance.prototype, "branch", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], TransportAllowance.prototype, "branchName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], TransportAllowance.prototype, "branchGL", void 0);
exports.TransportAllowance = TransportAllowance = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], TransportAllowance);
exports.TransportAllowanceSchema = mongoose_1.SchemaFactory.createForClass(TransportAllowance);
exports.TransportAllowanceSchema.index({ entity: 1, department: 1, staff: 1, year: 1, month: 1, weekOfMonth: 1 }, { unique: true });
//# sourceMappingURL=transport-allowance.schema.js.map