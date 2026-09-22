import mongoose, { Model } from 'mongoose';
import { CompensationOthers, CompensationOthersDocument } from '../../schemas/compensation-others.schema';
import { WorkflowNotifier } from 'src/services/comms/workflow-notifier.service';
interface GenerateOthersEntryDto {
    userId: string;
    staffId?: string;
    atlasAccount?: string;
    amount: number;
    baseAmount?: number;
    days?: number;
}
interface GenerateOthersWorkflowDto {
    reviewerId: string;
    approverId: string;
    posterId: string;
}
export interface GenerateOthersDto {
    entity: string;
    title: string;
    glCode: string;
    month: string;
    workflow: GenerateOthersWorkflowDto;
    entries: GenerateOthersEntryDto[];
    createdBy?: string;
}
export declare class CompensationOthersService {
    private readonly othersModel;
    private readonly userModel;
    private readonly subsidiaryModel;
    private readonly configModel?;
    private readonly workflowNotifier?;
    constructor(othersModel: Model<CompensationOthersDocument>, userModel: Model<any>, subsidiaryModel: Model<any>, configModel?: Model<any>, workflowNotifier?: WorkflowNotifier);
    private resolveEntityObjectId;
    private toObjectId;
    private normalizeIdentifier;
    private getUserIdentifierVariants;
    private static readonly SUPER_ADMIN_ROLE_NAMES;
    private extractRoleNames;
    private extractPermissionNames;
    private hasGlobalAccess;
    generate(dto: GenerateOthersDto): Promise<{
        success: true;
        data: any;
    }>;
    hasAssignmentsFor(user?: any): Promise<{
        hasAssignments: boolean;
        count: number;
    }>;
    list(filter?: {
        entity?: string;
        month?: string;
        status?: string;
        assignedOnly?: boolean;
        assignedId?: string;
    }, user?: any): Promise<(mongoose.FlattenMaps<CompensationOthersDocument> & Required<{
        _id: mongoose.FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    updateFinanceComment(id: string, user: any, comment?: string): Promise<{
        status: number;
        message: string;
    }>;
    act(id: string, stage: 'reviewer' | 'approver' | 'poster', action: 'approve' | 'reject', userId?: string): Promise<CompensationOthers & mongoose.Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    switchApprovalAccount(_user: any, othersId: string, staffId: string, accountType: string): Promise<any>;
    switchApprovalAccountForAll(_user: any, othersId: string, accountType: string): Promise<any>;
    findById(id: string): Promise<mongoose.FlattenMaps<CompensationOthersDocument> & Required<{
        _id: mongoose.FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
}
export {};
