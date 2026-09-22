import { Model } from 'mongoose';
import { PerformanceService } from 'src/services/performance/performance.service';
import { PerformanceKpi, PerformanceKpiDocument } from '../../schemas/kpi.schema';
import { KpiCategory, KpiCategoryDocument } from '../../schemas/kpi-category.schema';
import { RoleDocument } from '../../schemas/role.schema';
type CreateKpiInput = {
    employeeId?: string;
    employeeName?: string;
    roleId?: string;
    roleName?: string;
    levelId?: string;
    levelName?: string;
    departmentId?: string;
    departmentName?: string;
    businessUnitId?: string;
    businessUnitName?: string;
    branchId?: string;
    branchName?: string;
    entity?: string;
    title: string;
    description: string;
    type: string;
    kpa?: string;
    targetValue: string;
    measurementUnit: string;
    categoryId?: string;
    categoryName?: string;
    startDate?: string | Date;
    endDate?: string | Date;
    weight?: number;
    evaluationFrequency?: string;
    collectionSource?: string;
    externalKey?: string;
    scoringMethod?: string;
    scoreDirection?: string;
    hasConditions?: boolean;
    customFields?: Array<{
        name: string;
        type: string;
        required: boolean;
    }>;
    conditions?: Array<{
        field: string;
        operator: string;
        value: string;
        outcome: string;
    }>;
    actualValue?: number | null;
    isActualValueLocked?: boolean;
    lockedBy?: string;
    appraisalCycleId?: string;
    appraisalCycleName?: string;
    scoredBy?: string;
};
type UpdateKpiInput = Partial<CreateKpiInput>;
type KpiListFilters = Partial<{
    search: string;
    title: string;
    type: string;
    employeeId: string;
    roleId: string;
    roleName: string;
    levelId: string;
    departmentId: string;
    departmentName: string;
    branchId: string;
    branchName: string;
    category: string;
    kpa: string;
    entity: string;
    appraisalCycleId: string;
    expandRelated: boolean;
    relatedRoleId: string;
    relatedDepartmentId: string;
    relatedBranchId: string;
    relatedBusinessUnitId: string;
}>;
export declare class KpiService {
    private readonly kpiModel;
    private readonly categoryModel;
    private readonly userModel;
    private readonly roleModel;
    private readonly performanceService?;
    constructor(kpiModel: Model<PerformanceKpiDocument>, categoryModel: Model<KpiCategoryDocument>, userModel: Model<any>, roleModel: Model<RoleDocument>, performanceService?: PerformanceService);
    private buildSlug;
    private normalizeText;
    private normalizeLookupKey;
    private buildExactRegex;
    private buildIdMatchClause;
    private normalizeType;
    private normalizeScopeValue;
    private parseOptionalNumber;
    private parseScopes;
    private deriveTypeFromScopes;
    private scopesFromRow;
    private serializeScopes;
    private buildTargetFields;
    private ensureDefaultCategories;
    listCategories(): Promise<(import("mongoose").FlattenMaps<KpiCategoryDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    createCategory(name: string, description?: string): Promise<import("mongoose").Document<unknown, {}, KpiCategoryDocument, {}, {}> & KpiCategory & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    private normalizeDates;
    private normalizeKpiTitle;
    private normalizeKpiKey;
    private findDuplicateKpiId;
    private assertNotDuplicateKpi;
    findSimilarKpisByDescription(payload: {
        entity?: string;
        appraisalCycleId?: string;
        employeeId?: string;
        kpa?: string;
        description?: string;
        excludeId?: string;
    }): Promise<Array<{
        id: string;
        title: string;
        description: string;
        weight: number;
    }>>;
    private serializeCsvValue;
    createKpi(payload: CreateKpiInput): Promise<import("mongoose").Document<unknown, {}, PerformanceKpiDocument, {}, {}> & PerformanceKpi & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    private buildListFilters;
    listKpisGroupedByStaff(filters: {
        entity?: string;
        appraisalCycleId?: string;
        employeeId?: string;
        title?: string;
        search?: string;
        page?: number;
        limit?: number;
        weightFilter?: number;
    }): Promise<{
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
    listKpisGroupedByScope(filters: {
        groupBy: 'role' | 'department' | 'level' | 'branch' | 'business_unit';
        entity?: string;
        appraisalCycleId?: string;
        scopeId?: string;
        title?: string;
        weightFilter?: number;
    }): Promise<{
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
    listKpis(page?: number, limit?: number, filters?: KpiListFilters): Promise<{
        data: (import("mongoose").FlattenMaps<PerformanceKpiDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
    exportKpis(filters?: KpiListFilters): Promise<string>;
    getKpi(id: string): Promise<import("mongoose").FlattenMaps<PerformanceKpiDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    duplicateKpi(id: string, appraisalCycleId?: string, appraisalCycleName?: string): Promise<import("mongoose").Document<unknown, {}, PerformanceKpiDocument, {}, {}> & PerformanceKpi & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    updateKpi(id: string, updates: UpdateKpiInput): Promise<import("mongoose").Document<unknown, {}, PerformanceKpiDocument, {}, {}> & PerformanceKpi & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    deleteKpi(id: string): Promise<{
        deleted: boolean;
        reviewsRefreshed: number;
    }>;
    bulkCreateFromCsv(rows: Array<Record<string, string>>, entity?: string, appraisalCycleId?: string, appraisalCycleName?: string): Promise<{
        created: number;
        skipped: number;
        updated?: undefined;
    } | {
        created: number;
        updated: number;
        skipped: number;
    }>;
}
export {};
