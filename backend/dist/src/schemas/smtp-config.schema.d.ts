import { Document } from 'mongoose';
export type SmtpConfigDocument = SmtpConfig & Document;
export type MailProvider = 'smtp' | 'sendgrid' | 'sendgrid_api' | 'brevo';
export declare const MAIL_PROVIDERS: MailProvider[];
export type MailProviderPreset = {
    label: string;
    host?: string;
    port?: number;
    username?: string;
    usernameLabel: string;
    secretLabel: string;
};
export declare const MAIL_PROVIDER_PRESETS: Record<MailProvider, MailProviderPreset | null>;
export declare class SmtpConfig {
    enabled?: boolean;
    payrollEmailEnabled?: boolean;
    provider?: MailProvider;
    host?: string;
    port?: number;
    secure?: boolean;
    username?: string;
    password?: string;
    fromEmail?: string;
    fromName?: string;
    headerText?: string;
    footerText?: string;
    headerHtml?: string;
    footerHtml?: string;
}
export declare const SmtpConfigSchema: import("mongoose").Schema<SmtpConfig, import("mongoose").Model<SmtpConfig, any, any, any, Document<unknown, any, SmtpConfig, any, {}> & SmtpConfig & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SmtpConfig, Document<unknown, {}, import("mongoose").FlatRecord<SmtpConfig>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<SmtpConfig> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
