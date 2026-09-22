import { HealthService } from 'src/services/system/health.service';
import { MonitoringService } from 'src/services/system/monitoring.service';
export declare class MonitoringController {
    private readonly monitoringService;
    private readonly healthService;
    constructor(monitoringService: MonitoringService, healthService: HealthService);
    getHealth(): Promise<{
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
    }>;
    logActivity(payload: any): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/activity.schema").Activity, {}, {}> & import("../../schemas/activity.schema").Activity & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    clockInOut(payload: any): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/clock.schema").Clock, {}, {}> & import("../../schemas/clock.schema").Clock & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    getUserActivities(userId: string): Promise<void>;
    getNormalActivity(user: string, startDate: string, endDate: string, page?: number, limit?: number): Promise<{
        totalPages: number;
        currentPage: number;
        data: any[];
    }>;
    getDetailedActivity(user: string, startDate: string, endDate: string, page?: number, limit?: number): Promise<{
        totalPages: number;
        currentPage: number;
        data: any[];
    }>;
    getSummarizedActivity(user: string, startDate: string, endDate: string, page?: number, limit?: number): Promise<{
        totalPages: number;
        currentPage: number;
        data: any[];
    }>;
    getClockHistory(userId: string): Promise<(import("mongoose").Document<unknown, {}, import("../../schemas/clock.schema").Clock, {}, {}> & import("../../schemas/clock.schema").Clock & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    uninstallAttempt(payload: any): Promise<void>;
    verifyAdminPassword({ password }: {
        password: string;
    }): Promise<{
        message: string;
    }>;
    confirmUninstall({ password }: {
        password: string;
    }): Promise<void>;
    getGroupedActivities(page?: number, limit?: number, startDate?: string, endDate?: string, user?: string): Promise<{
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        totalDuration: any;
        data: any[];
    }>;
    getGroupedUser(page?: number, limit?: number, startDate?: string, endDate?: string): Promise<{
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        data: any[];
    }>;
}
