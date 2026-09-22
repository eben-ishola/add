import { ExitService } from 'src/services/employee-lifecycle/exit.service';
export declare class ExitController {
    private readonly exitService;
    constructor(exitService: ExitService);
    private actor;
    access(user: any): Promise<{
        isHr: boolean;
        isStageMember: boolean;
        isLineManager: boolean;
        canSeeClearance: boolean;
        stages: any;
    }>;
    listMine(user: any): Promise<({
        id: string;
        staffObjectId: string;
        staffName: string;
        staffId: string;
        proposedExitDate: string;
        approvedExitDate: string;
        status: any;
        submittedAt: string;
        decidedByName: string;
        decidedAt: string;
        restricted: boolean;
    } | {
        reason: string;
        noticePeriod: any;
        decisionComment: string;
        history: any;
        handoverNote: string;
        handoverAttachments: any;
        id: string;
        staffObjectId: string;
        staffName: string;
        staffId: string;
        proposedExitDate: string;
        approvedExitDate: string;
        status: any;
        submittedAt: string;
        decidedByName: string;
        decidedAt: string;
        restricted: boolean;
    })[]>;
    list(user: any, status?: string, search?: string): Promise<({
        id: string;
        staffObjectId: string;
        staffName: string;
        staffId: string;
        proposedExitDate: string;
        approvedExitDate: string;
        status: any;
        submittedAt: string;
        decidedByName: string;
        decidedAt: string;
        restricted: boolean;
    } | {
        reason: string;
        noticePeriod: any;
        decisionComment: string;
        history: any;
        handoverNote: string;
        handoverAttachments: any;
        id: string;
        staffObjectId: string;
        staffName: string;
        staffId: string;
        proposedExitDate: string;
        approvedExitDate: string;
        status: any;
        submittedAt: string;
        decidedByName: string;
        decidedAt: string;
        restricted: boolean;
    })[]>;
    getOne(id: string, user: any): Promise<{
        id: string;
        staffObjectId: string;
        staffName: string;
        staffId: string;
        proposedExitDate: string;
        approvedExitDate: string;
        status: any;
        submittedAt: string;
        decidedByName: string;
        decidedAt: string;
        restricted: boolean;
    } | {
        reason: string;
        noticePeriod: any;
        decisionComment: string;
        history: any;
        handoverNote: string;
        handoverAttachments: any;
        id: string;
        staffObjectId: string;
        staffName: string;
        staffId: string;
        proposedExitDate: string;
        approvedExitDate: string;
        status: any;
        submittedAt: string;
        decidedByName: string;
        decidedAt: string;
        restricted: boolean;
    }>;
    getWorkflowConfig(user: any, entity: string): Promise<{
        entity: string;
        hrIds: any;
        usingDefaults: boolean;
        stages: any;
    }>;
    saveWorkflowConfig(body: any, user: any): Promise<{
        status: number;
        data: import("mongoose").FlattenMaps<import("../../schemas/exit-workflow.schema").ExitWorkflowDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        };
    }>;
    attachHandover(id: string, files: Express.Multer.File[], user: any): Promise<{
        id: string;
        staffObjectId: string;
        staffName: string;
        staffId: string;
        proposedExitDate: string;
        approvedExitDate: string;
        status: any;
        submittedAt: string;
        decidedByName: string;
        decidedAt: string;
        restricted: boolean;
    } | {
        reason: string;
        noticePeriod: any;
        decisionComment: string;
        history: any;
        handoverNote: string;
        handoverAttachments: any;
        id: string;
        staffObjectId: string;
        staffName: string;
        staffId: string;
        proposedExitDate: string;
        approvedExitDate: string;
        status: any;
        submittedAt: string;
        decidedByName: string;
        decidedAt: string;
        restricted: boolean;
    }>;
    interviewQuestions(): {
        data: readonly [{
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
    };
    getMyInterview(user: any): Promise<{
        id: string;
        exitRequestId: string;
        staffName: string;
        answers: Record<string, string>;
        submitted: boolean;
        submittedAt: string | null;
    }>;
    saveMyInterview(body: any, user: any): Promise<{
        id: string;
        exitRequestId: string;
        staffName: string;
        answers: Record<string, string>;
        submitted: boolean;
        submittedAt: string;
    }>;
    getInterviewFor(id: string, user: any): Promise<{
        id: string;
        exitRequestId: string;
        staffName: string;
        answers: Record<string, string>;
        submitted: boolean;
        submittedAt: string;
    }>;
    getMyClearance(user: any): Promise<{
        data: {
            id: string;
            staffName: string;
            staffId: string;
            designation: string;
            exitDate: string;
            marketFacing: boolean;
            status: any;
            lineManagerId: string;
            items: any;
            sections: any;
        };
    }>;
    getClearance(id: string, user: any): Promise<{
        id: string;
        staffName: string;
        staffId: string;
        designation: string;
        exitDate: string;
        marketFacing: boolean;
        status: any;
        lineManagerId: string;
        items: any;
        sections: any;
    }>;
    saveSection(id: string, key: string, body: any, user: any): Promise<{
        id: string;
        staffName: string;
        staffId: string;
        designation: string;
        exitDate: string;
        marketFacing: boolean;
        status: any;
        lineManagerId: string;
        items: any;
        sections: any;
    }>;
    setItemStatus(id: string, key: string, body: any, user: any): Promise<{
        id: string;
        staffName: string;
        staffId: string;
        designation: string;
        exitDate: string;
        marketFacing: boolean;
        status: any;
        lineManagerId: string;
        items: any;
        sections: any;
    }>;
    completeClearance(id: string, user: any): Promise<{
        status: number;
        completedAt: any;
    }>;
    listClearances(user: any): Promise<{
        id: string;
        staffName: string;
        staffId: string;
        exitDate: string;
        status: any;
        itemsOutstanding: any;
        sectionsOutstanding: any;
        sections: any;
    }[]>;
}
