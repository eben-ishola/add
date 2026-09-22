import { Document } from 'mongoose';
export type KpiCategoryDocument = KpiCategory & Document;
export declare class KpiCategory {
    slug: string;
    name: string;
    description?: string;
}
export declare const KpiCategorySchema: import("mongoose").Schema<KpiCategory, import("mongoose").Model<KpiCategory, any, any, any, Document<unknown, any, KpiCategory, any, {}> & KpiCategory & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, KpiCategory, Document<unknown, {}, import("mongoose").FlatRecord<KpiCategory>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<KpiCategory> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
