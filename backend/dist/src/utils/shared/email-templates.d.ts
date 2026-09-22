export type MailTemplateDefinition = {
    subject: string;
    text: string;
};
export declare function buildWorkflowTemplates(moduleKey: string): Record<string, MailTemplateDefinition>;
export declare const JOB_STATUS_LABELS: Record<string, string>;
export declare const JOB_STATUS_MESSAGES: Record<string, string>;
export declare const BASE_TEMPLATES: Record<string, MailTemplateDefinition>;
export declare const buildJobStatusTemplate: () => MailTemplateDefinition;
