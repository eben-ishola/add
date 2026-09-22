export declare class CbaService {
    private readonly logger;
    private readonly requestTimeoutMs;
    private resolveCbaUrl;
    private resolveApiKey;
    private extractUpstreamMessage;
    private unwrapRows;
    private requestCba;
    fetchGlExpenditure(input: {
        account: string;
        institution: string;
        start: string;
        end: string;
    }): Promise<{
        status: number;
        totalDebit: number;
        data: any[];
    }>;
    searchGlAccounts(input: {
        name: string;
        businessUnit: string;
    }): Promise<{
        status: number;
        data: any[];
    }>;
    selectGlAccounts(input: {
        subLedger: string;
        businessUnit: string;
    }): Promise<{
        status: number;
        data: any[];
    }>;
    fetchSalaryCallOver(narration: string): Promise<{
        status: number;
        data: any[];
    }>;
}
