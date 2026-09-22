import { IncentivesService } from 'src/services/compensation/incentives.service';
export declare class IncentivesController {
    private readonly incentivesService;
    constructor(incentivesService: IncentivesService);
    getIncentives(query: any): Promise<{
        source: "ro" | "dmo";
        data: (import("mongoose").FlattenMaps<import("../../schemas/dmo-incentive.schema").DMOIncentiveDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    getRoIncentivesByPeriod(query: any): Promise<{
        data: (import("mongoose").FlattenMaps<import("../../schemas/roIncentive.schema").ROIncentiveDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    getDmoIncentives(query: any): Promise<{
        data: (import("mongoose").FlattenMaps<import("../../schemas/dmo-incentive.schema").DMOIncentiveDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    getProductCategory(): Promise<{
        data: (import("mongoose").FlattenMaps<import("../../schemas/product-category.schema").ProductCategoryDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    getCaseLoad(): Promise<{
        data: (import("mongoose").FlattenMaps<import("../../schemas/case-load.schema").CaseLoadDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    getVisitation(): Promise<{
        data: (import("mongoose").FlattenMaps<import("../../schemas/visitation.schema").VisitationDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    getDmoTarget(): Promise<{
        data: (import("mongoose").FlattenMaps<import("../../schemas/dmo-target.schema").DMOTargetDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    getActiveSavers(): Promise<{
        data: (import("mongoose").FlattenMaps<import("../../schemas/active-saver.schema").ActiveSaverDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    getDailyMobilization(): Promise<{
        data: (import("mongoose").FlattenMaps<import("../../schemas/daily-mobilization.schema").DailyMobilizationDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    getBudgets(type: string): Promise<{
        data: (import("mongoose").FlattenMaps<import("../../schemas/budget.schema").BudgetDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
}
