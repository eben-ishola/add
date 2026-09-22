"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollAttendanceService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const moment = require("moment-timezone");
const attendance_schema_1 = require("../../schemas/attendance.schema");
const attendanceConfig_schema_1 = require("../../schemas/attendanceConfig.schema");
const disciplinary_case_schema_1 = require("../../schemas/disciplinary-case.schema");
const holiday_schema_1 = require("../../schemas/holiday.schema");
const leave_schema_1 = require("../../schemas/leave.schema");
const user_service_1 = require("../user/user.service");
const payroll_calculation_util_1 = require("../../utils/payroll/payroll-calculation.util");
const payroll_attendance_util_1 = require("../../utils/payroll/payroll-attendance.util");
const payroll_period_util_1 = require("../../utils/payroll/payroll-period.util");
const payroll_proration_util_1 = require("../../utils/payroll/payroll-proration.util");
let PayrollAttendanceService = class PayrollAttendanceService {
    constructor(staffService, attendanceModel, leaveModel, attendanceConfigModel, holidayModel, disciplinaryCaseModel) {
        this.staffService = staffService;
        this.attendanceModel = attendanceModel;
        this.leaveModel = leaveModel;
        this.attendanceConfigModel = attendanceConfigModel;
        this.holidayModel = holidayModel;
        this.disciplinaryCaseModel = disciplinaryCaseModel;
    }
    async resolveAttendanceIdentifierAliases(rows, entityId) {
        const aliasMap = new Map();
        const baseIds = new Set();
        rows.forEach((row) => {
            (0, payroll_attendance_util_1.collectPayrollAttendanceIdentifiers)(row).forEach((id) => baseIds.add(id));
        });
        if (!baseIds.size) {
            return aliasMap;
        }
        baseIds.forEach((id) => (0, payroll_attendance_util_1.mergePayrollAttendanceAliasSets)(aliasMap, [id]));
        const directory = await this.staffService
            .resolveStaffDirectory(Array.from(baseIds), entityId)
            .catch(() => null);
        const staffRows = Array.isArray(directory?.data) ? directory.data : [];
        staffRows.forEach((entry) => {
            (0, payroll_attendance_util_1.mergePayrollAttendanceAliasSets)(aliasMap, [
                entry?.staffId ? String(entry.staffId) : undefined,
                entry?.userId ? String(entry.userId) : undefined,
                entry?.staffObjectId ? String(entry.staffObjectId) : undefined,
            ]);
        });
        return aliasMap;
    }
    async resolveLateDeductionEmployees(rows, periodDate, identifierAliases) {
        const aliasMap = identifierAliases ?? (await this.resolveAttendanceIdentifierAliases(rows));
        const ids = Array.from(new Set(rows.flatMap((row) => (0, payroll_attendance_util_1.expandPayrollAttendanceIdentifiers)((0, payroll_attendance_util_1.collectPayrollAttendanceIdentifiers)(row), aliasMap))));
        if (!ids.length) {
            return new Set();
        }
        const monthStart = moment(periodDate).tz('Africa/Lagos').startOf('month').toDate();
        const monthEnd = moment(periodDate).tz('Africa/Lagos').endOf('month').toDate();
        try {
            const results = await this.disciplinaryCaseModel
                .find({
                employeeId: { $in: ids },
                salaryDeductionApplied: true,
                salaryDeductionRequired: true,
                incidentDate: { $gte: monthStart, $lte: monthEnd },
            })
                .select('employeeId')
                .lean()
                .exec();
            const matched = new Set();
            results
                .map((entry) => entry?.employeeId)
                .filter((value) => value !== undefined && value !== null)
                .map((value) => String(value))
                .forEach((value) => {
                matched.add(value);
                const aliases = aliasMap.get(value);
                if (aliases) {
                    aliases.forEach((alias) => matched.add(alias));
                }
            });
            return matched;
        }
        catch (error) {
            console.error('Failed to resolve salary deduction cases', error);
            return new Set();
        }
    }
    async resolveAttendanceSummaryByEmployee(rows, periodDate, identifierAliases) {
        const aliasMap = identifierAliases ?? (await this.resolveAttendanceIdentifierAliases(rows));
        const identifierToGroup = new Map();
        const groupToIdentifiers = new Map();
        const resolveGroupId = (identifiers) => {
            let groupId;
            identifiers.forEach((id) => {
                const existing = identifierToGroup.get(id);
                if (existing && !groupId) {
                    groupId = existing;
                }
            });
            groupId = groupId ?? identifiers[0];
            identifiers.forEach((id) => {
                const existing = identifierToGroup.get(id);
                if (existing && existing !== groupId) {
                    const existingMembers = groupToIdentifiers.get(existing);
                    if (existingMembers) {
                        const target = groupToIdentifiers.get(groupId) ?? new Set();
                        existingMembers.forEach((member) => {
                            identifierToGroup.set(member, groupId);
                            target.add(member);
                        });
                        groupToIdentifiers.set(groupId, target);
                        groupToIdentifiers.delete(existing);
                    }
                }
                identifierToGroup.set(id, groupId);
                const bucket = groupToIdentifiers.get(groupId) ?? new Set();
                bucket.add(id);
                groupToIdentifiers.set(groupId, bucket);
            });
            return groupId;
        };
        const attendanceWindowsByGroup = new Map();
        rows.forEach((row) => {
            const identifiers = (0, payroll_attendance_util_1.expandPayrollAttendanceIdentifiers)((0, payroll_attendance_util_1.collectPayrollAttendanceIdentifiers)(row), aliasMap);
            if (!identifiers.length)
                return;
            const groupId = resolveGroupId(identifiers);
            const startDate = (0, payroll_period_util_1.resolveDateValue)(row?.startDate);
            let exitDate = (0, payroll_period_util_1.resolveDateValue)(row?.exitDate);
            if (exitDate && exitDate.getFullYear() <= 1971) {
                exitDate = null;
            }
            if (startDate && exitDate && exitDate < startDate) {
                exitDate = null;
            }
            const current = attendanceWindowsByGroup.get(groupId) ?? {};
            if (startDate && (!current.start || startDate < current.start)) {
                current.start = startDate;
            }
            if (exitDate && (!current.end || exitDate < current.end)) {
                current.end = exitDate;
            }
            attendanceWindowsByGroup.set(groupId, current);
        });
        const ids = Array.from(identifierToGroup.keys());
        if (!ids.length) {
            return new Map();
        }
        const monthStart = moment(periodDate).tz('Africa/Lagos').startOf('month').startOf('day');
        const monthEnd = moment(periodDate).tz('Africa/Lagos').endOf('month').startOf('day');
        const monthEndInclusive = monthEnd.clone().endOf('day');
        const { dayKeys } = await this.buildAttendanceWorkdayKeys(monthStart, monthEnd, monthEndInclusive);
        const leaveDaysByGroup = new Map();
        const approvedLeaves = await this.leaveModel
            .find({
            userId: { $in: ids },
            status: { $regex: /^approved$/i },
        })
            .select({ userId: 1, startDate: 1, endDate: 1, resumptionDate: 1 })
            .lean()
            .exec();
        approvedLeaves.forEach((leave) => {
            const owner = leave?.userId ? String(leave.userId).trim() : '';
            if (!owner)
                return;
            const groupId = identifierToGroup.get(owner);
            if (!groupId)
                return;
            const start = this.parseLeaveDate(leave?.startDate);
            const resumption = this.parseLeaveDate(leave?.resumptionDate ?? leave?.endDate);
            if (!start || !resumption)
                return;
            const leaveStart = start.clone().startOf('day');
            const leaveEnd = resumption.clone().startOf('day').subtract(1, 'day');
            if (leaveEnd.isBefore(leaveStart, 'day'))
                return;
            if (leaveEnd.isBefore(monthStart) || leaveStart.isAfter(monthEnd))
                return;
            const rangeStart = moment.max(leaveStart, monthStart);
            const rangeEnd = moment.min(leaveEnd, monthEnd);
            const bucket = leaveDaysByGroup.get(groupId) ?? new Set();
            for (let cursor = rangeStart.clone(); cursor.isSameOrBefore(rangeEnd); cursor.add(1, 'day')) {
                bucket.add(cursor.format('YYYY-MM-DD'));
            }
            leaveDaysByGroup.set(groupId, bucket);
        });
        const attendanceRecords = await this.attendanceModel
            .find({
            employeeId: { $in: ids },
            date: { $gte: monthStart.toDate(), $lte: monthEndInclusive.toDate() },
        })
            .select({ employeeId: 1, date: 1, status: 1 })
            .lean()
            .exec();
        const attendanceByGroup = new Map();
        attendanceRecords.forEach((record) => {
            const employeeId = record?.employeeId ? String(record.employeeId).trim() : '';
            if (!employeeId || !record?.date)
                return;
            const groupId = identifierToGroup.get(employeeId);
            if (!groupId)
                return;
            const dayKey = moment(record.date).tz('Africa/Lagos').format('YYYY-MM-DD');
            const status = typeof record?.status === 'string' ? record.status : 'Present';
            const bucket = attendanceByGroup.get(groupId) ?? new Map();
            const existing = bucket.get(dayKey);
            if (existing && existing.toLowerCase() !== 'absent') {
                attendanceByGroup.set(groupId, bucket);
                return;
            }
            if (existing && existing.toLowerCase() === 'absent' && status.toLowerCase() === 'absent') {
                attendanceByGroup.set(groupId, bucket);
                return;
            }
            bucket.set(dayKey, status);
            attendanceByGroup.set(groupId, bucket);
        });
        const result = new Map();
        groupToIdentifiers.forEach((identifiers, groupId) => {
            const leaveDays = leaveDaysByGroup.get(groupId) ?? new Set();
            const attendanceByDay = attendanceByGroup.get(groupId);
            const window = attendanceWindowsByGroup.get(groupId);
            const windowStart = window?.start
                ? moment(window.start).tz('Africa/Lagos').startOf('day')
                : monthStart;
            const windowEnd = window?.end
                ? moment(window.end).tz('Africa/Lagos').startOf('day')
                : monthEnd;
            const startKey = moment.max(windowStart, monthStart).format('YYYY-MM-DD');
            const endKey = moment.min(windowEnd, monthEnd).format('YYYY-MM-DD');
            let effectiveAbsentDays = 0;
            if (startKey <= endKey) {
                dayKeys.forEach((dayKey) => {
                    if (dayKey < startKey || dayKey > endKey)
                        return;
                    if (leaveDays.has(dayKey))
                        return;
                    const status = attendanceByDay?.get(dayKey);
                    if (!status || String(status).toLowerCase() === 'absent') {
                        effectiveAbsentDays += 1;
                    }
                });
            }
            identifiers.forEach((id) => {
                result.set(id, {
                    absentDays: effectiveAbsentDays,
                });
            });
        });
        return result;
    }
    applyAbsenceDeduction(rows, attendanceSummary, defaultWorkingDays, periodDate) {
        if (!attendanceSummary.size)
            return rows;
        const eligibleTypes = new Set(['salary', 'variable', 'reimbursable']);
        return rows.map((row) => {
            if (!row || typeof row !== 'object')
                return row;
            const type = row?.type ?? (0, payroll_proration_util_1.detectPayrollRowType)(row);
            if (!eligibleTypes.has(type))
                return row;
            const summary = (0, payroll_attendance_util_1.resolvePayrollAttendanceSummaryForRow)(attendanceSummary, row);
            if (!summary)
                return row;
            const proration = (0, payroll_proration_util_1.resolvePayrollProrationDetails)(row, defaultWorkingDays, {
                type,
                periodDate,
                includeAttendance: false,
            });
            const expectedDays = (0, payroll_calculation_util_1.toSafePayrollNumber)(proration.workedDays, defaultWorkingDays);
            const rawAbsentDays = (0, payroll_calculation_util_1.toSafePayrollNumber)(summary.absentDays, 0);
            const absentDays = Math.max(Math.min(rawAbsentDays, expectedDays), 0);
            if (!absentDays)
                return row;
            const baseDays = (0, payroll_calculation_util_1.toSafePayrollNumber)(row?.prorateBase ?? row?.totalDays ?? row?.workingDays ?? defaultWorkingDays, defaultWorkingDays);
            return {
                ...row,
                prorateBase: baseDays,
                attendanceAbsentDays: absentDays,
            };
        });
    }
    applyLateAttendanceDeduction(rows, deductionIds, defaultWorkingDays) {
        if (!deductionIds.size)
            return rows;
        return rows.map((row) => {
            if (!(0, payroll_attendance_util_1.hasPayrollLateAttendancePenalty)(deductionIds, row)) {
                return row;
            }
            const type = row?.type ?? (0, payroll_proration_util_1.detectPayrollRowType)(row);
            if (type !== 'salary') {
                return row;
            }
            const baseDays = (0, payroll_calculation_util_1.toSafePayrollNumber)(row?.prorateBase ?? row?.totalDays ?? row?.workingDays ?? defaultWorkingDays, defaultWorkingDays);
            const existingPenalty = (0, payroll_calculation_util_1.toSafePayrollNumber)(row?.attendanceLatePenaltyDays, 0);
            return {
                ...row,
                prorateBase: baseDays,
                attendanceLatePenaltyDays: existingPenalty + 1,
            };
        });
    }
    async buildAttendanceSummary(rows, periodDate, entityId) {
        const attendanceRows = rows.filter((row) => ['salary', 'variable', 'reimbursable'].includes(row?.type ?? (0, payroll_proration_util_1.detectPayrollRowType)(row)));
        const attendanceIdentifierAliases = attendanceRows.length
            ? await this.resolveAttendanceIdentifierAliases(attendanceRows, entityId)
            : new Map();
        const attendanceSummary = attendanceRows.length
            ? await this.resolveAttendanceSummaryByEmployee(attendanceRows, periodDate, attendanceIdentifierAliases)
            : new Map();
        const salaryRows = rows.filter((row) => (row?.type ?? (0, payroll_proration_util_1.detectPayrollRowType)(row)) === 'salary');
        const lateDeductionIds = salaryRows.length
            ? await this.resolveLateDeductionEmployees(salaryRows, periodDate, attendanceIdentifierAliases)
            : new Set();
        const dataMap = new Map();
        attendanceRows.forEach((row) => {
            const key = (0, payroll_attendance_util_1.extractPayrollEmployeeIdFromRow)(row);
            if (!key)
                return;
            const summary = (0, payroll_attendance_util_1.resolvePayrollAttendanceSummaryForRow)(attendanceSummary, row);
            const absentDays = (0, payroll_calculation_util_1.toSafePayrollNumber)(summary?.absentDays, 0);
            const latePenaltyDays = (0, payroll_attendance_util_1.hasPayrollLateAttendancePenalty)(lateDeductionIds, row) ? 1 : 0;
            const existing = dataMap.get(key);
            if (existing) {
                dataMap.set(key, {
                    absentDays: Math.max(existing.absentDays, absentDays),
                    latePenaltyDays: Math.max(existing.latePenaltyDays, latePenaltyDays),
                });
                return;
            }
            dataMap.set(key, { absentDays, latePenaltyDays });
        });
        return Array.from(dataMap.entries()).map(([employeeId, summary]) => ({
            employeeId,
            absentDays: summary.absentDays,
            latePenaltyDays: summary.latePenaltyDays,
        }));
    }
    async buildAttendanceWorkdayKeys(monthStart, monthEnd, monthEndInclusive) {
        const config = await this.attendanceConfigModel.findOne().lean().exec();
        const excludeWeekends = config?.excludeWeekends ?? true;
        const holidayRecords = await this.holidayModel
            .find({ date: { $gte: monthStart.toDate(), $lte: monthEndInclusive.toDate() } })
            .select({ date: 1 })
            .lean()
            .exec();
        const holidayDays = new Set();
        holidayRecords.forEach((record) => {
            if (!record?.date)
                return;
            const dayKey = moment(record.date).tz('Africa/Lagos').format('YYYY-MM-DD');
            holidayDays.add(dayKey);
        });
        if (config) {
            const additions = (0, payroll_attendance_util_1.normalizePayrollHolidayList)(config?.publicHolidayAdditions ?? config?.holidayAdditions);
            const removals = (0, payroll_attendance_util_1.normalizePayrollHolidayList)(config?.publicHolidayRemovals ?? config?.holidayRemovals);
            const legacyOverride = (0, payroll_attendance_util_1.normalizePayrollHolidayList)(config?.publicHolidays);
            const mergedAdditions = new Set(additions);
            legacyOverride.forEach((date) => {
                if (!holidayDays.has(date)) {
                    mergedAdditions.add(date);
                }
            });
            mergedAdditions.forEach((date) => holidayDays.add(date));
            removals.forEach((date) => holidayDays.delete(date));
        }
        const today = moment().tz('Africa/Lagos').startOf('day');
        const dayKeys = [];
        for (let cursor = monthStart.clone(); cursor.isSameOrBefore(monthEnd); cursor.add(1, 'day')) {
            if (cursor.isAfter(today, 'day'))
                continue;
            if (excludeWeekends && [0, 6].includes(cursor.day()))
                continue;
            const dayKey = cursor.format('YYYY-MM-DD');
            if (holidayDays.has(dayKey))
                continue;
            dayKeys.push(dayKey);
        }
        return { dayKeys, holidayDays };
    }
    parseLeaveDate(value) {
        if (!value)
            return null;
        if (value instanceof Date && !Number.isNaN(value.getTime())) {
            return moment(value).tz('Africa/Lagos');
        }
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed)
                return null;
            const parsed = moment(trimmed, ['DD-MM-YYYY', 'YYYY-MM-DD', moment.ISO_8601], true);
            if (parsed.isValid()) {
                return parsed.tz('Africa/Lagos');
            }
            const fallback = moment(trimmed);
            return fallback.isValid() ? fallback.tz('Africa/Lagos') : null;
        }
        return null;
    }
};
exports.PayrollAttendanceService = PayrollAttendanceService;
exports.PayrollAttendanceService = PayrollAttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)(attendance_schema_1.Attendance.name)),
    __param(2, (0, mongoose_1.InjectModel)(leave_schema_1.Leave.name)),
    __param(3, (0, mongoose_1.InjectModel)(attendanceConfig_schema_1.AttendanceConfig.name)),
    __param(4, (0, mongoose_1.InjectModel)(holiday_schema_1.Holiday.name)),
    __param(5, (0, mongoose_1.InjectModel)(disciplinary_case_schema_1.DisciplinaryCase.name)),
    __metadata("design:paramtypes", [user_service_1.StaffService,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], PayrollAttendanceService);
//# sourceMappingURL=payroll-attendance.service.js.map