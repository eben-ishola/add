import mongoose, { Document } from 'mongoose';
export type ExpenseBudgetDocument = ExpenseBudget & Document;
export declare class ExpenseBudget {
    entity: mongoose.Types.ObjectId;
    expenseAccount: mongoose.Types.ObjectId;
    year: number;
    description?: string;
    monthlyAllocation: number[];
    committed: number;
    spent: number;
    active: boolean;
    updatedBy?: string | null;
}
export declare const ExpenseBudgetSchema: mongoose.Schema<ExpenseBudget, mongoose.Model<ExpenseBudget, any, any, any, mongoose.Document<unknown, any, ExpenseBudget, any, {}> & ExpenseBudget & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, ExpenseBudget, mongoose.Document<unknown, {}, mongoose.FlatRecord<ExpenseBudget>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<ExpenseBudget> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
