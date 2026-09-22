export declare const MFA_TRUST_TTL_DAYS = 2;
export declare function issueMfaTrustToken(baseSecret: string, userId: string, totpSecret?: string | null): string | null;
export declare function verifyMfaTrustToken(baseSecret: string, token: string | null | undefined, userId: string, totpSecret?: string | null): boolean;
