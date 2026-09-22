import { Document } from 'mongoose';
export type EmailTemplateDocument = EmailTemplate & Document;
export declare class EmailTemplate {
    templateType: string;
    name?: string;
    description?: string;
    subject: string;
    text?: string;
    html?: string;
    variables?: string[];
    isActive?: boolean;
}
export declare const EmailTemplateSchema: import("mongoose").Schema<EmailTemplate, import("mongoose").Model<EmailTemplate, any, any, any, Document<unknown, any, EmailTemplate, any, {}> & EmailTemplate & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EmailTemplate, Document<unknown, {}, import("mongoose").FlatRecord<EmailTemplate>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<EmailTemplate> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
