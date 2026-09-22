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
exports.PayrollWorkflowConfigSchema = exports.PayrollWorkflowConfig = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let PayrollWorkflowConfig = class PayrollWorkflowConfig extends mongoose_2.Document {
};
exports.PayrollWorkflowConfig = PayrollWorkflowConfig;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Subsidiary', required: true, unique: true }),
    __metadata("design:type", mongoose_2.default.Schema.Types.ObjectId)
], PayrollWorkflowConfig.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], PayrollWorkflowConfig.prototype, "initiatorIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], PayrollWorkflowConfig.prototype, "reviewerIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], PayrollWorkflowConfig.prototype, "auditViewerIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], PayrollWorkflowConfig.prototype, "approverIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], PayrollWorkflowConfig.prototype, "postingIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], PayrollWorkflowConfig.prototype, "financeIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true, default: '' }),
    __metadata("design:type", String)
], PayrollWorkflowConfig.prototype, "exitAccountNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true, default: '' }),
    __metadata("design:type", String)
], PayrollWorkflowConfig.prototype, "exitAccountName", void 0);
exports.PayrollWorkflowConfig = PayrollWorkflowConfig = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PayrollWorkflowConfig);
exports.PayrollWorkflowConfigSchema = mongoose_1.SchemaFactory.createForClass(PayrollWorkflowConfig);
//# sourceMappingURL=payroll-workflow.schema.js.map