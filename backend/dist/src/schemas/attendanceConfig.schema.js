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
exports.AttendanceConfigSchema = exports.AttendanceConfig = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let AttendanceConfig = class AttendanceConfig {
};
exports.AttendanceConfig = AttendanceConfig;
__decorate([
    (0, mongoose_1.Prop)({ default: '09:00' }),
    __metadata("design:type", String)
], AttendanceConfig.prototype, "startOfBusiness", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '17:00' }),
    __metadata("design:type", String)
], AttendanceConfig.prototype, "closeOfBusiness", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '08:00' }),
    __metadata("design:type", String)
], AttendanceConfig.prototype, "clockInWindowStart", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '09:05' }),
    __metadata("design:type", String)
], AttendanceConfig.prototype, "lateThresholdTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '09:30' }),
    __metadata("design:type", String)
], AttendanceConfig.prototype, "absentThresholdTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], AttendanceConfig.prototype, "excludeWeekends", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], AttendanceConfig.prototype, "publicHolidays", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], AttendanceConfig.prototype, "publicHolidayAdditions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], AttendanceConfig.prototype, "publicHolidayRemovals", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], AttendanceConfig.prototype, "enableAutoAbsent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], AttendanceConfig.prototype, "enableAutoClockOut", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 15 }),
    __metadata("design:type", Number)
], AttendanceConfig.prototype, "gracePeriodInMinutes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], AttendanceConfig.prototype, "officeIps", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], AttendanceConfig.prototype, "allowLateNotes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], AttendanceConfig.prototype, "requireFacePresence", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], AttendanceConfig.prototype, "requireFaceMatch", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], AttendanceConfig.prototype, "enableFaceVerification", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 7 }),
    __metadata("design:type", Number)
], AttendanceConfig.prototype, "maxRemoteDaysPerMonth", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], AttendanceConfig.prototype, "remoteExemptStaff", void 0);
exports.AttendanceConfig = AttendanceConfig = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], AttendanceConfig);
exports.AttendanceConfigSchema = mongoose_1.SchemaFactory.createForClass(AttendanceConfig);
//# sourceMappingURL=attendanceConfig.schema.js.map