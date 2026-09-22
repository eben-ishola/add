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
exports.NudgeOutstandingPerformanceReviewsDto = exports.NudgePerformanceReviewsDto = exports.UpdatePerformanceReviewDto = exports.CreatePerformanceReviewDto = exports.PerformanceCoreValueRatingDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class PerformanceCoreValueRatingDto {
}
exports.PerformanceCoreValueRatingDto = PerformanceCoreValueRatingDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceCoreValueRatingDto.prototype, "coreValueId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceCoreValueRatingDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceCoreValueRatingDto.prototype, "_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceCoreValueRatingDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceCoreValueRatingDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], PerformanceCoreValueRatingDto.prototype, "weight", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], PerformanceCoreValueRatingDto.prototype, "rating", void 0);
class PerformanceReviewCommonDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceReviewCommonDto.prototype, "employeeName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceReviewCommonDto.prototype, "department", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceReviewCommonDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], PerformanceReviewCommonDto.prototype, "reviewDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceReviewCommonDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], PerformanceReviewCommonDto.prototype, "rating", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceReviewCommonDto.prototype, "reviewerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceReviewCommonDto.prototype, "reviewerName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceReviewCommonDto.prototype, "reviewer2Id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceReviewCommonDto.prototype, "reviewer2Name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceReviewCommonDto.prototype, "summary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceReviewCommonDto.prototype, "recommendation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceReviewCommonDto.prototype, "exceptionalAchievement", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceReviewCommonDto.prototype, "trainingRecommendation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceReviewCommonDto.prototype, "reviewer2Summary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceReviewCommonDto.prototype, "reviewer2Recommendation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], PerformanceReviewCommonDto.prototype, "reviewer2Rating", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PerformanceCoreValueRatingDto),
    __metadata("design:type", Array)
], PerformanceReviewCommonDto.prototype, "coreValueRatings", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PerformanceCoreValueRatingDto),
    __metadata("design:type", Array)
], PerformanceReviewCommonDto.prototype, "reviewerCoreValueRatings", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceReviewCommonDto.prototype, "appraisalCycleId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PerformanceReviewCommonDto.prototype, "appraisalCycleName", void 0);
class CreatePerformanceReviewDto extends PerformanceReviewCommonDto {
}
exports.CreatePerformanceReviewDto = CreatePerformanceReviewDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePerformanceReviewDto.prototype, "employeeId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePerformanceReviewDto.prototype, "reviewType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePerformanceReviewDto.prototype, "reviewPeriod", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], CreatePerformanceReviewDto.prototype, "reviewStartDate", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], CreatePerformanceReviewDto.prototype, "reviewEndDate", void 0);
class UpdatePerformanceReviewDto extends PerformanceReviewCommonDto {
}
exports.UpdatePerformanceReviewDto = UpdatePerformanceReviewDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePerformanceReviewDto.prototype, "employeeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePerformanceReviewDto.prototype, "reviewType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePerformanceReviewDto.prototype, "reviewPeriod", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdatePerformanceReviewDto.prototype, "reviewStartDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdatePerformanceReviewDto.prototype, "reviewEndDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePerformanceReviewDto.prototype, "reviewStage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdatePerformanceReviewDto.prototype, "reviewStageUpdatedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdatePerformanceReviewDto.prototype, "employeeScore", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdatePerformanceReviewDto.prototype, "reviewerScore", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdatePerformanceReviewDto.prototype, "finalScore", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePerformanceReviewDto.prototype, "resetStaffScores", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePerformanceReviewDto.prototype, "resetAllScores", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePerformanceReviewDto.prototype, "resetIndividualScores", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePerformanceReviewDto.prototype, "draft", void 0);
class NudgePerformanceReviewsDto {
}
exports.NudgePerformanceReviewsDto = NudgePerformanceReviewsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NudgePerformanceReviewsDto.prototype, "entity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NudgePerformanceReviewsDto.prototype, "appraisalCycleId", void 0);
class NudgeOutstandingPerformanceReviewsDto {
}
exports.NudgeOutstandingPerformanceReviewsDto = NudgeOutstandingPerformanceReviewsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NudgeOutstandingPerformanceReviewsDto.prototype, "entity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NudgeOutstandingPerformanceReviewsDto.prototype, "cycleId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NudgeOutstandingPerformanceReviewsDto.prototype, "dryRun", void 0);
//# sourceMappingURL=performance-review.dto.js.map