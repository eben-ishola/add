import { RemittanceService } from 'src/services/compensation/remittance.service';
export declare class RemittanceController {
    private readonly remittanceService;
    constructor(remittanceService: RemittanceService);
    createRemittance(user: any, body: any, invoiceFile?: Express.Multer.File): Promise<{
        message: string;
        data: import("../../schemas/remittance.schema").Remittance;
    }>;
    addProof(id: string, body: any, proofFile?: Express.Multer.File): Promise<{
        message: string;
        data: import("../../schemas/remittance.schema").Remittance;
    }>;
    listRemittances(type?: string, month?: string, status?: string): Promise<{
        data: (import("mongoose").FlattenMaps<import("../../schemas/remittance.schema").Remittance> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
}
