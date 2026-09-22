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
exports.PayrollPerformanceSchema = exports.PayrollPerformance = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let PayrollPerformance = class PayrollPerformance extends mongoose_2.Document {
};
exports.PayrollPerformance = PayrollPerformance;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], PayrollPerformance.prototype, "staffId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PayrollPerformance.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PayrollPerformance.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, lowercase: true, trim: true }),
    __metadata("design:type", String)
], PayrollPerformance.prototype, "periodKey", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PayrollPerformance.prototype, "periodLabel", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], PayrollPerformance.prototype, "periodDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], PayrollPerformance.prototype, "score", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PayrollPerformance.prototype, "entity", void 0);
exports.PayrollPerformance = PayrollPerformance = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PayrollPerformance);
exports.PayrollPerformanceSchema = mongoose_1.SchemaFactory.createForClass(PayrollPerformance);
exports.PayrollPerformanceSchema.index({ staffId: 1, periodKey: 1, entity: 1 }, { unique: true });
//# sourceMappingURL=payroll-performance.schema.js.map