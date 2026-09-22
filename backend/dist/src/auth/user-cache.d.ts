export declare const buildUserCacheKey: (payload: any) => string;
export declare const readUserCache: (key: string) => any | null;
export declare const writeUserCache: (key: string, user: any) => void;
export declare const dropUserCacheKey: (key: string) => void;
export declare const invalidateUserCache: (userId: unknown) => void;
export declare const clearUserCache: () => void;
