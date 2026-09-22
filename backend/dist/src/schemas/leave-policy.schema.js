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
exports.LeavePolicySchema = exports.LeavePolicy = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let LeavePolicy = class LeavePolicy {
};
exports.LeavePolicy = LeavePolicy;
__decorate([
    (0, mongoose_1.Prop)({ default: 3 }),
    __metadata("design:type", Number)
], LeavePolicy.prototype, "noticePeriodDays", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], LeavePolicy.prototype, "requireHandoverNote", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: ['sick', 'unpaid', 'casual'] }),
    __metadata("design:type", Array)
], LeavePolicy.prototype, "noticeExemptTypes", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: {
            maternity: 90,
            paternity: 0,
            casual: 0,
            unpaid: 0,
            sick: 0,
            compassionate: 0,
        },
    }),
    __metadata("design:type", Object)
], LeavePolicy.prototype, "fixedAllocations", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], LeavePolicy.prototype, "companyGL", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], LeavePolicy.prototype, "leaveGL", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], LeavePolicy.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], LeavePolicy.prototype, "updatedAt", void 0);
exports.LeavePolicy = LeavePolicy = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], LeavePolicy);
exports.LeavePolicySchema = mongoose_1.SchemaFactory.createForClass(LeavePolicy);
//# sourceMappingURL=leave-policy.schema.js.map