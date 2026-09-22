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
exports.UserSchema = exports.User = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const mongoose = require("mongoose");
const employeeInformation_schema_1 = require("./employeeInformation.schema");
let User = class User extends mongoose_2.Document {
};
exports.User = User;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "middleName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, ref: 'Branch' }),
    __metadata("design:type", mongoose.Schema.Types.ObjectId)
], User.prototype, "branch", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],
        default: [],
    }),
    __metadata("design:type", Array)
], User.prototype, "additionalBranch", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "allowMultiBranch", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, ref: 'Department' }),
    __metadata("design:type", mongoose.Schema.Types.ObjectId)
], User.prototype, "department", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        default: '$2b$10$b/22wbW1iGdKcuzF2aTWD.eyyeJVNuj7.gPmUCkbWYZQLu/lJbxoa',
    }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, mongoose_1.Prop)({ ref: 'BusinessUnit' }),
    __metadata("design:type", mongoose.Schema.Types.ObjectId)
], User.prototype, "businessUnit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, ref: 'Subsidiary' }),
    __metadata("design:type", mongoose.Schema.Types.ObjectId)
], User.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subsidiary' }],
        default: [],
    }),
    __metadata("design:type", Array)
], User.prototype, "entityViewer", void 0);
__decorate([
    (0, mongoose_1.Prop)({ ref: 'Level' }),
    __metadata("design:type", mongoose.Schema.Types.ObjectId)
], User.prototype, "level", void 0);
__decorate([
    (0, mongoose_1.Prop)({ ref: 'Level', default: null }),
    __metadata("design:type", mongoose.Schema.Types.ObjectId)
], User.prototype, "previousLevel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], User.prototype, "levelChangedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true, lowercase: true, default: '' }),
    __metadata("design:type", String)
], User.prototype, "transportLevel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true, lowercase: true, default: '' }),
    __metadata("design:type", String)
], User.prototype, "inconvenienceLevel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ ref: 'Role', default: null }),
    __metadata("design:type", mongoose.Schema.Types.ObjectId)
], User.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], User.prototype, "startDate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], User.prototype, "exitDate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "addosserAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "atlasAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "aftaAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "additionalAfta", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "addToGross", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "staffId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "orbitID", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], User.prototype, "dateOfBirth", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "phoneNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'FALSE' }),
    __metadata("design:type", String)
], User.prototype, "confirmed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: employeeInformation_schema_1.EmployeeInformationSchema, default: {} }),
    __metadata("design:type", employeeInformation_schema_1.EmployeeInformation)
], User.prototype, "employeeInformation", void 0);
__decorate([
    (0, mongoose_1.Prop)({ ref: 'User' }),
    __metadata("design:type", mongoose.Schema.Types.ObjectId)
], User.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ ref: 'User' }),
    __metadata("design:type", mongoose.Schema.Types.ObjectId)
], User.prototype, "supervisorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ ref: 'User' }),
    __metadata("design:type", mongoose.Schema.Types.ObjectId)
], User.prototype, "supervisor2Id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ ref: 'User' }),
    __metadata("design:type", mongoose.Schema.Types.ObjectId)
], User.prototype, "hodApproval", void 0);
__decorate([
    (0, mongoose_1.Prop)({ ref: 'User' }),
    __metadata("design:type", mongoose.Schema.Types.ObjectId)
], User.prototype, "itApproval", void 0);
__decorate([
    (0, mongoose_1.Prop)({ ref: 'User' }),
    __metadata("design:type", mongoose.Schema.Types.ObjectId)
], User.prototype, "auditApproval", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Approved' }),
    __metadata("design:type", String)
], User.prototype, "supervisorStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Approved' }),
    __metadata("design:type", String)
], User.prototype, "auditStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Approved' }),
    __metadata("design:type", String)
], User.prototype, "itStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Approved' }),
    __metadata("design:type", String)
], User.prototype, "hrStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'NONE' }),
    __metadata("design:type", String)
], User.prototype, "workflowStage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], User.prototype, "workflowType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "requiresHrApproval", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.Mixed, default: null }),
    __metadata("design:type", Object)
], User.prototype, "pendingChanges", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], User.prototype, "workflowUpdatedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], User.prototype, "rent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], User.prototype, "rentStartDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], User.prototype, "rentEndDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], User.prototype, "passwordResetToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], User.prototype, "passwordResetExpires", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], User.prototype, "passwordResetRequestedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose.Schema.Types.ObjectId)
], User.prototype, "passwordResetRequestedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
                entity: { type: mongoose.Schema.Types.ObjectId, ref: 'Subsidiary', default: null },
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], User.prototype, "additionalRoles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], User.prototype, "assignedApps", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "mfaEnabled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "mfaRequired", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "mfaExempt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null, select: false }),
    __metadata("design:type", String)
], User.prototype, "totpSecret", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [], select: false }),
    __metadata("design:type", Array)
], User.prototype, "mfaBackupCodes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], User.prototype, "mfaSetupAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], User.prototype, "mfaVerifiedAt", void 0);
exports.User = User = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], User);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
exports.UserSchema.index({ email: 1 }, { collation: { locale: 'en', strength: 2 } });
exports.UserSchema.index({ staffId: 1 }, { collation: { locale: 'en', strength: 2 } });
exports.UserSchema.index({ supervisorId: 1 });
exports.UserSchema.index({ supervisor2Id: 1 });
exports.UserSchema.index({ passwordResetToken: 1 }, { sparse: true });
exports.UserSchema.index({ entity: 1, status: 1, startDate: -1 });
exports.UserSchema.index({ entity: 1, exitDate: -1 });
exports.UserSchema.index({ workflowType: 1, workflowUpdatedAt: -1 });
exports.UserSchema.pre('save', async function (next) {
    try {
        if (this.isNew || !this.isModified('level'))
            return next();
        const stored = await this.constructor
            .findById(this._id)
            .select('level')
            .lean();
        const oldLevel = stored?.level ?? null;
        const newLevel = this.level ?? null;
        if (String(oldLevel ?? '') !== String(newLevel ?? '')) {
            this.previousLevel = oldLevel;
            this.levelChangedAt = new Date();
        }
        return next();
    }
    catch (err) {
        return next();
    }
});
//# sourceMappingURL=user.schema.js.map