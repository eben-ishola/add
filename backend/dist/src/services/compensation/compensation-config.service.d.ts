import mongoose, { Model } from 'mongoose';
import { CompensationConfigDocument } from '../../schemas/compensation-config.schema';
import { PayrollService } from 'src/services/payroll/payroll.service';
export interface SaveCompensationConfigDto {
    id?: string;
    entity: string;
    title: string;
    glCode?: string;
    valueType: string;
    globalAmount?: number;
    payType?: string | null;
    percent?: number;
    percentBase?: string | null;
    combinationComponents?: string[];
    reviewers?: string[];
    approvers?: string[];
    posters?: string[];
    postingIds?: string[];
    auditViewers?: string[];
    active?: boolean;
}
export declare class CompensationConfigService {
    private readonly configModel;
    private readonly payrollMapModel;
    private readonly payrollService;
    constructor(configModel: Model<CompensationConfigDocument>, payrollMapModel: Model<any>, payrollService: PayrollService);
    private assertFinance;
    private normalizeEntityId;
    private normalizeIdList;
    private buildUpdate;
    list(user: any, entity?: string): Promise<{
        status: number;
        data: (mongoose.FlattenMaps<CompensationConfigDocument> & Required<{
            _id: mongoose.FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    getById(user: any, id: string): Promise<{
        status: number;
        data: mongoose.FlattenMaps<CompensationConfigDocument> & Required<{
            _id: mongoose.FlattenMaps<unknown>;
        }> & {
            __v: number;
        };
    }>;
    save(user: any, payload: SaveCompensationConfigDto): Promise<{
        status: number;
        data: mongoose.FlattenMaps<CompensationConfigDocument> & Required<{
            _id: mongoose.FlattenMaps<unknown>;
        }> & {
            __v: number;
        };
    }>;
    computeAmounts(user: any, id: string, entity: string, staff: Array<{
        userId: string;
        levelName?: string;
    }>): Promise<{
        status: number;
        data: {
            userId: string;
            amount: number;
            manual: boolean;
        }[];
    }>;
    remove(user: any, id: string): Promise<{
        status: number;
        message: string;
    }>;
}
