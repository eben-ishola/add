import { KpiService } from '../../services/jobs/kpi.service';
import type { Response } from 'express';
export declare class KpiController {
    private readonly kpiService;
    constructor(kpiService: KpiService);
    list(page?: string, limit?: string, search?: string, title?: string, type?: string, employeeId?: string, roleId?: string, roleName?: string, levelId?: string, departmentId?: string, departmentName?: string, branchId?: string, branchName?: string, category?: string, kpa?: string, expandRelated?: string, relatedRoleId?: string, relatedDepartmentId?: string, relatedBranchId?: string, relatedBusinessUnitId?: string, entity?: string, appraisalCycleId?: string): Promise<{
        data: (import("mongoose").FlattenMaps<import("../../schemas/kpi.schema").PerformanceKpiDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
    create(body: any): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/kpi.schema").PerformanceKpiDocument, {}, {}> & import("../../schemas/kpi.schema").PerformanceKpi & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    categoriesAlias(): Promise<(import("mongoose").FlattenMaps<import("../../schemas/kpi-category.schema").KpiCategoryDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    categories(): Promise<(import("mongoose").FlattenMaps<import("../../schemas/kpi-category.schema").KpiCategoryDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    groupedByScope(groupBy?: string, entity?: string, appraisalCycleId?: string, scopeId?: string, title?: string, weightFilter?: string): Promise<{
        data: {
            key: string;
            scopeId: string;
            scopeName: string;
            groupLabel: string;
            totalKpis: number;
            totalWeight: number;
            perspectives: {
                perspective: string;
                rows: any[];
                totalWeight: number;
            }[];
            rows: any[];
        }[];
        total: number;
        availableWeights: number[];
    }>;
    groupedByStaff(entity?: string, appraisalCycleId?: string, employeeId?: string, title?: string, search?: string, page?: string, limit?: string, weightFilter?: string): Promise<{
        data: any[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        availableWeights?: undefined;
    } | {
        data: {
            staffKey: string;
            staffName: any;
            staffId: any;
            totalKpis: number;
            totalWeight: number;
            typeBreakdown: string;
            perspectives: {
                perspective: string;
                rows: any[];
                totalWeight: number;
            }[];
            rows: any[];
        }[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        availableWeights: number[];
    }>;
    export(search: string | undefined, title: string | undefined, type: string | undefined, employeeId: string | undefined, roleId: string | undefined, levelId: string | undefined, departmentId: string | undefined, departmentName: string | undefined, branchId: string | undefined, branchName: string | undefined, category: string | undefined, entity: string | undefined, appraisalCycleId: string | undefined, res: Response): Promise<void>;
    createCategory(body: {
        name: string;
        description?: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/kpi-category.schema").KpiCategoryDocument, {}, {}> & import("../../schemas/kpi-category.schema").KpiCategory & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    similarCheck(body: {
        entity?: string;
        appraisalCycleId?: string;
        employeeId?: string;
        kpa?: string;
        description?: string;
        excludeId?: string;
    }): Promise<{
        matches: {
            id: string;
            title: string;
            description: string;
            weight: number;
        }[];
    }>;
    getOne(id: string): Promise<import("mongoose").FlattenMaps<import("../../schemas/kpi.schema").PerformanceKpiDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    duplicate(id: string, body?: any): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/kpi.schema").PerformanceKpiDocument, {}, {}> & import("../../schemas/kpi.schema").PerformanceKpi & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    update(id: string, body: any): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/kpi.schema").PerformanceKpiDocument, {}, {}> & import("../../schemas/kpi.schema").PerformanceKpi & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
        reviewsRefreshed: number;
    }>;
    bulkUpload(file: Express.Multer.File, entity?: string, appraisalCycleId?: string, appraisalCycleName?: string): Promise<{
        created: number;
        skipped: number;
        updated?: undefined;
    } | {
        created: number;
        updated: number;
        skipped: number;
    }>;
}
