export type RequestSource = 'main' | 'others';
export declare const MAIN_REQUEST_SOURCE: RequestSource;
export declare const EXTERNAL_REQUEST_SOURCE: RequestSource;
export declare const REQUEST_SOURCES: readonly RequestSource[];
export declare const normalizeRequestSource: (value: unknown) => RequestSource;
export declare const projectUserForSource: (user: any, source: RequestSource) => any;
