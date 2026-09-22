export declare const API_RESPONSE_VERSION: 1;
export type ApiPaginationMeta = {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
};
export type ApiResponseMeta = Record<string, unknown> & {
    pagination?: ApiPaginationMeta;
};
export type ApiSuccessResponse<T> = {
    ok: true;
    apiVersion: typeof API_RESPONSE_VERSION;
    data: T;
    message?: string;
    meta?: ApiResponseMeta;
};
export type ApiErrorResponse = {
    ok: false;
    apiVersion: typeof API_RESPONSE_VERSION;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
};
type ApiSuccessOptions = {
    message?: string;
    meta?: ApiResponseMeta;
};
export declare const apiSuccess: <T>(data: T, options?: ApiSuccessOptions) => ApiSuccessResponse<T>;
export declare const apiPaginated: <T>(data: T[], pagination: ApiPaginationMeta, options?: Omit<ApiSuccessOptions, "meta"> & {
    meta?: Omit<ApiResponseMeta, "pagination">;
}) => ApiSuccessResponse<T[]>;
export declare const apiError: (code: string, message: string, details?: unknown) => ApiErrorResponse;
export {};
