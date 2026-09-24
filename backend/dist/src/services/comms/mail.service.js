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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const promises_1 = require("fs/promises");
const nodemailer = require("nodemailer");
const smtp_config_service_1 = require("./smtp-config.service");
const smtp_config_schema_1 = require("../../schemas/smtp-config.schema");
const email_templates_1 = require("../../utils/shared/email-templates");
const IMPLICIT_TLS_PORT = 465;
const SENDGRID_MAIL_SEND_URL = 'https://api.sendgrid.com/v3/mail/send';
let MailService = class MailService {
    constructor(smtpConfigService) {
        this.smtpConfigService = smtpConfigService;
        this.transporter = null;
        this.transporterKey = null;
    }
    closeTransporter() {
        const current = this.transporter;
        if (current && typeof current.close === 'function') {
            try {
                current.close();
            }
            catch (error) {
                console.error('Failed to close SMTP transporter', error);
            }
        }
        this.transporter = null;
        this.transporterKey = null;
    }
    attachTransporterErrorHandler(transporter) {
        transporter.on('error', (error) => {
            console.error('SMTP transport error', error);
            if (this.transporter === transporter) {
                this.closeTransporter();
            }
        });
    }
    normalizeLayoutSegment(value) {
        if (typeof value !== 'string')
            return undefined;
        const trimmed = value.trim();
        return trimmed.length ? trimmed : undefined;
    }
    resolveLayoutConfig(config) {
        if (!config) {
            return {};
        }
        return {
            headerText: this.normalizeLayoutSegment(config.headerText),
            footerText: this.normalizeLayoutSegment(config.footerText),
            headerHtml: this.normalizeLayoutSegment(config.headerHtml),
            footerHtml: this.normalizeLayoutSegment(config.footerHtml),
        };
    }
    getTemplateValue(variables, path) {
        if (!variables)
            return undefined;
        const segments = path.split('.');
        let current = variables;
        for (const segment of segments) {
            if (current == null)
                return undefined;
            current = current[segment];
        }
        return current;
    }
    renderTemplate(template, variables) {
        return template.replace(/{{\s*([^}]+)\s*}}/g, (_match, rawKey) => {
            const key = String(rawKey ?? '').trim();
            if (!key)
                return '';
            const value = this.getTemplateValue(variables, key);
            return value === undefined || value === null ? '' : String(value);
        });
    }
    escapeHtml(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    getButtonLinkStyle() {
        return ('display:inline-block;background:#1d4ed8;color:#ffffff !important;' +
            'text-decoration:none;padding:10px 16px;border-radius:6px;font-weight:600;');
    }
    linkifyText(value) {
        const style = this.getButtonLinkStyle();
        const buttonLabel = 'Click here to view';
        return value.replace(/(https?:\/\/[^\s<]+)/g, (match) => {
            return `<a href="${match}" target="_blank" rel="noopener noreferrer" data-email-button="1" style="${style}">${buttonLabel}</a>`;
        });
    }
    buildLayoutCss() {
        return ('<style>' +
            'a{display:inline-block;background:#1d4ed8;color:#ffffff !important;text-decoration:none;padding:10px 16px;border-radius:6px;font-weight:600}' +
            'a:visited{color:#ffffff !important}' +
            '</style>');
    }
    applyButtonStyleToAnchors(html) {
        const style = this.getButtonLinkStyle();
        return html.replace(/<a([^>]*)>/gi, (match, attrs) => {
            if (/\bdata-email-button\b/i.test(attrs))
                return match;
            if (/\bstyle\s*=/.test(attrs)) {
                const updated = attrs.replace(/style\s*=\s*(['"])(.*?)\1/i, (_m, quote, value) => {
                    const trimmed = String(value ?? '').trim();
                    const separator = trimmed && !trimmed.endsWith(';') ? ';' : '';
                    return `style=${quote}${trimmed}${separator}${style}${quote}`;
                });
                return `<a${updated}>`;
            }
            const prefix = attrs ? `${attrs} ` : ' ';
            return `<a${prefix}style="${style}">`;
        });
    }
    textToHtml(text) {
        const escaped = this.escapeHtml(text);
        const linked = this.linkifyText(escaped);
        return linked.replace(/\n/g, '<br>');
    }
    applyLayout(text, html, layout) {
        const headerText = layout.headerText;
        const footerText = layout.footerText;
        const layoutCss = this.buildLayoutCss();
        const headerHtml = layout.headerHtml ?? (headerText ? this.textToHtml(headerText) : undefined);
        const footerHtml = layout.footerHtml ?? (footerText ? this.textToHtml(footerText) : undefined);
        const headerHtmlWithCss = layoutCss ? `${layoutCss}${headerHtml ?? ''}` : headerHtml;
        let nextText = text;
        if (headerText) {
            nextText = nextText ? `${headerText}\n\n${nextText}` : headerText;
        }
        if (footerText) {
            nextText = nextText ? `${nextText}\n\n${footerText}` : footerText;
        }
        let nextHtml = html;
        if (!nextHtml && nextText) {
            nextHtml = this.textToHtml(nextText);
        }
        if (headerHtmlWithCss) {
            nextHtml = nextHtml ? `${headerHtmlWithCss}<br><br>${nextHtml}` : headerHtmlWithCss;
        }
        if (footerHtml) {
            nextHtml = nextHtml ? `${nextHtml}<br><br>${footerHtml}` : footerHtml;
        }
        if (nextHtml) {
            nextHtml = this.applyButtonStyleToAnchors(nextHtml);
        }
        return { text: nextText, html: nextHtml };
    }
    isJobStatusTemplate(templateType) {
        return Object.prototype.hasOwnProperty.call(email_templates_1.JOB_STATUS_LABELS, templateType);
    }
    resolveTemplate(templateType, variables) {
        let base = email_templates_1.BASE_TEMPLATES[templateType] ?? null;
        let resolvedVariables = variables ?? {};
        if (!base && this.isJobStatusTemplate(templateType)) {
            const statusLabel = email_templates_1.JOB_STATUS_LABELS[templateType] ?? templateType;
            const statusMessage = email_templates_1.JOB_STATUS_MESSAGES[templateType] ??
                'We will keep you updated on the next steps.';
            base = (0, email_templates_1.buildJobStatusTemplate)();
            resolvedVariables = {
                companyName: 'Addosser',
                ...variables,
                statusLabel,
                statusMessage,
            };
        }
        if (!base) {
            return null;
        }
        const renderedSubject = this.renderTemplate(base.subject, resolvedVariables);
        const renderedText = this.renderTemplate(base.text, resolvedVariables);
        return {
            subject: renderedSubject,
            text: renderedText,
            html: this.textToHtml(renderedText),
        };
    }
    buildTransportConfig(config) {
        if (config?.enabled === false) {
            return { disabled: true };
        }
        const preset = smtp_config_schema_1.MAIL_PROVIDER_PRESETS[config?.provider ?? 'smtp'] ?? null;
        const configuredHost = typeof config?.host === 'string' ? config.host.trim() : '';
        const configuredUsername = typeof config?.username === 'string' ? config.username.trim() : '';
        const password = typeof config?.password === 'string' ? config.password.trim() : '';
        const host = preset?.host ?? configuredHost;
        const username = preset?.username ?? configuredUsername;
        const port = Number.isFinite(config?.port)
            ? Number(config?.port)
            : (preset?.port ?? 587);
        const secure = typeof config?.secure === 'boolean' ? config.secure : port === IMPLICIT_TLS_PORT;
        if (!host || !username || !password) {
            return { disabled: true };
        }
        const usernameIsDeliverable = username.includes('@') && !/@smtp-brevo.com$/i.test(username);
        const fromEmail = (typeof config?.fromEmail === 'string' && config.fromEmail.trim()) ||
            (usernameIsDeliverable ? username : '');
        if (!fromEmail) {
            console.error('SMTP is configured but no From address is set, and the relay login is not itself a deliverable address. Set the From Email in IT Admin to a sender verified with the provider.');
            return { disabled: true };
        }
        const fromName = typeof config?.fromName === 'string' && config.fromName.trim()
            ? config.fromName.trim()
            : '';
        return {
            transport: {
                host,
                port,
                secure,
                auth: {
                    user: username,
                    pass: password,
                },
            },
            from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
        };
    }
    async resolveTransporter() {
        const config = await this.smtpConfigService?.getConfig({ includeSecrets: true });
        const resolved = this.buildTransportConfig(config ?? undefined);
        const layout = this.resolveLayoutConfig(config ?? undefined);
        if ('disabled' in resolved) {
            return { disabled: true, layout };
        }
        const key = JSON.stringify(resolved.transport);
        if (!this.transporter || this.transporterKey !== key) {
            if (this.transporter) {
                this.closeTransporter();
            }
            this.transporter = nodemailer.createTransport(resolved.transport);
            this.transporterKey = key;
            this.attachTransporterErrorHandler(this.transporter);
        }
        return { transporter: this.transporter, from: resolved.from, layout };
    }
    resolveSendGridApiConfig(config) {
        const layout = this.resolveLayoutConfig(config);
        const apiKey = typeof config?.password === 'string' ? config.password.trim() : '';
        const fromEmail = typeof config?.fromEmail === 'string' ? config.fromEmail.trim() : '';
        const fromName = typeof config?.fromName === 'string' ? config.fromName.trim() : '';
        if (config?.enabled === false || !apiKey || !fromEmail) {
            return { disabled: true, layout };
        }
        return { apiKey, fromEmail, fromName: fromName || undefined, layout };
    }
    async sendWithSendGridApi(config, message, attachments) {
        const content = [
            ...(message.text ? [{ type: 'text/plain', value: message.text }] : []),
            ...(message.html ? [{ type: 'text/html', value: message.html }] : []),
        ];
        const encodedAttachments = attachments?.length
            ? await Promise.all(attachments.map(async (attachment) => ({
                filename: attachment.filename,
                content: (await (0, promises_1.readFile)(attachment.path)).toString('base64'),
                disposition: 'attachment',
            })))
            : undefined;
        const response = await axios_1.default.post(SENDGRID_MAIL_SEND_URL, {
            personalizations: [{ to: [{ email: message.to }] }],
            from: { email: config.fromEmail, ...(config.fromName ? { name: config.fromName } : {}) },
            subject: message.subject,
            content,
            ...(encodedAttachments ? { attachments: encodedAttachments } : {}),
        }, {
            headers: {
                Authorization: `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
            },
            validateStatus: (status) => status >= 200 && status < 300,
        });
        console.log('Email sent through SendGrid API: ' + response.status);
        return response.data;
    }
    logSendError(error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error('Error sending email:', {
                message: error.message,
                status: error.response?.status,
                response: error.response?.data,
            });
            return;
        }
        console.error('Error sending email:', error);
    }
    async send(options) {
        return this.sendMail(options);
    }
    async sendMail(options) {
        try {
            const to = typeof options.to === 'string' ? options.to.trim() : '';
            if (!to) {
                return { success: false, message: 'Recipient email is required.' };
            }
            let subject;
            let text;
            let html;
            if ('templateType' in options) {
                const template = this.resolveTemplate(options.templateType, options.templateVariables ?? {});
                subject = options.subject ?? template?.subject;
                text = options.text ?? template?.text;
                html = options.html ?? template?.html;
            }
            else {
                subject = options.subject;
                text = options.text;
                html = options.html;
            }
            if (!subject) {
                return { success: false, message: 'Email subject is required.' };
            }
            if (!text && !html) {
                return { success: false, message: 'Email body is required.' };
            }
            const config = await this.smtpConfigService?.getConfig({ includeSecrets: true });
            if (config?.provider === 'sendgrid_api') {
                const sendGrid = this.resolveSendGridApiConfig(config);
                if ('disabled' in sendGrid) {
                    return { success: false, message: 'Email sending is disabled.' };
                }
                const body = this.applyLayout(text, html, sendGrid.layout);
                const info = await this.sendWithSendGridApi(sendGrid, {
                    to,
                    subject,
                    text: body.text,
                    html: body.html ?? body.text,
                });
                return { success: true, message: 'Email sent successfully', info };
            }
            const resolved = await this.resolveTransporter();
            if (resolved?.disabled || !resolved?.transporter) {
                return { success: false, message: 'Email sending is disabled.' };
            }
            const body = this.applyLayout(text, html, resolved.layout ?? {});
            const mailOptions = {
                from: resolved.from,
                to,
                subject,
                text: body.text,
                html: body.html ?? body.text,
            };
            const info = await resolved.transporter.sendMail(mailOptions);
            console.log('Email sent: ' + info.response);
            return { success: true, message: 'Email sent successfully', info };
        }
        catch (error) {
            this.logSendError(error);
            return { success: false, message: 'Error sending email', error };
        }
    }
    async sendMailWithAttachment(filePath, fileName, toEmail) {
        const to = typeof toEmail === 'string' ? toEmail.trim() : '';
        if (!to) {
            return { success: false, message: 'Recipient email is required.' };
        }
        const mailOptions = {
            to,
            subject: 'Payroll Batch Attachment',
            text: 'Please find the payroll batch CSV attached.',
            attachments: [
                {
                    filename: fileName,
                    path: filePath,
                },
            ],
        };
        try {
            const config = await this.smtpConfigService?.getConfig({ includeSecrets: true });
            if (config?.provider === 'sendgrid_api') {
                const sendGrid = this.resolveSendGridApiConfig(config);
                if ('disabled' in sendGrid) {
                    return { success: false, message: 'Email sending is disabled.' };
                }
                const body = this.applyLayout(mailOptions.text, undefined, sendGrid.layout);
                const info = await this.sendWithSendGridApi(sendGrid, {
                    to,
                    subject: mailOptions.subject,
                    text: body.text,
                    html: body.html ?? body.text,
                }, [{ filename: fileName, path: filePath }]);
                return { success: true, message: 'Email sent successfully', info };
            }
            const resolved = await this.resolveTransporter();
            if (resolved?.disabled || !resolved?.transporter) {
                return { success: false, message: 'Email sending is disabled.' };
            }
            mailOptions.from = resolved.from;
            const body = this.applyLayout(mailOptions.text, undefined, resolved.layout ?? {});
            mailOptions.text = body.text;
            mailOptions.html = body.html ?? body.text;
            const info = await resolved.transporter.sendMail(mailOptions);
            console.log('Email sent: ' + info.response);
            return { success: true, message: 'Email sent successfully', info };
        }
        catch (error) {
            this.logSendError(error);
            return { success: false, message: 'Error sending email', error };
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [smtp_config_service_1.SmtpConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map