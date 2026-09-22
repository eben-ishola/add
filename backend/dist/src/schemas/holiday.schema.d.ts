import { Document } from 'mongoose';
export declare class Holiday {
    date: Date;
    name: string;
    description: string;
}
export type HolidayDocument = Document & Holiday;
export declare const HolidaySchema: import("mongoose").Schema<Holiday, import("mongoose").Model<Holiday, any, any, any, Document<unknown, any, Holiday, any, {}> & Holiday & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Holiday, Document<unknown, {}, import("mongoose").FlatRecord<Holiday>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Holiday> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
