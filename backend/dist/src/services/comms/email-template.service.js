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
exports.EmailTemplateService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const email_template_schema_1 = require("../../schemas/email-template.schema");
const email_templates_1 = require("../../utils/shared/email-templates");
const normalizeRequiredString = (value) => {
    if (typeof value !== 'string')
        return undefined;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
};
const normalizeOptionalString = (value) => {
    if (typeof value !== 'string')
        return undefined;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
};
const extractVariables = (...sources) => {
    const matches = new Set();
    sources.forEach((source) => {
        if (!source)
            return;
        const regex = /{{\s*([a-zA-Z0-9_.-]+)\s*}}/g;
        for (const match of source.matchAll(regex)) {
            if (match[1])
                matches.add(match[1]);
        }
    });
    return Array.from(matches).sort((a, b) => a.localeCompare(b));
};
const escapeHtml = (value) => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
const textToHtml = (text) => escapeHtml(text).replace(/\n/g, '<br>');
let EmailTemplateService = class EmailTemplateService {
    constructor(templateModel) {
        this.templateModel = templateModel;
    }
    normalizeTemplate(record) {
        if (!record)
            return null;
        const text = typeof record.text === 'string' ? record.text : undefined;
        const html = typeof record.html === 'string' && record.html.trim().length
            ? record.html
            : text
                ? textToHtml(text)
                : undefined;
        const subject = typeof record.subject === 'string' ? record.subject : '';
        const variables = Array.isArray(record.variables) && record.variables.length
            ? record.variables
            : extractVariables(subject, text, html);
        return {
            ...record,
            text,
            html,
            variables,
        };
    }
    buildDefaultTemplates() {
        const templates = [];
        const toRecord = (templateType, base) => {
            const text = base.text;
            const html = text ? textToHtml(text) : undefined;
            return {
                templateType,
                subject: base.subject,
                text,
                html,
                variables: extractVariables(base.subject, text, html),
                isActive: true,
            };
        };
        Object.entries(email_templates_1.BASE_TEMPLATES).forEach(([templateType, base]) => {
            templates.push(toRecord(templateType, base));
        });
        const jobStatusTemplate = (0, email_templates_1.buildJobStatusTemplate)();
        Object.keys(email_templates_1.JOB_STATUS_LABELS).forEach((templateType) => {
            templates.push(toRecord(templateType, jobStatusTemplate));
        });
        return templates;
    }
    async listTemplates() {
        const stored = await this.templateModel.find().lean().exec();
        const normalizedStored = stored
            .map((template) => this.normalizeTemplate(template))
            .filter(Boolean);
        const storedByType = new Map(normalizedStored
            .filter((item) => item?.templateType)
            .map((item) => [String(item.templateType), item]));
        const defaults = this.buildDefaultTemplates();
        const defaultTypes = new Set(defaults.map((item) => item.templateType));
        const merged = defaults.map((fallback) => storedByType.get(fallback.templateType) ?? fallback);
        const extras = normalizedStored.filter((item) => !defaultTypes.has(item.templateType));
        const data = [...merged, ...extras].sort((a, b) => String(a.templateType).localeCompare(String(b.templateType)));
        return { data };
    }
    normalizeVariablesInput(variables, subject, text, html) {
        if (Array.isArray(variables)) {
            const normalized = variables
                .map((value) => (typeof value === 'string' ? value.trim() : ''))
                .filter(Boolean);
            return normalized.length ? normalized : extractVariables(subject, text, html);
        }
        return extractVariables(subject, text, html);
    }
    async createTemplate(payload) {
        const templateType = normalizeRequiredString(payload?.templateType);
        const subject = normalizeRequiredString(payload?.subject);
        if (!templateType) {
            throw new Error('Template type is required.');
        }
        if (!subject) {
            throw new Error('Template subject is required.');
        }
        const existing = await this.templateModel.findOne({ templateType }).lean().exec();
        if (existing) {
            throw new Error('Template type already exists.');
        }
        const text = normalizeOptionalString(payload?.text);
        const html = normalizeOptionalString(payload?.html);
        const name = normalizeOptionalString(payload?.name);
        const description = normalizeOptionalString(payload?.description);
        const variables = this.normalizeVariablesInput(payload?.variables, subject, text, html);
        const isActive = payload?.isActive ?? true;
        const created = await this.templateModel.create({
            templateType,
            name,
            description,
            subject,
            text,
            html,
            variables,
            isActive,
        });
        return { data: this.normalizeTemplate(created.toObject()) };
    }
    async updateTemplate(id, payload) {
        if (!id) {
            throw new Error('Template identifier is required.');
        }
        const isObjectId = mongoose_2.default.isValidObjectId(id);
        const filter = isObjectId ? { _id: id } : { templateType: id };
        const existing = await this.templateModel.findOne(filter).exec();
        const incomingType = normalizeOptionalString(payload?.templateType);
        const templateType = incomingType ??
            existing?.templateType ??
            (!isObjectId ? id : undefined);
        if (!templateType) {
            throw new Error('Template type is required.');
        }
        if (incomingType && existing && incomingType !== existing.templateType) {
            const duplicate = await this.templateModel
                .findOne({ templateType: incomingType })
                .lean()
                .exec();
            if (duplicate) {
                throw new Error('Template type already exists.');
            }
        }
        const subject = payload?.subject !== undefined
            ? normalizeRequiredString(payload?.subject)
            : existing?.subject;
        if (!subject) {
            throw new Error('Template subject is required.');
        }
        const text = payload?.text !== undefined
            ? normalizeOptionalString(payload?.text)
            : existing?.text;
        const html = payload?.html !== undefined
            ? normalizeOptionalString(payload?.html)
            : existing?.html;
        const name = payload?.name !== undefined
            ? normalizeOptionalString(payload?.name)
            : existing?.name;
        const description = payload?.description !== undefined
            ? normalizeOptionalString(payload?.description)
            : existing?.description;
        const isActive = payload?.isActive !== undefined
            ? Boolean(payload?.isActive)
            : existing?.isActive ?? true;
        const variables = this.normalizeVariablesInput(payload?.variables, subject, text, html);
        const updates = {
            templateType,
            subject,
            text,
            html,
            name,
            description,
            variables,
            isActive,
        };
        if (existing) {
            Object.assign(existing, updates);
            const saved = await existing.save();
            return { data: this.normalizeTemplate(saved.toObject()) };
        }
        const created = await this.templateModel.create(updates);
        return { data: this.normalizeTemplate(created.toObject()) };
    }
    async deleteTemplate(id) {
        if (!id) {
            throw new Error('Template identifier is required.');
        }
        const filter = mongoose_2.default.isValidObjectId(id)
            ? { _id: id }
            : { templateType: id };
        const removed = await this.templateModel.findOneAndDelete(filter).lean().exec();
        return { deleted: Boolean(removed) };
    }
};
exports.EmailTemplateService = EmailTemplateService;
exports.EmailTemplateService = EmailTemplateService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(email_template_schema_1.EmailTemplate.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], EmailTemplateService);
//# sourceMappingURL=email-template.service.js.map