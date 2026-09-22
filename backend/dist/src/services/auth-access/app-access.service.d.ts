import { Model } from 'mongoose';
import { AppCatalog, AppCatalogDocument } from 'src/schemas/app-catalog.schema';
import { UserDocument } from 'src/schemas/user.schema';
import { SubsidiaryDocument } from 'src/schemas/subsidiary.schema';
export declare class AppAccessService {
    private readonly appModel;
    private readonly userModel;
    private readonly subsidiaryModel;
    constructor(appModel: Model<AppCatalogDocument>, userModel: Model<UserDocument>, subsidiaryModel: Model<SubsidiaryDocument>);
    listCatalog(entity?: string): Promise<string[]>;
    addToCatalog(name: string, entity?: string): Promise<import("mongoose").Document<unknown, {}, AppCatalogDocument, {}, {}> & AppCatalog & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    listEnrollments(search?: string, entity?: string, page?: number, limit?: number): Promise<{
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
    updateEnrollment(userId: string, apps: string[]): Promise<{
        id: string;
        apps: string[];
    }>;
    private escapeRegex;
    private resolveEntityId;
    private appExistsInEntity;
}
