import { Document } from 'mongoose';
export type RemittanceType = 'NHF' | 'Pension';
export type RemittanceStatus = 'INVOICE_SUBMITTED' | 'PROOF_SUBMITTED';
export declare class Remittance extends Document {
    type: RemittanceType;
    periodMonth: string;
    invoiceNote?: string;
    invoiceFileName?: string;
    proofNote?: string;
    proofFileName?: string;
    status: RemittanceStatus;
    requestedBy?: string;
    requestedByName?: string;
}
export declare const RemittanceSchema: import("mongoose").Schema<Remittance, import("mongoose").Model<Remittance, any, any, any, Document<unknown, any, Remittance, any, {}> & Remittance & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Remittance, Document<unknown, {}, import("mongoose").FlatRecord<Remittance>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Remittance> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
