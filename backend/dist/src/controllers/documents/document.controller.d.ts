import { DocumentLibraryService } from 'src/services/documents/document-library.service';
export declare class DocumentLibraryController {
    private readonly documentService;
    private readonly logger;
    constructor(documentService: DocumentLibraryService);
    private ensureUploadDir;
    private discardUploadedFile;
    private isPassportPhotoUpload;
    private removeBackgroundFromPassportPhoto;
    private resolveUploadedFileUrl;
    listDocuments(req: any, search?: string, category?: string, owner?: string, featured?: string, excludeEmployeeDocuments?: string, includeReadStatus?: string, page?: string, limit?: string): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    categories(req: any, excludeEmployeeDocuments?: string): Promise<{
        category: any;
        total: any;
    }[]>;
    unreadPolicyDocuments(req: any, limit?: string): Promise<{
        data: any[];
        total: number;
        limit: number;
    }>;
    lookupScannedDocumentTarget(req: any, staffId?: string): Promise<import("src/services/documents/document-library.service").ScannedDocumentTarget>;
    getDocument(req: any, id: string): Promise<import("mongoose").FlattenMaps<import("../../schemas/document-library.schema").DocumentLibraryDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    markDocumentRead(req: any, id: string): Promise<{
        read: boolean;
        documentId: string;
        version: number;
        readAt: Date;
    }>;
    createDocument(req: any, body: any, file?: Express.Multer.File): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/document-library.schema").DocumentLibraryDocument, {}, {}> & import("../../schemas/document-library.schema").DocumentLibrary & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    createScannedDocument(req: any, body: any, file?: Express.Multer.File): Promise<{
        documentId: string;
        title: string;
        category: string;
        fileUrl: string;
        pageCount: number;
        staff: import("src/services/documents/document-library.service").ScannedDocumentTarget;
    }>;
    updateDocument(req: any, id: string, body: any, file?: Express.Multer.File): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/document-library.schema").DocumentLibraryDocument, {}, {}> & import("../../schemas/document-library.schema").DocumentLibrary & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    deleteDocument(req: any, id: string): Promise<{
        deleted: boolean;
    }>;
}
