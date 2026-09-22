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
exports.ExitInterviewSchema = exports.ExitInterview = exports.EXIT_INTERVIEW_QUESTIONS = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
exports.EXIT_INTERVIEW_QUESTIONS = [
    { key: 'expectations', prompt: 'How did the job match your expectations?' },
    {
        key: 'alignment',
        prompt: 'Did you feel that the work you were doing aligned with your personal goals and interests?',
    },
    {
        key: 'tools',
        prompt: 'Did you have the tools and resources you needed to effectively do your job?',
    },
    { key: 'culture', prompt: 'How would you describe the culture of our company?' },
    { key: 'examples', prompt: 'Can you provide more information, such as specific examples?' },
    {
        key: 'retention',
        prompt: 'What could have been done for you to remain employed here?',
    },
    {
        key: 'recommend',
        prompt: 'Would you recommend this as a great place for a friend to work?',
    },
    { key: 'newRole', prompt: 'What ultimately led you to accept the new position?' },
    {
        key: 'changes',
        prompt: 'If you could change anything about your job or the company, what would you change?',
    },
    { key: 'taxId', prompt: 'What is your tax ID?' },
];
let ExitInterview = class ExitInterview {
};
exports.ExitInterview = ExitInterview;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'ExitRequest', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExitInterview.prototype, "exitRequest", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExitInterview.prototype, "staff", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], ExitInterview.prototype, "staffName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], ExitInterview.prototype, "answers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ExitInterview.prototype, "submitted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], ExitInterview.prototype, "submittedAt", void 0);
exports.ExitInterview = ExitInterview = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ExitInterview);
exports.ExitInterviewSchema = mongoose_1.SchemaFactory.createForClass(ExitInterview);
exports.ExitInterviewSchema.index({ staff: 1 }, { unique: true, partialFilterExpression: { submitted: true } });
//# sourceMappingURL=exit-interview.schema.js.map