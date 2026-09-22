import { Model } from 'mongoose';
import { Activity } from '../../schemas/activity.schema';
import { Clock } from '../../schemas/clock.schema';
export declare class MonitoringService {
    private activityModel;
    private clockModel;
    constructor(activityModel: Model<Activity>, clockModel: Model<Clock>);
    logActivity(payload: any): Promise<import("mongoose").Document<unknown, {}, Activity, {}, {}> & Activity & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    clockInOut(payload: any): Promise<import("mongoose").Document<unknown, {}, Clock, {}, {}> & Clock & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    getUserActivities(user: string, startDate: string, endDate: string): Promise<(import("mongoose").Document<unknown, {}, Activity, {}, {}> & Activity & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    getNormalActivity(user: string, startDate: Date, endDate: Date, page?: number, limit?: number): Promise<{
        totalPages: number;
        currentPage: number;
        data: any[];
    }>;
    getDetailedActivity(user: string, startDate: Date, endDate: Date, page?: number, limit?: number): Promise<{
        totalPages: number;
        currentPage: number;
        data: any[];
    }>;
    getSummarizedActivity(user: string, startDate: Date, endDate: Date, page?: number, limit?: number): Promise<{
        totalPages: number;
        currentPage: number;
        data: any[];
    }>;
    getClockHistory(user: string): Promise<(import("mongoose").Document<unknown, {}, Clock, {}, {}> & Clock & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    confirmUninstall(password: string): Promise<void>;
    handleUninstallAttempt(user: any): Promise<void>;
    verifyAdminPassword(password: string): Promise<{
        message: string;
    }>;
    findGroupedActivities(page?: number, limit?: number, startDate?: string, endDate?: string, user?: string): Promise<{
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        totalDuration: any;
        data: any[];
    }>;
    findUserActivities(page?: number, limit?: number, startDate?: string, endDate?: string): Promise<{
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        data: any[];
    }>;
}
