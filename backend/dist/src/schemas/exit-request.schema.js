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
exports.ExitRequestSchema = exports.ExitRequest = exports.ExitHandoverAttachmentSchema = exports.ExitHandoverAttachment = exports.ExitRequestHistoryEntrySchema = exports.ExitRequestHistoryEntry = exports.NOTICE_PERIODS = exports.EXIT_REQUEST_STATUSES = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
exports.EXIT_REQUEST_STATUSES = [
    'PENDING',
    'APPROVED',
    'REJECTED',
    'WITHDRAWN',
];
exports.NOTICE_PERIODS = ['2 weeks', '4 weeks', '6 weeks', '3 months'];
let ExitRequestHistoryEntry = class ExitRequestHistoryEntry {
};
exports.ExitRequestHistoryEntry = ExitRequestHistoryEntry;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ExitRequestHistoryEntry.prototype, "action", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExitRequestHistoryEntry.prototype, "actor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], ExitRequestHistoryEntry.prototype, "actorName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], ExitRequestHistoryEntry.prototype, "comment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: () => new Date() }),
    __metadata("design:type", Date)
], ExitRequestHistoryEntry.prototype, "at", void 0);
exports.ExitRequestHistoryEntry = ExitRequestHistoryEntry = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ExitRequestHistoryEntry);
exports.ExitRequestHistoryEntrySchema = mongoose_1.SchemaFactory.createForClass(ExitRequestHistoryEntry);
let ExitHandoverAttachment = class ExitHandoverAttachment {
};
exports.ExitHandoverAttachment = ExitHandoverAttachment;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ExitHandoverAttachment.prototype, "fileName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ExitHandoverAttachment.prototype, "storedName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExitHandoverAttachment.prototype, "uploadedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: () => new Date() }),
    __metadata("design:type", Date)
], ExitHandoverAttachment.prototype, "uploadedAt", void 0);
exports.ExitHandoverAttachment = ExitHandoverAttachment = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ExitHandoverAttachment);
exports.ExitHandoverAttachmentSchema = mongoose_1.SchemaFactory.createForClass(ExitHandoverAttachment);
let ExitRequest = class ExitRequest {
};
exports.ExitRequest = ExitRequest;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExitRequest.prototype, "staff", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], ExitRequest.prototype, "staffName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], ExitRequest.prototype, "staffId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Subsidiary', default: null, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExitRequest.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Department', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExitRequest.prototype, "department", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Branch', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExitRequest.prototype, "branch", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', default: null, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExitRequest.prototype, "lineManager", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true }),
    __metadata("design:type", Date)
], ExitRequest.prototype, "proposedExitDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], ExitRequest.prototype, "reason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: exports.NOTICE_PERIODS, default: null }),
    __metadata("design:type", String)
], ExitRequest.prototype, "noticePeriod", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], ExitRequest.prototype, "handoverNote", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.ExitHandoverAttachmentSchema], default: [] }),
    __metadata("design:type", Array)
], ExitRequest.prototype, "handoverAttachments", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: exports.EXIT_REQUEST_STATUSES,
        default: 'PENDING',
        index: true,
    }),
    __metadata("design:type", String)
], ExitRequest.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: () => new Date() }),
    __metadata("design:type", Date)
], ExitRequest.prototype, "submittedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExitRequest.prototype, "decidedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], ExitRequest.prototype, "decidedByName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], ExitRequest.prototype, "decidedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], ExitRequest.prototype, "decisionComment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], ExitRequest.prototype, "approvedExitDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.ExitRequestHistoryEntrySchema], default: [] }),
    __metadata("design:type", Array)
], ExitRequest.prototype, "history", void 0);
exports.ExitRequest = ExitRequest = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ExitRequest);
exports.ExitRequestSchema = mongoose_1.SchemaFactory.createForClass(ExitRequest);
exports.ExitRequestSchema.index({ status: 1, submittedAt: -1 });
exports.ExitRequestSchema.index({ staff: 1, submittedAt: -1 });
exports.ExitRequestSchema.index({ staff: 1 }, { unique: true, partialFilterExpression: { status: 'PENDING' } });
//# sourceMappingURL=exit-request.schema.js.map