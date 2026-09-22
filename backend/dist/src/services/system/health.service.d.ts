import type { Connection } from 'mongoose';
export declare class HealthService {
    private readonly mainConnection;
    constructor(mainConnection: Connection);
    getHealth(): {
        ok: boolean;
        status: string;
        uptimeSeconds: number;
        timestamp: string;
        dependencies: {
            mongo: {
                status: string;
                database: string;
            };
        };
    };
}
