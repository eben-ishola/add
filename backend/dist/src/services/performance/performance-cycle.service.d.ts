import { Model } from 'mongoose';
import { PerformanceAppraisalCycleDocument } from '../../schemas/performance-appraisal-cycle.schema';
import { PerformanceReviewDocument } from '../../schemas/performance-review.schema';
import { PerformanceKpiDocument } from '../../schemas/kpi.schema';
export declare class PerformanceCycleService {
    private readonly appraisalCycleModel;
    private readonly reviewModel;
    private readonly kpiModel;
    constructor(appraisalCycleModel: Model<PerformanceAppraisalCycleDocument>, reviewModel?: Model<PerformanceReviewDocument>, kpiModel?: Model<PerformanceKpiDocument>);
    private normalizeEntityIdStrict;
    private normalizeUserId;
    private normalizeCycleStatus;
    private normalizeStringList;
    private normalizeRatingTags;
    private parseCycleDate;
    private assertReviewWindowWithinCycle;
    private assertNoOverlappingActiveCycle;
    private serializeAppraisalCycle;
    listAppraisalCycles(user: any, entity?: string, search?: string): Promise<any>;
    listActiveAppraisalCycles(user: any, entity?: string): Promise<any>;
    debugAppraisalCycleExists(user: any, entity?: string): Promise<any>;
    getAppraisalCycle(user: any, id: string): Promise<any>;
    createAppraisalCycle(user: any, payload: any): Promise<any>;
    updateAppraisalCycle(user: any, id: string, payload: any): Promise<any>;
    deleteAppraisalCycle(user: any, id: string): Promise<any>;
}
