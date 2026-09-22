"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const document_controller_1 = require("../controllers/documents/document.controller");
const document_library_service_1 = require("../services/documents/document-library.service");
const document_library_schema_1 = require("../schemas/document-library.schema");
const document_read_schema_1 = require("../schemas/document-read.schema");
const user_schema_1 = require("../schemas/user.schema");
let DocumentModule = class DocumentModule {
};
exports.DocumentModule = DocumentModule;
exports.DocumentModule = DocumentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: document_library_schema_1.DocumentLibrary.name, schema: document_library_schema_1.DocumentLibrarySchema },
                { name: document_read_schema_1.DocumentRead.name, schema: document_read_schema_1.DocumentReadSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
        ],
        controllers: [document_controller_1.DocumentLibraryController],
        providers: [document_library_service_1.DocumentLibraryService],
        exports: [document_library_service_1.DocumentLibraryService],
    })
], DocumentModule);
//# sourceMappingURL=document.module.js.map