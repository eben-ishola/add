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
exports.PerformanceReviewSchema = exports.PerformanceReview = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const kpi_schema_1 = require("./kpi.schema");
const performance_core_value_schema_1 = require("./performance-core-value.schema");
const performance_1 = require("../constants/performance");
let PerformanceReview = class PerformanceReview {
};
exports.PerformanceReview = PerformanceReview;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PerformanceReview.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PerformanceReview.prototype, "employeeName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceReview.prototype, "department", void 0);
__decorate([
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", String)
], PerformanceReview.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'PerformanceAppraisalCycle', index: true }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], PerformanceReview.prototype, "appraisalCycleId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceReview.prototype, "appraisalCycleName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceReview.prototype, "position", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PerformanceReview.prototype, "reviewType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PerformanceReview.prototype, "reviewPeriod", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true }),
    __metadata("design:type", Date)
], PerformanceReview.prototype, "reviewDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true }),
    __metadata("design:type", Date)
], PerformanceReview.prototype, "reviewStartDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true }),
    __metadata("design:type", Date)
], PerformanceReview.prototype, "reviewEndDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Pending' }),
    __metadata("design:type", String)
], PerformanceReview.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'supervisor' }),
    __metadata("design:type", String)
], PerformanceReview.prototype, "reviewStage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], PerformanceReview.prototype, "reviewStageUpdatedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: null, min: 0, max: performance_1.RATING_SCALE_MAX }),
    __metadata("design:type", Number)
], PerformanceReview.prototype, "rating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: null, min: 0, max: performance_1.RATING_SCALE_MAX }),
    __metadata("design:type", Number)
], PerformanceReview.prototype, "reviewer2Rating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: null, min: 0, max: performance_1.RATING_SCALE_MAX }),
    __metadata("design:type", Number)
], PerformanceReview.prototype, "employeeScore", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: null, min: 0, max: performance_1.RATING_SCALE_MAX }),
    __metadata("design:type", Number)
], PerformanceReview.prototype, "reviewerScore", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: null, min: 0, max: performance_1.RATING_SCALE_MAX }),
    __metadata("design:type", Number)
], PerformanceReview.prototype, "finalScore", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: null, min: 0, max: performance_1.RATING_SCALE_MAX }),
    __metadata("design:type", Number)
], PerformanceReview.prototype, "okrScore", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: null, min: 0, max: performance_1.RATING_SCALE_MAX }),
    __metadata("design:type", Number)
], PerformanceReview.prototype, "employeeBehaviouralScore", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: null, min: 0, max: performance_1.RATING_SCALE_MAX }),
    __metadata("design:type", Number)
], PerformanceReview.prototype, "reviewerBehaviouralScore", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceReview.prototype, "reviewerId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceReview.prototype, "reviewerName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceReview.prototype, "reviewer2Id", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceReview.prototype, "reviewer2Name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], PerformanceReview.prototype, "hrReviewerIds", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceReview.prototype, "summary", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceReview.prototype, "recommendation", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceReview.prototype, "exceptionalAchievement", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceReview.prototype, "trainingRecommendation", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceReview.prototype, "reviewer2Summary", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceReview.prototype, "reviewer2Recommendation", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceReview.prototype, "reviewerTrainingRecommendation", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PerformanceReview.prototype, "reviewer2TrainingRecommendation", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [mongoose_2.default.Schema.Types.ObjectId], ref: kpi_schema_1.PerformanceKpi.name, default: [] }),
    __metadata("design:type", Array)
], PerformanceReview.prototype, "kpiIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                kpiId: { type: mongoose_2.default.Schema.Types.ObjectId, ref: kpi_schema_1.PerformanceKpi.name },
                title: { type: String },
                description: { type: String },
                targetValue: { type: String },
                actualValue: { type: mongoose_2.default.Schema.Types.Mixed },
                measurementUnit: { type: String },
                weight: { type: Number },
                type: { type: String },
                kpa: { type: String },
                categoryName: { type: String },
                startDate: { type: Date },
                endDate: { type: Date },
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], PerformanceReview.prototype, "kpiSnapshot", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], PerformanceReview.prototype, "kpiSnapshotAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                coreValueId: { type: mongoose_2.default.Schema.Types.ObjectId, ref: performance_core_value_schema_1.PerformanceCoreValue.name },
                title: { type: String },
                description: { type: String },
                weight: { type: Number },
                rating: { type: Number, min: 0, max: performance_1.RATING_SCALE_MAX },
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], PerformanceReview.prototype, "coreValueRatings", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], PerformanceReview.prototype, "coreValueSnapshotAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                coreValueId: { type: mongoose_2.default.Schema.Types.ObjectId, ref: performance_core_value_schema_1.PerformanceCoreValue.name },
                title: { type: String },
                description: { type: String },
                weight: { type: Number },
                rating: { type: Number, min: 0, max: performance_1.RATING_SCALE_MAX },
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], PerformanceReview.prototype, "reviewerCoreValueRatings", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], PerformanceReview.prototype, "reviewerCoreValueSnapshotAt", void 0);
exports.PerformanceReview = PerformanceReview = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PerformanceReview);
exports.PerformanceReviewSchema = mongoose_1.SchemaFactory.createForClass(PerformanceReview);
exports.PerformanceReviewSchema.index({ employeeId: 1, appraisalCycleId: 1 });
exports.PerformanceReviewSchema.index({ reviewerId: 1, status: 1, reviewStage: 1 });
exports.PerformanceReviewSchema.index({ reviewer2Id: 1, status: 1, reviewStage: 1 });
exports.PerformanceReviewSchema.index({ hrReviewerIds: 1, status: 1, reviewStage: 1 });
exports.PerformanceReviewSchema.index({ entity: 1, status: 1, appraisalCycleId: 1 });
exports.PerformanceReviewSchema.index({ reviewDate: -1 });
//# sourceMappingURL=performance-review.schema.js.map