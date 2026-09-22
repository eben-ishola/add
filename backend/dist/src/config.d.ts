export type OrbitServerConfig = {
    user?: string;
    password?: string;
    connectionString?: string;
    connectString?: string;
    calloverQuery?: string;
};
export type AppConfig = {
    neutralDB: string;
    authDB: string;
    mainDB: string;
    incentivesDB: string;
    savingsDB: string;
    cbaUrl: string;
    cbaApiKey: string;
    performanceKpiOpenDay: number;
    performanceKpiApiImportDay: number;
    performanceKpiApiUrl: string;
    performanceKpiApiToken: string;
    performanceKpiApiPeriodOffsetMonths: number;
    port: number;
    frontendUrl: string;
    corsOrigins: string[];
    bodyLimit: string;
    swaggerEnabled: boolean;
    jwtSecret: string;
    mfaChallengeSecret: string;
};
export declare const config: AppConfig;
