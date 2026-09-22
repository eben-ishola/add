import { EmailTemplateService } from 'src/services/comms/email-template.service';
export declare class EmailTemplateController {
    private readonly emailTemplateService;
    constructor(emailTemplateService: EmailTemplateService);
    list(): Promise<{
        data: any[];
    }>;
    create(body: any): Promise<{
        data: any;
    }>;
    update(id: string, body: any): Promise<{
        data: any;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
