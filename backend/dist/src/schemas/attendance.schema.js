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
exports.AttendanceSchema = exports.Attendance = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Attendance = class Attendance {
};
exports.Attendance = Attendance;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Attendance.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Attendance.prototype, "employeeName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Attendance.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Attendance.prototype, "entityId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Attendance.prototype, "clockIn", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Attendance.prototype, "clockOut", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Attendance.prototype, "totalHours", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['Present', 'Absent', 'Late'], default: 'Present' }),
    __metadata("design:type", String)
], Attendance.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['Office', 'Remote'], required: false }),
    __metadata("design:type", String)
], Attendance.prototype, "workMode", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Attendance.prototype, "ip", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Attendance.prototype, "city", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Attendance.prototype, "country", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Attendance.prototype, "isp", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Attendance.prototype, "clockInPhotoUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Attendance.prototype, "clockOutPhotoUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Attendance.prototype, "note", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Attendance.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Attendance.prototype, "latePolicyStep", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Attendance.prototype, "latePolicyAction", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Attendance.prototype, "latePolicyMailSent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Attendance.prototype, "latePolicyMailRecipients", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Attendance.prototype, "latePolicyMailSentAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Attendance.prototype, "latePolicyProcessedAt", void 0);
exports.Attendance = Attendance = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Attendance);
exports.AttendanceSchema = mongoose_1.SchemaFactory.createForClass(Attendance);
exports.AttendanceSchema.index({ employeeId: 1, date: -1 });
exports.AttendanceSchema.index({ entity: 1, date: -1 });
exports.AttendanceSchema.index({ entityId: 1, date: -1 });
exports.AttendanceSchema.index({ status: 1, date: -1 });
//# sourceMappingURL=attendance.schema.js.map