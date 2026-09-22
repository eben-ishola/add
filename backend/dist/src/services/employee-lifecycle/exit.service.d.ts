import { Model } from 'mongoose';
import { ExitRequestDocument } from 'src/schemas/exit-request.schema';
import { ExitClearanceDocument } from 'src/schemas/exit-clearance.schema';
import { User } from 'src/schemas/user.schema';
import { ExitInterviewDocument } from 'src/schemas/exit-interview.schema';
import { ExitWorkflowDocument } from 'src/schemas/exit-workflow.schema';
import { MailService } from 'src/services/comms/mail.service';
export type ExitActor = {
    id: string;
    name: string;
    isHr: boolean;
    isSuperAdmin: boolean;
};
export declare class ExitService {
    private readonly requestModel;
    private readonly clearanceModel;
    private readonly userModel;
    private readonly departmentModel?;
    private readonly workflowModel?;
    private readonly mailService?;
    private readonly payrollConfigModel?;
    private readonly interviewModel?;
    constructor(requestModel: Model<ExitRequestDocument>, clearanceModel: Model<ExitClearanceDocument>, userModel: Model<User>, departmentModel?: Model<any>, workflowModel?: Model<ExitWorkflowDocument>, mailService?: MailService, payrollConfigModel?: Model<any>, interviewModel?: Model<ExitInterviewDocument>);
    private text;
    private objectId;
    private optionalObjectId;
    private toDate;
    private startOfDay;
    private noticePeriod;
    private appendHistory;
    canSeeDetail(doc: any, actor: ExitActor): boolean;
    isLineManagerOf(doc: any, actor: ExitActor): boolean;
    mapRequest(doc: any, actor: ExitActor): {
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
    };
    listMine(actor: ExitActor): Promise<({
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
    list(filters: {
        status?: string;
        search?: string;
    }, actor: ExitActor): Promise<({
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
    getOne(id: string, actor: ExitActor): Promise<{
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
    private buildClearance;
    exitAccountFor(entity: any): Promise<string>;
    applyExitPayouts(rows: any[], options: {
        entity?: any;
        runDate?: Date | string | null;
    }): Promise<any[]>;
    notifyLineManager(request: any, exitDate: Date): Promise<boolean>;
    private resolveDepartmentName;
    private hrActor;
    commenceExit(staffId: any, rawExitDate: any, actor: {
        id?: string;
        name?: string;
    }): Promise<{
        created: boolean;
        requestId: string;
        clearanceId: string;
    }>;
    getMyClearance(actor: ExitActor): Promise<{
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
    resolveAccess(user: any, actor: ExitActor): Promise<{
        isHr: boolean;
        isStageMember: boolean;
        isLineManager: boolean;
        canSeeClearance: boolean;
        stages: any;
    }>;
    stageKeyFrom(label: string, taken: Set<string>): string;
    getWorkflowConfig(entity: string, actor: ExitActor): Promise<{
        entity: string;
        hrIds: any;
        usingDefaults: boolean;
        stages: any;
    }>;
    saveWorkflowConfig(payload: any, actor: ExitActor): Promise<{
        status: number;
        data: import("mongoose").FlattenMaps<ExitWorkflowDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        };
    }>;
    private mapClearance;
    private canEditSection;
    getClearance(id: string, user: any, actor: ExitActor): Promise<{
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
    saveSection(id: string, key: string, payload: {
        data?: Record<string, any>;
        comment?: string;
        complete?: boolean;
    }, user: any, actor: ExitActor): Promise<{
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
    setItemStatus(id: string, key: string, payload: {
        status?: string;
        comment?: string;
    }, user: any, actor: ExitActor): Promise<{
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
    outstandingSections(clearance: any): string[];
    completeClearance(id: string, actor: ExitActor): Promise<{
        status: number;
        completedAt: any;
    }>;
    attachHandover(id: string, files: any[], actor: ExitActor): Promise<{
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
    private blankInterview;
    private mapInterview;
    getMyInterview(actor: ExitActor): Promise<{
        id: string;
        exitRequestId: string;
        staffName: string;
        answers: Record<string, string>;
        submitted: boolean;
        submittedAt: string | null;
    }>;
    saveMyInterview(payload: {
        answers?: Record<string, string>;
        submit?: boolean;
    }, actor: ExitActor): Promise<{
        id: string;
        exitRequestId: string;
        staffName: string;
        answers: Record<string, string>;
        submitted: boolean;
        submittedAt: string;
    }>;
    getInterviewFor(exitRequestId: string, actor: ExitActor): Promise<{
        id: string;
        exitRequestId: string;
        staffName: string;
        answers: Record<string, string>;
        submitted: boolean;
        submittedAt: string;
    }>;
    listClearances(actor: ExitActor, user?: any): Promise<{
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
