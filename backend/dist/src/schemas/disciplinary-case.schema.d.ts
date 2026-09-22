import { Document } from 'mongoose';
export type DisciplinaryCaseDocument = DisciplinaryCase & Document;
export declare class DisciplinaryCase {
    employeeId: string;
    entity?: string;
    employeeName?: string;
    department?: string;
    category?: string;
    status?: string;
    severity?: string;
    incidentDate?: Date;
    reviewerId?: string;
    reviewerName?: string;
    summary?: string;
    nextSteps?: string;
    salaryDeductionRequired?: boolean;
    salaryDeductionApplied?: boolean;
    salaryDeductionAppliedAt?: Date;
    salaryDeductionAppliedBy?: string;
    attachments: Array<{
        name: string;
        url?: string;
    }>;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const DisciplinaryCaseSchema: import("mongoose").Schema<DisciplinaryCase, import("mongoose").Model<DisciplinaryCase, any, any, any, Document<unknown, any, DisciplinaryCase, any, {}> & DisciplinaryCase & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DisciplinaryCase, Document<unknown, {}, import("mongoose").FlatRecord<DisciplinaryCase>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<DisciplinaryCase> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
