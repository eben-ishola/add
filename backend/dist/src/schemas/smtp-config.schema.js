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
exports.SmtpConfigSchema = exports.SmtpConfig = exports.MAIL_PROVIDER_PRESETS = exports.MAIL_PROVIDERS = void 0;
const mongoose_1 = require("@nestjs/mongoose");
exports.MAIL_PROVIDERS = ['smtp', 'sendgrid', 'brevo'];
exports.MAIL_PROVIDER_PRESETS = {
    smtp: null,
    sendgrid: {
        label: 'Twilio SendGrid',
        host: 'smtp.sendgrid.net',
        port: 587,
        username: 'apikey',
        usernameLabel: 'Fixed by SendGrid',
        secretLabel: 'SendGrid API key',
    },
    brevo: {
        label: 'Brevo',
        host: 'smtp-relay.brevo.com',
        port: 587,
        usernameLabel: 'Brevo SMTP login',
        secretLabel: 'Brevo SMTP key',
    },
};
let SmtpConfig = class SmtpConfig {
};
exports.SmtpConfig = SmtpConfig;
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], SmtpConfig.prototype, "enabled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], SmtpConfig.prototype, "payrollEmailEnabled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: exports.MAIL_PROVIDERS, default: 'smtp' }),
    __metadata("design:type", String)
], SmtpConfig.prototype, "provider", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: 'smtp-relay.brevo.com' }),
    __metadata("design:type", String)
], SmtpConfig.prototype, "host", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 587 }),
    __metadata("design:type", Number)
], SmtpConfig.prototype, "port", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], SmtpConfig.prototype, "secure", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], SmtpConfig.prototype, "username", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SmtpConfig.prototype, "password", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], SmtpConfig.prototype, "fromEmail", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], SmtpConfig.prototype, "fromName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SmtpConfig.prototype, "headerText", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SmtpConfig.prototype, "footerText", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SmtpConfig.prototype, "headerHtml", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SmtpConfig.prototype, "footerHtml", void 0);
exports.SmtpConfig = SmtpConfig = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], SmtpConfig);
exports.SmtpConfigSchema = mongoose_1.SchemaFactory.createForClass(SmtpConfig);
//# sourceMappingURL=smtp-config.schema.js.map