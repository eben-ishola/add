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
exports.NotificationDispatchSchema = exports.NotificationDispatch = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let NotificationDispatch = class NotificationDispatch {
};
exports.NotificationDispatch = NotificationDispatch;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], NotificationDispatch.prototype, "key", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], NotificationDispatch.prototype, "channel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], NotificationDispatch.prototype, "context", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: () => new Date() }),
    __metadata("design:type", Date)
], NotificationDispatch.prototype, "sentAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], NotificationDispatch.prototype, "expiresAt", void 0);
exports.NotificationDispatch = NotificationDispatch = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], NotificationDispatch);
exports.NotificationDispatchSchema = mongoose_1.SchemaFactory.createForClass(NotificationDispatch);
exports.NotificationDispatchSchema.index({ key: 1 }, { unique: true });
exports.NotificationDispatchSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
//# sourceMappingURL=notification-dispatch.schema.js.map