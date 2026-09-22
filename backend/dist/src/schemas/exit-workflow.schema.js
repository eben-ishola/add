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
exports.ExitWorkflowConfigSchema = exports.ExitWorkflowConfig = exports.ExitWorkflowStageSchema = exports.ExitWorkflowStage = exports.EXIT_STAGE_KEYS = exports.CONFIGURABLE_EXIT_STAGES = exports.LINE_MANAGER_STAGE_KEY = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const exit_clearance_schema_1 = require("./exit-clearance.schema");
exports.LINE_MANAGER_STAGE_KEY = 'LINE_MANAGER';
exports.CONFIGURABLE_EXIT_STAGES = exit_clearance_schema_1.CLEARANCE_SECTIONS.filter((section) => section.key !== exports.LINE_MANAGER_STAGE_KEY);
exports.EXIT_STAGE_KEYS = exports.CONFIGURABLE_EXIT_STAGES.map((section) => section.key);
let ExitWorkflowStage = class ExitWorkflowStage {
};
exports.ExitWorkflowStage = ExitWorkflowStage;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ExitWorkflowStage.prototype, "key", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ExitWorkflowStage.prototype, "label", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], ExitWorkflowStage.prototype, "unit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], ExitWorkflowStage.prototype, "order", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [mongoose_2.Types.ObjectId], ref: 'User', default: [] }),
    __metadata("design:type", Array)
], ExitWorkflowStage.prototype, "userIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [mongoose_2.Types.ObjectId], ref: 'Department', default: [] }),
    __metadata("design:type", Array)
], ExitWorkflowStage.prototype, "departmentIds", void 0);
exports.ExitWorkflowStage = ExitWorkflowStage = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ExitWorkflowStage);
exports.ExitWorkflowStageSchema = mongoose_1.SchemaFactory.createForClass(ExitWorkflowStage);
let ExitWorkflowConfig = class ExitWorkflowConfig {
};
exports.ExitWorkflowConfig = ExitWorkflowConfig;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Subsidiary', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExitWorkflowConfig.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.ExitWorkflowStageSchema], default: [] }),
    __metadata("design:type", Array)
], ExitWorkflowConfig.prototype, "stages", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [mongoose_2.Types.ObjectId], ref: 'User', default: [] }),
    __metadata("design:type", Array)
], ExitWorkflowConfig.prototype, "hrIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExitWorkflowConfig.prototype, "updatedBy", void 0);
exports.ExitWorkflowConfig = ExitWorkflowConfig = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ExitWorkflowConfig);
exports.ExitWorkflowConfigSchema = mongoose_1.SchemaFactory.createForClass(ExitWorkflowConfig);
exports.ExitWorkflowConfigSchema.index({ entity: 1 }, { unique: true });
//# sourceMappingURL=exit-workflow.schema.js.map