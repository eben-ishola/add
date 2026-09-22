import { Model } from 'mongoose';
import { PerformanceKpi } from '../../schemas/kpi.schema';
import { PerformanceKpiResult, PerformanceKpiResultDocument } from '../../schemas/performance-kpi-result.schema';
import { PerformanceReviewDocument } from '../../schemas/performance-review.schema';
import { PerformanceService } from 'src/services/performance/performance.service';
export declare class PerformanceKpiResultService {
    private readonly resultModel;
    private readonly kpiModel;
    private readonly reviewModel;
    private readonly performanceService?;
    constructor(resultModel: Model<PerformanceKpiResultDocument>, kpiModel: Model<PerformanceKpi>, reviewModel: Model<PerformanceReviewDocument>, performanceService?: PerformanceService);
    private buildScopeKey;
    private computeScore;
    private hasActualValue;
    private normalizeKpiTitle;
    private resolveDisplayStatus;
    private withResolvedActualValue;
    private syncReviewSnapshotActualValue;
    listResults(filters: Partial<{
        period: string;
        periodStart: string;
        periodEnd: string;
        employeeId: string;
        status: string;
        source: string;
        kpiId: string;
        search: string;
        entity: string;
        appraisalCycleId: string;
    }>, page?: number, limit?: number): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    submitManualResult(payload: {
        kpiId: string;
        period?: string;
        employeeId?: string;
        employeeName?: string;
        actualValue?: string;
        entity?: string;
    }, actorId?: string): Promise<import("mongoose").Document<unknown, {}, PerformanceKpiResultDocument, {}, {}> & PerformanceKpiResult & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    approveResult(id: string, updates: {
        actualValue?: string;
        isActualValueLocked?: boolean;
        status?: string;
        reviewerName?: string;
    }, actorId?: string): Promise<import("mongoose").Document<unknown, {}, PerformanceKpiResultDocument, {}, {}> & PerformanceKpiResult & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    openMonthlyResults(periodInput?: string): Promise<{
        created: number;
        skipped: number;
    }>;
    importApiResults(payload: {
        period?: string;
        results?: Array<Record<string, any>>;
    }): Promise<{
        updated: number;
        skipped: number;
    }>;
}
