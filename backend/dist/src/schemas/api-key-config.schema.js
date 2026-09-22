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
exports.ApiKeyConfigSchema = exports.ApiKeyConfig = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let ApiKeyConfig = class ApiKeyConfig {
};
exports.ApiKeyConfig = ApiKeyConfig;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, trim: true }),
    __metadata("design:type", String)
], ApiKeyConfig.prototype, "serviceKey", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ApiKeyConfig.prototype, "displayName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ApiKeyConfig.prototype, "baseUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ApiKeyConfig.prototype, "apiKey", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], ApiKeyConfig.prototype, "enabled", void 0);
exports.ApiKeyConfig = ApiKeyConfig = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ApiKeyConfig);
exports.ApiKeyConfigSchema = mongoose_1.SchemaFactory.createForClass(ApiKeyConfig);
//# sourceMappingURL=api-key-config.schema.js.map