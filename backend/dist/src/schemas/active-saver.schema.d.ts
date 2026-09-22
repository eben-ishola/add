import { Document } from 'mongoose';
export type ActiveSaverDocument = ActiveSaver & Document;
declare class ServiceLength {
    lengths: string;
    numberOfCustomers: number;
}
export declare class ActiveSaver {
    productCategory: string;
    contributionPercentage: number;
    serviceLengths: ServiceLength[];
}
export declare const ActiveSaverSchema: import("mongoose").Schema<ActiveSaver, import("mongoose").Model<ActiveSaver, any, any, any, Document<unknown, any, ActiveSaver, any, {}> & ActiveSaver & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ActiveSaver, Document<unknown, {}, import("mongoose").FlatRecord<ActiveSaver>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ActiveSaver> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export {};
