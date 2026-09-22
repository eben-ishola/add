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
exports.LeaveAllowanceWorkflowConfigSchema = exports.LeaveAllowanceWorkflowConfig = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let LeaveAllowanceWorkflowConfig = class LeaveAllowanceWorkflowConfig extends mongoose_2.Document {
};
exports.LeaveAllowanceWorkflowConfig = LeaveAllowanceWorkflowConfig;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Subsidiary', required: true, unique: true }),
    __metadata("design:type", mongoose_2.default.Schema.Types.ObjectId)
], LeaveAllowanceWorkflowConfig.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], LeaveAllowanceWorkflowConfig.prototype, "initiatorIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], LeaveAllowanceWorkflowConfig.prototype, "reviewerIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], LeaveAllowanceWorkflowConfig.prototype, "auditViewerIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], LeaveAllowanceWorkflowConfig.prototype, "approverIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], LeaveAllowanceWorkflowConfig.prototype, "postingIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], LeaveAllowanceWorkflowConfig.prototype, "financeIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], LeaveAllowanceWorkflowConfig.prototype, "companyGL", void 0);
exports.LeaveAllowanceWorkflowConfig = LeaveAllowanceWorkflowConfig = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], LeaveAllowanceWorkflowConfig);
exports.LeaveAllowanceWorkflowConfigSchema = mongoose_1.SchemaFactory.createForClass(LeaveAllowanceWorkflowConfig);
//# sourceMappingURL=leave-allowance-workflow.schema.js.map