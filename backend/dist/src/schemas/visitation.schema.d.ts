import { Document } from 'mongoose';
export type VisitationDocument = Visitation & Document;
declare class ServiceLengthVisitation {
    lengths: string;
    visitation: number;
}
export declare class Visitation {
    category: string;
    dailyMobilization: number;
    productMixPercentage: number;
    serviceLengths: ServiceLengthVisitation[];
}
export declare const VisitationSchema: import("mongoose").Schema<Visitation, import("mongoose").Model<Visitation, any, any, any, Document<unknown, any, Visitation, any, {}> & Visitation & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Visitation, Document<unknown, {}, import("mongoose").FlatRecord<Visitation>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Visitation> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export {};
