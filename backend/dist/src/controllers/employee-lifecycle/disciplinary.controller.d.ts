import { DisciplinaryService } from 'src/services/employee-lifecycle/disciplinary.service';
import type { Response } from 'express';
export declare class DisciplinaryController {
    private readonly disciplinaryService;
    constructor(disciplinaryService: DisciplinaryService);
    listCases(search?: string, status?: string, severity?: string, category?: string, department?: string, entity?: string, subsidiaryId?: string, page?: string, limit?: string): Promise<{
        data: (import("mongoose").FlattenMaps<import("../../schemas/disciplinary-case.schema").DisciplinaryCaseDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    summary(status?: string, severity?: string, category?: string, department?: string, entity?: string, subsidiaryId?: string): Promise<{
        total: any;
        byStatus: any;
        bySeverity: any;
        byCategory: any;
    }>;
    exportCases(res: Response, search: string | undefined, status: string | undefined, severity: string | undefined, category: string | undefined, department: string | undefined, entity?: string, subsidiaryId?: string): Promise<void>;
    getCase(id: string): Promise<import("mongoose").FlattenMaps<import("../../schemas/disciplinary-case.schema").DisciplinaryCaseDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    createCase(body: any): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/disciplinary-case.schema").DisciplinaryCaseDocument, {}, {}> & import("../../schemas/disciplinary-case.schema").DisciplinaryCase & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    updateCase(id: string, body: any): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/disciplinary-case.schema").DisciplinaryCaseDocument, {}, {}> & import("../../schemas/disciplinary-case.schema").DisciplinaryCase & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    applySalaryDeduction(id: string, req: any): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/disciplinary-case.schema").DisciplinaryCaseDocument, {}, {}> & import("../../schemas/disciplinary-case.schema").DisciplinaryCase & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    deleteCase(id: string): Promise<{
        deleted: boolean;
    }>;
}
