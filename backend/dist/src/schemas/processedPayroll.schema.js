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
exports.ProcessedPayrollSchema = exports.ProcessedPayroll = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ProcessedPayroll = class ProcessedPayroll extends mongoose_2.Document {
};
exports.ProcessedPayroll = ProcessedPayroll;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({}),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "staffId", void 0);
__decorate([
    (0, mongoose_1.Prop)({}),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "account", void 0);
__decorate([
    (0, mongoose_1.Prop)({}),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "accountNo", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "narration", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ProcessedPayroll.prototype, "exitRedirected", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "staffObjectId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "periodKey", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "period", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ProcessedPayroll.prototype, "periodDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "grade", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "basic", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "housing", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "transport", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "dress", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "utilities", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "lunch", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "telephone", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "gross", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "nhf", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "pension", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "companyPension", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "paye", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "payeAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "nhfAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "pensionAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "pensionProvider", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "batchId", void 0);
__decorate([
    (0, mongoose_1.Prop)({}),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "branch", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Pending', enum: ['Pending', 'Approved', 'Rejected'] }),
    __metadata("design:type", String)
], ProcessedPayroll.prototype, "payslipApproval", void 0);
exports.ProcessedPayroll = ProcessedPayroll = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ProcessedPayroll);
exports.ProcessedPayrollSchema = mongoose_1.SchemaFactory.createForClass(ProcessedPayroll);
exports.ProcessedPayrollSchema.index({ entity: 1, periodKey: 1, type: 1 });
exports.ProcessedPayrollSchema.index({ entity: 1, batchId: 1 });
exports.ProcessedPayrollSchema.index({ staffId: 1, periodKey: -1 });
exports.ProcessedPayrollSchema.index({ userId: 1, periodKey: -1 });
exports.ProcessedPayrollSchema.index({ employeeId: 1, periodKey: -1 });
exports.ProcessedPayrollSchema.index({ payslipApproval: 1, entity: 1, periodKey: -1 });
exports.ProcessedPayrollSchema.index({ batchId: 1 });
exports.ProcessedPayrollSchema.index({ entity: 1, createdAt: 1 });
//# sourceMappingURL=processedPayroll.schema.js.map