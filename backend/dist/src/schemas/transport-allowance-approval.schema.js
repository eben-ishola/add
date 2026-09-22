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
exports.TransportAllowanceApprovalSchema = exports.TransportAllowanceApproval = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let TransportAllowanceApproval = class TransportAllowanceApproval extends mongoose_2.Document {
};
exports.TransportAllowanceApproval = TransportAllowanceApproval;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Subsidiary', required: true }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], TransportAllowanceApproval.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Department', required: false }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], TransportAllowanceApproval.prototype, "department", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], TransportAllowanceApproval.prototype, "year", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], TransportAllowanceApproval.prototype, "month", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], TransportAllowanceApproval.prototype, "weekOfMonth", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['weekly', 'monthly'], default: 'weekly' }),
    __metadata("design:type", String)
], TransportAllowanceApproval.prototype, "frequency", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['PENDING_REVIEW', 'PENDING_APPROVAL', 'PENDING_POSTING', 'APPROVED', 'REJECTED'],
        default: 'PENDING_REVIEW',
    }),
    __metadata("design:type", String)
], TransportAllowanceApproval.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['REVIEWER', 'APPROVER', 'POSTING', 'POSTED'], default: 'REVIEWER' }),
    __metadata("design:type", String)
], TransportAllowanceApproval.prototype, "currentStage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.SchemaTypes.Mixed, default: [] }),
    __metadata("design:type", Array)
], TransportAllowanceApproval.prototype, "data", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], TransportAllowanceApproval.prototype, "requestedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], TransportAllowanceApproval.prototype, "requestedByName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], TransportAllowanceApproval.prototype, "initiatorComment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], TransportAllowanceApproval.prototype, "reviewerIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], TransportAllowanceApproval.prototype, "auditViewerIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], TransportAllowanceApproval.prototype, "approverIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], TransportAllowanceApproval.prototype, "postingIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], TransportAllowanceApproval.prototype, "reviewerApprovedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], TransportAllowanceApproval.prototype, "reviewerApprovedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], TransportAllowanceApproval.prototype, "reviewerApprovedByName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], TransportAllowanceApproval.prototype, "approverApprovedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], TransportAllowanceApproval.prototype, "approverApprovedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], TransportAllowanceApproval.prototype, "approverApprovedByName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], TransportAllowanceApproval.prototype, "postingApprovedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], TransportAllowanceApproval.prototype, "postingApprovedByName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], TransportAllowanceApproval.prototype, "postingApprovedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], TransportAllowanceApproval.prototype, "rejectionReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], TransportAllowanceApproval.prototype, "financeComment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], TransportAllowanceApproval.prototype, "financeCommentBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], TransportAllowanceApproval.prototype, "financeCommentByName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], TransportAllowanceApproval.prototype, "financeCommentAt", void 0);
exports.TransportAllowanceApproval = TransportAllowanceApproval = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], TransportAllowanceApproval);
exports.TransportAllowanceApprovalSchema = mongoose_1.SchemaFactory.createForClass(TransportAllowanceApproval);
exports.TransportAllowanceApprovalSchema.index({
    entity: 1,
    department: 1,
    year: 1,
    month: 1,
    weekOfMonth: 1,
    frequency: 1,
    status: 1,
});
exports.TransportAllowanceApprovalSchema.index({
    entity: 1,
    year: 1,
    month: 1,
    weekOfMonth: 1,
    frequency: 1,
    status: 1,
});
exports.TransportAllowanceApprovalSchema.index({ status: 1, createdAt: -1 });
exports.TransportAllowanceApprovalSchema.index({ entity: 1, status: 1, createdAt: -1 });
exports.TransportAllowanceApprovalSchema.index({ reviewerIds: 1, status: 1 });
exports.TransportAllowanceApprovalSchema.index({ approverIds: 1, status: 1 });
exports.TransportAllowanceApprovalSchema.index({ postingIds: 1, status: 1 });
//# sourceMappingURL=transport-allowance-approval.schema.js.map