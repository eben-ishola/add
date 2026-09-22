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
exports.ServiceSurveySchema = exports.ServiceSurvey = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ServiceSurvey = class ServiceSurvey {
};
exports.ServiceSurvey = ServiceSurvey;
__decorate([
    (0, mongoose_1.Prop)({ enum: ['INTERNAL', 'EXTERNAL'], required: true }),
    __metadata("design:type", String)
], ServiceSurvey.prototype, "customerType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ServiceSurvey.prototype, "serviceArea", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, uppercase: true }),
    __metadata("design:type", String)
], ServiceSurvey.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, unique: true, sparse: true }),
    __metadata("design:type", String)
], ServiceSurvey.prototype, "referenceCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Number)
], ServiceSurvey.prototype, "referenceSequence", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ServiceSurvey.prototype, "department", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ServiceSurvey.prototype, "unit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 1, max: 5 }),
    __metadata("design:type", Number)
], ServiceSurvey.prototype, "satisfactionRating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 1, max: 5 }),
    __metadata("design:type", Number)
], ServiceSurvey.prototype, "responsivenessRating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 1, max: 5 }),
    __metadata("design:type", Number)
], ServiceSurvey.prototype, "turnaroundRating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ServiceSurvey.prototype, "comments", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ServiceSurvey.prototype, "requestSubmittedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ServiceSurvey.prototype, "responseReceivedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], ServiceSurvey.prototype, "turnaroundTargetHours", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], ServiceSurvey.prototype, "turnaroundActualHours", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Boolean)
], ServiceSurvey.prototype, "turnaroundMetTarget", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ServiceSurvey.prototype, "internalRespondent", void 0);
exports.ServiceSurvey = ServiceSurvey = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ServiceSurvey);
exports.ServiceSurveySchema = mongoose_1.SchemaFactory.createForClass(ServiceSurvey);
//# sourceMappingURL=service-survey.schema.js.map