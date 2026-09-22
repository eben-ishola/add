import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { TransportAllowanceDocument } from '../../schemas/transport-allowance.schema';
import { TransportAllowanceSettingDocument } from '../../schemas/transport-allowance-setting.schema';
import { Department } from '../../schemas/department.schema';
import { Role } from '../../schemas/role.schema';
import { Subsidiary } from '../../schemas/subsidiary.schema';
import { TransportWorkflowConfigDocument } from '../../schemas/transport-workflow.schema';
import { TransportAllowanceApproval } from '../../schemas/transport-allowance-approval.schema';
import { NoticeService } from 'src/services/comms/notice.service';
import { WorkflowNotifier } from 'src/services/comms/workflow-notifier.service';
import { UserDocument } from '../../schemas/user.schema';
import { BranchDocument } from '../../schemas/branch.schema';
export declare class TransportAllowanceService implements OnModuleInit {
    private readonly transportModel;
    private readonly transportSettingModel;
    private readonly departmentModel;
    private readonly roleModel;
    private readonly subsidiaryModel;
    private readonly transportWorkflowModel;
    private readonly transportApprovalModel;
    private readonly userModel;
    private readonly branchModel;
    private readonly noticeService;
    private readonly workflowNotifier?;
    private static readonly TRANSPORT_APPROVAL_STATUS;
    constructor(transportModel: Model<TransportAllowanceDocument>, transportSettingModel: Model<TransportAllowanceSettingDocument>, departmentModel: Model<Department>, roleModel: Model<Role>, subsidiaryModel: Model<Subsidiary>, transportWorkflowModel: Model<TransportWorkflowConfigDocument>, transportApprovalModel: Model<TransportAllowanceApproval>, userModel: Model<UserDocument>, branchModel: Model<BranchDocument>, noticeService: NoticeService, workflowNotifier?: WorkflowNotifier);
    private buildBranchByLowerName;
    onModuleInit(): Promise<void>;
    private normalizeObjectId;
    private toNumber;
    private normalizeAmount;
    private normalizeFrequency;
    private normalizeText;
    private normalizeTransportLevel;
    private normalizeUserId;
    private normalizeUserIdentifierValue;
    private getUserIdentifierVariants;
    private getUserIdentifierSet;
    private listIncludesUserIdentifier;
    private composeUserName;
    private static readonly SUPER_ADMIN_ROLE_NAMES;
    private extractRoleNames;
    private extractPermissionNames;
    private hasGlobalAccess;
    private userHasAnyPermission;
    private workflowHasUserInRoles;
    private assertTransportWorkflowAccess;
    private canViewApproval;
    private canReviewApproval;
    private canApproveApproval;
    private canPostApproval;
    private normalizeUserIdList;
    private resolveStageFromStatus;
    private buildTransportApprovalLink;
    private normalizeApprovalCurrentStage;
    private resolveNamedValue;
    private normalizeUserLookupValue;
    private collectApprovalUserIds;
    private buildUserNameDirectory;
    private resolveUserLabel;
    private enrichApprovalDisplayNames;
    private escapeRegex;
    private pickRowValue;
    private resolveEntityForSettingRow;
    private resolveDepartmentForSettingRow;
    private resolveRoleForSettingRow;
    private resolveContext;
    private resolveBatchContext;
    private buildProrationRows;
    list(filters: {
        entity?: string;
        department?: string;
        staff?: string;
        year?: string | number;
        month?: string | number;
        weekOfMonth?: string | number;
    }, user?: any): Promise<{
        status: number;
        data: (import("mongoose").FlattenMaps<TransportAllowanceDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    listSettings(filters: {
        entity?: string;
        transportLevel?: string;
        page?: string | number;
        limit?: string | number;
    }, user?: any): Promise<{
        status: number;
        data: (import("mongoose").FlattenMaps<TransportAllowanceSettingDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    } | {
        status: number;
        data: (import("mongoose").FlattenMaps<TransportAllowanceSettingDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
        total?: undefined;
        page?: undefined;
        limit?: undefined;
        totalPages?: undefined;
    }>;
    getWorkflowConfigs(entity?: string, user?: any): Promise<{
        status: number;
        data: (import("mongoose").FlattenMaps<TransportWorkflowConfigDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    saveWorkflowConfig(payload: any): Promise<{
        status: number;
        data: import("mongoose").FlattenMaps<TransportWorkflowConfigDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        };
    }>;
    upsertSetting(payload: any): Promise<{
        status: number;
        data: import("mongoose").FlattenMaps<TransportAllowanceSettingDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        };
    }>;
    bulkUpsertSettings(rows: Array<Record<string, any>>, options?: {
        entity?: string;
    }): Promise<{
        status: number;
        processed: number;
        imported: number;
        skipped: number;
        updated: number;
        upserted: number;
        errors: {
            row: number;
            field?: string;
            error: string;
        }[];
    }>;
    deleteSetting(id: string): Promise<{
        status: number;
        deleted: boolean;
    }>;
    preview(payload: any, user?: any): Promise<{
        status: number;
        data: {
            staff: string;
            entity: string;
            department: string;
            year: number;
            month: number;
            weekOfMonth: number;
            staffId: any;
            staffName: any;
            addosserAccount: any;
            baseDays: number;
            days: number;
            baseAmount: number;
            proratedAmount: number;
        }[];
        totals: {
            total: number;
        };
    }>;
    generate(payload: any, user?: any): Promise<{
        status: number;
        data: {
            id: string;
            staff: string;
            staffObjectId: string;
            staffId: string;
            name: string;
            addosserAccount: string;
            departmentId: string;
            transportLevel: string;
            baseAmount: number;
            baseDays: number;
            days: number;
            proratedAmount: number;
            year: number;
            month: number;
            weekOfMonth: number;
            frequency: "weekly" | "monthly";
            entity: string;
            department: string;
        }[];
        totals: {
            total: number;
        };
    }>;
    upsert(payload: any, user?: any): Promise<{
        status: number;
        updated: number;
        upserted: number;
    }>;
    submitForReview(payload: any, actor: any): Promise<{
        status: number;
        message: string;
        approvalId: unknown;
    }>;
    getApprovals(user: any, options?: {
        status?: string;
        entity?: string;
        assignedOnly?: boolean;
        assignedId?: string;
    }): Promise<{
        status: number;
        data: any[];
    }>;
    getApprovalById(id: string, user: any): Promise<{
        status: number;
        data: any;
    }>;
    private backfillApprovalAddosserAccounts;
    private assertFinanceCommenter;
    updateFinanceComment(id: string, user: any, comment?: string): Promise<{
        status: number;
        message: string;
    }>;
    approveApproval(id: string, user: any, comment?: string): Promise<{
        status: number;
        message: string;
    }>;
    rejectApproval(id: string, user: any, reason?: string): Promise<{
        status: number;
        message: string;
    }>;
    markPostingComplete(id: string, user: any): Promise<{
        status: number;
        message: string;
    }>;
    switchApprovalAccount(_user: any, approvalId: string, staffId: string, accountType: string): Promise<any>;
    switchApprovalAccountForAll(_user: any, approvalId: string, accountType: string): Promise<any>;
    getWorkflowRole(user: any, options?: {
        entity?: string;
        scanAll?: boolean;
    }): Promise<{
        status: number;
        data: {
            isReviewer: boolean;
            isFinalApprover: boolean;
            isPoster: boolean;
            isAuditViewer: boolean;
            isInitiator: boolean;
            isFinance: boolean;
            entities: string[];
            entityCount: number;
        };
    }>;
}
