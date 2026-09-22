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
exports.AuditLogSchema = exports.AuditLog = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let AuditLog = class AuditLog {
};
exports.AuditLog = AuditLog;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "action", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AuditLog.prototype, "method", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AuditLog.prototype, "path", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AuditLog.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AuditLog.prototype, "entityId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AuditLog.prototype, "scopeEntityId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], AuditLog.prototype, "actor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], AuditLog.prototype, "changes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], AuditLog.prototype, "params", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], AuditLog.prototype, "query", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], AuditLog.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], AuditLog.prototype, "statusCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], AuditLog.prototype, "success", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AuditLog.prototype, "error", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AuditLog.prototype, "ip", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AuditLog.prototype, "userAgent", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], AuditLog.prototype, "durationMs", void 0);
exports.AuditLog = AuditLog = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], AuditLog);
exports.AuditLogSchema = mongoose_1.SchemaFactory.createForClass(AuditLog);
exports.AuditLogSchema.index({ createdAt: -1 });
exports.AuditLogSchema.index({ 'actor.id': 1, createdAt: -1 });
exports.AuditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });
exports.AuditLogSchema.index({ scopeEntityId: 1, createdAt: -1 });
exports.AuditLogSchema.index({ action: 1, createdAt: -1 });
//# sourceMappingURL=audit-log.schema.js.map