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
exports.ExpenseAccountSchema = exports.ExpenseAccount = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ExpenseAccount = class ExpenseAccount {
};
exports.ExpenseAccount = ExpenseAccount;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, trim: true, index: true }),
    __metadata("design:type", String)
], ExpenseAccount.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, trim: true }),
    __metadata("design:type", String)
], ExpenseAccount.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, trim: true }),
    __metadata("design:type", String)
], ExpenseAccount.prototype, "acct", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Subsidiary', default: null }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], ExpenseAccount.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: true }),
    __metadata("design:type", Boolean)
], ExpenseAccount.prototype, "active", void 0);
exports.ExpenseAccount = ExpenseAccount = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ExpenseAccount);
exports.ExpenseAccountSchema = mongoose_1.SchemaFactory.createForClass(ExpenseAccount);
exports.ExpenseAccountSchema.index({ type: 1, name: 1 });
exports.ExpenseAccountSchema.index({ entity: 1, type: 1 });
exports.ExpenseAccountSchema.index({ entity: 1, type: 1, acct: 1 }, { unique: true });
//# sourceMappingURL=expense-account.schema.js.map