import { Document, Types } from 'mongoose';
export declare class AppCatalog extends Document {
    name: string;
    entity: Types.ObjectId;
}
export type AppCatalogDocument = AppCatalog & Document;
export declare const AppCatalogSchema: import("mongoose").Schema<AppCatalog, import("mongoose").Model<AppCatalog, any, any, any, Document<unknown, any, AppCatalog, any, {}> & AppCatalog & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AppCatalog, Document<unknown, {}, import("mongoose").FlatRecord<AppCatalog>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<AppCatalog> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
