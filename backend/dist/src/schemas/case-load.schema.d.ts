import { Document } from 'mongoose';
export type CaseLoadDocument = CaseLoad & Document;
export declare class CaseLoad {
    serviceLength: string;
    minimumCaseLoad: number;
}
export declare const CaseLoadSchema: import("mongoose").Schema<CaseLoad, import("mongoose").Model<CaseLoad, any, any, any, Document<unknown, any, CaseLoad, any, {}> & CaseLoad & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CaseLoad, Document<unknown, {}, import("mongoose").FlatRecord<CaseLoad>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<CaseLoad> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
