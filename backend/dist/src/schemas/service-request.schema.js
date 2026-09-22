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
exports.ServiceRequestSchema = exports.ServiceRequest = exports.ServiceRequestCommentSchema = exports.ServiceRequestComment = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ServiceRequestComment = class ServiceRequestComment {
};
exports.ServiceRequestComment = ServiceRequestComment;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ServiceRequestComment.prototype, "author", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ServiceRequestComment.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['REQUESTER', 'RESOLVER'], required: true }),
    __metadata("design:type", String)
], ServiceRequestComment.prototype, "role", void 0);
exports.ServiceRequestComment = ServiceRequestComment = __decorate([
    (0, mongoose_1.Schema)({ _id: true, timestamps: true })
], ServiceRequestComment);
exports.ServiceRequestCommentSchema = mongoose_1.SchemaFactory.createForClass(ServiceRequestComment);
let ServiceRequest = class ServiceRequest {
};
exports.ServiceRequest = ServiceRequest;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ServiceRequest.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ServiceRequest.prototype, "serviceArea", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ServiceRequest.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ServiceRequest.prototype, "requester", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ServiceRequest.prototype, "resolver", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'RESOLVED'],
        default: 'PENDING',
    }),
    __metadata("design:type", String)
], ServiceRequest.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], ServiceRequest.prototype, "acceptedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], ServiceRequest.prototype, "resolvedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ServiceRequest.prototype, "attachment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.ServiceRequestCommentSchema], default: [] }),
    __metadata("design:type", Array)
], ServiceRequest.prototype, "comments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: 1, max: 5, default: null }),
    __metadata("design:type", Number)
], ServiceRequest.prototype, "ratingScore", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true, default: null }),
    __metadata("design:type", String)
], ServiceRequest.prototype, "ratingComment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ServiceRequest.prototype, "ratedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], ServiceRequest.prototype, "ratedAt", void 0);
exports.ServiceRequest = ServiceRequest = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ServiceRequest);
exports.ServiceRequestSchema = mongoose_1.SchemaFactory.createForClass(ServiceRequest);
//# sourceMappingURL=service-request.schema.js.map