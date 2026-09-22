import { Model } from 'mongoose';
import { ActiveSaverDocument } from 'src/schemas/active-saver.schema';
import { BudgetDocument } from 'src/schemas/budget.schema';
import { CaseLoadDocument } from 'src/schemas/case-load.schema';
import { DailyMobilizationDocument } from 'src/schemas/daily-mobilization.schema';
import { DMOTargetDocument } from 'src/schemas/dmo-target.schema';
import { DMOIncentiveDocument } from 'src/schemas/dmo-incentive.schema';
import { ProductCategoryDocument } from 'src/schemas/product-category.schema';
import { ROIncentiveDocument } from 'src/schemas/roIncentive.schema';
import { UserDocument } from 'src/schemas/user.schema';
import { VisitationDocument } from 'src/schemas/visitation.schema';
export declare class IncentivesService {
    private readonly roIncentiveModel;
    private readonly dmoIncentiveModel;
    private readonly userModel;
    private readonly productCategoryModel;
    private readonly caseLoadModel;
    private readonly dmoTargetModel;
    private readonly activeSaverModel;
    private readonly dailyMobilizationModel;
    private readonly visitationModel;
    private readonly budgetModel;
    constructor(roIncentiveModel: Model<ROIncentiveDocument>, dmoIncentiveModel: Model<DMOIncentiveDocument>, userModel: Model<UserDocument>, productCategoryModel: Model<ProductCategoryDocument>, caseLoadModel: Model<CaseLoadDocument>, dmoTargetModel: Model<DMOTargetDocument>, activeSaverModel: Model<ActiveSaverDocument>, dailyMobilizationModel: Model<DailyMobilizationDocument>, visitationModel: Model<VisitationDocument>, budgetModel: Model<BudgetDocument>);
    private resolveGroupHints;
    private resolveIncentiveSource;
    private buildGroupMatchConditions;
    private resolveUnitId;
    private resolveEntityId;
    private buildOrbitIdMatchConditions;
    private resolveOrbitIdsForUnit;
    private buildUnitMatchConditions;
    private mergeOrFilter;
    getIncentivesByGroup(query: any): Promise<{
        source: "ro" | "dmo";
        data: (import("mongoose").FlattenMaps<DMOIncentiveDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    getRoIncentives(query: any): Promise<{
        data: (import("mongoose").FlattenMaps<ROIncentiveDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    getDmoIncentives(query: any): Promise<{
        data: (import("mongoose").FlattenMaps<DMOIncentiveDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    getProductCategories(): Promise<{
        data: (import("mongoose").FlattenMaps<ProductCategoryDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    getCaseLoads(): Promise<{
        data: (import("mongoose").FlattenMaps<CaseLoadDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    getDmoTargets(): Promise<{
        data: (import("mongoose").FlattenMaps<DMOTargetDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    getActiveSavers(): Promise<{
        data: (import("mongoose").FlattenMaps<ActiveSaverDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    getDailyMobilizations(): Promise<{
        data: (import("mongoose").FlattenMaps<DailyMobilizationDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    getVisitations(): Promise<{
        data: (import("mongoose").FlattenMaps<VisitationDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    getBudgets(type?: string): Promise<{
        data: (import("mongoose").FlattenMaps<BudgetDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
}
