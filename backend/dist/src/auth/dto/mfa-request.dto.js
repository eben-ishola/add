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
exports.SetMfaPolicyDto = exports.VerifyMfaChallengeDto = exports.MfaTokenDto = void 0;
const class_validator_1 = require("class-validator");
const request_source_dto_1 = require("./request-source.dto");
class MfaTokenDto extends request_source_dto_1.RequestSourceDto {
}
exports.MfaTokenDto = MfaTokenDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MfaTokenDto.prototype, "token", void 0);
class VerifyMfaChallengeDto extends request_source_dto_1.RequestSourceDto {
}
exports.VerifyMfaChallengeDto = VerifyMfaChallengeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyMfaChallengeDto.prototype, "challengeToken", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyMfaChallengeDto.prototype, "code", void 0);
class SetMfaPolicyDto extends request_source_dto_1.RequestSourceDto {
}
exports.SetMfaPolicyDto = SetMfaPolicyDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SetMfaPolicyDto.prototype, "requireForAll", void 0);
//# sourceMappingURL=mfa-request.dto.js.map