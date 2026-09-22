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
exports.UpdateStaffDto = exports.CreateStaffDto = void 0;
const class_validator_1 = require("class-validator");
class StaffRequestBaseDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffRequestBaseDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffRequestBaseDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffRequestBaseDto.prototype, "middleName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffRequestBaseDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffRequestBaseDto.prototype, "staffId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffRequestBaseDto.prototype, "staffID", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffRequestBaseDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffRequestBaseDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffRequestBaseDto.prototype, "confirmed", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffRequestBaseDto.prototype, "orbitID", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffRequestBaseDto.prototype, "orbitId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffRequestBaseDto.prototype, "transportLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffRequestBaseDto.prototype, "inconvenienceLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffRequestBaseDto.prototype, "addosserAccount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffRequestBaseDto.prototype, "atlasAccount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffRequestBaseDto.prototype, "aftaAccount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffRequestBaseDto.prototype, "application", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffRequestBaseDto.prototype, "photo", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "branch", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "additionalBranch", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "allowMultiBranch", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "department", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "businessUnit", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "entity", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "entityId", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "subsidiary", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "subsidiaryId", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "entityViewer", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "level", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "additionalRoles", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "assignedApps", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "supervisor", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "supervisorId", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "supervisor2Id", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "exitDate", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "confirmDate", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "additionalAfta", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "addToGross", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "employeeInformation", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "rent", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "rentStartDate", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "rentEndDate", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "rentStart", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "rentEnd", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "rentReceipt", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StaffRequestBaseDto.prototype, "rentSupporting", void 0);
class CreateStaffDto extends StaffRequestBaseDto {
}
exports.CreateStaffDto = CreateStaffDto;
__decorate([
    (0, class_validator_1.ValidateIf)((payload) => !payload.staffId),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateStaffDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((payload) => !payload.email),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateStaffDto.prototype, "staffId", void 0);
class UpdateStaffDto extends StaffRequestBaseDto {
}
exports.UpdateStaffDto = UpdateStaffDto;
//# sourceMappingURL=staff-request.dto.js.map