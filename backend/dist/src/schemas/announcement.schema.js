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
exports.AnnouncementSchema = exports.Announcement = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Announcement = class Announcement {
};
exports.Announcement = Announcement;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Announcement.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Announcement.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['text', 'image'], default: 'text' }),
    __metadata("design:type", String)
], Announcement.prototype, "contentType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], Announcement.prototype, "imageUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Announcement.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: () => new Date() }),
    __metadata("design:type", Date)
], Announcement.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Announcement.prototype, "pinned", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], Announcement.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['ALL', 'SELECTED'], default: 'ALL' }),
    __metadata("design:type", String)
], Announcement.prototype, "audienceScope", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [mongoose_2.Types.ObjectId], ref: 'Subsidiary', default: [] }),
    __metadata("design:type", Array)
], Announcement.prototype, "targetEntities", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [mongoose_2.Types.ObjectId], ref: 'Staff', default: [] }),
    __metadata("design:type", Array)
], Announcement.prototype, "readBy", void 0);
exports.Announcement = Announcement = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Announcement);
exports.AnnouncementSchema = mongoose_1.SchemaFactory.createForClass(Announcement);
exports.AnnouncementSchema.index({ pinned: -1, date: -1, createdAt: -1 });
//# sourceMappingURL=announcement.schema.js.map