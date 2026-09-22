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
exports.LeaveAllowanceApprovalSchema = exports.LeaveAllowanceApproval = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let LeaveAllowanceApproval = class LeaveAllowanceApproval extends mongoose_2.Document {
};
exports.LeaveAllowanceApproval = LeaveAllowanceApproval;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true }),
    __metadata("design:type", String)
], LeaveAllowanceApproval.prototype, "payrollApprovalId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LeaveAllowanceApproval.prototype, "batchId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LeaveAllowanceApproval.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['PENDING_REVIEW', 'PENDING_APPROVAL', 'PENDING_POSTING', 'APPROVED', 'REJECTED'],
        default: 'PENDING_REVIEW',
    }),
    __metadata("design:type", String)
], LeaveAllowanceApproval.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.SchemaTypes.Mixed, default: [] }),
    __metadata("design:type", Array)
], LeaveAllowanceApproval.prototype, "data", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], LeaveAllowanceApproval.prototype, "types", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], LeaveAllowanceApproval.prototype, "year", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], LeaveAllowanceApproval.prototype, "month", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], LeaveAllowanceApproval.prototype, "requestedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], LeaveAllowanceApproval.prototype, "requestedByName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], LeaveAllowanceApproval.prototype, "initiatorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], LeaveAllowanceApproval.prototype, "initiatorName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], LeaveAllowanceApproval.prototype, "initiatorComment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], LeaveAllowanceApproval.prototype, "reviewerIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], LeaveAllowanceApproval.prototype, "auditViewerIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], LeaveAllowanceApproval.prototype, "approverIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], LeaveAllowanceApproval.prototype, "postingIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.SchemaTypes.ObjectId, ref: 'User' }),
    __metadata("design:type", Object)
], LeaveAllowanceApproval.prototype, "reviewerApprovedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], LeaveAllowanceApproval.prototype, "reviewerApprovedByName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], LeaveAllowanceApproval.prototype, "reviewerApprovedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], LeaveAllowanceApproval.prototype, "reviewerComment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.SchemaTypes.ObjectId, ref: 'User' }),
    __metadata("design:type", Object)
], LeaveAllowanceApproval.prototype, "approverApprovedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], LeaveAllowanceApproval.prototype, "approverApprovedByName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], LeaveAllowanceApproval.prototype, "approverApprovedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.SchemaTypes.ObjectId, ref: 'User' }),
    __metadata("design:type", Object)
], LeaveAllowanceApproval.prototype, "postingApprovedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], LeaveAllowanceApproval.prototype, "postingApprovedByName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], LeaveAllowanceApproval.prototype, "postingApprovedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], LeaveAllowanceApproval.prototype, "processedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], LeaveAllowanceApproval.prototype, "rejectionReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], LeaveAllowanceApproval.prototype, "financeComment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.SchemaTypes.ObjectId, ref: 'User' }),
    __metadata("design:type", Object)
], LeaveAllowanceApproval.prototype, "financeCommentBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], LeaveAllowanceApproval.prototype, "financeCommentByName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], LeaveAllowanceApproval.prototype, "financeCommentAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], LeaveAllowanceApproval.prototype, "currentStage", void 0);
exports.LeaveAllowanceApproval = LeaveAllowanceApproval = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], LeaveAllowanceApproval);
exports.LeaveAllowanceApprovalSchema = mongoose_1.SchemaFactory.createForClass(LeaveAllowanceApproval);
exports.LeaveAllowanceApprovalSchema.index({ status: 1, entity: 1, year: -1, month: -1 });
exports.LeaveAllowanceApprovalSchema.index({ entity: 1, status: 1, createdAt: -1 });
exports.LeaveAllowanceApprovalSchema.index({ batchId: 1 });
exports.LeaveAllowanceApprovalSchema.index({ reviewerIds: 1, status: 1 });
exports.LeaveAllowanceApprovalSchema.index({ approverIds: 1, status: 1 });
exports.LeaveAllowanceApprovalSchema.index({ postingIds: 1, status: 1 });
exports.LeaveAllowanceApprovalSchema.index({ initiatorId: 1 });
exports.LeaveAllowanceApprovalSchema.index({ requestedBy: 1 });
exports.LeaveAllowanceApprovalSchema.index({ auditViewerIds: 1, status: 1 });
//# sourceMappingURL=leave-allowance-approval.schema.js.map