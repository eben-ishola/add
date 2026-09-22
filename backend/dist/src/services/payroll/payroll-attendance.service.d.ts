import { Model } from 'mongoose';
import { AttendanceDocument } from '../../schemas/attendance.schema';
import { AttendanceConfigDocument } from 'src/schemas/attendanceConfig.schema';
import { DisciplinaryCaseDocument } from 'src/schemas/disciplinary-case.schema';
import { HolidayDocument } from 'src/schemas/holiday.schema';
import { LeaveDocument } from 'src/schemas/leave.schema';
import { StaffService } from 'src/services/user/user.service';
export declare class PayrollAttendanceService {
    private readonly staffService;
    private readonly attendanceModel;
    private readonly leaveModel;
    private readonly attendanceConfigModel;
    private readonly holidayModel;
    private readonly disciplinaryCaseModel;
    constructor(staffService: StaffService, attendanceModel: Model<AttendanceDocument>, leaveModel: Model<LeaveDocument>, attendanceConfigModel: Model<AttendanceConfigDocument>, holidayModel: Model<HolidayDocument>, disciplinaryCaseModel: Model<DisciplinaryCaseDocument>);
    resolveAttendanceIdentifierAliases(rows: any[], entityId?: string): Promise<Map<string, Set<string>>>;
    resolveLateDeductionEmployees(rows: any[], periodDate: Date, identifierAliases?: Map<string, Set<string>>): Promise<Set<string>>;
    resolveAttendanceSummaryByEmployee(rows: any[], periodDate: Date, identifierAliases?: Map<string, Set<string>>): Promise<Map<string, {
        absentDays: number;
    }>>;
    applyAbsenceDeduction(rows: any[], attendanceSummary: Map<string, {
        absentDays: number;
    }>, defaultWorkingDays: number, periodDate: Date): any[];
    applyLateAttendanceDeduction(rows: any[], deductionIds: Set<string>, defaultWorkingDays: number): any[];
    buildAttendanceSummary(rows: any[], periodDate: Date, entityId?: string): Promise<Array<{
        employeeId: string;
        absentDays: number;
        latePenaltyDays: number;
    }>>;
    private buildAttendanceWorkdayKeys;
    private parseLeaveDate;
}
