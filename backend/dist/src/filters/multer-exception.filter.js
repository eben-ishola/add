"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MulterExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MulterExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const multer_1 = require("multer");
let MulterExceptionFilter = MulterExceptionFilter_1 = class MulterExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(MulterExceptionFilter_1.name);
    }
    catch(error, host) {
        const response = host.switchToHttp().getResponse();
        const { status, message } = this.describe(error);
        this.logger.warn(`Upload rejected (${error.code}${error.field ? ` on ${error.field}` : ''}): ${message}`);
        response.status(status).json({
            statusCode: status,
            message,
            error: common_1.HttpStatus[status] ?? 'Bad Request',
        });
    }
    describe(error) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return {
                    status: common_1.HttpStatus.PAYLOAD_TOO_LARGE,
                    message: 'File too large. Choose a smaller file and try again.',
                };
            case 'LIMIT_FILE_COUNT':
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Too many files were attached.',
                };
            case 'LIMIT_UNEXPECTED_FILE':
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: `Unexpected file field${error.field ? ` "${error.field}"` : ''}.`,
                };
            case 'LIMIT_PART_COUNT':
            case 'LIMIT_FIELD_KEY':
            case 'LIMIT_FIELD_VALUE':
            case 'LIMIT_FIELD_COUNT':
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: 'The upload had too many or too large form fields.',
                };
            default:
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: error.message || 'The file could not be uploaded.',
                };
        }
    }
};
exports.MulterExceptionFilter = MulterExceptionFilter;
exports.MulterExceptionFilter = MulterExceptionFilter = MulterExceptionFilter_1 = __decorate([
    (0, common_1.Catch)(multer_1.MulterError)
], MulterExceptionFilter);
//# sourceMappingURL=multer-exception.filter.js.map