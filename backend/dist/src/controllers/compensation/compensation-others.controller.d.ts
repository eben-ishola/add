import { CompensationOthersService, GenerateOthersDto } from '../../services/compensation/compensation-others.service';
export declare class CompensationOthersController {
    private readonly service;
    constructor(service: CompensationOthersService);
    generate(body: GenerateOthersDto, req: any): Promise<{
        success: true;
        data: any;
    }>;
    myAssignments(req: any): Promise<{
        hasAssignments: boolean;
        count: number;
    }>;
    list(req: any, entity?: string, month?: string, status?: string, assignedOnly?: string, assignedId?: string, userId?: string): Promise<(import("mongoose").FlattenMaps<import("../../schemas/compensation-others.schema").CompensationOthersDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    })[]>;
    findById(id: string): Promise<import("mongoose").FlattenMaps<import("../../schemas/compensation-others.schema").CompensationOthersDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    act(id: string, body: {
        stage: 'reviewer' | 'approver' | 'poster';
        action: 'approve' | 'reject';
    }, req: any): Promise<import("../../schemas/compensation-others.schema").CompensationOthers & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    switchAccount(id: string, body: {
        staffId?: string;
        employeeId?: string;
        accountType?: string;
        applyToAll?: boolean | string;
    }, req: any): Promise<any>;
    financeComment(id: string, body: {
        comment?: string;
    }, req: any): Promise<{
        status: number;
        message: string;
    }>;
}
