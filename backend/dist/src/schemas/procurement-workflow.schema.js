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
exports.ProcurementWorkflowConfigSchema = exports.ProcurementWorkflowConfig = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ProcurementWorkflowConfig = class ProcurementWorkflowConfig {
};
exports.ProcurementWorkflowConfig = ProcurementWorkflowConfig;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Subsidiary', required: true }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], ProcurementWorkflowConfig.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User' }], default: [] }),
    __metadata("design:type", Array)
], ProcurementWorkflowConfig.prototype, "reviewerIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Department' }], default: [] }),
    __metadata("design:type", Array)
], ProcurementWorkflowConfig.prototype, "reviewerDepartments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User' }], default: [] }),
    __metadata("design:type", Array)
], ProcurementWorkflowConfig.prototype, "approverPoolIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Department' }], default: [] }),
    __metadata("design:type", Array)
], ProcurementWorkflowConfig.prototype, "approverDepartments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User' }], default: [] }),
    __metadata("design:type", Array)
], ProcurementWorkflowConfig.prototype, "postingIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Department' }], default: [] }),
    __metadata("design:type", Array)
], ProcurementWorkflowConfig.prototype, "postingDepartments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User' }], default: [] }),
    __metadata("design:type", Array)
], ProcurementWorkflowConfig.prototype, "disbursementIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Department' }], default: [] }),
    __metadata("design:type", Array)
], ProcurementWorkflowConfig.prototype, "disbursementDepartments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User' }], default: [] }),
    __metadata("design:type", Array)
], ProcurementWorkflowConfig.prototype, "auditViewerIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 7 }),
    __metadata("design:type", Number)
], ProcurementWorkflowConfig.prototype, "receiptGraceDays", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], ProcurementWorkflowConfig.prototype, "updatedBy", void 0);
exports.ProcurementWorkflowConfig = ProcurementWorkflowConfig = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ProcurementWorkflowConfig);
exports.ProcurementWorkflowConfigSchema = mongoose_1.SchemaFactory.createForClass(ProcurementWorkflowConfig);
exports.ProcurementWorkflowConfigSchema.index({ entity: 1 }, { unique: true });
//# sourceMappingURL=procurement-workflow.schema.js.map