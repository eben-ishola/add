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
exports.LeaveSchema = exports.Leave = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Leave = class Leave {
};
exports.Leave = Leave;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Leave.prototype, "leaveType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Leave.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Leave.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Leave.prototype, "relievingOfficer", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Leave.prototype, "startDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Leave.prototype, "endDate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Leave.prototype, "resumptionDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Leave.prototype, "startNoticeSentAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Leave.prototype, "numberOfDays", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Leave.prototype, "reason", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Leave.prototype, "contactDetails", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Leave.prototype, "handoverNoteUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Leave.prototype, "relieverApproval", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Pending', enum: ['Pending', 'Approved', 'Rejected'] }),
    __metadata("design:type", String)
], Leave.prototype, "relieverStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Leave.prototype, "hodApproval", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Pending', enum: ['Pending', 'Approved', 'Rejected'] }),
    __metadata("design:type", String)
], Leave.prototype, "hodStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Leave.prototype, "hrApproval", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Pending', enum: ['Pending', 'Approved', 'Rejected'] }),
    __metadata("design:type", String)
], Leave.prototype, "hrStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Leave.prototype, "relieverComment", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Leave.prototype, "hodComment", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Leave.prototype, "hrComment", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Leave.prototype, "relieverApprovalDate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Leave.prototype, "hodApprovalDate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Leave.prototype, "hrApprovalDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Pending', enum: ['Pending', 'Approved', 'Rejected'] }),
    __metadata("design:type", String)
], Leave.prototype, "status", void 0);
exports.Leave = Leave = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Leave);
exports.LeaveSchema = mongoose_1.SchemaFactory.createForClass(Leave);
exports.LeaveSchema.index({ userId: 1, startDate: -1 });
exports.LeaveSchema.index({ entity: 1, status: 1, startDate: -1 });
exports.LeaveSchema.index({ status: 1, startDate: -1 });
exports.LeaveSchema.index({ hodApproval: 1, hodStatus: 1 });
exports.LeaveSchema.index({ hrApproval: 1, hrStatus: 1 });
exports.LeaveSchema.index({ relievingOfficer: 1, relieverStatus: 1 });
//# sourceMappingURL=leave.schema.js.map