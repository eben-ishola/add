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
exports.PayslipApprovalSchema = exports.PayslipApproval = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let PayslipApproval = class PayslipApproval extends mongoose_2.Document {
};
exports.PayslipApproval = PayslipApproval;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PayslipApproval.prototype, "staffId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PayslipApproval.prototype, "staffObjectId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PayslipApproval.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PayslipApproval.prototype, "staffName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PayslipApproval.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PayslipApproval.prototype, "periodKey", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PayslipApproval.prototype, "period", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], PayslipApproval.prototype, "periodDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['PENDING_REVIEW', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'],
        default: 'PENDING_REVIEW',
    }),
    __metadata("design:type", String)
], PayslipApproval.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], PayslipApproval.prototype, "reviewerIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], PayslipApproval.prototype, "approverIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], PayslipApproval.prototype, "requestedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], PayslipApproval.prototype, "requestedByName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], PayslipApproval.prototype, "reviewerApprovedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], PayslipApproval.prototype, "reviewerApprovedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], PayslipApproval.prototype, "approverApprovedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], PayslipApproval.prototype, "approverApprovedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], PayslipApproval.prototype, "rejectionReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], PayslipApproval.prototype, "currentStage", void 0);
exports.PayslipApproval = PayslipApproval = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PayslipApproval);
exports.PayslipApprovalSchema = mongoose_1.SchemaFactory.createForClass(PayslipApproval);
exports.PayslipApprovalSchema.index({ status: 1, createdAt: -1 });
exports.PayslipApprovalSchema.index({ entity: 1, status: 1, createdAt: -1 });
exports.PayslipApprovalSchema.index({ reviewerIds: 1, status: 1 });
exports.PayslipApprovalSchema.index({ approverIds: 1, status: 1 });
exports.PayslipApprovalSchema.index({ requestedBy: 1 });
exports.PayslipApprovalSchema.index({ staffId: 1, periodKey: 1 });
//# sourceMappingURL=payslipApproval.schema.js.map