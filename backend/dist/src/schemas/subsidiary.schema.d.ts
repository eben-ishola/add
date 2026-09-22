import { Document } from 'mongoose';
export declare class Subsidiary extends Document {
    name: string;
    short: string;
    gl: string;
}
export declare const SubsidiarySchema: import("mongoose").Schema<Subsidiary, import("mongoose").Model<Subsidiary, any, any, any, Document<unknown, any, Subsidiary, any, {}> & Subsidiary & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Subsidiary, Document<unknown, {}, import("mongoose").FlatRecord<Subsidiary>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Subsidiary> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export type SubsidiaryDocument = Subsidiary & Document;
