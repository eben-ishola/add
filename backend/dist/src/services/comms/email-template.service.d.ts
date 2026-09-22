import { Model } from 'mongoose';
import { EmailTemplateDocument } from 'src/schemas/email-template.schema';
type TemplatePayload = {
    templateType?: string;
    name?: string;
    description?: string;
    subject?: string;
    text?: string;
    html?: string;
    variables?: string[];
    isActive?: boolean;
};
export declare class EmailTemplateService {
    private readonly templateModel;
    constructor(templateModel: Model<EmailTemplateDocument>);
    private normalizeTemplate;
    private buildDefaultTemplates;
    listTemplates(): Promise<{
        data: any[];
    }>;
    private normalizeVariablesInput;
    createTemplate(payload: TemplatePayload): Promise<{
        data: any;
    }>;
    updateTemplate(id: string, payload: TemplatePayload): Promise<{
        data: any;
    }>;
    deleteTemplate(id: string): Promise<{
        deleted: boolean;
    }>;
}
export {};
