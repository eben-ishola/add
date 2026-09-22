import { Model } from 'mongoose';
import { PerformanceAppraisalCycleDocument } from '../../schemas/performance-appraisal-cycle.schema';
export declare class PerformanceCycleService {
    private readonly appraisalCycleModel;
    constructor(appraisalCycleModel: Model<PerformanceAppraisalCycleDocument>);
    private normalizeEntityIdStrict;
    private normalizeUserId;
    private normalizeCycleStatus;
    private normalizeStringList;
    private normalizeRatingTags;
    private parseCycleDate;
    private assertReviewWindowWithinCycle;
    private serializeAppraisalCycle;
    listAppraisalCycles(user: any, entity?: string, search?: string): Promise<any>;
    listActiveAppraisalCycles(user: any, entity?: string): Promise<any>;
    debugAppraisalCycleExists(user: any, entity?: string): Promise<any>;
    getAppraisalCycle(user: any, id: string): Promise<any>;
    createAppraisalCycle(user: any, payload: any): Promise<any>;
    updateAppraisalCycle(user: any, id: string, payload: any): Promise<any>;
    deleteAppraisalCycle(user: any, id: string): Promise<any>;
}
