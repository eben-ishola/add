import { Document, Types } from 'mongoose';
export type TaxConfigDocument = TaxConfig & Document;
export declare class TaxBracket {
    minIncome: number;
    maxIncome?: number | null;
    rate: number;
    baseTax: number;
}
export declare const TaxBracketSchema: import("mongoose").Schema<TaxBracket, import("mongoose").Model<TaxBracket, any, any, any, Document<unknown, any, TaxBracket, any, {}> & TaxBracket & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TaxBracket, Document<unknown, {}, import("mongoose").FlatRecord<TaxBracket>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<TaxBracket> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare class TaxConfig {
    configName: string;
    entity?: Types.ObjectId | string | null;
    isActive: boolean;
    currency: string;
    exemptLimit?: number | null;
    brackets: TaxBracket[];
    useProgressiveTaxCalculation?: boolean;
    effectiveFrom?: Date;
    effectiveTo?: Date;
    yearPassed?: number;
}
export declare const TaxConfigSchema: import("mongoose").Schema<TaxConfig, import("mongoose").Model<TaxConfig, any, any, any, Document<unknown, any, TaxConfig, any, {}> & TaxConfig & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TaxConfig, Document<unknown, {}, import("mongoose").FlatRecord<TaxConfig>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<TaxConfig> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
