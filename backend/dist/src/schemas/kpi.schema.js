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
exports.PerformanceKpiSchema = exports.PerformanceKpi = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const kpi_category_schema_1 = require("./kpi-category.schema");
let PerformanceKpi = class PerformanceKpi {
};
exports.PerformanceKpi = PerformanceKpi;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "employeeName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "roleId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "roleName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "levelId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "levelName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "departmentId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "departmentName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "businessUnitId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "businessUnitName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "branchId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "branchName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'PerformanceAppraisalCycle', index: true }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], PerformanceKpi.prototype, "appraisalCycleId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "appraisalCycleName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "kpa", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "targetValue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "measurementUnit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: kpi_category_schema_1.KpiCategory.name }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], PerformanceKpi.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "categoryName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], PerformanceKpi.prototype, "startDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], PerformanceKpi.prototype, "endDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], PerformanceKpi.prototype, "weight", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'monthly' }),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "evaluationFrequency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'manual' }),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "collectionSource", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "externalKey", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'ratio' }),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "scoringMethod", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'higher' }),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "scoreDirection", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], PerformanceKpi.prototype, "hasConditions", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                name: { type: String },
                type: { type: String },
                required: { type: Boolean, default: false },
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], PerformanceKpi.prototype, "customFields", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                field: { type: String },
                operator: { type: String },
                value: { type: String },
                outcome: { type: String },
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], PerformanceKpi.prototype, "conditions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'any' }),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "scoredBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.Mixed }),
    __metadata("design:type", Object)
], PerformanceKpi.prototype, "actualValue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], PerformanceKpi.prototype, "isActualValueLocked", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceKpi.prototype, "lockedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], PerformanceKpi.prototype, "lockedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], PerformanceKpi.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], PerformanceKpi.prototype, "updatedAt", void 0);
exports.PerformanceKpi = PerformanceKpi = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PerformanceKpi);
exports.PerformanceKpiSchema = mongoose_1.SchemaFactory.createForClass(PerformanceKpi);
//# sourceMappingURL=kpi.schema.js.map