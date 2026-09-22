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
exports.PerformanceWorkflowConfigSchema = exports.PerformanceWorkflowConfig = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let PerformanceWorkflowConfig = class PerformanceWorkflowConfig extends mongoose_2.Document {
};
exports.PerformanceWorkflowConfig = PerformanceWorkflowConfig;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Subsidiary', required: true, unique: true }),
    __metadata("design:type", mongoose_2.default.Schema.Types.ObjectId)
], PerformanceWorkflowConfig.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: true }),
    __metadata("design:type", Boolean)
], PerformanceWorkflowConfig.prototype, "enabled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: true }),
    __metadata("design:type", Boolean)
], PerformanceWorkflowConfig.prototype, "autoIncludeManager", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], PerformanceWorkflowConfig.prototype, "initiatorIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], PerformanceWorkflowConfig.prototype, "reviewerIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], PerformanceWorkflowConfig.prototype, "approverIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], PerformanceWorkflowConfig.prototype, "hrReviewerIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], PerformanceWorkflowConfig.prototype, "finalApproverIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 40 }),
    __metadata("design:type", Number)
], PerformanceWorkflowConfig.prototype, "employeeScoreWeight", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 60 }),
    __metadata("design:type", Number)
], PerformanceWorkflowConfig.prototype, "reviewerScoreWeight", void 0);
exports.PerformanceWorkflowConfig = PerformanceWorkflowConfig = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PerformanceWorkflowConfig);
exports.PerformanceWorkflowConfigSchema = mongoose_1.SchemaFactory.createForClass(PerformanceWorkflowConfig);
//# sourceMappingURL=performance-workflow.schema.js.map