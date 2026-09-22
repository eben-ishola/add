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
exports.ResetPasswordDto = exports.VerifyPasswordResetDto = exports.RequestPasswordResetDto = exports.ChangePasswordDto = void 0;
const class_validator_1 = require("class-validator");
const request_source_dto_1 = require("./request-source.dto");
class ChangePasswordDto extends request_source_dto_1.RequestSourceDto {
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
class RequestPasswordResetDto extends request_source_dto_1.RequestSourceDto {
}
exports.RequestPasswordResetDto = RequestPasswordResetDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RequestPasswordResetDto.prototype, "email", void 0);
class VerifyPasswordResetDto extends request_source_dto_1.RequestSourceDto {
}
exports.VerifyPasswordResetDto = VerifyPasswordResetDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], VerifyPasswordResetDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyPasswordResetDto.prototype, "token", void 0);
class ResetPasswordDto extends VerifyPasswordResetDto {
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
//# sourceMappingURL=auth-request.dto.js.map