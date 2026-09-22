import { Document, Types } from 'mongoose';
export declare class Department {
    name: string;
    groupEmail?: string;
    entity?: Types.ObjectId | null;
    createdAt?: Date;
    updatedAt?: Date;
}
export type DepartmentDocument = Document & Department;
export declare const DepartmentSchema: import("mongoose").Schema<Department, import("mongoose").Model<Department, any, any, any, Document<unknown, any, Department, any, {}> & Department & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Department, Document<unknown, {}, import("mongoose").FlatRecord<Department>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Department> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
