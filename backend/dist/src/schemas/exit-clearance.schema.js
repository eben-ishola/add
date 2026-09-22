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
exports.ExitClearanceSchema = exports.ExitClearance = exports.ClearanceSectionSchema = exports.ClearanceSection = exports.ClearanceItemSchema = exports.ClearanceItem = exports.isMarketFacingDepartment = exports.MARKET_FACING_DEPARTMENTS = exports.CLEARANCE_SECTIONS = exports.CLEARANCE_ITEMS = exports.CLEARANCE_SECTION_STATUSES = exports.CLEARANCE_ITEM_STATUSES = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
exports.CLEARANCE_ITEM_STATUSES = [
    'PENDING',
    'RETURNED',
    'NOT_APPLICABLE',
];
exports.CLEARANCE_SECTION_STATUSES = [
    'PENDING',
    'COMPLETED',
    'NOT_APPLICABLE',
];
exports.CLEARANCE_ITEMS = [
    { key: 'HANDOVER_NOTE', label: 'Hand over note', unit: 'Line Manager' },
    { key: 'LAPTOP', label: 'Tab / laptop / charger', unit: 'Admin' },
    { key: 'HEADSET', label: 'Head set and charger', unit: 'Admin' },
    { key: 'CUG_PHONE', label: 'CUG phone', unit: 'Admin' },
    { key: 'STAFF_ID', label: 'Staff ID card', unit: 'HR Department' },
];
exports.CLEARANCE_SECTIONS = [
    { key: 'LINE_MANAGER', label: 'Line manager', unit: 'Line Manager' },
    { key: 'CREDIT_RISK', label: 'Credit risk management', unit: 'Credit Risk Management' },
    { key: 'LOAN_MONITORING', label: 'Loan monitoring', unit: 'Loan Monitoring' },
    { key: 'IT', label: 'Information technology', unit: 'Information Technology' },
    { key: 'ADMIN', label: 'Admin department', unit: 'Admin' },
    { key: 'INTERNAL_AUDIT', label: 'Internal audit', unit: 'Internal Audit' },
    { key: 'HR', label: 'Human resources', unit: 'HR Department' },
];
exports.MARKET_FACING_DEPARTMENTS = [
    'sme',
    'retail',
    'savings group',
    'consumer',
    'personal finance',
    'public sector',
    'specialized product',
    'specialised product',
    'medium enterprise',
];
const isMarketFacingDepartment = (name) => {
    const normalized = String(name ?? '').trim().toLowerCase();
    if (!normalized)
        return false;
    return exports.MARKET_FACING_DEPARTMENTS.some((token) => normalized.includes(token));
};
exports.isMarketFacingDepartment = isMarketFacingDepartment;
let ClearanceItem = class ClearanceItem {
};
exports.ClearanceItem = ClearanceItem;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ClearanceItem.prototype, "key", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ClearanceItem.prototype, "label", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ClearanceItem.prototype, "unit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: exports.CLEARANCE_ITEM_STATUSES, default: 'PENDING' }),
    __metadata("design:type", String)
], ClearanceItem.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ClearanceItem.prototype, "confirmedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], ClearanceItem.prototype, "confirmedByName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], ClearanceItem.prototype, "confirmedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], ClearanceItem.prototype, "comment", void 0);
exports.ClearanceItem = ClearanceItem = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ClearanceItem);
exports.ClearanceItemSchema = mongoose_1.SchemaFactory.createForClass(ClearanceItem);
let ClearanceSection = class ClearanceSection {
};
exports.ClearanceSection = ClearanceSection;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ClearanceSection.prototype, "key", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ClearanceSection.prototype, "label", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ClearanceSection.prototype, "unit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: exports.CLEARANCE_SECTION_STATUSES, default: 'PENDING' }),
    __metadata("design:type", String)
], ClearanceSection.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], ClearanceSection.prototype, "data", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], ClearanceSection.prototype, "comment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ClearanceSection.prototype, "completedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], ClearanceSection.prototype, "completedByName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], ClearanceSection.prototype, "completedAt", void 0);
exports.ClearanceSection = ClearanceSection = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ClearanceSection);
exports.ClearanceSectionSchema = mongoose_1.SchemaFactory.createForClass(ClearanceSection);
let ExitClearance = class ExitClearance {
};
exports.ExitClearance = ExitClearance;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'ExitRequest', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExitClearance.prototype, "exitRequest", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExitClearance.prototype, "staff", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], ExitClearance.prototype, "staffName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], ExitClearance.prototype, "staffId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], ExitClearance.prototype, "designation", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Subsidiary', default: null, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExitClearance.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Department', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExitClearance.prototype, "department", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Branch', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExitClearance.prototype, "branch", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', default: null, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExitClearance.prototype, "lineManager", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true }),
    __metadata("design:type", Date)
], ExitClearance.prototype, "exitDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ExitClearance.prototype, "marketFacing", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.ClearanceItemSchema], default: [] }),
    __metadata("design:type", Array)
], ExitClearance.prototype, "items", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.ClearanceSectionSchema], default: [] }),
    __metadata("design:type", Array)
], ExitClearance.prototype, "sections", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        default: 'IN_PROGRESS',
        index: true,
    }),
    __metadata("design:type", String)
], ExitClearance.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], ExitClearance.prototype, "completedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExitClearance.prototype, "completedBy", void 0);
exports.ExitClearance = ExitClearance = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ExitClearance);
exports.ExitClearanceSchema = mongoose_1.SchemaFactory.createForClass(ExitClearance);
exports.ExitClearanceSchema.index({ status: 1, exitDate: -1 });
//# sourceMappingURL=exit-clearance.schema.js.map