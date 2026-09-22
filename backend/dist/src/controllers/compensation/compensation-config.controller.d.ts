import { CompensationConfigService, SaveCompensationConfigDto } from '../../services/compensation/compensation-config.service';
export declare class CompensationConfigController {
    private readonly service;
    constructor(service: CompensationConfigService);
    list(req: any, entity?: string): Promise<{
        status: number;
        data: (import("mongoose").FlattenMaps<import("../../schemas/compensation-config.schema").CompensationConfigDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    getById(id: string, req: any): Promise<{
        status: number;
        data: import("mongoose").FlattenMaps<import("../../schemas/compensation-config.schema").CompensationConfigDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        };
    }>;
    create(body: SaveCompensationConfigDto, req: any): Promise<{
        status: number;
        data: import("mongoose").FlattenMaps<import("../../schemas/compensation-config.schema").CompensationConfigDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        };
    }>;
    update(id: string, body: SaveCompensationConfigDto, req: any): Promise<{
        status: number;
        data: import("mongoose").FlattenMaps<import("../../schemas/compensation-config.schema").CompensationConfigDocument> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        };
    }>;
    compute(id: string, body: {
        entity: string;
        staff: Array<{
            userId: string;
            levelName?: string;
        }>;
    }, req: any): Promise<{
        status: number;
        data: {
            userId: string;
            amount: number;
            manual: boolean;
        }[];
    }>;
    remove(id: string, req: any): Promise<{
        status: number;
        message: string;
    }>;
}
