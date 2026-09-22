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
exports.InconvenienceWorkflowConfigSchema = exports.InconvenienceWorkflowConfig = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let InconvenienceWorkflowConfig = class InconvenienceWorkflowConfig extends mongoose_2.Document {
};
exports.InconvenienceWorkflowConfig = InconvenienceWorkflowConfig;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.default.Schema.Types.ObjectId, ref: 'Subsidiary', required: true, unique: true }),
    __metadata("design:type", mongoose_2.default.Schema.Types.ObjectId)
], InconvenienceWorkflowConfig.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], InconvenienceWorkflowConfig.prototype, "initiatorIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], InconvenienceWorkflowConfig.prototype, "reviewerIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], InconvenienceWorkflowConfig.prototype, "auditViewerIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], InconvenienceWorkflowConfig.prototype, "approverIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], InconvenienceWorkflowConfig.prototype, "postingIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: String }], default: [] }),
    __metadata("design:type", Array)
], InconvenienceWorkflowConfig.prototype, "financeIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], InconvenienceWorkflowConfig.prototype, "inconvenienceGl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], InconvenienceWorkflowConfig.prototype, "companyGL", void 0);
exports.InconvenienceWorkflowConfig = InconvenienceWorkflowConfig = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], InconvenienceWorkflowConfig);
exports.InconvenienceWorkflowConfigSchema = mongoose_1.SchemaFactory.createForClass(InconvenienceWorkflowConfig);
//# sourceMappingURL=inconvenience-workflow.schema.js.map