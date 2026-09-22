import { Document } from 'mongoose';
export type DocumentLibraryDocument = DocumentLibrary & Document;
export type DocumentAccessScope = 'all' | 'entities' | 'units' | 'users';
export type DocumentAccessRules = {
    scope: DocumentAccessScope;
    entityIds: string[];
    unitIds: string[];
    userIds: string[];
};
export declare class DocumentLibrary {
    title: string;
    category: string;
    owner?: string;
    createdBy?: string;
    description?: string;
    version?: number;
    versions?: Array<{
        version: number;
        fileUrl?: string;
        fileType?: string;
        fileSize?: number;
        updatedAt?: Date;
    }>;
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
    tags: string[];
    tagsSearch?: string;
    featured?: boolean;
    viewAccess: DocumentAccessRules;
    downloadAccess: DocumentAccessRules;
    editAccess: DocumentAccessRules;
}
export declare const DocumentLibrarySchema: import("mongoose").Schema<DocumentLibrary, import("mongoose").Model<DocumentLibrary, any, any, any, Document<unknown, any, DocumentLibrary, any, {}> & DocumentLibrary & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DocumentLibrary, Document<unknown, {}, import("mongoose").FlatRecord<DocumentLibrary>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<DocumentLibrary> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
