"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const api_response_util_1 = require("../utils/shared/api-response.util");
let ApiExceptionFilter = class ApiExceptionFilter {
    catch(exception, host) {
        const context = host.switchToHttp();
        const response = context.getResponse();
        const request = context.getRequest();
        const status = this.resolveStatus(exception);
        const exceptionBody = this.resolveExceptionBody(exception);
        const message = this.resolveMessage(exceptionBody, exception);
        const code = this.resolveCode(status, exceptionBody);
        const details = this.resolveDetails(exceptionBody, request);
        response.status(status).json((0, api_response_util_1.apiError)(code, message, details));
    }
    resolveStatus(exception) {
        return exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
    }
    resolveExceptionBody(exception) {
        return exception instanceof common_1.HttpException ? exception.getResponse() : undefined;
    }
    resolveMessage(exceptionBody, exception) {
        if (typeof exceptionBody === 'string' && exceptionBody.trim()) {
            return exceptionBody;
        }
        if (exceptionBody && typeof exceptionBody === 'object') {
            const body = exceptionBody;
            const rawMessage = body.message;
            if (Array.isArray(rawMessage)) {
                return rawMessage.map((entry) => String(entry)).join('; ');
            }
            if (typeof rawMessage === 'string' && rawMessage.trim()) {
                return rawMessage;
            }
        }
        return exception instanceof Error && exception.message
            ? exception.message
            : 'Request failed';
    }
    resolveCode(status, exceptionBody) {
        if (status === common_1.HttpStatus.BAD_REQUEST &&
            exceptionBody &&
            typeof exceptionBody === 'object' &&
            Array.isArray(exceptionBody.message)) {
            return 'VALIDATION_ERROR';
        }
        if (exceptionBody && typeof exceptionBody === 'object') {
            const error = exceptionBody.error;
            if (typeof error === 'string' && error.trim()) {
                return error.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_');
            }
        }
        return `HTTP_${status}`;
    }
    resolveDetails(exceptionBody, request) {
        const details = {
            path: request.url,
            method: request.method,
            timestamp: new Date().toISOString(),
        };
        if (exceptionBody && typeof exceptionBody === 'object') {
            const body = exceptionBody;
            if (Array.isArray(body.message)) {
                details.validationErrors = body.message;
            }
            const extra = Object.fromEntries(Object.entries(body).filter(([key]) => !['statusCode', 'error', 'message'].includes(key)));
            if (Object.keys(extra).length) {
                details.context = extra;
            }
        }
        return details;
    }
};
exports.ApiExceptionFilter = ApiExceptionFilter;
exports.ApiExceptionFilter = ApiExceptionFilter = __decorate([
    (0, common_1.Catch)()
], ApiExceptionFilter);
//# sourceMappingURL=api-exception.filter.js.map