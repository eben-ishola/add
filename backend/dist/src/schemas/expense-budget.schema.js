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
exports.ExpenseBudgetSchema = exports.ExpenseBudget = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ExpenseBudget = class ExpenseBudget {
};
exports.ExpenseBudget = ExpenseBudget;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Subsidiary', required: true, index: true }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], ExpenseBudget.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.default.Schema.Types.ObjectId,
        ref: 'ExpenseAccount',
        required: true,
        index: true,
    }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], ExpenseBudget.prototype, "expenseAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, index: true }),
    __metadata("design:type", Number)
], ExpenseBudget.prototype, "year", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true }),
    __metadata("design:type", String)
], ExpenseBudget.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [Number],
        default: () => new Array(12).fill(0),
        validate: {
            validator: (value) => Array.isArray(value) && value.length === 12,
            message: 'A budget must carry exactly twelve monthly allocations.',
        },
    }),
    __metadata("design:type", Array)
], ExpenseBudget.prototype, "monthlyAllocation", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ExpenseBudget.prototype, "committed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ExpenseBudget.prototype, "spent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: true }),
    __metadata("design:type", Boolean)
], ExpenseBudget.prototype, "active", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], ExpenseBudget.prototype, "updatedBy", void 0);
exports.ExpenseBudget = ExpenseBudget = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ExpenseBudget);
exports.ExpenseBudgetSchema = mongoose_1.SchemaFactory.createForClass(ExpenseBudget);
exports.ExpenseBudgetSchema.index({ entity: 1, expenseAccount: 1, year: 1 }, { unique: true });
exports.ExpenseBudgetSchema.virtual('allocated').get(function () {
    const months = Array.isArray(this.monthlyAllocation) ? this.monthlyAllocation : [];
    return months.reduce((sum, value) => sum + (Number(value) || 0), 0);
});
exports.ExpenseBudgetSchema.virtual('balance').get(function () {
    const months = Array.isArray(this.monthlyAllocation) ? this.monthlyAllocation : [];
    const allocated = months.reduce((sum, value) => sum + (Number(value) || 0), 0);
    return allocated - (this.committed ?? 0) - (this.spent ?? 0);
});
exports.ExpenseBudgetSchema.set('toObject', { virtuals: true });
exports.ExpenseBudgetSchema.set('toJSON', { virtuals: true });
//# sourceMappingURL=expense-budget.schema.js.map