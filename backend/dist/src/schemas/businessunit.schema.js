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
exports.BusinessUnitSchema = exports.BusinessUnit = exports.UNIT_TYPES = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
exports.UNIT_TYPES = ['sme', 'retail', 'savings', 'afl'];
let BusinessUnit = class BusinessUnit {
};
exports.BusinessUnit = BusinessUnit;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, unique: true }),
    __metadata("design:type", String)
], BusinessUnit.prototype, "BU_NM", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, unique: true }),
    __metadata("design:type", Number)
], BusinessUnit.prototype, "BU_ID", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, unique: true }),
    __metadata("design:type", Number)
], BusinessUnit.prototype, "BU_NO", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: exports.UNIT_TYPES, default: null, index: true }),
    __metadata("design:type", String)
], BusinessUnit.prototype, "unit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], BusinessUnit.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Subsidiary', default: null, index: true }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], BusinessUnit.prototype, "subsidiary", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Territory', default: null }),
    __metadata("design:type", mongoose_2.default.Types.ObjectId)
], BusinessUnit.prototype, "territory", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], BusinessUnit.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], BusinessUnit.prototype, "updatedAt", void 0);
exports.BusinessUnit = BusinessUnit = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], BusinessUnit);
exports.BusinessUnitSchema = mongoose_1.SchemaFactory.createForClass(BusinessUnit);
//# sourceMappingURL=businessunit.schema.js.map