export type YearMonth = {
    year: number;
    month: number;
    start: Date;
    end: Date;
    key: string;
};
export declare const normalizeText: (value: unknown) => string;
export declare const normalizeToken: (value: unknown) => string;
export declare const normalizeStatus: (value: unknown) => string;
export declare const normalizeStage: (value: unknown) => string;
export declare const resolvePortalBaseUrl: (value?: string) => string;
export declare const buildNoticePayload: (user: unknown, message: unknown, extra?: Record<string, unknown>) => Record<string, unknown>;
export declare const parseYearMonth: (value: unknown, now?: Date) => YearMonth;
export declare const dateRangeForMonth: (value: unknown, now?: Date) => Pick<YearMonth, "start" | "end" | "key">;
