"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DocumentLibraryController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentLibraryController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs = require("fs");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const document_library_service_1 = require("../../services/documents/document-library.service");
const SCANNED_DOCUMENT_MAX_BYTES = 30 * 1024 * 1024;
const isPdfUpload = (file) => file?.mimetype === 'application/pdf' ||
    (0, path_1.extname)(file?.originalname ?? '').toLowerCase() === '.pdf';
let DocumentLibraryController = DocumentLibraryController_1 = class DocumentLibraryController {
    constructor(documentService) {
        this.documentService = documentService;
        this.logger = new common_1.Logger(DocumentLibraryController_1.name);
    }
    ensureUploadDir() {
        const dir = (0, path_1.join)(process.cwd(), 'uploads', 'documents');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        return dir;
    }
    async discardUploadedFile(file) {
        const target = file?.path ?? (file?.filename
            ? (0, path_1.join)(process.cwd(), 'uploads', 'documents', file.filename)
            : undefined);
        if (!target)
            return;
        await fs.promises.unlink(target).catch(() => undefined);
    }
    isPassportPhotoUpload(body, file) {
        if (!file?.mimetype?.startsWith('image/'))
            return false;
        const category = String(body?.category ?? '').trim().toLowerCase();
        if (category !== 'employee documents')
            return false;
        const searchable = [body?.title, body?.description, body?.documentType, body?.type]
            .filter((value) => typeof value === 'string' && value.trim())
            .join(' ');
        return /passport|profile\s*(photo|image)|avatar/i.test(searchable);
    }
    async removeBackgroundFromPassportPhoto(file) {
        const uploadDir = this.ensureUploadDir();
        const sourcePath = file.path || (0, path_1.join)(uploadDir, file.filename);
        const outputFilename = `${(0, path_1.basename)(file.filename, (0, path_1.extname)(file.filename))}-background-removed.png`;
        const outputPath = (0, path_1.join)(uploadDir, outputFilename);
        try {
            const { removeBackground } = await Promise.resolve().then(() => require('@imgly/background-removal-node'));
            const input = await fs.promises.readFile(sourcePath);
            const result = await removeBackground(input, {
                model: 'small',
                output: {
                    format: 'image/png',
                    quality: 0.92,
                },
            });
            const outputBuffer = Buffer.from(await result.arrayBuffer());
            await fs.promises.writeFile(outputPath, outputBuffer);
            await fs.promises.unlink(sourcePath).catch(() => undefined);
            file.filename = outputFilename;
            file.path = outputPath;
            file.mimetype = 'image/png';
            file.size = outputBuffer.length;
            return `uploads/documents/${outputFilename}`;
        }
        catch (error) {
            await fs.promises.unlink(outputPath).catch(() => undefined);
            this.logger.warn(`Background removal failed for ${file.filename}; keeping original image. ${error?.message ?? error}`);
            return `uploads/documents/${file.filename}`;
        }
    }
    async resolveUploadedFileUrl(body, file) {
        if (!file)
            return body?.fileUrl;
        if (this.isPassportPhotoUpload(body, file)) {
            return this.removeBackgroundFromPassportPhoto(file);
        }
        return `uploads/documents/${file.filename}`;
    }
    async listDocuments(req, search, category, owner, featured, excludeEmployeeDocuments, includeReadStatus, page, limit) {
        return this.documentService.listDocuments(req?.user, { search, category, owner, featured, excludeEmployeeDocuments, includeReadStatus }, Number(page), Number(limit));
    }
    async categories(req, excludeEmployeeDocuments) {
        return this.documentService.getCategories(req?.user, excludeEmployeeDocuments);
    }
    async unreadPolicyDocuments(req, limit) {
        return this.documentService.listUnreadPolicyDocuments(req?.user, Number(limit));
    }
    async lookupScannedDocumentTarget(req, staffId) {
        return this.documentService.lookupStaffForScannedDocument(req?.user, staffId);
    }
    async getDocument(req, id) {
        return this.documentService.getDocument(req?.user, id);
    }
    async markDocumentRead(req, id) {
        return this.documentService.markDocumentRead(req?.user, id);
    }
    async createDocument(req, body, file) {
        this.ensureUploadDir();
        const fileUrl = await this.resolveUploadedFileUrl(body, file);
        return this.documentService.createDocument(req?.user, {
            ...body,
            fileUrl,
            fileType: file?.mimetype ?? body?.fileType,
            fileSize: file?.size ?? body?.fileSize,
            versions: body?.versions,
            version: body?.version,
        });
    }
    async createScannedDocument(req, body, file) {
        this.ensureUploadDir();
        if (!file) {
            throw new common_1.BadRequestException('A scanned PDF is required.');
        }
        try {
            return await this.documentService.createScannedDocument(req?.user, {
                staffId: body?.staffId,
                title: body?.title,
                description: body?.description,
                pageCount: body?.pageCount,
                fileUrl: `uploads/documents/${file.filename}`,
                fileType: file.mimetype,
                fileSize: file.size,
            });
        }
        catch (error) {
            await this.discardUploadedFile(file);
            throw error;
        }
    }
    async updateDocument(req, id, body, file) {
        const updatePayload = { ...body };
        const suppliedFileUrl = typeof body?.fileUrl === 'string' && body.fileUrl.trim()
            ? body.fileUrl.trim()
            : undefined;
        if (file) {
            updatePayload.fileUrl = await this.resolveUploadedFileUrl(body, file);
            updatePayload.fileType = file.mimetype;
            updatePayload.fileSize = file.size;
        }
        else if (suppliedFileUrl) {
            updatePayload.fileUrl = suppliedFileUrl;
            if (body?.fileType)
                updatePayload.fileType = body.fileType;
            if (body?.fileSize !== undefined)
                updatePayload.fileSize = body.fileSize;
        }
        return this.documentService.updateDocument(req?.user, id, updatePayload);
    }
    async deleteDocument(req, id) {
        return this.documentService.deleteDocument(req?.user, id);
    }
};
exports.DocumentLibraryController = DocumentLibraryController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('category')),
    __param(3, (0, common_1.Query)('owner')),
    __param(4, (0, common_1.Query)('featured')),
    __param(5, (0, common_1.Query)('excludeEmployeeDocuments')),
    __param(6, (0, common_1.Query)('includeReadStatus')),
    __param(7, (0, common_1.Query)('page')),
    __param(8, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], DocumentLibraryController.prototype, "listDocuments", null);
__decorate([
    (0, common_1.Get)('categories'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('excludeEmployeeDocuments')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentLibraryController.prototype, "categories", null);
__decorate([
    (0, common_1.Get)('policy/unread'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentLibraryController.prototype, "unreadPolicyDocuments", null);
__decorate([
    (0, common_1.Get)('staff-lookup'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('staffId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentLibraryController.prototype, "lookupScannedDocumentTarget", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentLibraryController.prototype, "getDocument", null);
__decorate([
    (0, common_1.Post)(':id/read'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentLibraryController.prototype, "markDocumentRead", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => {
                const dir = (0, path_1.join)(process.cwd(), 'uploads', 'documents');
                if (!fs.existsSync(dir))
                    fs.mkdirSync(dir, { recursive: true });
                cb(null, dir);
            },
            filename: (_req, file, cb) => {
                const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            },
        }),
    })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentLibraryController.prototype, "createDocument", null);
__decorate([
    (0, common_1.Post)('scan'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => {
                const dir = (0, path_1.join)(process.cwd(), 'uploads', 'documents');
                if (!fs.existsSync(dir))
                    fs.mkdirSync(dir, { recursive: true });
                cb(null, dir);
            },
            filename: (_req, file, cb) => {
                const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                cb(null, `scan-${uniqueSuffix}.pdf`);
            },
        }),
        limits: { fileSize: SCANNED_DOCUMENT_MAX_BYTES, files: 1 },
        fileFilter: (_req, file, cb) => {
            if (!isPdfUpload(file)) {
                cb(new common_1.BadRequestException('A scanned document must be uploaded as a PDF.'), false);
                return;
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentLibraryController.prototype, "createScannedDocument", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => {
                const dir = (0, path_1.join)(process.cwd(), 'uploads', 'documents');
                if (!fs.existsSync(dir))
                    fs.mkdirSync(dir, { recursive: true });
                cb(null, dir);
            },
            filename: (_req, file, cb) => {
                const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            },
        }),
    })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentLibraryController.prototype, "updateDocument", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentLibraryController.prototype, "deleteDocument", null);
exports.DocumentLibraryController = DocumentLibraryController = DocumentLibraryController_1 = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('documents'),
    __metadata("design:paramtypes", [document_library_service_1.DocumentLibraryService])
], DocumentLibraryController);
//# sourceMappingURL=document.controller.js.map