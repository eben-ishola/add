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
exports.PayrollSchema = exports.Payroll = exports.DEFAULT_PERFORMANCE_BRACKETS = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
exports.DEFAULT_PERFORMANCE_BRACKETS = [
    { minScore: 90, maxScore: 100, percent: 100 },
    { minScore: 80, maxScore: 89, percent: 90 },
    { minScore: 70, maxScore: 79, percent: 80 },
    { minScore: 60, maxScore: 69, percent: 70 },
    { minScore: 0, maxScore: 59, percent: 0 },
];
let Payroll = class Payroll extends mongoose_2.Document {
};
exports.Payroll = Payroll;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payroll.prototype, "basic", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payroll.prototype, "housing", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payroll.prototype, "transport", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payroll.prototype, "dress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payroll.prototype, "utilities", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payroll.prototype, "lunch", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payroll.prototype, "telephone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payroll.prototype, "reimbursable", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payroll.prototype, "variable", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payroll.prototype, "leave", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payroll.prototype, "pension", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payroll.prototype, "companyPension", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payroll.prototype, "nhf", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payroll.prototype, "craRelief", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payroll.prototype, "fixedCra", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payroll.prototype, "workingDays", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Payroll.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Payroll.prototype, "autoPayroll", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: "internal" }),
    __metadata("design:type", String)
], Payroll.prototype, "payrollProvider", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: "" }),
    __metadata("design:type", String)
], Payroll.prototype, "payrollEmail", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: "" }),
    __metadata("design:type", String)
], Payroll.prototype, "salaryAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: "" }),
    __metadata("design:type", String)
], Payroll.prototype, "payeAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: "" }),
    __metadata("design:type", String)
], Payroll.prototype, "nhfAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: "" }),
    __metadata("design:type", String)
], Payroll.prototype, "staffPensionAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: "" }),
    __metadata("design:type", String)
], Payroll.prototype, "companyPensionAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: "" }),
    __metadata("design:type", String)
], Payroll.prototype, "companyGL", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: "" }),
    __metadata("design:type", String)
], Payroll.prototype, "reimbursableAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: "" }),
    __metadata("design:type", String)
], Payroll.prototype, "bankPartAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: "" }),
    __metadata("design:type", String)
], Payroll.prototype, "individualAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: "" }),
    __metadata("design:type", String)
], Payroll.prototype, "exitAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Payroll.prototype, "enableSplit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Array, default: [] }),
    __metadata("design:type", Array)
], Payroll.prototype, "splitPayments", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                minScore: { type: Number, required: true },
                maxScore: { type: Number, required: false },
                percent: { type: Number, required: true },
            },
        ],
        default: exports.DEFAULT_PERFORMANCE_BRACKETS,
    }),
    __metadata("design:type", Array)
], Payroll.prototype, "performanceBrackets", void 0);
exports.Payroll = Payroll = __decorate([
    (0, mongoose_1.Schema)()
], Payroll);
exports.PayrollSchema = mongoose_1.SchemaFactory.createForClass(Payroll);
//# sourceMappingURL=payroll.schema.js.map