import { PerformanceKpiResultService } from '../../services/performance/performance-kpi-result.service';
export declare class PerformanceKpiResultController {
    private readonly performanceKpiResultService;
    constructor(performanceKpiResultService: PerformanceKpiResultService);
    listResults(period?: string, periodStart?: string, periodEnd?: string, employeeId?: string, status?: string, source?: string, kpiId?: string, search?: string, entity?: string, appraisalCycleId?: string, page?: string, limit?: string): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    submitManual(payload: any, req: any): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/performance-kpi-result.schema").PerformanceKpiResultDocument, {}, {}> & import("../../schemas/performance-kpi-result.schema").PerformanceKpiResult & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    approveResult(id: string, payload: any, req: any): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/performance-kpi-result.schema").PerformanceKpiResultDocument, {}, {}> & import("../../schemas/performance-kpi-result.schema").PerformanceKpiResult & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    importApiResults(payload: any): Promise<{
        updated: number;
        skipped: number;
    }>;
    openMonthly(period?: string): Promise<{
        created: number;
        skipped: number;
    }>;
}
