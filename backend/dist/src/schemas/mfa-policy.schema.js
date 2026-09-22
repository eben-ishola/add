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
exports.MfaPolicySchema = exports.MfaPolicy = exports.MFA_POLICY_SINGLETON_KEY = void 0;
const mongoose_1 = require("@nestjs/mongoose");
exports.MFA_POLICY_SINGLETON_KEY = 'global';
let MfaPolicy = class MfaPolicy {
};
exports.MfaPolicy = MfaPolicy;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, unique: true, default: exports.MFA_POLICY_SINGLETON_KEY }),
    __metadata("design:type", String)
], MfaPolicy.prototype, "key", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], MfaPolicy.prototype, "requireForAll", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], MfaPolicy.prototype, "updatedBy", void 0);
exports.MfaPolicy = MfaPolicy = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], MfaPolicy);
exports.MfaPolicySchema = mongoose_1.SchemaFactory.createForClass(MfaPolicy);
//# sourceMappingURL=mfa-policy.schema.js.map