import { SmtpConfigService } from 'src/services/comms/smtp-config.service';
type TemplateVariables = Record<string, any>;
type MailSendOptions = {
    to: string;
    subject: string;
    text?: string;
    html?: string;
};
type MailTemplateOptions = {
    to: string;
    templateType: string;
    templateVariables?: TemplateVariables;
    subject?: string;
    text?: string;
    html?: string;
};
export declare class MailService {
    private readonly smtpConfigService?;
    private transporter;
    private transporterKey;
    constructor(smtpConfigService?: SmtpConfigService);
    private closeTransporter;
    private attachTransporterErrorHandler;
    private normalizeLayoutSegment;
    private resolveLayoutConfig;
    private getTemplateValue;
    private renderTemplate;
    private escapeHtml;
    private getButtonLinkStyle;
    private linkifyText;
    private buildLayoutCss;
    private applyButtonStyleToAnchors;
    private textToHtml;
    private applyLayout;
    private isJobStatusTemplate;
    private resolveTemplate;
    private buildTransportConfig;
    private resolveTransporter;
    private resolveSendGridApiConfig;
    private sendWithSendGridApi;
    private logSendError;
    send(options: MailTemplateOptions): Promise<{
        success: boolean;
        message: string;
        info?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        info: any;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        info?: undefined;
    }>;
    sendMail(options: MailSendOptions | MailTemplateOptions): Promise<{
        success: boolean;
        message: string;
        info?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        info: any;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        info?: undefined;
    }>;
    sendMailWithAttachment(filePath: string, fileName: string, toEmail: string): Promise<any>;
}
export {};
