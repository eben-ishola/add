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
exports.PayrollApprovalSchema = exports.PayrollApproval = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let PayrollApproval = class PayrollApproval extends mongoose_2.Document {
};
exports.PayrollApproval = PayrollApproval;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PayrollApproval.prototype, "batchId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PayrollApproval.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: 'payroll', index: true }),
    __metadata("design:type", String)
], PayrollApproval.prototype, "workflowType", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['PENDING_REVIEW', 'PENDING_APPROVAL', 'PENDING_POSTING', 'APPROVED', 'REJECTED'],
        default: 'PENDING_REVIEW',
    }),
    __metadata("design:type", String)
], PayrollApproval.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.SchemaTypes.Mixed, default: [] }),
    __metadata("design:type", Array)
], PayrollApproval.prototype, "data", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], PayrollApproval.prototype, "types", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], PayrollApproval.prototype, "requestedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], PayrollApproval.prototype, "requestedByName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], PayrollApproval.prototype, "initiatorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], PayrollApproval.prototype, "initiatorName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], PayrollApproval.prototype, "initiatorComment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], PayrollApproval.prototype, "reviewerIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], PayrollApproval.prototype, "auditViewerIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], PayrollApproval.prototype, "approverIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], PayrollApproval.prototype, "postingIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.SchemaTypes.ObjectId, ref: 'User' }),
    __metadata("design:type", Object)
], PayrollApproval.prototype, "reviewerApprovedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], PayrollApproval.prototype, "reviewerApprovedByName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], PayrollApproval.prototype, "reviewerApprovedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], PayrollApproval.prototype, "reviewerComment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.SchemaTypes.ObjectId, ref: 'User' }),
    __metadata("design:type", Object)
], PayrollApproval.prototype, "approverApprovedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], PayrollApproval.prototype, "approverApprovedByName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], PayrollApproval.prototype, "approverApprovedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.SchemaTypes.ObjectId, ref: 'User' }),
    __metadata("design:type", Object)
], PayrollApproval.prototype, "postingApprovedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], PayrollApproval.prototype, "postingApprovedByName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], PayrollApproval.prototype, "postingApprovedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], PayrollApproval.prototype, "processedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], PayrollApproval.prototype, "rejectionReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], PayrollApproval.prototype, "financeComment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.SchemaTypes.ObjectId, ref: 'User' }),
    __metadata("design:type", Object)
], PayrollApproval.prototype, "financeCommentBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], PayrollApproval.prototype, "financeCommentByName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], PayrollApproval.prototype, "financeCommentAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], PayrollApproval.prototype, "currentStage", void 0);
exports.PayrollApproval = PayrollApproval = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PayrollApproval);
exports.PayrollApprovalSchema = mongoose_1.SchemaFactory.createForClass(PayrollApproval);
exports.PayrollApprovalSchema.index({ status: 1, entity: 1, createdAt: -1 });
exports.PayrollApprovalSchema.index({ entity: 1, workflowType: 1, status: 1, createdAt: -1 });
exports.PayrollApprovalSchema.index({ batchId: 1 });
exports.PayrollApprovalSchema.index({ reviewerIds: 1, status: 1 });
exports.PayrollApprovalSchema.index({ approverIds: 1, status: 1 });
exports.PayrollApprovalSchema.index({ postingIds: 1, status: 1 });
exports.PayrollApprovalSchema.index({ initiatorId: 1 });
exports.PayrollApprovalSchema.index({ requestedBy: 1 });
exports.PayrollApprovalSchema.index({ auditViewerIds: 1, status: 1 });
//# sourceMappingURL=payrollApproval.schema.js.map