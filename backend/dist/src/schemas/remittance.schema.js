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
exports.RemittanceSchema = exports.Remittance = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Remittance = class Remittance extends mongoose_2.Document {
};
exports.Remittance = Remittance;
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['NHF', 'Pension'] }),
    __metadata("design:type", String)
], Remittance.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Remittance.prototype, "periodMonth", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Remittance.prototype, "invoiceNote", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Remittance.prototype, "invoiceFileName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Remittance.prototype, "proofNote", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Remittance.prototype, "proofFileName", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['INVOICE_SUBMITTED', 'PROOF_SUBMITTED'],
        default: 'INVOICE_SUBMITTED',
    }),
    __metadata("design:type", String)
], Remittance.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Remittance.prototype, "requestedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Remittance.prototype, "requestedByName", void 0);
exports.Remittance = Remittance = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Remittance);
exports.RemittanceSchema = mongoose_1.SchemaFactory.createForClass(Remittance);
//# sourceMappingURL=remittance.schema.js.map