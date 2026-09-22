import mongoose, { Document } from 'mongoose';
export type ExpenseAccountDocument = ExpenseAccount & Document;
export declare class ExpenseAccount {
    type: string;
    name: string;
    acct: string;
    entity?: mongoose.Types.ObjectId | null;
    active: boolean;
}
export declare const ExpenseAccountSchema: mongoose.Schema<ExpenseAccount, mongoose.Model<ExpenseAccount, any, any, any, mongoose.Document<unknown, any, ExpenseAccount, any, {}> & ExpenseAccount & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, ExpenseAccount, mongoose.Document<unknown, {}, mongoose.FlatRecord<ExpenseAccount>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<ExpenseAccount> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
