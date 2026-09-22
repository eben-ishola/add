import type { Response } from 'express';
import { CreateRequisitionDto, DisburseDto, PostGlDto, ProcurementCommentDto, ProcurementRejectDto, SaveProcurementWorkflowDto, TriageRequisitionDto } from 'src/dto/procurement.dto';
import { CbaService } from 'src/services/compensation/cba.service';
import { ProcurementService } from 'src/services/procurement/procurement.service';
export declare class ProcurementController {
    private readonly procurementService;
    private readonly cbaService;
    constructor(procurementService: ProcurementService, cbaService: CbaService);
    create(user: any, body: CreateRequisitionDto): Promise<{
        status: number;
        data: any;
    }>;
    counts(user: any, entity?: string, mine?: string): Promise<{
        status: number;
        data: {
            byStatus: Record<string, number>;
            total: number;
            needsAction: number;
        };
        role: import("src/services/procurement/procurement.service").ProcurementWorkflowRole;
    }>;
    list(user: any, entity?: string, status?: string, mine?: string, needsAction?: string, search?: string, page?: string, limit?: string): Promise<{
        status: number;
        data: any;
        role: import("src/services/procurement/procurement.service").ProcurementWorkflowRole;
        totals: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getOne(user: any, id: string): Promise<{
        status: number;
        data: any;
        role: import("src/services/procurement/procurement.service").ProcurementWorkflowRole;
    }>;
    triage(user: any, id: string, body: TriageRequisitionDto): Promise<{
        status: number;
        data: any;
    }>;
    approve(user: any, id: string, body: ProcurementCommentDto): Promise<{
        status: number;
        data: any;
    }>;
    reject(user: any, id: string, body: ProcurementRejectDto): Promise<{
        status: number;
        data: any;
    }>;
    requestClarification(user: any, id: string, body: ProcurementCommentDto): Promise<{
        status: number;
        data: any;
    }>;
    postGl(user: any, id: string, body: PostGlDto): Promise<{
        status: number;
        data: any;
    }>;
    disburse(user: any, id: string, body: DisburseDto): Promise<{
        status: number;
        data: any;
    }>;
    financeComment(user: any, id: string, body: ProcurementCommentDto): Promise<{
        status: number;
        data: any;
    }>;
    addAttachments(user: any, id: string, files: Express.Multer.File[], kind?: string): Promise<{
        status: number;
        data: {
            attached: number;
            attachments: import("../../schemas/procurement-requisition.schema").ProcurementAttachment[];
        };
    }>;
    downloadAttachment(user: any, id: string, storedName: string, res: Response): Promise<void>;
    extendReceipt(user: any, id: string, body: {
        dueAt?: string;
    }): Promise<{
        status: number;
        data: {
            receiptDueAt: Date;
        };
    }>;
    workflowRole(user: any, entity?: string): Promise<import("src/services/procurement/procurement.service").ProcurementWorkflowRole>;
    getWorkflowConfig(entity: string): Promise<{
        status: number;
        data: import("mongoose").FlattenMaps<import("../../schemas/procurement-workflow.schema").ProcurementWorkflowDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        };
    }>;
    approverPool(entity: string): Promise<{
        status: number;
        data: any;
    }>;
    resolvingDepartments(entity: string): Promise<{
        status: number;
        data: any[];
    }>;
    saveWorkflowConfig(user: any, body: SaveProcurementWorkflowDto): Promise<{
        status: number;
        data: import("mongoose").FlattenMaps<import("../../schemas/procurement-workflow.schema").ProcurementWorkflowDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        };
    }>;
    expenseTypes(): Promise<{
        status: number;
        data: string[];
    }>;
    expenseAccounts(type?: string): Promise<{
        status: number;
        data: (import("mongoose").FlattenMaps<import("../../schemas/expense-account.schema").ExpenseAccountDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    createExpenseAccount(body: Record<string, unknown>): Promise<{
        status: number;
        data: import("../../schemas/expense-account.schema").ExpenseAccount & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
    }>;
    glExport(user: any, ids?: string, entity?: string, status?: string): Promise<{
        status: number;
        data: {
            headers: string[];
            rows: string[][];
            references: string[];
            requisitions: number;
        };
    }>;
    budgets(entity?: string, year?: string): Promise<{
        status: number;
        data: any[];
    }>;
    saveBudget(user: any, body: Record<string, unknown>): Promise<{
        status: number;
        data: (import("mongoose").Document<unknown, {}, import("../../schemas/expense-budget.schema").ExpenseBudgetDocument, {}, {}> & import("../../schemas/expense-budget.schema").ExpenseBudget & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        }) | (import("../../schemas/expense-budget.schema").ExpenseBudget & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        });
    }>;
    private parseUpload;
    importExpenseAccounts(file: Express.Multer.File): Promise<{
        status: number;
        data: {
            received: number;
            created: any;
            updated: any;
        };
    }>;
    importBudgets(user: any, file: Express.Multer.File, entity?: string): Promise<{
        status: number;
        data: {
            received: number;
            created: any;
            updated: any;
        };
    }>;
    budgetPosition(entity: string, expenseAccount: string, year?: string): Promise<{
        status: number;
        data: any;
    }>;
    glExpenditure(account: string, institution: string, start: string, end: string): Promise<{
        status: number;
        totalDebit: number;
        data: any[];
    }>;
    glSearch(name: string, businessUnit: string): Promise<{
        status: number;
        data: any[];
    }>;
    glSelect(subLedger: string, businessUnit: string): Promise<{
        status: number;
        data: any[];
    }>;
    outstandingReceipts(user: any, entity?: string): Promise<{
        status: number;
        data: any;
        count: any;
    }>;
}
