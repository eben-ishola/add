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
exports.ProcurementRequisitionSchema = exports.ProcurementRequisition = exports.ProcurementAttachmentSchema = exports.ProcurementAttachment = exports.ProcurementHistoryEntrySchema = exports.ProcurementHistoryEntry = exports.ProcurementGlEntrySchema = exports.ProcurementGlEntry = exports.ProcurementItemSchema = exports.ProcurementItem = exports.PROCUREMENT_STAGES = exports.PROCUREMENT_STATUSES = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
exports.PROCUREMENT_STATUSES = [
    'PENDING_REVIEW',
    'PENDING_APPROVAL',
    'PENDING_POSTING',
    'PENDING_DISBURSEMENT',
    'COMPLETED',
    'REJECTED',
];
exports.PROCUREMENT_STAGES = [
    'REVIEWER',
    'APPROVER',
    'POSTING',
    'DISBURSEMENT',
    'DONE',
];
let ProcurementItem = class ProcurementItem {
};
exports.ProcurementItem = ProcurementItem;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, trim: true }),
    __metadata("design:type", String)
], ProcurementItem.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 1 }),
    __metadata("design:type", Number)
], ProcurementItem.prototype, "quantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ProcurementItem.prototype, "unitPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ProcurementItem.prototype, "lineTotal", void 0);
exports.ProcurementItem = ProcurementItem = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ProcurementItem);
exports.ProcurementItemSchema = mongoose_1.SchemaFactory.createForClass(ProcurementItem);
let ProcurementGlEntry = class ProcurementGlEntry {
};
exports.ProcurementGlEntry = ProcurementGlEntry;
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true }),
    __metadata("design:type", String)
], ProcurementGlEntry.prototype, "businessUnit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true }),
    __metadata("design:type", String)
], ProcurementGlEntry.prototype, "glName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true }),
    __metadata("design:type", String)
], ProcurementGlEntry.prototype, "glNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true }),
    __metadata("design:type", String)
], ProcurementGlEntry.prototype, "glType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true }),
    __metadata("design:type", String)
], ProcurementGlEntry.prototype, "subAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true }),
    __metadata("design:type", String)
], ProcurementGlEntry.prototype, "narration", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ProcurementGlEntry.prototype, "amount", void 0);
exports.ProcurementGlEntry = ProcurementGlEntry = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ProcurementGlEntry);
exports.ProcurementGlEntrySchema = mongoose_1.SchemaFactory.createForClass(ProcurementGlEntry);
let ProcurementHistoryEntry = class ProcurementHistoryEntry {
};
exports.ProcurementHistoryEntry = ProcurementHistoryEntry;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], ProcurementHistoryEntry.prototype, "stage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], ProcurementHistoryEntry.prototype, "action", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], ProcurementHistoryEntry.prototype, "actor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], ProcurementHistoryEntry.prototype, "actorName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], ProcurementHistoryEntry.prototype, "comment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], ProcurementHistoryEntry.prototype, "at", void 0);
exports.ProcurementHistoryEntry = ProcurementHistoryEntry = __decorate([
    (0, mongoose_1.Schema)({ _id: false, timestamps: false })
], ProcurementHistoryEntry);
exports.ProcurementHistoryEntrySchema = mongoose_1.SchemaFactory.createForClass(ProcurementHistoryEntry);
let ProcurementAttachment = class ProcurementAttachment {
};
exports.ProcurementAttachment = ProcurementAttachment;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], ProcurementAttachment.prototype, "fileName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], ProcurementAttachment.prototype, "storedName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['QUOTE', 'INVOICE', 'RECEIPT', 'OTHER'], default: 'OTHER' }),
    __metadata("design:type", String)
], ProcurementAttachment.prototype, "kind", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ProcurementAttachment.prototype, "size", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], ProcurementAttachment.prototype, "uploadedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], ProcurementAttachment.prototype, "uploadedAt", void 0);
exports.ProcurementAttachment = ProcurementAttachment = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ProcurementAttachment);
exports.ProcurementAttachmentSchema = mongoose_1.SchemaFactory.createForClass(ProcurementAttachment);
let ProcurementRequisition = class ProcurementRequisition extends mongoose_2.Document {
};
exports.ProcurementRequisition = ProcurementRequisition;
__decorate([
    (0, mongoose_1.Prop)({ type: String, index: true }),
    __metadata("design:type", String)
], ProcurementRequisition.prototype, "reference", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Subsidiary', required: true }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], ProcurementRequisition.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Branch' }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], ProcurementRequisition.prototype, "branch", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Department' }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], ProcurementRequisition.prototype, "department", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Department' }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], ProcurementRequisition.prototype, "resolvingDepartment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], ProcurementRequisition.prototype, "requestedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], ProcurementRequisition.prototype, "requestedByName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, trim: true }),
    __metadata("design:type", String)
], ProcurementRequisition.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], ProcurementRequisition.prototype, "justification", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true }),
    __metadata("design:type", String)
], ProcurementRequisition.prototype, "assignee", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.ProcurementItemSchema], default: [] }),
    __metadata("design:type", Array)
], ProcurementRequisition.prototype, "items", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: 'NGN' }),
    __metadata("design:type", String)
], ProcurementRequisition.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ProcurementRequisition.prototype, "estimatedAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ProcurementRequisition.prototype, "recommendedAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ProcurementRequisition.prototype, "vatRate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ProcurementRequisition.prototype, "vatAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ProcurementRequisition.prototype, "withholdingRate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ProcurementRequisition.prototype, "withholdingAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ProcurementRequisition.prototype, "totalAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ProcurementRequisition.prototype, "netPayable", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true }),
    __metadata("design:type", String)
], ProcurementRequisition.prototype, "payeeName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true }),
    __metadata("design:type", String)
], ProcurementRequisition.prototype, "payeeBank", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true }),
    __metadata("design:type", String)
], ProcurementRequisition.prototype, "payeeAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true }),
    __metadata("design:type", String)
], ProcurementRequisition.prototype, "paymentType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true }),
    __metadata("design:type", String)
], ProcurementRequisition.prototype, "narration", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'ExpenseAccount' }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], ProcurementRequisition.prototype, "expenseCategory", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'ExpenseBudget' }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], ProcurementRequisition.prototype, "budget", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ProcurementRequisition.prototype, "committedAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ProcurementRequisition.prototype, "budgetAvailableAtApproval", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ProcurementRequisition.prototype, "budgetOverrun", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.SchemaTypes.Mixed }),
    __metadata("design:type", Object)
], ProcurementRequisition.prototype, "budgetRef", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: exports.PROCUREMENT_STATUSES,
        default: 'PENDING_REVIEW',
        index: true,
    }),
    __metadata("design:type", String)
], ProcurementRequisition.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: exports.PROCUREMENT_STAGES, default: 'REVIEWER', index: true }),
    __metadata("design:type", String)
], ProcurementRequisition.prototype, "currentStage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User', index: true }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], ProcurementRequisition.prototype, "assignedApprover", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], ProcurementRequisition.prototype, "assignedApproverName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.ProcurementHistoryEntrySchema], default: [] }),
    __metadata("design:type", Array)
], ProcurementRequisition.prototype, "history", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], ProcurementRequisition.prototype, "rejectionReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], ProcurementRequisition.prototype, "financeComment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], ProcurementRequisition.prototype, "financeCommentBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], ProcurementRequisition.prototype, "financeCommentByName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], ProcurementRequisition.prototype, "financeCommentAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.ProcurementGlEntrySchema], default: [] }),
    __metadata("design:type", Array)
], ProcurementRequisition.prototype, "glEntries", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], ProcurementRequisition.prototype, "disbursedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], ProcurementRequisition.prototype, "disbursedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], ProcurementRequisition.prototype, "receiptDueAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.ProcurementAttachmentSchema], default: [] }),
    __metadata("design:type", Array)
], ProcurementRequisition.prototype, "attachments", void 0);
exports.ProcurementRequisition = ProcurementRequisition = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ProcurementRequisition);
exports.ProcurementRequisitionSchema = mongoose_1.SchemaFactory.createForClass(ProcurementRequisition);
exports.ProcurementRequisitionSchema.index({ entity: 1, status: 1, createdAt: -1 });
exports.ProcurementRequisitionSchema.index({ requestedBy: 1, createdAt: -1 });
exports.ProcurementRequisitionSchema.index({ assignedApprover: 1, status: 1 });
exports.ProcurementRequisitionSchema.index({ currentStage: 1, status: 1, createdAt: -1 });
exports.ProcurementRequisitionSchema.index({ status: 1, receiptDueAt: 1 });
//# sourceMappingURL=procurement-requisition.schema.js.map