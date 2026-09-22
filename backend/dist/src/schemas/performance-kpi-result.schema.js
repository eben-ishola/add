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
exports.PerformanceKpiResultSchema = exports.PerformanceKpiResult = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const kpi_schema_1 = require("./kpi.schema");
let PerformanceKpiResult = class PerformanceKpiResult {
};
exports.PerformanceKpiResult = PerformanceKpiResult;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: kpi_schema_1.PerformanceKpi.name, required: true }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], PerformanceKpiResult.prototype, "kpiId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PerformanceKpiResult.prototype, "period", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PerformanceKpiResult.prototype, "scopeKey", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpiResult.prototype, "scopeType", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpiResult.prototype, "scopeId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpiResult.prototype, "scopeName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpiResult.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpiResult.prototype, "employeeName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", String)
], PerformanceKpiResult.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'system' }),
    __metadata("design:type", String)
], PerformanceKpiResult.prototype, "source", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'draft' }),
    __metadata("design:type", String)
], PerformanceKpiResult.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], PerformanceKpiResult.prototype, "achievement", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], PerformanceKpiResult.prototype, "score", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpiResult.prototype, "submittedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], PerformanceKpiResult.prototype, "submittedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpiResult.prototype, "reviewedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpiResult.prototype, "reviewerName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], PerformanceKpiResult.prototype, "reviewedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.Mixed }),
    __metadata("design:type", Object)
], PerformanceKpiResult.prototype, "actualValue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.Mixed }),
    __metadata("design:type", Object)
], PerformanceKpiResult.prototype, "employeeActualValue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.Mixed }),
    __metadata("design:type", Object)
], PerformanceKpiResult.prototype, "reviewerActualValue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], PerformanceKpiResult.prototype, "isActualValueLocked", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpiResult.prototype, "lockedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], PerformanceKpiResult.prototype, "lockedAt", void 0);
exports.PerformanceKpiResult = PerformanceKpiResult = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PerformanceKpiResult);
exports.PerformanceKpiResultSchema = mongoose_1.SchemaFactory.createForClass(PerformanceKpiResult);
exports.PerformanceKpiResultSchema.index({ kpiId: 1, period: 1, scopeKey: 1, source: 1 }, { unique: true });
exports.PerformanceKpiResultSchema.index({ employeeId: 1, source: 1, status: 1 });
exports.PerformanceKpiResultSchema.index({ entity: 1, status: 1, source: 1 });
exports.PerformanceKpiResultSchema.index({ kpiId: 1, source: 1 });
//# sourceMappingURL=performance-kpi-result.schema.js.map