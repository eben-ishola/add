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
exports.DisciplinaryCaseSchema = exports.DisciplinaryCase = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let DisciplinaryCase = class DisciplinaryCase {
};
exports.DisciplinaryCase = DisciplinaryCase;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], DisciplinaryCase.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", String)
], DisciplinaryCase.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ index: 'text' }),
    __metadata("design:type", String)
], DisciplinaryCase.prototype, "employeeName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", String)
], DisciplinaryCase.prototype, "department", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Attendance', index: true }),
    __metadata("design:type", String)
], DisciplinaryCase.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Open', index: true }),
    __metadata("design:type", String)
], DisciplinaryCase.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Low', index: true }),
    __metadata("design:type", String)
], DisciplinaryCase.prototype, "severity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], DisciplinaryCase.prototype, "incidentDate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], DisciplinaryCase.prototype, "reviewerId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], DisciplinaryCase.prototype, "reviewerName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], DisciplinaryCase.prototype, "summary", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], DisciplinaryCase.prototype, "nextSteps", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], DisciplinaryCase.prototype, "salaryDeductionRequired", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], DisciplinaryCase.prototype, "salaryDeductionApplied", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], DisciplinaryCase.prototype, "salaryDeductionAppliedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], DisciplinaryCase.prototype, "salaryDeductionAppliedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                name: { type: String },
                url: { type: String },
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], DisciplinaryCase.prototype, "attachments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], DisciplinaryCase.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], DisciplinaryCase.prototype, "updatedAt", void 0);
exports.DisciplinaryCase = DisciplinaryCase = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], DisciplinaryCase);
exports.DisciplinaryCaseSchema = mongoose_1.SchemaFactory.createForClass(DisciplinaryCase);
exports.DisciplinaryCaseSchema.index({ employeeName: 'text', summary: 'text' });
exports.DisciplinaryCaseSchema.index({ entity: 1, createdAt: -1 });
//# sourceMappingURL=disciplinary-case.schema.js.map