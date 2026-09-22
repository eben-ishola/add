import { Model } from 'mongoose';
import { PerformanceCoreValueDocument } from '../../schemas/performance-core-value.schema';
export declare class PerformanceCoreValueService {
    private readonly coreValueModel;
    constructor(coreValueModel: Model<PerformanceCoreValueDocument>);
    private normalizeEntityIdStrict;
    private normalizeRaters;
    private normalizeWeight;
    listCoreValues(user: any, entity?: string): Promise<any>;
    createCoreValue(user: any, payload: any): Promise<any>;
    updateCoreValue(user: any, id: string, payload: any): Promise<any>;
    deleteCoreValue(user: any, id: string): Promise<any>;
}
