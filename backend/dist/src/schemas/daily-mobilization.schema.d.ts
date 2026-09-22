import { Document } from 'mongoose';
export type DailyMobilizationDocument = DailyMobilization & Document;
declare class Mobilization {
    region: string;
    min: string;
    max: string;
}
export declare class DailyMobilization {
    lengthOfService: string;
    mobilization: Mobilization[];
}
export declare const DailyMobilizationSchema: import("mongoose").Schema<DailyMobilization, import("mongoose").Model<DailyMobilization, any, any, any, Document<unknown, any, DailyMobilization, any, {}> & DailyMobilization & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DailyMobilization, Document<unknown, {}, import("mongoose").FlatRecord<DailyMobilization>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<DailyMobilization> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export {};
