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
exports.RoleSchema = exports.Role = exports.ROLE_PROFILE_KEYS = exports.ROLE_ACCESS_SCOPES = void 0;
const mongoose_1 = require("@nestjs/mongoose");
exports.ROLE_ACCESS_SCOPES = ['group', 'entity', 'department', 'self', 'finance'];
exports.ROLE_PROFILE_KEYS = ['profile', 'supervisor', 'admin', 'super-admin'];
let Role = class Role {
};
exports.Role = Role;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, trim: true }),
    __metadata("design:type", String)
], Role.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Role.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true }),
    __metadata("design:type", String)
], Role.prototype, "app", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true }),
    __metadata("design:type", String)
], Role.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{ type: String, ref: 'Permission' }],
    }),
    __metadata("design:type", Array)
], Role.prototype, "permissions", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [String],
        enum: exports.ROLE_ACCESS_SCOPES,
        default: ['self'],
    }),
    __metadata("design:type", Array)
], Role.prototype, "scopes", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: exports.ROLE_PROFILE_KEYS,
        default: 'profile',
    }),
    __metadata("design:type", String)
], Role.prototype, "profileKey", void 0);
exports.Role = Role = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
    })
], Role);
exports.RoleSchema = mongoose_1.SchemaFactory.createForClass(Role);
//# sourceMappingURL=role.schema.js.map