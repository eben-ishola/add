import { Model } from 'mongoose';
import { Remittance } from 'src/schemas/remittance.schema';
type CreateRemittancePayload = {
    type: 'NHF' | 'Pension';
    periodMonth?: string;
    invoiceNote?: string;
};
type AddProofPayload = {
    proofNote?: string;
};
export declare class RemittanceService {
    private readonly remittanceModel;
    constructor(remittanceModel: Model<Remittance>);
    private normalizeMonth;
    createRemittance(user: any, payload: CreateRemittancePayload, invoiceFileName?: string): Promise<Remittance>;
    addProof(id: string, payload: AddProofPayload, proofFileName?: string): Promise<Remittance>;
    listRemittances(query: {
        type?: string;
        month?: string;
        status?: string;
    }): Promise<(import("mongoose").FlattenMaps<Remittance> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
}
export {};
