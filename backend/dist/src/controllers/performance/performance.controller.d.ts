import { PerformanceService } from '../../services/performance/performance.service';
import { CreatePerformanceReviewDto, NudgeOutstandingPerformanceReviewsDto, NudgePerformanceReviewsDto, UpdatePerformanceReviewDto } from 'src/dto/performance-review.dto';
export declare class PerformanceController {
    private readonly performanceService;
    constructor(performanceService: PerformanceService);
    listReviews(user: any, status?: string, department?: string, reviewer?: string, employeeId?: string, search?: string, supervisorScope?: string, subordinateScope?: string, entity?: string, appraisalCycleId?: string, page?: string, limit?: string): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    reviewStats(user: any, status?: string, department?: string, reviewer?: string, employeeId?: string, search?: string, supervisorScope?: string, subordinateScope?: string, entity?: string, appraisalCycleId?: string): Promise<{
        total: number;
        completed: number;
        pending: number;
        ratedCount: number;
        average: number;
    }>;
    exportReviews(user: any, status?: string, department?: string, reviewer?: string, employeeId?: string, search?: string, supervisorScope?: string, subordinateScope?: string, entity?: string, appraisalCycleId?: string): Promise<{
        data: (import("mongoose").FlattenMaps<import("../../schemas/performance-review.schema").PerformanceReviewDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
        total: number;
    }>;
    getReview(id: string, user: any): Promise<import("mongoose").FlattenMaps<import("../../schemas/performance-review.schema").PerformanceReviewDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    createReview(payload: CreatePerformanceReviewDto): Promise<any>;
    recomputeAllReviews(): Promise<{
        processed: number;
        failed: number;
    }>;
    backfillSupervisorKpiResults(id: string): Promise<{
        reviewId: string;
        status: string;
    }>;
    refreshReview(id: string, user: any): Promise<{
        status: number;
        message: string;
    }>;
    debugKpiResolution(id: string): Promise<{
        review: {
            id: string;
            employeeId: string;
            employeeName: string;
            reviewStartDate: Date;
            reviewEndDate: Date;
        };
        employee: {
            id: string;
            entity: string;
            role: {
                id?: string;
                name?: string;
            };
            level: {
                id?: string;
                name?: string;
            };
            department: {
                id?: string;
                name?: string;
            };
            businessUnit: {
                id?: string;
                name?: string;
            };
            branch: {
                id?: string;
                name?: string;
            };
        };
        totalCandidates: number;
        includedCount: number;
        decisions: {
            kpiId: string;
            title: any;
            included: boolean;
            reasons: string[];
            kpi: {
                entity: any;
                employeeId: any;
                roleId: any;
                roleName: any;
                levelId: any;
                levelName: any;
                departmentId: any;
                departmentName: any;
                businessUnitId: any;
                businessUnitName: any;
                branchId: any;
                branchName: any;
                startDate: any;
                endDate: any;
                appraisalCycleId: any;
            };
        }[];
    }>;
    nudgeReviewSupervisor(id: string, user: any): Promise<{
        status: number;
        message: string;
    }>;
    nudgeAllPendingSupervisors(body: NudgePerformanceReviewsDto, user: any): Promise<{
        status: number;
        message: string;
        sent: number;
        skipped: number;
        total: number;
    }>;
    nudgeOutstandingEmployees(body: NudgeOutstandingPerformanceReviewsDto, user: any): Promise<{
        cycles: number;
        employeesScanned: number;
        outstanding: number;
        notified: number;
        failed: number;
        skippedNoUserId: number;
    }>;
    bulkUploadReviews(file: Express.Multer.File): Promise<{
        created: number;
        skipped: number;
    }>;
    updateReview(id: string, payload: UpdatePerformanceReviewDto, user: any): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/performance-review.schema").PerformanceReviewDocument, {}, {}> & import("../../schemas/performance-review.schema").PerformanceReview & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    deleteReview(id: string): Promise<{
        deleted: boolean;
    }>;
    getWorkflowConfigs(user: any, entity?: string): Promise<any>;
    saveWorkflowConfig(user: any, payload: any): Promise<any>;
    listCoreValues(user: any, entity?: string): Promise<any>;
    createCoreValue(user: any, payload: any): Promise<any>;
    updateCoreValue(user: any, id: string, payload: any): Promise<any>;
    deleteCoreValue(user: any, id: string): Promise<any>;
    listAppraisalCycles(user: any, entity?: string, search?: string): Promise<any>;
    listActiveAppraisalCycles(user: any, entity?: string): Promise<any>;
    debugAppraisalCycleExists(user: any, entity?: string): Promise<any>;
    getAppraisalCycle(user: any, id: string): Promise<any>;
    createAppraisalCycle(user: any, payload: any): Promise<any>;
    updateAppraisalCycle(user: any, id: string, payload: any): Promise<any>;
    deleteAppraisalCycle(user: any, id: string): Promise<any>;
}
