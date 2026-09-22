import { Document } from 'mongoose';
export type ProductCategoryDocument = ProductCategory & Document;
export declare class ProductCategory {
    type: string;
    dailyMobilization: number;
    percentageContribution: number;
}
export declare const ProductCategorySchema: import("mongoose").Schema<ProductCategory, import("mongoose").Model<ProductCategory, any, any, any, Document<unknown, any, ProductCategory, any, {}> & ProductCategory & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProductCategory, Document<unknown, {}, import("mongoose").FlatRecord<ProductCategory>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ProductCategory> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
