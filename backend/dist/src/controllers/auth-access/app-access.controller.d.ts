import { AppAccessService } from 'src/services/auth-access/app-access.service';
export declare class AppAccessController {
    private readonly appAccessService;
    constructor(appAccessService: AppAccessService);
    listCatalog(entity?: string): Promise<{
        data: string[];
    }>;
    addToCatalog(body: {
        name: string;
        entity?: string;
    }): Promise<{
        data: import("mongoose").Document<unknown, {}, import("../../schemas/app-catalog.schema").AppCatalogDocument, {}, {}> & import("../../schemas/app-catalog.schema").AppCatalog & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
    }>;
    listEnrollments(search?: string, entity?: string, page?: string, limit?: string): Promise<{
        data: {
            id: string;
            name: string;
            email: any;
            staffId: any;
            department: any;
            apps: any;
        }[];
        total: number;
        totalPages: number;
        page: number;
    }>;
    updateEnrollment(userId: string, body: {
        apps: string[];
    }): Promise<{
        id: string;
        apps: string[];
    }>;
}
