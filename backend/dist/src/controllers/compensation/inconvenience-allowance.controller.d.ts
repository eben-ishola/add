import { InconvenienceApprovalApproveDto, InconvenienceApprovalRejectDto } from 'src/dto/inconvenience-allowance-approval.dto';
import { FinanceCommentDto } from 'src/dto/payroll-approval.dto';
import { InconvenienceAllowanceService } from 'src/services/compensation/inconvenience-allowance.service';
export declare class InconvenienceAllowanceController {
    private readonly inconvenienceAllowanceService;
    constructor(inconvenienceAllowanceService: InconvenienceAllowanceService);
    list(user: any, entity?: string, department?: string, staff?: string, year?: string, month?: string, weekOfMonth?: string): Promise<{
        status: number;
        data: (import("mongoose").FlattenMaps<import("../../schemas/inconvenience-allowance.schema").InconvenienceAllowanceDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    listSettings(user: any, entity?: string, inconvenienceLevel?: string, page?: string, limit?: string): Promise<{
        status: number;
        data: (import("mongoose").FlattenMaps<import("../../schemas/inconvenience-allowance-setting.schema").InconvenienceAllowanceSettingDocument> & Required<{
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
        data: (import("mongoose").FlattenMaps<import("../../schemas/inconvenience-allowance-setting.schema").InconvenienceAllowanceSettingDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
        total?: undefined;
        page?: undefined;
        limit?: undefined;
        totalPages?: undefined;
    }>;
    upsertSetting(payload: any): Promise<{
        status: number;
        data: import("mongoose").FlattenMaps<import("../../schemas/inconvenience-allowance-setting.schema").InconvenienceAllowanceSettingDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        };
    }>;
    bulkUpsertSettings(file: Express.Multer.File, entity?: string): Promise<{
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
    getWorkflowConfigs(user: any, entity?: string): Promise<{
        status: number;
        data: (import("mongoose").FlattenMaps<import("../../schemas/inconvenience-workflow.schema").InconvenienceWorkflowConfigDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    saveWorkflowConfig(payload: any): Promise<{
        status: number;
        data: import("mongoose").FlattenMaps<import("../../schemas/inconvenience-workflow.schema").InconvenienceWorkflowConfigDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        };
    }>;
    upsert(payload: any, user: any): Promise<{
        status: number;
        updated: number;
        upserted: number;
    }>;
    preview(payload: any, user: any): Promise<{
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
    generate(payload: any, user: any): Promise<{
        status: number;
        data: {
            id: string;
            staff: string;
            staffObjectId: string;
            staffId: string;
            name: string;
            addosserAccount: string;
            departmentId: string;
            inconvenienceLevel: string;
            baseAmount: number;
            baseDays: number;
            days: number;
            proratedAmount: number;
            year: number;
            month: number;
            weekOfMonth: number;
            frequency: "monthly";
            entity: string;
            department: string;
        }[];
        totals: {
            total: number;
        };
    }>;
    submit(payload: any, user: any): Promise<{
        status: number;
        message: string;
        approvalId: unknown;
    }>;
    approvals(user: any, status?: string, entity?: string, assignedOnly?: string, userId?: string, assignedId?: string): Promise<{
        status: number;
        data: any[];
    }>;
    getApprovalById(id: string, user: any): Promise<{
        status: number;
        data: any;
    }>;
    approveApproval(id: string, body: InconvenienceApprovalApproveDto, user: any): Promise<{
        status: number;
        message: string;
    }>;
    rejectApproval(id: string, body: InconvenienceApprovalRejectDto, user: any): Promise<{
        status: number;
        message: string;
    }>;
    markPosted(id: string, user: any): Promise<{
        status: number;
        message: string;
    }>;
    switchAccount(id: string, body: {
        staffId?: string;
        employeeId?: string;
        accountType?: string;
        applyToAll?: boolean | string;
    }, user: any): Promise<any>;
    updateFinanceComment(id: string, body: FinanceCommentDto, user: any): Promise<{
        status: number;
        message: string;
    }>;
    getWorkflowRole(user: any, entity?: string, scanAll?: string): Promise<{
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
