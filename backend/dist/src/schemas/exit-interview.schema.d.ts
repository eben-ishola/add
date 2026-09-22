import { Document, Types } from 'mongoose';
export declare const EXIT_INTERVIEW_QUESTIONS: readonly [{
    readonly key: "expectations";
    readonly prompt: "How did the job match your expectations?";
}, {
    readonly key: "alignment";
    readonly prompt: "Did you feel that the work you were doing aligned with your personal goals and interests?";
}, {
    readonly key: "tools";
    readonly prompt: "Did you have the tools and resources you needed to effectively do your job?";
}, {
    readonly key: "culture";
    readonly prompt: "How would you describe the culture of our company?";
}, {
    readonly key: "examples";
    readonly prompt: "Can you provide more information, such as specific examples?";
}, {
    readonly key: "retention";
    readonly prompt: "What could have been done for you to remain employed here?";
}, {
    readonly key: "recommend";
    readonly prompt: "Would you recommend this as a great place for a friend to work?";
}, {
    readonly key: "newRole";
    readonly prompt: "What ultimately led you to accept the new position?";
}, {
    readonly key: "changes";
    readonly prompt: "If you could change anything about your job or the company, what would you change?";
}, {
    readonly key: "taxId";
    readonly prompt: "What is your tax ID?";
}];
export type ExitInterviewQuestionKey = (typeof EXIT_INTERVIEW_QUESTIONS)[number]['key'];
export type ExitInterviewDocument = ExitInterview & Document;
export declare class ExitInterview {
    exitRequest: Types.ObjectId;
    staff: Types.ObjectId;
    staffName?: string;
    answers: Record<string, string>;
    submitted: boolean;
    submittedAt?: Date | null;
}
export declare const ExitInterviewSchema: import("mongoose").Schema<ExitInterview, import("mongoose").Model<ExitInterview, any, any, any, Document<unknown, any, ExitInterview, any, {}> & ExitInterview & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ExitInterview, Document<unknown, {}, import("mongoose").FlatRecord<ExitInterview>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ExitInterview> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
