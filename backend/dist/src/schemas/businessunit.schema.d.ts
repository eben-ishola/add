import mongoose, { Document } from 'mongoose';
export declare const UNIT_TYPES: readonly ["sme", "retail", "savings", "afl"];
export type UnitType = (typeof UNIT_TYPES)[number];
export declare class BusinessUnit {
    BU_NM: string;
    BU_ID: number;
    BU_NO: number;
    unit?: UnitType | null;
    address?: string | null;
    subsidiary?: mongoose.Types.ObjectId | null;
    territory?: mongoose.Types.ObjectId | null;
    createdAt?: Date;
    updatedAt?: Date;
}
export type BusinessUnitDocument = Document & BusinessUnit;
export declare const BusinessUnitSchema: mongoose.Schema<BusinessUnit, mongoose.Model<BusinessUnit, any, any, any, mongoose.Document<unknown, any, BusinessUnit, any, {}> & BusinessUnit & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, BusinessUnit, mongoose.Document<unknown, {}, mongoose.FlatRecord<BusinessUnit>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<BusinessUnit> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
