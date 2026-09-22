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
exports.FinanceCommentDto = exports.PayrollApprovalRejectDto = exports.PayrollApprovalApproveDto = exports.PayrollApprovalCommentDto = void 0;
const class_validator_1 = require("class-validator");
class PayrollApprovalCommentDto {
}
exports.PayrollApprovalCommentDto = PayrollApprovalCommentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayrollApprovalCommentDto.prototype, "initiatorComment", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayrollApprovalCommentDto.prototype, "reviewerComment", void 0);
class PayrollApprovalApproveDto {
}
exports.PayrollApprovalApproveDto = PayrollApprovalApproveDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayrollApprovalApproveDto.prototype, "comment", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayrollApprovalApproveDto.prototype, "reviewerComment", void 0);
class PayrollApprovalRejectDto {
}
exports.PayrollApprovalRejectDto = PayrollApprovalRejectDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PayrollApprovalRejectDto.prototype, "reason", void 0);
class FinanceCommentDto {
}
exports.FinanceCommentDto = FinanceCommentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinanceCommentDto.prototype, "comment", void 0);
//# sourceMappingURL=payroll-approval.dto.js.map