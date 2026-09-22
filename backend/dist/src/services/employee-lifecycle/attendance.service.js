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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const moment = require("moment-timezone");
const attendance_schema_1 = require("../../schemas/attendance.schema");
const attendanceConfig_schema_1 = require("../../schemas/attendanceConfig.schema");
const holiday_schema_1 = require("../../schemas/holiday.schema");
const leave_schema_1 = require("../../schemas/leave.schema");
const schedule_1 = require("@nestjs/schedule");
const user_service_1 = require("../user/user.service");
const notice_service_1 = require("../comms/notice.service");
const disciplinary_service_1 = require("./disciplinary.service");
const mail_service_1 = require("../comms/mail.service");
const notification_dispatch_service_1 = require("../comms/notification-dispatch.service");
const user_name_util_1 = require("../../utils/user/user-name.util");
const OFFICE_DISTANCE_METERS = 35;
const ATTENDANCE_PUBLIC_FIELDS = [
    '_id',
    'employeeId',
    'date',
    'clockIn',
    'clockOut',
    'totalHours',
    'status',
    'workMode',
    'note',
    'clockInPhotoUrl',
    'clockOutPhotoUrl',
];
const ATTENDANCE_PUBLIC_PROJECTION = ATTENDANCE_PUBLIC_FIELDS.join(' ');
let AttendanceService = class AttendanceService {
    constructor(attModel, cfgModel, holidayModel, leaveModel, staffService, noticeService, disciplinaryService, mailService, dispatchService) {
        this.attModel = attModel;
        this.cfgModel = cfgModel;
        this.holidayModel = holidayModel;
        this.leaveModel = leaveModel;
        this.staffService = staffService;
        this.noticeService = noticeService;
        this.disciplinaryService = disciplinaryService;
        this.mailService = mailService;
        this.dispatchService = dispatchService;
    }
    serializeAttendanceRecord(record) {
        if (!record)
            return null;
        return {
            _id: record?._id,
            employeeId: record?.employeeId ?? null,
            date: record?.date ?? null,
            clockIn: record?.clockIn ?? null,
            clockOut: record?.clockOut ?? null,
            totalHours: record?.totalHours ?? '0h 0m',
            status: record?.status ?? null,
            workMode: record?.workMode ?? null,
            note: record?.note ?? null,
            clockInPhotoUrl: record?.clockInPhotoUrl ?? null,
            clockOutPhotoUrl: record?.clockOutPhotoUrl ?? null,
        };
    }
    getTodayRangeLagos() {
        const start = moment().tz('Africa/Lagos').startOf('day');
        const end = moment().tz('Africa/Lagos').endOf('day');
        return { start, end };
    }
    async getConfig() {
        let cfg = await this.cfgModel.findOne();
        if (!cfg) {
            cfg = await this.cfgModel.create({});
        }
        return cfg;
    }
    ipToLong(ip) {
        return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);
    }
    cidrMaskBits(bits) {
        return -1 << (32 - bits);
    }
    isIpInCidr(ip, cidr) {
        const [cidrBase, bitsStr] = cidr.split('/');
        const bits = parseInt(bitsStr, 10);
        const ipLong = this.ipToLong(ip);
        const baseLong = this.ipToLong(cidrBase);
        const mask = this.cidrMaskBits(bits);
        return (ipLong & mask) === (baseLong & mask);
    }
    isOfficeIP(ip, cidrList) {
        return cidrList.some(cidr => this.isIpInCidr(ip, cidr));
    }
    isOfficeIP2(ip, cidrList) {
        return cidrList.some(cidr => cidr === ip);
    }
    normalizeCoordinate(value) {
        if (value === null || value === undefined)
            return null;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    toRadians(value) {
        return (value * Math.PI) / 180;
    }
    distanceMeters(lat1, lng1, lat2, lng2) {
        const earthRadiusMeters = 6371000;
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) *
                Math.cos(this.toRadians(lat2)) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadiusMeters * c;
    }
    normalizeWorkMode(value) {
        if (typeof value !== 'string')
            return null;
        const normalized = value.trim().toLowerCase();
        if (normalized === 'office')
            return 'Office';
        if (normalized === 'remote')
            return 'Remote';
        return null;
    }
    combineTime(base, time, fallback = '00:00') {
        const value = typeof time === 'string' && /^\d{1,2}:\d{2}$/.test(time.trim())
            ? time.trim()
            : fallback;
        const [hourStr, minuteStr] = value.split(':');
        const hour = Math.min(Math.max(parseInt(hourStr, 10) || 0, 0), 23);
        const minute = Math.min(Math.max(parseInt(minuteStr, 10) || 0, 0), 59);
        return base.clone().set({ hour, minute, second: 0, millisecond: 0 });
    }
    normalizeTimeInput(value, fallback) {
        if (typeof value !== 'string') {
            return fallback;
        }
        const trimmed = value.trim();
        if (!/^\d{1,2}:\d{2}$/.test(trimmed)) {
            return fallback;
        }
        const [hourStr, minuteStr] = trimmed.split(':');
        const hour = Math.min(Math.max(parseInt(hourStr, 10) || 0, 0), 23);
        const minute = Math.min(Math.max(parseInt(minuteStr, 10) || 0, 0), 59);
        return `${hour.toString().padStart(2, '0')}:${minute
            .toString()
            .padStart(2, '0')}`;
    }
    normalizeHolidayDate(value) {
        if (!value)
            return null;
        if (value instanceof Date) {
            return moment(value).tz('Africa/Lagos').format('YYYY-MM-DD');
        }
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed)
                return null;
            const parsed = moment(trimmed, ['DD-MM-YYYY', 'YYYY-MM-DD', moment.ISO_8601], true);
            if (!parsed.isValid())
                return null;
            return parsed.tz('Africa/Lagos').format('YYYY-MM-DD');
        }
        if (typeof value === 'object') {
            return this.normalizeHolidayDate(value?.date ?? value?.holidayDate);
        }
        return null;
    }
    formatLateDate(value) {
        return moment(value).tz('Africa/Lagos').format('DD MMM YYYY');
    }
    buildLateDatesSummary(dates) {
        const formatted = dates
            .filter((date) => date && !Number.isNaN(date.getTime()))
            .map((date) => this.formatLateDate(date));
        return formatted.length ? formatted.join(', ') : 'N/A';
    }
    resolveLatePolicyAction(count, monthLabel, datesSummary) {
        if (count === 1) {
            return {
                key: 'warning',
                noticeType: 'attendance',
                sendEmail: false,
                message: `Late attendance warning: you were late once in ${monthLabel}. Date(s): ${datesSummary}.`,
            };
        }
        if (count === 2) {
            return {
                key: 'query',
                noticeType: 'disciplinary',
                sendEmail: true,
                message: `Query issued for lateness in ${monthLabel}. You have been late twice. Date(s): ${datesSummary}.`,
                disciplinary: {
                    severity: 'Medium',
                    summary: `Late attendance query (2 occurrences) for ${monthLabel}. Date(s): ${datesSummary}.`,
                    nextSteps: 'Submit an explanation for the repeated late attendance.',
                },
            };
        }
        if (count === 3) {
            return {
                key: 'query-followup',
                noticeType: 'disciplinary',
                sendEmail: true,
                message: `Second query issued for lateness in ${monthLabel}. You have been late three times. Date(s): ${datesSummary}.`,
                disciplinary: {
                    severity: 'High',
                    summary: `Late attendance query (3 occurrences) for ${monthLabel}. Date(s): ${datesSummary}.`,
                    nextSteps: 'Submit an explanation for continued late attendance.',
                },
            };
        }
        if (count === 4) {
            return {
                key: 'salary-deduction',
                noticeType: 'disciplinary',
                sendEmail: true,
                message: `Salary deduction recommended for lateness in ${monthLabel}. You have been late four times. Date(s): ${datesSummary}.`,
                disciplinary: {
                    severity: 'High',
                    summary: `Salary deduction recommended for 4 late attendances in ${monthLabel}. Date(s): ${datesSummary}.`,
                    nextSteps: 'HR to review and apply one-day salary deduction.',
                },
            };
        }
        if (count >= 5) {
            const countLabel = count === 5 ? 'five times' : `${count} times`;
            return {
                key: 'suspension',
                noticeType: 'disciplinary',
                sendEmail: true,
                message: `Suspension triggered for lateness in ${monthLabel}. You have been late ${countLabel}. Date(s): ${datesSummary}.`,
                disciplinary: {
                    severity: 'High',
                    summary: `Suspension recommended for ${count} late attendances in ${monthLabel}. Date(s): ${datesSummary}.`,
                    nextSteps: 'HR to initiate suspension process.',
                },
            };
        }
        return null;
    }
    normalizeEmail(value) {
        if (typeof value !== 'string')
            return null;
        const trimmed = value.trim();
        return trimmed ? trimmed : null;
    }
    buildStaffDisplayName(staff, fallback) {
        const fallbackName = (0, user_name_util_1.toTitleCaseName)(fallback) || 'Employee';
        if (!staff) {
            return fallbackName;
        }
        const segments = [staff?.firstName, staff?.middleName, staff?.lastName]
            .filter((value) => typeof value === 'string' && value.trim().length > 0)
            .map((value) => value.trim());
        if (segments.length) {
            return (0, user_name_util_1.toTitleCaseName)(segments.join(' '));
        }
        if (typeof staff?.fullName === 'string' && staff.fullName.trim()) {
            return (0, user_name_util_1.toTitleCaseName)(staff.fullName);
        }
        if (typeof staff?.email === 'string' && staff.email.trim()) {
            return staff.email.trim();
        }
        return fallbackName;
    }
    resolveLatePolicySubject(actionKey) {
        switch (actionKey) {
            case 'query':
            case 'query-followup':
                return 'Attendance Query';
            case 'salary-deduction':
                return 'Attendance Salary Deduction';
            case 'suspension':
                return 'Attendance Suspension';
            default:
                return 'Attendance Notification';
        }
    }
    buildLatePolicyEscalationMessage(actionKey, employeeName, lateCount, monthLabel, datesSummary) {
        const countLabel = `${lateCount} time${lateCount === 1 ? '' : 's'}`;
        const base = `${employeeName} was late ${countLabel} in ${monthLabel}. Date(s): ${datesSummary}.`;
        switch (actionKey) {
            case 'query':
                return `Attendance query issued. ${base}`;
            case 'query-followup':
                return `Attendance query escalated. ${base}`;
            case 'salary-deduction':
                return `Salary deduction required (1 day). ${base}`;
            case 'suspension':
                return `Suspension required. ${base}`;
            default:
                return base;
        }
    }
    async claimScheduledRun(jobName) {
        if (!this.dispatchService)
            return true;
        return this.dispatchService.claimScheduledRun(jobName);
    }
    buildLatePolicyClaimKey(employeeId, when, actionKey) {
        return ['attendance-late-policy', employeeId, when.format('YYYY-MM'), actionKey].join(':');
    }
    async claimLatePolicyAction(key, context) {
        if (!this.dispatchService)
            return true;
        return this.dispatchService.claim(key, {
            channel: 'attendance-late-policy',
            context,
        });
    }
    async sendMailIfAvailable(to, subject, message) {
        if (!this.mailService || !to)
            return false;
        try {
            const result = await this.mailService.sendMail({
                to,
                subject,
                text: message,
            });
            return Boolean(result?.success);
        }
        catch (error) {
            console.error('Failed to send attendance email', error);
            return false;
        }
    }
    async safeCreateNotice(userId, message, type) {
        if (!userId || !message)
            return;
        try {
            await this.noticeService.createNotice({
                userId,
                message,
                type,
                sendEmail: false,
            });
        }
        catch (error) {
            console.error('Failed to create attendance notice', error);
        }
    }
    async resolveSupervisorRecord(staff) {
        const supervisorRef = staff?.supervisorId ?? staff?.supervisor2Id;
        if (!supervisorRef)
            return null;
        if (typeof supervisorRef === 'object') {
            return supervisorRef;
        }
        return this.staffService.getById(String(supervisorRef)).catch(() => null);
    }
    async notifyLatePolicyRecipients(options) {
        const { employeeId, employeeName, staff, action, lateCount, monthLabel, datesSummary, } = options;
        await this.safeCreateNotice(employeeId, action.message, action.noticeType);
        if (!action.sendEmail) {
            return {
                mailSent: false,
                recipients: [],
            };
        }
        const subject = this.resolveLatePolicySubject(action.key);
        const attemptedRecipientKeys = new Set();
        const sentRecipientKeys = new Set();
        const sendUnique = async (email, message) => {
            const normalized = this.normalizeEmail(email);
            if (!normalized)
                return;
            const key = normalized.toLowerCase();
            if (attemptedRecipientKeys.has(key))
                return;
            attemptedRecipientKeys.add(key);
            const sent = await this.sendMailIfAvailable(normalized, subject, message);
            if (sent) {
                sentRecipientKeys.add(key);
            }
        };
        await sendUnique(staff?.email, action.message);
        const supervisor = await this.resolveSupervisorRecord(staff);
        const supervisorId = supervisor?._id ?? supervisor;
        const supervisorMessage = this.buildLatePolicyEscalationMessage(action.key, employeeName, lateCount, monthLabel, datesSummary);
        if (supervisorId) {
            await this.safeCreateNotice(String(supervisorId), supervisorMessage, action.noticeType);
        }
        await sendUnique(supervisor?.email, supervisorMessage);
        await sendUnique(staff?.department?.groupEmail, supervisorMessage);
        return {
            mailSent: sentRecipientKeys.size > 0,
            recipients: Array.from(sentRecipientKeys),
        };
    }
    normalizeHolidayList(source) {
        const list = Array.isArray(source)
            ? source
            : typeof source === 'string'
                ? source.split(/\r?\n/)
                : [];
        const normalized = list
            .map((value) => this.normalizeHolidayDate(value))
            .filter((value) => Boolean(value));
        return Array.from(new Set(normalized)).sort();
    }
    async getHolidayBaseDates() {
        const holidays = await this.holidayModel.find().select('date').lean();
        const dates = holidays.map((holiday) => holiday?.date);
        return this.normalizeHolidayList(dates);
    }
    resolveHolidayOverrides(cfg, baseDates) {
        const additions = this.normalizeHolidayList(cfg?.publicHolidayAdditions ?? cfg?.holidayAdditions);
        const removals = this.normalizeHolidayList(cfg?.publicHolidayRemovals ?? cfg?.holidayRemovals);
        const legacyOverride = this.normalizeHolidayList(cfg?.publicHolidays);
        const baseSet = new Set(baseDates);
        const mergedAdditions = new Set(additions);
        legacyOverride.forEach((date) => {
            if (!baseSet.has(date)) {
                mergedAdditions.add(date);
            }
        });
        const set = new Set(baseDates);
        Array.from(mergedAdditions).forEach((date) => set.add(date));
        removals.forEach((date) => set.delete(date));
        return {
            effective: Array.from(set).sort(),
            additions: Array.from(mergedAdditions).sort(),
            removals,
            legacyOverride: legacyOverride.length > 0 && baseDates.length === 0,
        };
    }
    async getEffectivePublicHolidays(cfg) {
        const baseDates = await this.getHolidayBaseDates();
        const overrides = this.resolveHolidayOverrides(cfg, baseDates);
        return {
            baseDates,
            ...overrides,
        };
    }
    async serializeConfig(cfg) {
        const obj = cfg.toObject();
        const clockInWindowStart = this.normalizeTimeInput(obj.clockInWindowStart ?? obj.startOfBusiness ?? '08:00', '08:00');
        const { baseDates, effective, additions, removals } = await this.getEffectivePublicHolidays(cfg);
        return {
            startOfBusiness: this.normalizeTimeInput(obj.startOfBusiness, '09:00'),
            closeOfBusiness: this.normalizeTimeInput(obj.closeOfBusiness, '17:00'),
            excludeWeekends: obj.excludeWeekends ?? true,
            publicHolidays: effective,
            publicHolidayBase: baseDates,
            publicHolidayAdditions: additions,
            publicHolidayRemovals: removals,
            enableAutoAbsent: obj.enableAutoAbsent ?? true,
            enableAutoClockOut: obj.enableAutoClockOut ?? true,
            gracePeriodInMinutes: obj.gracePeriodInMinutes ?? 15,
            officeIps: Array.isArray(obj.officeIps) ? obj.officeIps : [],
            clockInWindowStart,
            lateThresholdTime: this.normalizeTimeInput(obj.lateThresholdTime ?? '09:05', '09:05'),
            absentThresholdTime: this.normalizeTimeInput(obj.absentThresholdTime ?? '09:30', '09:30'),
            allowLateNotes: obj.allowLateNotes ?? true,
            requireFacePresence: obj.requireFacePresence ?? true,
            requireFaceMatch: obj.requireFaceMatch ?? obj.enableFaceVerification ?? true,
            enableFaceVerification: obj.enableFaceVerification ?? true,
            maxRemoteDaysPerMonth: obj.maxRemoteDaysPerMonth ?? 7,
            remoteExemptStaff: Array.isArray(obj.remoteExemptStaff)
                ? obj.remoteExemptStaff.map((id) => String(id))
                : [],
        };
    }
    async clockIn(employeeId, meta) {
        meta = meta ?? {};
        const { start: todayStart, end: todayEnd } = this.getTodayRangeLagos();
        const [cfg, existing, staff] = await Promise.all([
            this.getConfig(),
            this.attModel.findOne({
                employeeId,
                date: { $gte: todayStart.toDate(), $lte: todayEnd.toDate() },
            }),
            this.staffService.getAttendanceIdentity(employeeId),
        ]);
        if (existing?.clockIn) {
            throw new common_1.BadRequestException('Already clocked in today.');
        }
        if (!staff) {
            throw new common_1.NotFoundException('Employee not found.');
        }
        const fullName = (0, user_name_util_1.toTitleCaseName)(`${staff.lastName} ${staff.firstName} ${staff.middleName || ''}`);
        const now = moment().tz('Africa/Lagos');
        const windowStart = this.combineTime(todayStart.clone(), cfg.clockInWindowStart ?? cfg.startOfBusiness, '08:00');
        if (now.isBefore(windowStart)) {
            throw new common_1.ForbiddenException(`Clock-in opens at ${windowStart.format('HH:mm')} for today.`);
        }
        const resolvedMode = this.normalizeWorkMode(meta.mode);
        if (resolvedMode === 'Remote') {
            const exemptList = (cfg.remoteExemptStaff ?? []).map((id) => String(id).toLowerCase());
            const isExempt = exemptList.includes(String(staff.staffId ?? '').toLowerCase());
            if (!isExempt) {
                const maxRemote = cfg.maxRemoteDaysPerMonth ?? 7;
                const monthStart = todayStart.clone().startOf('month').toDate();
                const monthEnd = todayStart.clone().endOf('month').toDate();
                const remoteDaysUsed = await this.attModel.countDocuments({
                    employeeId,
                    date: { $gte: monthStart, $lte: monthEnd },
                    workMode: 'Remote',
                });
                if (remoteDaysUsed >= maxRemote) {
                    throw new common_1.ForbiddenException(`Exceed possible remote days. You have used all ${maxRemote} remote day(s) allowed this month.`);
                }
            }
        }
        const lateThreshold = this.combineTime(todayStart.clone(), cfg.lateThresholdTime, '09:05');
        const status = now.isSameOrAfter(lateThreshold) ? 'Late' : 'Present';
        const record = existing ?? new this.attModel({
            employeeId,
            employeeName: fullName,
            date: todayStart.toDate(),
        });
        record.employeeId = employeeId;
        record.employeeName = fullName;
        record.date = todayStart.toDate();
        record.clockIn = now.toDate();
        record.status = status;
        if (resolvedMode) {
            record.workMode = resolvedMode;
        }
        record.clockInPhotoUrl = meta.clockInPhotoUrl;
        record.note = typeof meta.note === 'string' ? meta.note.trim() : undefined;
        record.totalHours ??= '0h 0m';
        try {
            const saved = await record.save();
            return this.serializeAttendanceRecord(saved);
        }
        catch (err) {
            console.error('Clock-in save failed', err);
            throw new common_1.BadRequestException('Unable to complete clock-in.');
        }
    }
    async clockOut(employeeId, meta, mode) {
        const { start: todayStart, end: todayEnd } = this.getTodayRangeLagos();
        const cfg = await this.getConfig();
        const rec = await this.attModel.findOne({
            employeeId,
            date: { $gte: todayStart.toDate(), $lte: todayEnd.toDate() }
        });
        if (!rec)
            throw new common_1.NotFoundException('No clock-in record found.');
        if (rec.workMode === 'Remote' && mode)
            rec.workMode = mode;
        const now = moment().tz('Africa/Lagos');
        rec.clockOut = now.toDate();
        if (rec.clockIn) {
            const duration = moment.duration(now.diff(moment(rec.clockIn)));
            const hours = Math.floor(duration.asHours());
            const minutes = duration.minutes();
            rec.totalHours = `${hours}h ${minutes}m`;
        }
        rec.ip = meta.ip;
        rec.city = meta.city;
        rec.country = meta.country;
        rec.isp = meta.org;
        if (meta.clockOutPhotoUrl) {
            rec.clockOutPhotoUrl = meta.clockOutPhotoUrl;
        }
        const saved = await rec.save();
        return this.serializeAttendanceRecord(saved);
    }
    async updateNote(attendanceId, note) {
        const attendance = await this.attModel.findById(attendanceId);
        if (!attendance) {
            throw new common_1.NotFoundException('Attendance record not found.');
        }
        attendance.note = note;
        const saved = await attendance.save();
        return this.serializeAttendanceRecord(saved);
    }
    async getAttendanceConfig() {
        const cfg = await this.getConfig();
        return await this.serializeConfig(cfg);
    }
    async updateAttendanceConfig(payload) {
        const current = await this.getConfig();
        const update = {};
        const startTimeInput = payload.startOfBusiness ?? payload.startTime;
        if (startTimeInput !== undefined) {
            update.startOfBusiness = this.normalizeTimeInput(startTimeInput, this.normalizeTimeInput(current.startOfBusiness, '09:00'));
        }
        const closeTimeInput = payload.closeOfBusiness ?? payload.endTime;
        if (closeTimeInput !== undefined) {
            update.closeOfBusiness = this.normalizeTimeInput(closeTimeInput, this.normalizeTimeInput(current.closeOfBusiness, '17:00'));
        }
        if (payload.clockInWindowStart !== undefined || payload.startTime !== undefined) {
            update.clockInWindowStart = this.normalizeTimeInput(payload.clockInWindowStart ?? payload.startTime, this.normalizeTimeInput(current.clockInWindowStart ?? current.startOfBusiness, '08:00'));
        }
        if (payload.lateThresholdTime !== undefined) {
            update.lateThresholdTime = this.normalizeTimeInput(payload.lateThresholdTime, this.normalizeTimeInput(current.lateThresholdTime ?? '09:05', '09:05'));
        }
        if (payload.absentThresholdTime !== undefined) {
            update.absentThresholdTime = this.normalizeTimeInput(payload.absentThresholdTime, this.normalizeTimeInput(current.absentThresholdTime ?? '09:30', '09:30'));
        }
        if (payload.excludeWeekends !== undefined || payload.excludedWeekends !== undefined) {
            update.excludeWeekends = Boolean(payload.excludeWeekends ?? payload.excludedWeekends);
        }
        if (payload.enableAutoAbsent !== undefined) {
            update.enableAutoAbsent = Boolean(payload.enableAutoAbsent);
        }
        if (payload.enableAutoClockOut !== undefined) {
            update.enableAutoClockOut = Boolean(payload.enableAutoClockOut);
        }
        if (payload.allowLateNotes !== undefined) {
            update.allowLateNotes = Boolean(payload.allowLateNotes);
        }
        if (payload.requireFacePresence !== undefined) {
            const presence = Boolean(payload.requireFacePresence);
            update.requireFacePresence = presence;
            if (!presence) {
                update.requireFaceMatch = false;
            }
        }
        if (payload.requireFaceMatch !== undefined) {
            const match = Boolean(payload.requireFaceMatch);
            const presence = update.requireFacePresence ?? payload.requireFacePresence ?? true;
            update.requireFaceMatch = match && Boolean(presence);
            update.enableFaceVerification = update.requireFaceMatch;
        }
        if (payload.enableFaceVerification !== undefined) {
            update.enableFaceVerification = Boolean(payload.enableFaceVerification);
        }
        if (payload.maxRemoteDaysPerMonth !== undefined) {
            const days = Number(payload.maxRemoteDaysPerMonth);
            if (Number.isFinite(days) && days >= 0) {
                update.maxRemoteDaysPerMonth = Math.round(days);
            }
        }
        if (payload.remoteExemptStaff !== undefined) {
            const raw = Array.isArray(payload.remoteExemptStaff)
                ? payload.remoteExemptStaff
                : String(payload.remoteExemptStaff ?? '')
                    .split(',')
                    .map((id) => id.trim())
                    .filter(Boolean);
            update.remoteExemptStaff = raw
                .map((id) => String(id).trim())
                .filter(Boolean);
        }
        if (payload.gracePeriodInMinutes !== undefined || payload.graceMinutes !== undefined) {
            const minutes = Number(payload.gracePeriodInMinutes ?? payload.graceMinutes);
            if (Number.isFinite(minutes) && minutes >= 0) {
                update.gracePeriodInMinutes = Math.round(minutes);
            }
        }
        if (payload.officeIps !== undefined) {
            const ips = Array.isArray(payload.officeIps)
                ? payload.officeIps
                : String(payload.officeIps ?? '')
                    .split(',')
                    .map((ip) => ip.trim())
                    .filter(Boolean);
            update.officeIps = ips;
        }
        const legacyHolidayUpdate = payload.publicHolidays !== undefined ||
            payload.excludedHolidays !== undefined;
        const additionsProvided = payload.publicHolidayAdditions !== undefined ||
            payload.holidayAdditions !== undefined;
        const removalsProvided = payload.publicHolidayRemovals !== undefined ||
            payload.holidayRemovals !== undefined;
        if (legacyHolidayUpdate) {
            const holidaysSource = payload.publicHolidays ?? payload.excludedHolidays ?? [];
            update.publicHolidays = this.normalizeHolidayList(holidaysSource);
            if (!additionsProvided) {
                update.publicHolidayAdditions = [];
            }
            if (!removalsProvided) {
                update.publicHolidayRemovals = [];
            }
        }
        if (additionsProvided) {
            const additionsSource = payload.publicHolidayAdditions ?? payload.holidayAdditions ?? [];
            update.publicHolidayAdditions = this.normalizeHolidayList(additionsSource);
        }
        if (removalsProvided) {
            const removalsSource = payload.publicHolidayRemovals ?? payload.holidayRemovals ?? [];
            update.publicHolidayRemovals = this.normalizeHolidayList(removalsSource);
        }
        const updated = await this.cfgModel.findOneAndUpdate({ _id: current._id }, { $set: update }, { new: true, upsert: true, setDefaultsOnInsert: true });
        return await this.serializeConfig(updated);
    }
    async getAttendance(employeeId, month, year, page = 1, limit = 10, options) {
        let safePage = Math.max(Number(page) || 1, 1);
        const safeLimit = Math.max(Number(limit) || 10, 1);
        const cfg = await this.getConfig();
        const { effective: publicHolidays } = await this.getEffectivePublicHolidays(cfg);
        const publicHolidaySet = new Set(publicHolidays);
        const start = moment.tz({ year, month: month - 1 }, 'Africa/Lagos').startOf('month');
        const end = moment.tz({ year, month: month - 1 }, 'Africa/Lagos').endOf('month');
        const leaveDaysMap = await this.resolveLeaveDaysMap([String(employeeId)], start, end);
        const leaveDays = leaveDaysMap.get(String(employeeId)) ?? new Set();
        const skip = (safePage - 1) * safeLimit;
        const allDays = Array.from({ length: end.date() }, (_, i) => start.clone().add(i, 'days')).filter(d => {
            const isWeekend = cfg.excludeWeekends && [0, 6].includes(d.day());
            const isHoliday = !isWeekend && publicHolidaySet.has(d.format('YYYY-MM-DD'));
            return !isWeekend && !isHoliday;
        });
        const records = await this.attModel
            .find({
            employeeId,
            date: { $gte: start.toDate(), $lte: end.toDate() }
        })
            .select(ATTENDANCE_PUBLIC_PROJECTION)
            .sort({ date: -1 })
            .lean();
        const paginated = allDays.slice(skip, skip + safeLimit);
        const today = moment().tz('Africa/Lagos').startOf('day');
        const result = paginated.map(day => {
            const dayKey = day.format('YYYY-MM-DD');
            const record = records.find(r => moment(r.date).tz('Africa/Lagos').isSame(day, 'day'));
            if (leaveDays.has(dayKey) && (!record || String(record.status).toLowerCase() === 'absent')) {
                return {
                    employeeId,
                    date: dayKey,
                    clockIn: null,
                    clockOut: null,
                    totalHours: '0h 0m',
                    status: 'Leave',
                    workMode: null,
                    note: null,
                    clockInPhotoUrl: null,
                };
            }
            if (record) {
                return this.serializeAttendanceRecord(record);
            }
            const isFuture = day.isAfter(today, 'day');
            return {
                employeeId,
                date: dayKey,
                clockIn: null,
                clockOut: null,
                totalHours: '0h 0m',
                status: isFuture ? 'Upcoming' : 'Absent',
                workMode: null,
                note: null,
                clockInPhotoUrl: null,
            };
        });
        const response = {
            data: result,
            totalPages: Math.ceil(allDays.length / safeLimit),
            page: safePage
        };
        if (options?.includeFullData) {
            response.fullData = records.map((record) => this.serializeAttendanceRecord(record));
        }
        return response;
    }
    parseLeaveDate(value) {
        if (!value)
            return null;
        if (value instanceof Date) {
            const parsed = moment(value);
            return parsed.isValid() ? parsed : null;
        }
        const trimmed = String(value ?? '').trim();
        if (!trimmed)
            return null;
        const parsed = moment(trimmed);
        return parsed.isValid() ? parsed : null;
    }
    async resolveLeaveDaysMap(userIds, start, end) {
        const ids = Array.from(new Set(userIds.filter(Boolean)));
        if (!ids.length)
            return new Map();
        const leaves = await this.leaveModel
            .find({
            userId: { $in: ids },
            status: { $regex: /^approved$/i },
        })
            .select({ userId: 1, startDate: 1, endDate: 1, resumptionDate: 1 })
            .lean()
            .exec();
        const startDay = start.clone().startOf('day');
        const endDay = end.clone().startOf('day');
        const result = new Map();
        leaves.forEach((leave) => {
            const userId = leave?.userId ? String(leave.userId).trim() : '';
            if (!userId)
                return;
            const startDate = this.parseLeaveDate(leave?.startDate);
            const resumptionDate = this.parseLeaveDate(leave?.resumptionDate ?? leave?.endDate);
            if (!startDate || !resumptionDate)
                return;
            const leaveStart = startDate.clone().tz('Africa/Lagos').startOf('day');
            const leaveEnd = resumptionDate.clone().tz('Africa/Lagos').startOf('day').subtract(1, 'day');
            if (leaveEnd.isBefore(leaveStart, 'day'))
                return;
            if (leaveEnd.isBefore(startDay) || leaveStart.isAfter(endDay))
                return;
            const rangeStart = moment.max(leaveStart, startDay);
            const rangeEnd = moment.min(leaveEnd, endDay);
            const bucket = result.get(userId) ?? new Set();
            for (let cursor = rangeStart.clone(); cursor.isSameOrBefore(rangeEnd); cursor.add(1, 'day')) {
                bucket.add(cursor.format('YYYY-MM-DD'));
            }
            result.set(userId, bucket);
        });
        return result;
    }
    async getMonthlyAttendanceStats(employeeId) {
        const now = moment().tz('Africa/Lagos');
        const start = now.clone().startOf('month');
        const end = now.clone().endOf('month');
        const cfg = await this.getConfig();
        const { effective: publicHolidays } = await this.getEffectivePublicHolidays(cfg);
        const publicHolidaySet = new Set(publicHolidays);
        const leaveDaysMap = await this.resolveLeaveDaysMap([String(employeeId)], start, end);
        const leaveDays = leaveDaysMap.get(String(employeeId)) ?? new Set();
        const allDays = Array.from({ length: end.date() }, (_, i) => start.clone().add(i, 'days')).filter(d => {
            const isWeekend = cfg.excludeWeekends && [0, 6].includes(d.day());
            const isHoliday = !isWeekend && publicHolidaySet.has(d.format('YYYY-MM-DD'));
            return !isWeekend && !isHoliday;
        });
        const records = await this.attModel
            .find({
            employeeId,
            date: { $gte: start.toDate(), $lte: end.toDate() }
        })
            .select('date status')
            .lean();
        let present = 0;
        let late = 0;
        let absent = 0;
        const today = now.clone().startOf('day');
        let leaveCount = 0;
        allDays.forEach(day => {
            if (day.isAfter(today, 'day')) {
                return;
            }
            const dayKey = day.format('YYYY-MM-DD');
            if (leaveDays.has(dayKey)) {
                leaveCount += 1;
                return;
            }
            const rec = records.find(r => moment(r.date).tz('Africa/Lagos').isSame(day, 'day'));
            if (!rec || rec.status === 'Absent')
                absent++;
            else {
                if (rec.status === 'Late') {
                    present++;
                    late++;
                }
                else {
                    present++;
                }
            }
        });
        return {
            present,
            late,
            absent,
            total: Math.max(allDays.length - leaveCount, 0),
        };
    }
    async getAttendanceAdmin(params) {
        const { viewMode, date, page = 1, limit = 10, isHR, supervisorId, search, entity, status, mode: modeInput, department, branch, } = params;
        let safePage = Math.max(Number(page) || 1, 1);
        const safeLimit = Math.max(Number(limit) || 10, 1);
        const normalizeFilter = (value) => {
            const trimmed = String(value ?? '').trim().toLowerCase();
            return trimmed && trimmed !== 'all' ? trimmed : '';
        };
        const normalizeModeFilter = (value) => {
            const trimmed = String(value ?? '').trim().toLowerCase();
            if (!trimmed || trimmed === 'all')
                return '';
            if (['office', 'onsite', 'on-site', 'on site', 'in-office', 'in office'].includes(trimmed)) {
                return 'office';
            }
            if (['remote', 'wfh', 'work from home'].includes(trimmed)) {
                return 'remote';
            }
            return trimmed;
        };
        const statusFilter = normalizeFilter(status);
        const modeFilter = normalizeModeFilter(modeInput);
        const departmentFilter = normalizeFilter(department);
        const branchFilter = normalizeFilter(branch);
        const hasStatusFilter = Boolean(statusFilter);
        const hasModeFilter = Boolean(modeFilter);
        const hasDepartmentFilter = Boolean(departmentFilter);
        const hasBranchFilter = Boolean(branchFilter);
        const cfg = await this.getConfig();
        const { effective: publicHolidays } = await this.getEffectivePublicHolidays(cfg);
        const publicHolidaySet = new Set(publicHolidays);
        const mode = ['daily', 'weekly', 'monthly'].includes(String(viewMode))
            ? viewMode
            : 'daily';
        const base = moment(date).tz('Africa/Lagos');
        const start = mode === 'daily'
            ? base.clone().startOf('day')
            : mode === 'weekly'
                ? base.clone().startOf('isoWeek')
                : base.clone().startOf('month');
        const end = mode === 'daily'
            ? base.clone().endOf('day')
            : mode === 'weekly'
                ? base.clone().endOf('isoWeek')
                : base.clone().endOf('month');
        const today = moment().tz('Africa/Lagos').startOf('day');
        const lightOptions = { light: true };
        let staffList = isHR
            ? await this.staffService.getStaffList(entity, lightOptions)
            : supervisorId !== undefined
                ? await this.staffService.getBySupervisor(String(supervisorId), lightOptions)
                : await this.staffService.getStaffList(entity, lightOptions);
        if (search) {
            const trimmed = String(search).trim();
            if (trimmed) {
                const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const rx = new RegExp(escaped, 'i');
                staffList = staffList.filter(s => rx.test(s.lastName + ' ' + s.firstName + ' ' + (s.middleName || '')));
            }
        }
        const staffIds = staffList.map(s => s._id.toString());
        const leaveDaysByUser = await this.resolveLeaveDaysMap(staffIds, start, end);
        const recs = await this.attModel
            .find({
            employeeId: { $in: staffIds },
            date: { $gte: start.toDate(), $lte: end.toDate() },
        })
            .select(ATTENDANCE_PUBLIC_PROJECTION)
            .lean();
        const recMap = recs.reduce((acc, r) => {
            const key = moment(r.date).tz('Africa/Lagos').format('YYYY-MM-DD');
            acc[r.employeeId] = acc[r.employeeId] || {};
            acc[r.employeeId][key] = r;
            return acc;
        }, {});
        const daysArr = mode === 'daily'
            ? [base.clone()]
            : mode === 'weekly'
                ? Array.from({ length: 7 }).map((_, i) => start.clone().add(i, 'days'))
                : Array.from({ length: end.diff(start, 'days') + 1 }).map((_, i) => start.clone().add(i, 'days'));
        const statsDays = daysArr.filter((d) => !d.isAfter(today, 'day'));
        const workingDayMoments = statsDays.filter((d) => {
            const isWeekend = cfg.excludeWeekends && [0, 6].includes(d.day());
            const isHoliday = !isWeekend && publicHolidaySet.has(d.format('YYYY-MM-DD'));
            return !(isWeekend || isHoliday);
        });
        const workingDaySet = new Set(workingDayMoments.map((d) => d.format('YYYY-MM-DD')));
        const statsDayMeta = statsDays.map((d) => {
            const ds = d.format('YYYY-MM-DD');
            const isWeekend = cfg.excludeWeekends && [0, 6].includes(d.day());
            const isHoliday = !isWeekend && publicHolidaySet.has(ds);
            return { ds, isWeekend, isHoliday };
        });
        const dayMeta = daysArr.map((d) => {
            const ds = d.format('YYYY-MM-DD');
            const isWeekend = cfg.excludeWeekends && [0, 6].includes(d.day());
            const isHoliday = !isWeekend && publicHolidaySet.has(ds);
            const isFuture = d.isAfter(today, 'day');
            return { ds, isWeekend, isHoliday, isFuture, day: d };
        });
        const resolveStaffDepartment = (staff) => {
            if (!staff)
                return '';
            if (typeof staff.department === 'object' && staff.department) {
                const name = staff.department?.name ??
                    staff.department?.label ??
                    staff.department?.departmentName;
                if (typeof name === 'string' && name.trim().length) {
                    return name.trim();
                }
            }
            if (typeof staff.department === 'string' && staff.department.trim().length) {
                return staff.department.trim();
            }
            if (typeof staff.departmentName === 'string' && staff.departmentName.trim().length) {
                return staff.departmentName.trim();
            }
            if (typeof staff.businessUnit?.name === 'string' && staff.businessUnit.name.trim().length) {
                return staff.businessUnit.name.trim();
            }
            if (typeof staff.businessUnit?.BU_NM === 'string' && staff.businessUnit.BU_NM.trim().length) {
                return staff.businessUnit.BU_NM.trim();
            }
            return '';
        };
        const resolveStaffBranch = (staff) => {
            if (!staff)
                return '';
            if (typeof staff.branch === 'object' && staff.branch) {
                const name = staff.branch?.name ?? staff.branch?.label ?? staff.branch?.branchName;
                if (typeof name === 'string' && name.trim().length) {
                    return name.trim();
                }
            }
            if (typeof staff.branch === 'string' && staff.branch.trim().length) {
                return staff.branch.trim();
            }
            if (typeof staff.branchName === 'string' && staff.branchName.trim().length) {
                return staff.branchName.trim();
            }
            return '';
        };
        const normalizeKey = (value) => typeof value === 'string' ? value.trim().toLowerCase() : '';
        if (hasDepartmentFilter || hasBranchFilter) {
            staffList = staffList.filter((staff) => {
                const deptKey = normalizeKey(resolveStaffDepartment(staff));
                const branchKey = normalizeKey(resolveStaffBranch(staff));
                if (hasDepartmentFilter && deptKey !== departmentFilter)
                    return false;
                if (hasBranchFilter && branchKey !== branchFilter)
                    return false;
                return true;
            });
        }
        const normalizeStatusValue = (value) => normalizeKey(value);
        const normalizeModeValue = (value) => {
            const trimmed = normalizeKey(value);
            if (['office', 'onsite', 'on-site', 'on site', 'in-office', 'in office'].includes(trimmed)) {
                return 'office';
            }
            if (['remote', 'wfh', 'work from home'].includes(trimmed)) {
                return 'remote';
            }
            return trimmed;
        };
        const matchesDayFilters = (statusValue, modeValue) => {
            if (hasStatusFilter) {
                const statusKey = normalizeStatusValue(statusValue);
                if (!statusKey || statusKey !== statusFilter)
                    return false;
            }
            if (hasModeFilter) {
                const modeKey = normalizeModeValue(modeValue);
                if (!modeKey || modeKey !== modeFilter)
                    return false;
            }
            return true;
        };
        let scopedStaff = staffList;
        if (hasStatusFilter || hasModeFilter) {
            scopedStaff = staffList.filter((staff) => {
                const staffId = String(staff?._id ?? '');
                if (!staffId)
                    return false;
                const leaveDays = leaveDaysByUser.get(staffId) ?? new Set();
                return dayMeta.some(({ ds, isWeekend, isHoliday, isFuture }) => {
                    const rec = recMap[staffId]?.[ds];
                    let statusValue = '';
                    let modeValue = null;
                    if (isWeekend) {
                        statusValue = 'Weekend';
                    }
                    else if (isHoliday) {
                        statusValue = 'Holiday';
                    }
                    else if (leaveDays.has(ds) && (!rec || String(rec.status).toLowerCase() === 'absent')) {
                        statusValue = 'Leave';
                    }
                    else if (rec) {
                        statusValue = rec.status ?? '';
                        modeValue = rec.workMode ?? null;
                    }
                    else if (isFuture) {
                        statusValue = 'Upcoming';
                    }
                    else {
                        statusValue = 'Absent';
                    }
                    return matchesDayFilters(statusValue, modeValue);
                });
            });
        }
        const baseDs = base.format('YYYY-MM-DD');
        const baseIsWeekend = cfg.excludeWeekends && [0, 6].includes(base.day());
        const baseIsHoliday = !baseIsWeekend && publicHolidaySet.has(baseDs);
        const baseIsFuture = base.isAfter(today, 'day');
        const resolveStaffStatusForBase = (staff) => {
            if (baseIsWeekend)
                return 'Weekend';
            if (baseIsHoliday)
                return 'Holiday';
            const staffId = String(staff?._id ?? '');
            const rec = recMap[staffId]?.[baseDs];
            const leaveDays = leaveDaysByUser.get(staffId);
            if (leaveDays?.has(baseDs) && (!rec || String(rec.status).toLowerCase() === 'absent')) {
                return 'Leave';
            }
            if (rec?.status)
                return String(rec.status);
            if (baseIsFuture)
                return 'Upcoming';
            return 'Absent';
        };
        scopedStaff.sort((a, b) => {
            const statusCompare = resolveStaffStatusForBase(b).localeCompare(resolveStaffStatusForBase(a), 'en', { sensitivity: 'base' });
            if (statusCompare !== 0)
                return statusCompare;
            const firstCompare = String(a?.firstName ?? '').localeCompare(String(b?.firstName ?? ''), 'en', { sensitivity: 'base' });
            if (firstCompare !== 0)
                return firstCompare;
            return String(a?.lastName ?? '').localeCompare(String(b?.lastName ?? ''), 'en', { sensitivity: 'base' });
        });
        const scopedStaffIds = new Set(scopedStaff
            .map((staff) => String(staff?._id ?? ''))
            .filter((value) => value.length > 0));
        const totalEmployees = scopedStaff.length;
        const totalPages = Math.ceil(totalEmployees / safeLimit) || 1;
        if (safePage > totalPages) {
            safePage = 1;
        }
        const pageStart = (safePage - 1) * safeLimit;
        const pageEnd = pageStart + safeLimit;
        const pagedStaff = scopedStaff.slice(pageStart, pageEnd);
        const rows = pagedStaff.map(s => {
            const department = resolveStaffDepartment(s);
            const branch = resolveStaffBranch(s);
            const row = {
                id: s._id,
                employee: (0, user_name_util_1.toTitleCaseName)(`${s.lastName} ${s.firstName} ${s.middleName || ''}`),
                department,
                branch,
            };
            const leaveDays = leaveDaysByUser.get(String(s._id)) ?? new Set();
            dayMeta.forEach(({ ds, isWeekend, isHoliday, isFuture }) => {
                const rec = recMap[s._id]?.[ds];
                if (isWeekend) {
                    row[ds] = { status: 'Weekend', hours: '0h 0m', workMode: '', clockIn: null, clockOut: null, note: null, clockInPhotoUrl: null };
                }
                else if (isHoliday) {
                    row[ds] = { status: 'Holiday', hours: '0h 0m', workMode: '', clockIn: null, clockOut: null, note: null, clockInPhotoUrl: null };
                }
                else if (leaveDays.has(ds) && (!rec || String(rec.status).toLowerCase() === 'absent')) {
                    row[ds] = { status: 'Leave', hours: '-', workMode: '', clockIn: null, clockOut: null, note: null, clockInPhotoUrl: null };
                }
                else if (rec) {
                    row[ds] = {
                        status: rec.status,
                        hours: rec.totalHours ?? '0h 0m',
                        workMode: rec.workMode,
                        clockIn: rec.clockIn ? moment(rec.clockIn).tz('Africa/Lagos').format('HH:mm') : null,
                        clockOut: rec.clockOut ? moment(rec.clockOut).tz('Africa/Lagos').format('HH:mm') : null,
                        note: rec.note ?? null,
                        clockInPhotoUrl: rec.clockInPhotoUrl ?? null,
                    };
                }
                else if (isFuture) {
                    row[ds] = { status: 'Upcoming', hours: '-', workMode: '', clockIn: null, clockOut: null, note: null, clockInPhotoUrl: null };
                }
                else {
                    row[ds] = { status: 'Absent', hours: '0h 0m', workMode: '', clockIn: null, clockOut: null, note: null, clockInPhotoUrl: null };
                }
            });
            return row;
        });
        const totalDays = statsDays.length;
        const totalWorkingDays = workingDayMoments.length;
        const totalRecords = totalEmployees * totalDays;
        let totalLeaveDays = 0;
        leaveDaysByUser.forEach((days, userId) => {
            if (!scopedStaffIds.has(String(userId)))
                return;
            days.forEach((dayKey) => {
                if (workingDaySet.has(dayKey)) {
                    totalLeaveDays += 1;
                }
            });
        });
        const totalExpectedRecords = Math.max(totalEmployees * totalWorkingDays - totalLeaveDays, 0);
        let present = 0;
        let late = 0;
        let absentRecorded = 0;
        let remote = 0;
        let onsite = 0;
        recs.forEach((rec) => {
            if (!scopedStaffIds.has(String(rec.employeeId)))
                return;
            const day = moment(rec.date).tz('Africa/Lagos');
            if (day.isAfter(today, 'day'))
                return;
            const ds = day.format('YYYY-MM-DD');
            if (!workingDaySet.has(ds))
                return;
            const leaveDays = leaveDaysByUser.get(String(rec.employeeId));
            if (leaveDays?.has(ds))
                return;
            if (rec.status === 'Present') {
                present += 1;
            }
            else if (rec.status === 'Late') {
                late += 1;
            }
            else if (rec.status === 'Absent') {
                absentRecorded += 1;
            }
            if (rec.status === 'Present' || rec.status === 'Late') {
                const workMode = (rec.workMode || '').toLowerCase();
                if (workMode === 'remote') {
                    remote += 1;
                }
                else {
                    onsite += 1;
                }
            }
        });
        const weekendDays = cfg.excludeWeekends ? statsDayMeta.filter((d) => d.isWeekend).length : 0;
        const holidayDays = statsDayMeta.filter((d) => d.isHoliday).length;
        const attended = present + late;
        const absentMissing = Math.max(totalExpectedRecords - (present + late + absentRecorded), 0);
        const absent = absentRecorded + absentMissing;
        const calcRate = (value, total) => total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0;
        const stats = {
            totalEmployees,
            totalDays,
            totalWorkingDays,
            totalRecords,
            totalExpectedRecords,
            present,
            late,
            absent,
            weekend: totalEmployees * weekendDays,
            holiday: totalEmployees * holidayDays,
            remote,
            onsite,
        };
        const branchRollupMap = new Map();
        const ensureBranchRollup = (branchName) => {
            const label = branchName?.trim() || 'Unassigned';
            const current = branchRollupMap.get(label);
            if (current)
                return current;
            const next = {
                branch: label,
                expected: 0,
                present: 0,
                remote: 0,
                onsite: 0,
                late: 0,
                absent: 0,
                leave: 0,
                weekend: 0,
                holiday: 0,
            };
            branchRollupMap.set(label, next);
            return next;
        };
        scopedStaff.forEach((staff) => {
            const staffId = String(staff?._id ?? '');
            if (!staffId)
                return;
            const bucket = ensureBranchRollup(resolveStaffBranch(staff));
            const leaveDays = leaveDaysByUser.get(staffId) ?? new Set();
            statsDayMeta.forEach(({ ds, isWeekend, isHoliday }) => {
                if (isWeekend) {
                    bucket.weekend += 1;
                    return;
                }
                if (isHoliday) {
                    bucket.holiday += 1;
                    return;
                }
                if (!workingDaySet.has(ds))
                    return;
                const rec = recMap[staffId]?.[ds];
                if (leaveDays.has(ds) && (!rec || String(rec.status).toLowerCase() === 'absent')) {
                    bucket.leave += 1;
                    return;
                }
                bucket.expected += 1;
                if (!rec) {
                    bucket.absent += 1;
                    return;
                }
                const statusKey = String(rec.status ?? '').trim().toLowerCase();
                const workMode = normalizeModeValue(rec.workMode ?? null);
                if (statusKey === 'late') {
                    bucket.late += 1;
                    return;
                }
                if (statusKey === 'present') {
                    if (workMode === 'remote') {
                        bucket.remote += 1;
                    }
                    else {
                        bucket.present += 1;
                        bucket.onsite += 1;
                    }
                    return;
                }
                if (statusKey === 'absent') {
                    bucket.absent += 1;
                }
            });
        });
        const branchRollup = Array.from(branchRollupMap.values()).sort((left, right) => right.expected - left.expected ||
            right.present + right.remote + right.late - (left.present + left.remote + left.late) ||
            left.branch.localeCompare(right.branch));
        const derivedStats = {
            attendanceRate: calcRate(attended, totalExpectedRecords),
            absenceRate: calcRate(absent, totalExpectedRecords),
            lateRate: calcRate(late, attended || 0),
            remoteShare: calcRate(remote, attended || 0),
        };
        return {
            data: rows,
            totalPages,
            currentPage: safePage,
            stats: {
                ...stats,
                ...derivedStats,
                branchRollup,
            },
        };
    }
    async autoMarkAbsentees() {
        if (!(await this.claimScheduledRun('attendance-auto-absent')))
            return;
        const cfg = await this.getConfig();
        const { effective: publicHolidays } = await this.getEffectivePublicHolidays(cfg);
        const d = moment().tz('Africa/Lagos');
        if (!cfg.enableAutoAbsent)
            return;
        const absentThreshold = this.combineTime(d.clone().startOf('day'), cfg.absentThresholdTime, '09:30');
        if (d.isBefore(absentThreshold))
            return;
        if (cfg.excludeWeekends && [0, 6].includes(d.day()))
            return;
        if (publicHolidays.includes(d.format('YYYY-MM-DD')))
            return;
        const ids = await this.attModel.distinct('employeeId');
        const dayKey = d.format('YYYY-MM-DD');
        const leaveUsers = await this.leaveModel
            .find({
            userId: { $in: ids },
            status: { $regex: /^approved$/i },
            startDate: { $lte: dayKey },
            endDate: { $gt: dayKey },
        })
            .select({ userId: 1 })
            .lean()
            .exec();
        const leaveUserIds = new Set(leaveUsers
            .map((leave) => leave?.userId)
            .filter((value) => value !== undefined && value !== null)
            .map((value) => String(value)));
        for (const id of ids) {
            if (!id)
                continue;
            if (leaveUserIds.has(String(id)))
                continue;
            const exists = await this.attModel.findOne({
                employeeId: id,
                date: {
                    $gte: d.clone().startOf('day').toDate(),
                    $lte: d.clone().endOf('day').toDate()
                }
            });
            if (!exists) {
                const staff = await this.staffService.getById(id).catch(() => null);
                const fullName = staff
                    ? (0, user_name_util_1.toTitleCaseName)(`${staff.lastName ?? ''} ${staff.firstName ?? ''} ${staff.middleName ?? ''}`)
                    : '';
                const resolvedName = fullName || 'Employee';
                await this.attModel.create({
                    employeeId: id,
                    employeeName: resolvedName,
                    date: d.clone().startOf('day').toDate(),
                    status: 'Absent'
                });
            }
        }
    }
    async applyLateAttendancePolicy() {
        if (!(await this.claimScheduledRun('attendance-late-policy')))
            return;
        const now = moment().tz('Africa/Lagos');
        const dayStart = now.clone().startOf('day');
        const dayEnd = now.clone().endOf('day');
        const lateRecords = await this.attModel.find({
            status: 'Late',
            date: { $gte: dayStart.toDate(), $lte: dayEnd.toDate() },
            $or: [
                { latePolicyProcessedAt: { $exists: false } },
                { latePolicyProcessedAt: null },
            ],
        });
        if (!lateRecords.length) {
            return;
        }
        const monthStart = now.clone().startOf('month');
        const monthEnd = now.clone().endOf('month');
        const monthLabel = now.format('MMMM YYYY');
        for (const record of lateRecords) {
            const claimedRecord = await this.attModel
                .findOneAndUpdate({
                _id: record._id,
                $or: [
                    { latePolicyProcessedAt: { $exists: false } },
                    { latePolicyProcessedAt: null },
                ],
            }, { $set: { latePolicyProcessedAt: now.toDate() } })
                .exec();
            if (!claimedRecord) {
                continue;
            }
            try {
                const staff = await this.staffService
                    .getById(String(record.employeeId))
                    .catch(() => null);
                const monthLateRecords = await this.attModel
                    .find({
                    employeeId: record.employeeId,
                    status: 'Late',
                    date: { $gte: monthStart.toDate(), $lte: monthEnd.toDate() },
                })
                    .select('date')
                    .sort({ date: 1 })
                    .lean()
                    .exec();
                const lateDates = monthLateRecords
                    .map((entry) => entry.date)
                    .filter((date) => Boolean(date));
                const lateCount = lateDates.length;
                const datesSummary = this.buildLateDatesSummary(lateDates);
                const action = this.resolveLatePolicyAction(lateCount, monthLabel, datesSummary);
                const employeeName = this.buildStaffDisplayName(staff, record.employeeName || 'Employee');
                let latePolicyMailSent = false;
                let latePolicyMailRecipients = [];
                if (action) {
                    const actionClaimKey = this.buildLatePolicyClaimKey(String(record.employeeId), now, action.key);
                    const claimedAction = await this.claimLatePolicyAction(actionClaimKey, {
                        lateCount,
                        monthLabel,
                        employeeName,
                    });
                    if (claimedAction) {
                        const notification = await this.notifyLatePolicyRecipients({
                            employeeId: String(record.employeeId),
                            employeeName,
                            staff,
                            action,
                            lateCount,
                            monthLabel,
                            datesSummary,
                        });
                        latePolicyMailSent = notification.mailSent;
                        latePolicyMailRecipients = notification.recipients;
                        if (action.disciplinary) {
                            const department = staff?.department?.name ||
                                staff?.department ||
                                staff?.businessUnit?.name ||
                                '';
                            const entityId = staff?.entity?._id ??
                                staff?.entity ??
                                staff?.entityId ??
                                record?.entity ??
                                record?.entityId;
                            await this.disciplinaryService.createCase({
                                employeeId: String(record.employeeId),
                                employeeName,
                                ...(entityId ? { entity: String(entityId) } : {}),
                                department,
                                category: 'Attendance',
                                status: 'Open',
                                severity: action.disciplinary.severity,
                                incidentDate: record.date,
                                summary: action.disciplinary.summary,
                                nextSteps: action.disciplinary.nextSteps,
                                salaryDeductionRequired: action.key === 'salary-deduction',
                                sendEmail: false,
                            });
                        }
                    }
                    record.latePolicyAction = action.key;
                }
                else {
                    record.latePolicyAction = 'none';
                }
                record.latePolicyStep = lateCount;
                record.latePolicyMailSent = latePolicyMailSent;
                record.latePolicyMailRecipients = latePolicyMailRecipients;
                record.latePolicyMailSentAt = latePolicyMailSent ? now.toDate() : undefined;
                record.latePolicyProcessedAt = now.toDate();
                await record.save();
            }
            catch (error) {
                console.error('Late attendance policy failed', {
                    attendanceId: record?._id,
                    employeeId: record?.employeeId,
                    error,
                });
                await this.attModel
                    .updateOne({ _id: record._id }, { $set: { latePolicyProcessedAt: null } })
                    .exec()
                    .catch(() => undefined);
            }
        }
    }
    async autoClockOut() {
        if (!(await this.claimScheduledRun('attendance-auto-clockout')))
            return;
        const cfg = await this.getConfig();
        if (!cfg.enableAutoClockOut)
            return;
        const y = moment().subtract(1, 'day');
        const recs = await this.attModel.find({
            date: { $gte: y.clone().startOf('day').toDate(), $lte: y.clone().endOf('day').toDate() },
            clockIn: { $exists: true },
            clockOut: { $exists: false }
        });
        for (const rec of recs) {
            const endTime = moment(`${moment(rec.date).format('YYYY-MM-DD')} ${cfg.closeOfBusiness}`, 'YYYY-MM-DD HH:mm');
            rec.clockOut = endTime.toDate();
            if (rec.clockIn) {
                const duration = moment.duration(endTime.diff(moment(rec.clockIn)));
                const hours = Math.floor(duration.asHours());
                const minutes = duration.minutes();
                rec.totalHours = `${hours}h ${minutes}m`;
            }
            await rec.save();
        }
    }
};
exports.AttendanceService = AttendanceService;
__decorate([
    (0, schedule_1.Cron)('0 20 * * *', { timeZone: 'Africa/Lagos' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttendanceService.prototype, "autoMarkAbsentees", null);
__decorate([
    (0, schedule_1.Cron)('30 23 * * *', { timeZone: 'Africa/Lagos' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttendanceService.prototype, "applyLateAttendancePolicy", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_11PM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttendanceService.prototype, "autoClockOut", null);
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(attendance_schema_1.Attendance.name)),
    __param(1, (0, mongoose_1.InjectModel)(attendanceConfig_schema_1.AttendanceConfig.name)),
    __param(2, (0, mongoose_1.InjectModel)(holiday_schema_1.Holiday.name)),
    __param(3, (0, mongoose_1.InjectModel)(leave_schema_1.Leave.name)),
    __param(7, (0, common_1.Optional)()),
    __param(8, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        user_service_1.StaffService,
        notice_service_1.NoticeService,
        disciplinary_service_1.DisciplinaryService,
        mail_service_1.MailService,
        notification_dispatch_service_1.NotificationDispatchService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map