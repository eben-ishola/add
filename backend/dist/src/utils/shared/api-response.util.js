"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiError = exports.apiPaginated = exports.apiSuccess = exports.API_RESPONSE_VERSION = void 0;
exports.API_RESPONSE_VERSION = 1;
const apiSuccess = (data, options = {}) => ({
    ok: true,
    apiVersion: exports.API_RESPONSE_VERSION,
    data,
    ...(options.message ? { message: options.message } : {}),
    ...(options.meta ? { meta: options.meta } : {}),
});
exports.apiSuccess = apiSuccess;
const apiPaginated = (data, pagination, options = {}) => (0, exports.apiSuccess)(data, {
    message: options.message,
    meta: {
        ...(options.meta ?? {}),
        pagination,
    },
});
exports.apiPaginated = apiPaginated;
const apiError = (code, message, details) => ({
    ok: false,
    apiVersion: exports.API_RESPONSE_VERSION,
    error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
    },
});
exports.apiError = apiError;
//# sourceMappingURL=api-response.util.js.map