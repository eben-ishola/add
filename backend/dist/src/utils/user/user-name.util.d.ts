export declare const NAME_FIELDS: readonly ["firstName", "middleName", "lastName"];
export declare const toTitleCaseName: (value: unknown) => string;
export declare const normalizeNameFields: <T extends Record<string, any>>(payload: T) => T;
