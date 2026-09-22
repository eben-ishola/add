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
exports.DocumentReadSchema = exports.DocumentRead = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const document_library_schema_1 = require("./document-library.schema");
const user_schema_1 = require("./user.schema");
let DocumentRead = class DocumentRead {
};
exports.DocumentRead = DocumentRead;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: document_library_schema_1.DocumentLibrary.name, required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DocumentRead.prototype, "documentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: user_schema_1.User.name, required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DocumentRead.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 1 }),
    __metadata("design:type", Number)
], DocumentRead.prototype, "version", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], DocumentRead.prototype, "readAt", void 0);
exports.DocumentRead = DocumentRead = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], DocumentRead);
exports.DocumentReadSchema = mongoose_1.SchemaFactory.createForClass(DocumentRead);
exports.DocumentReadSchema.index({ documentId: 1, userId: 1, version: 1 }, { unique: true });
exports.DocumentReadSchema.index({ userId: 1, readAt: -1 });
//# sourceMappingURL=document-read.schema.js.map