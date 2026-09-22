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
exports.ROIncentiveSchema = exports.ROIncentive = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ROIncentive = class ROIncentive {
};
exports.ROIncentive = ROIncentive;
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], ROIncentive.prototype, "OFFICER", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ROIncentive.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], ROIncentive.prototype, "FOR_MONTH", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed }),
    __metadata("design:type", Object)
], ROIncentive.prototype, "USER_ID", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ROIncentive.prototype, "EARNINGS_TARGET", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ROIncentive.prototype, "EARNINGS_ACHIEVED", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ROIncentive.prototype, "VOLUME_TARGET", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ROIncentive.prototype, "VOLUME_ACHIEVED", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ROIncentive.prototype, "COUNT_TARGET", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ROIncentive.prototype, "NO_BOOKED", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ROIncentive.prototype, "PDO", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ROIncentive.prototype, "PAR", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ROIncentive.prototype, "EARNING_RESULT", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ROIncentive.prototype, "VOLUME_RESULT", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ROIncentive.prototype, "EARNING_INCENTIVE", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ROIncentive.prototype, "VOLUME_INCENTIVE", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ROIncentive.prototype, "STAR_BONUS", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ROIncentive.prototype, "PAYABLE", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ROIncentive.prototype, "AMOUNT", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], ROIncentive.prototype, "MODE", void 0);
exports.ROIncentive = ROIncentive = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'roincentives' })
], ROIncentive);
exports.ROIncentiveSchema = mongoose_1.SchemaFactory.createForClass(ROIncentive);
//# sourceMappingURL=roIncentive.schema.js.map