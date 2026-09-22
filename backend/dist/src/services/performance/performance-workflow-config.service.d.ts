import { Document, Model } from 'mongoose';
import { PerformanceWorkflowConfig } from '../../schemas/performance-workflow.schema';
type PerformanceWorkflowConfigDocument = PerformanceWorkflowConfig & Document;
export declare class PerformanceWorkflowConfigService {
    private readonly workflowModel;
    constructor(workflowModel: Model<PerformanceWorkflowConfigDocument>);
    private normalizeEntityIdStrict;
    private normalizeUserId;
    private normalizeUserIdList;
    private normalizeWeight;
    getWorkflowConfigs(user: any, entity?: string): Promise<any>;
    saveWorkflowConfig(user: any, payload: any): Promise<any>;
}
export {};
