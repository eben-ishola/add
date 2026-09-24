import mongoose, { Model } from 'mongoose';
import { ProcurementRequisition } from 'src/schemas/procurement-requisition.schema';
import { ProcurementWorkflowDocument } from 'src/schemas/procurement-workflow.schema';
import { User } from 'src/schemas/user.schema';
import { ExpenseAccount, ExpenseAccountDocument } from 'src/schemas/expense-account.schema';
import { ExpenseBudget, ExpenseBudgetDocument } from 'src/schemas/expense-budget.schema';
import { DepartmentDocument } from 'src/schemas/department.schema';
import { WorkflowNotifier } from 'src/services/comms/workflow-notifier.service';
export declare const DEFAULT_RESOLVING_DEPARTMENTS: string[];
export declare const DEFAULT_FINANCE_DEPARTMENTS: string[];
export declare const DEFAULT_RECEIPT_GRACE_DAYS = 7;
export declare const buildOverdueReceiptQuery: (now?: Date) => Record<string, any>;
export type ProcurementWorkflowRole = {
    isReviewer: boolean;
    isApproverCandidate: boolean;
    isPoster: boolean;
    isDisburser: boolean;
    isAuditViewer: boolean;
    isSuperAdmin: boolean;
    canViewAll: boolean;
};
export declare class ProcurementService {
    private readonly requisitionModel;
    private readonly workflowModel;
    private readonly userModel;
    private readonly expenseModel;
    private readonly budgetModel;
    private readonly departmentModel;
    private readonly notifier?;
    constructor(requisitionModel: Model<ProcurementRequisition>, workflowModel: Model<ProcurementWorkflowDocument>, userModel: Model<User>, expenseModel: Model<ExpenseAccountDocument>, budgetModel: Model<ExpenseBudgetDocument>, departmentModel: Model<DepartmentDocument>, notifier?: WorkflowNotifier);
    private toObjectId;
    private optionalObjectId;
    private idString;
    private normalizeName;
    private displayName;
    private toDate;
    private toMinor;
    getWorkflowConfig(entity: string): Promise<{
        status: number;
        data: mongoose.FlattenMaps<ProcurementWorkflowDocument> & Required<{
            _id: mongoose.FlattenMaps<unknown>;
        }> & {
            __v: number;
        };
    }>;
    listApproverPool(entity: string): Promise<{
        status: number;
        data: any;
    }>;
    listResolvingDepartments(entity: string): Promise<{
        status: number;
        data: any[];
    }>;
    saveWorkflowConfig(payload: any, actorId?: string): Promise<{
        status: number;
        data: mongoose.FlattenMaps<ProcurementWorkflowDocument> & Required<{
            _id: mongoose.FlattenMaps<unknown>;
        }> & {
            __v: number;
        };
    }>;
    listExpenseTypes(): Promise<{
        status: number;
        data: string[];
    }>;
    listExpenseAccounts(type?: string): Promise<{
        status: number;
        data: (mongoose.FlattenMaps<ExpenseAccountDocument> & Required<{
            _id: mongoose.FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    createExpenseAccount(payload: any): Promise<{
        status: number;
        data: ExpenseAccount & mongoose.Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
    }>;
    importExpenseAccounts(rows: Array<Record<string, any>>): Promise<{
        status: number;
        data: {
            received: number;
            created: any;
            updated: any;
        };
    }>;
    importBudgets(rows: Array<Record<string, any>>, entity: string, actorId?: string): Promise<{
        status: number;
        data: {
            received: number;
            created: any;
            updated: any;
        };
    }>;
    listBudgets(entity?: string, year?: string): Promise<{
        status: number;
        data: any[];
    }>;
    saveBudget(payload: any, actorId?: string): Promise<{
        status: number;
        data: (mongoose.Document<unknown, {}, ExpenseBudgetDocument, {}, {}> & ExpenseBudget & mongoose.Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        }) | (ExpenseBudget & mongoose.Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        });
    }>;
    private consumptionByBudget;
    private budgetTotals;
    private budgetPositionFor;
    getBudgetPosition(entity: string, expenseAccount: string, year?: number): Promise<{
        status: number;
        data: any;
    }>;
    addAttachments(id: string, kind: string, files: Array<{
        originalname: string;
        filename: string;
        size?: number;
    }>, user: any): Promise<{
        status: number;
        data: {
            attached: number;
            attachments: import("src/schemas/procurement-requisition.schema").ProcurementAttachment[];
        };
    }>;
    resolveAttachment(id: string, storedName: string, user: any): Promise<{
        storedName: string;
        fileName: string;
    }>;
    extendReceiptDue(id: string, dueAt: string, user: any): Promise<{
        status: number;
        data: {
            receiptDueAt: Date;
        };
    }>;
    buildGlExport(filters: {
        ids?: string;
        entity?: string;
        status?: string;
    }, user: any): Promise<{
        status: number;
        data: {
            headers: string[];
            rows: string[][];
            references: string[];
            requisitions: number;
        };
    }>;
    private commitBudget;
    private settleBudget;
    private releaseBudget;
    private matchesStage;
    resolveWorkflowRole(user: any, entity?: string): Promise<ProcurementWorkflowRole>;
    private assertStage;
    private appendHistory;
    private notify;
    private stakeholderIds;
    private computeTotals;
    private nextReference;
    createRequisition(payload: any, user: any): Promise<{
        status: number;
        data: any;
    }>;
    private populate;
    private userDepartmentId;
    private buildNeedsActionClause;
    listRequisitions(filters: {
        entity?: string;
        status?: string;
        mine?: string;
        unit?: string;
        needsAction?: string;
        search?: string;
        page?: string | number;
        limit?: string | number;
    }, user: any): Promise<{
        status: number;
        data: any;
        role: ProcurementWorkflowRole;
        totals: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    countRequisitionsByStatus(filters: {
        entity?: string;
        mine?: string;
        unit?: string;
        needsAction?: string;
        search?: string;
    }, user: any): Promise<{
        status: number;
        data: {
            byStatus: Record<string, number>;
            total: number;
            needsAction: number;
        };
        role: ProcurementWorkflowRole;
    }>;
    getRequisition(id: string, user: any): Promise<{
        status: number;
        data: any;
        role: ProcurementWorkflowRole;
    }>;
    private loadForAction;
    private configFor;
    private isAssignedApprover;
    private matchesResolvingDepartment;
    private assertCanAct;
    triage(id: string, payload: any, user: any): Promise<{
        status: number;
        data: any;
    }>;
    approve(id: string, payload: any, user: any): Promise<{
        status: number;
        data: any;
    }>;
    reject(id: string, payload: any, user: any): Promise<{
        status: number;
        data: any;
    }>;
    requestClarification(id: string, payload: any, user: any): Promise<{
        status: number;
        data: any;
    }>;
    postGl(id: string, payload: any, user: any): Promise<{
        status: number;
        data: any;
    }>;
    disburse(id: string, payload: any, user: any): Promise<{
        status: number;
        data: any;
    }>;
    addFinanceComment(id: string, payload: any, user: any): Promise<{
        status: number;
        data: any;
    }>;
    private assertActorHoldsStage;
    listOverdueReceipts(entity: string | undefined, user: any): Promise<{
        status: number;
        data: any;
        count: any;
    }>;
}
