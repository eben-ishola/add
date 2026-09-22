import { Document, Types } from 'mongoose';
export type BudgetDocument = Budget & Document;
export declare class Budget {
    name: string;
    orbitId: Types.ObjectId;
    monthOne: string;
    monthTwo: string;
    monthThree: string;
    monthFour: string;
    monthFive: string;
    monthSix: string;
    monthSeven: string;
    monthEight: string;
    monthNine: string;
    monthTen: string;
    monthEleven: string;
    monthTwelve: string;
    type: string;
}
export declare const BudgetSchema: import("mongoose").Schema<Budget, import("mongoose").Model<Budget, any, any, any, Document<unknown, any, Budget, any, {}> & Budget & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Budget, Document<unknown, {}, import("mongoose").FlatRecord<Budget>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Budget> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
