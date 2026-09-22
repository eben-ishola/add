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
exports.CompensationOthersSchema = exports.CompensationOthers = exports.CompensationOthersWorkflowSchema = exports.CompensationOthersWorkflow = exports.CompensationOthersEntrySchema = exports.CompensationOthersEntry = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let CompensationOthersEntry = class CompensationOthersEntry {
};
exports.CompensationOthersEntry = CompensationOthersEntry;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], CompensationOthersEntry.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], CompensationOthersEntry.prototype, "staffId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], CompensationOthersEntry.prototype, "atlasAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], CompensationOthersEntry.prototype, "payoutAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['atlas', 'addosser'] }),
    __metadata("design:type", String)
], CompensationOthersEntry.prototype, "payoutAccountType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, default: 0 }),
    __metadata("design:type", Number)
], CompensationOthersEntry.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], CompensationOthersEntry.prototype, "baseAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 30 }),
    __metadata("design:type", Number)
], CompensationOthersEntry.prototype, "days", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Branch' }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], CompensationOthersEntry.prototype, "branch", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], CompensationOthersEntry.prototype, "branchName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], CompensationOthersEntry.prototype, "branchGL", void 0);
exports.CompensationOthersEntry = CompensationOthersEntry = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], CompensationOthersEntry);
exports.CompensationOthersEntrySchema = mongoose_1.SchemaFactory.createForClass(CompensationOthersEntry);
let CompensationOthersWorkflow = class CompensationOthersWorkflow {
};
exports.CompensationOthersWorkflow = CompensationOthersWorkflow;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], CompensationOthersWorkflow.prototype, "reviewerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], CompensationOthersWorkflow.prototype, "approverId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], CompensationOthersWorkflow.prototype, "posterId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    }),
    __metadata("design:type", String)
], CompensationOthersWorkflow.prototype, "reviewerStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    }),
    __metadata("design:type", String)
], CompensationOthersWorkflow.prototype, "approverStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    }),
    __metadata("design:type", String)
], CompensationOthersWorkflow.prototype, "posterStatus", void 0);
exports.CompensationOthersWorkflow = CompensationOthersWorkflow = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], CompensationOthersWorkflow);
exports.CompensationOthersWorkflowSchema = mongoose_1.SchemaFactory.createForClass(CompensationOthersWorkflow);
let CompensationOthers = class CompensationOthers {
};
exports.CompensationOthers = CompensationOthers;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Subsidiary', required: true }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], CompensationOthers.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], CompensationOthers.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], CompensationOthers.prototype, "glCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], CompensationOthers.prototype, "month", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], CompensationOthers.prototype, "totalAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.CompensationOthersEntrySchema], default: [] }),
    __metadata("design:type", Array)
], CompensationOthers.prototype, "entries", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: exports.CompensationOthersWorkflowSchema, required: true }),
    __metadata("design:type", CompensationOthersWorkflow)
], CompensationOthers.prototype, "workflow", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: [
            'PENDING_REVIEW',
            'PENDING_APPROVAL',
            'PENDING_POSTING',
            'APPROVED',
            'REJECTED',
        ],
        default: 'PENDING_REVIEW',
    }),
    __metadata("design:type", String)
], CompensationOthers.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], CompensationOthers.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], CompensationOthers.prototype, "financeComment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], CompensationOthers.prototype, "financeCommentBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], CompensationOthers.prototype, "financeCommentByName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], CompensationOthers.prototype, "financeCommentAt", void 0);
exports.CompensationOthers = CompensationOthers = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], CompensationOthers);
exports.CompensationOthersSchema = mongoose_1.SchemaFactory.createForClass(CompensationOthers);
exports.CompensationOthersSchema.index({ entity: 1, month: 1, title: 1 });
exports.CompensationOthersSchema.index({ status: 1, createdAt: -1 });
exports.CompensationOthersSchema.index({ 'workflow.reviewerId': 1 });
exports.CompensationOthersSchema.index({ 'workflow.approverId': 1 });
exports.CompensationOthersSchema.index({ 'workflow.posterId': 1 });
//# sourceMappingURL=compensation-others.schema.js.map