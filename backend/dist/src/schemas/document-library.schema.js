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
exports.DocumentLibrarySchema = exports.DocumentLibrary = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const AccessSchemaShape = {
    scope: {
        type: String,
        enum: ['all', 'entities', 'units', 'users'],
        default: 'all',
    },
    entityIds: {
        type: [String],
        default: [],
    },
    unitIds: {
        type: [String],
        default: [],
    },
    userIds: {
        type: [String],
        default: [],
    },
};
let DocumentLibrary = class DocumentLibrary {
};
exports.DocumentLibrary = DocumentLibrary;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], DocumentLibrary.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], DocumentLibrary.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], DocumentLibrary.prototype, "owner", void 0);
__decorate([
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", String)
], DocumentLibrary.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], DocumentLibrary.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 1 }),
    __metadata("design:type", Number)
], DocumentLibrary.prototype, "version", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                version: { type: Number, default: 1 },
                fileUrl: { type: String },
                fileType: { type: String },
                fileSize: { type: Number },
                updatedAt: { type: Date, default: Date.now },
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], DocumentLibrary.prototype, "versions", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], DocumentLibrary.prototype, "fileUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], DocumentLibrary.prototype, "fileType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], DocumentLibrary.prototype, "fileSize", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [String],
        default: [],
    }),
    __metadata("design:type", Array)
], DocumentLibrary.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], DocumentLibrary.prototype, "tagsSearch", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], DocumentLibrary.prototype, "featured", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: AccessSchemaShape,
        default: { scope: 'all', entityIds: [], unitIds: [], userIds: [] },
    }),
    __metadata("design:type", Object)
], DocumentLibrary.prototype, "viewAccess", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: AccessSchemaShape,
        default: { scope: 'all', entityIds: [], unitIds: [], userIds: [] },
    }),
    __metadata("design:type", Object)
], DocumentLibrary.prototype, "downloadAccess", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: AccessSchemaShape,
        default: { scope: 'all', entityIds: [], unitIds: [], userIds: [] },
    }),
    __metadata("design:type", Object)
], DocumentLibrary.prototype, "editAccess", void 0);
exports.DocumentLibrary = DocumentLibrary = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], DocumentLibrary);
exports.DocumentLibrarySchema = mongoose_1.SchemaFactory.createForClass(DocumentLibrary);
exports.DocumentLibrarySchema.index({
    title: 'text',
    description: 'text',
    tagsSearch: 'text',
});
exports.DocumentLibrarySchema.index({ tags: 1 });
//# sourceMappingURL=document-library.schema.js.map