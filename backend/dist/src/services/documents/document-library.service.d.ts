import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { DocumentAccessRules, DocumentLibrary, DocumentLibraryDocument } from 'src/schemas/document-library.schema';
import { DocumentReadDocument } from 'src/schemas/document-read.schema';
import { UserDocument } from 'src/schemas/user.schema';
type CreateDocumentInput = {
    title: string;
    category: string;
    owner?: string;
    description?: string;
    version?: number;
    versions?: Array<{
        version: number;
        fileUrl?: string;
        fileSize?: number;
        fileType?: string;
        updatedAt?: string | Date;
    }>;
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
    tags?: string[];
    featured?: boolean;
    viewAccess?: Partial<DocumentAccessRules>;
    downloadAccess?: Partial<DocumentAccessRules>;
    editAccess?: Partial<DocumentAccessRules>;
    versioning?: boolean | string;
};
type UpdateDocumentInput = Partial<CreateDocumentInput>;
type ScannedDocumentInput = {
    staffId?: string;
    title?: string;
    description?: string;
    pageCount?: number | string;
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
};
export type ScannedDocumentTarget = {
    staffId: string;
    name: string;
    department?: string;
    entity?: string;
    status?: string;
};
export declare class DocumentLibraryService implements OnModuleInit {
    private readonly documentModel;
    private readonly documentReadModel;
    private readonly staffModel;
    private readonly logger;
    private legacyIndexCheck?;
    private createdByBackfill?;
    private readonly employeeDocumentCategory;
    private static readonly SUPER_ADMIN_ROLE_NAMES;
    constructor(documentModel: Model<DocumentLibraryDocument>, documentReadModel: Model<DocumentReadDocument>, staffModel: Model<UserDocument>);
    onModuleInit(): Promise<void>;
    private ensureLegacyIndexes;
    private backfillCreatedBy;
    private normalizeAccess;
    private normalizeId;
    private isObjectIdString;
    private normalizeOwnerId;
    private normalizeUserId;
    private isEmployeeDocumentCategory;
    private isPolicyDocumentCategory;
    private policyDocumentCategoryFilter;
    private resolveDocumentVersion;
    private isPassportDocument;
    private ownerMatchesUser;
    private resolveEmployeeOwnerId;
    private attachEmployeeDocument;
    private detachEmployeeDocument;
    private extractPermissionNames;
    private isDocumentManager;
    private extractRoleNames;
    private isSuperAdmin;
    private resolveCreatorId;
    private resolveDocumentCreatorId;
    private isCreator;
    private isPrivilegedDocumentActor;
    private buildVisibilityConditions;
    private resolveAccessContext;
    private matchesAccess;
    private buildAccessConditions;
    private canViewDocument;
    private canEditDocument;
    private escapeRegex;
    private normaliseTags;
    private expandCaseVariants;
    private resolveUserIdentifiers;
    private buildFilters;
    listDocuments(user: any, query: {
        search?: string;
        category?: string;
        owner?: string;
        featured?: string;
        excludeEmployeeDocuments?: string;
        includeReadStatus?: string;
    }, page?: number, limit?: number): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getDocument(user: any, id: string): Promise<import("mongoose").FlattenMaps<DocumentLibraryDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    listUnreadPolicyDocuments(user: any, limit?: number): Promise<{
        data: any[];
        total: number;
        limit: number;
    }>;
    markDocumentRead(user: any, id: string): Promise<{
        read: boolean;
        documentId: string;
        version: number;
        readAt: Date;
    }>;
    private assertCanCreateDocument;
    createDocument(user: any, payload: CreateDocumentInput, options?: {
        alreadyAuthorized?: boolean;
    }): Promise<import("mongoose").Document<unknown, {}, DocumentLibraryDocument, {}, {}> & DocumentLibrary & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    private canFileScannedDocuments;
    private assertCanFileScannedDocuments;
    private describeScannedDocumentTarget;
    private findStaffByStaffId;
    private buildScannedDocumentTitle;
    lookupStaffForScannedDocument(user: any, staffId?: string): Promise<ScannedDocumentTarget>;
    createScannedDocument(user: any, payload: ScannedDocumentInput): Promise<{
        documentId: string;
        title: string;
        category: string;
        fileUrl: string;
        pageCount: number;
        staff: ScannedDocumentTarget;
    }>;
    updateDocument(user: any, id: string, updates: UpdateDocumentInput): Promise<import("mongoose").Document<unknown, {}, DocumentLibraryDocument, {}, {}> & DocumentLibrary & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    deleteDocument(user: any, id: string): Promise<{
        deleted: boolean;
    }>;
    getCategories(user: any, excludeEmployeeDocuments?: string): Promise<{
        category: any;
        total: any;
    }[]>;
}
export {};
