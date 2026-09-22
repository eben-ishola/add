import { Document } from 'mongoose';
export type DMOIncentiveDocument = DMOIncentive & Document;
export declare class DMOIncentive {
}
export declare const DMOIncentiveSchema: import("mongoose").Schema<DMOIncentive, import("mongoose").Model<DMOIncentive, any, any, any, Document<unknown, any, DMOIncentive, any, {}> & DMOIncentive & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DMOIncentive, Document<unknown, {}, import("mongoose").FlatRecord<DMOIncentive>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<DMOIncentive> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
