import { OnApplicationBootstrap } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { StaffService } from 'src/services/user/user.service';
import { PerformanceKpiResultService } from 'src/services/performance/performance-kpi-result.service';
import { PerformanceService } from 'src/services/performance/performance.service';
import { NotificationDispatchService } from 'src/services/comms/notification-dispatch.service';
export declare class CronService implements OnApplicationBootstrap {
    private readonly httpService;
    private readonly staffService;
    private readonly performanceKpiResultService;
    private readonly performanceService;
    private readonly dispatchService;
    constructor(httpService: HttpService, staffService: StaffService, performanceKpiResultService: PerformanceKpiResultService, performanceService: PerformanceService, dispatchService: NotificationDispatchService);
    onApplicationBootstrap(): void;
    private deactivateExitedStaff;
    deactivateExitedStaffAtDayStart(): Promise<void>;
    handleCron(): Promise<void>;
    handlePerformanceKpiCron(): Promise<void>;
    handleOutstandingAppraisalNudges(): Promise<void>;
}
