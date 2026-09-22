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
exports.LeaveService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const leave_schema_1 = require("../../schemas/leave.schema");
const axios_1 = require("axios");
const holiday_schema_1 = require("../../schemas/holiday.schema");
const attendanceConfig_schema_1 = require("../../schemas/attendanceConfig.schema");
const user_service_1 = require("../user/user.service");
const leaveMapping_schema_1 = require("../../schemas/leaveMapping.schema");
const user_schema_1 = require("../../schemas/user.schema");
const notice_service_1 = require("../comms/notice.service");
const mail_service_1 = require("../comms/mail.service");
const access_control_util_1 = require("../../utils/shared/access-control.util");
const leave_policy_schema_1 = require("../../schemas/leave-policy.schema");
const level_schema_1 = require("../../schemas/level.schema");
const level_category_schema_1 = require("../../schemas/level-category.schema");
const department_schema_1 = require("../../schemas/department.schema");
const schedule_1 = require("@nestjs/schedule");
const notification_dispatch_service_1 = require("../comms/notification-dispatch.service");
const moment = require("moment-timezone");
const config_1 = require("../../config");
let LeaveService = class LeaveService {
    constructor(leaveModel, holidayModel, attendanceConfigModel, leaveMappingModel, leavePolicyModel, userModel, departmentModel, levelModel, levelCategoryModel, notificationService, staffService, noticeService, mailService, dispatchService) {
        this.leaveModel = leaveModel;
        this.holidayModel = holidayModel;
        this.attendanceConfigModel = attendanceConfigModel;
        this.leaveMappingModel = leaveMappingModel;
        this.leavePolicyModel = leavePolicyModel;
        this.userModel = userModel;
        this.departmentModel = departmentModel;
        this.levelModel = levelModel;
        this.levelCategoryModel = levelCategoryModel;
        this.notificationService = notificationService;
        this.staffService = staffService;
        this.noticeService = noticeService;
        this.mailService = mailService;
        this.dispatchService = dispatchService;
    }
    async claimScheduledRun(jobName) {
        if (!this.dispatchService)
            return true;
        return this.dispatchService.claimScheduledRun(jobName);
    }
    requireDepartmentScope(user) {
        (0, access_control_util_1.assertUserScope)(user, ['department', 'group'], 'You do not have permission to manage leave records.');
    }
    requirePolicyScope(user) {
        (0, access_control_util_1.assertUserScope)(user, ['group', 'entity'], 'You do not have permission to manage leave policies.');
    }
    requireLeaveAdminScope(user) {
        (0, access_control_util_1.assertUserScope)(user, ['group', 'entity'], 'You do not have permission to modify leave records directly. Leave changes must go through the approval workflow.');
    }
    normalizeLevelCategory(value) {
        if (!value) {
            throw new common_1.BadRequestException('Level category is required.');
        }
        const normalized = String(typeof value === 'object' ? value?._id ?? value?.id ?? value : value).trim();
        if (!normalized || !mongoose_2.default.Types.ObjectId.isValid(normalized)) {
            throw new common_1.BadRequestException('Invalid level category provided.');
        }
        return new mongoose_2.default.Types.ObjectId(normalized);
    }
    extractLevelCategoryId(value) {
        if (!value)
            return null;
        if (value instanceof mongoose_2.default.Types.ObjectId) {
            return value.toHexString();
        }
        if (typeof value === 'string') {
            return value.trim() ? value.trim() : null;
        }
        if (typeof value === 'object') {
            return (this.extractLevelCategoryId(value?._id) ??
                this.extractLevelCategoryId(value?.id) ??
                this.extractLevelCategoryId(value?.levelCategory));
        }
        return null;
    }
    getYearRange(year) {
        const start = new Date(year, 0, 1);
        const end = new Date(year + 1, 0, 1);
        return { start, end };
    }
    async ensureHolidaysLoaded(year) {
        const { start, end } = this.getYearRange(year);
        const exists = await this.holidayModel.exists({
            date: { $gte: start, $lt: end },
        });
        if (!exists) {
            try {
                await this.updateHolidays();
            }
            catch (error) {
                console.error('Failed to refresh holidays from API', error);
            }
        }
    }
    async hydrateLevelCategories(records) {
        if (!Array.isArray(records) || !records.length) {
            return records;
        }
        const ids = Array.from(new Set(records
            .map((record) => this.extractLevelCategoryId(record?.levelCategory))
            .filter((value) => Boolean(value))));
        if (!ids.length) {
            return records;
        }
        const objectIds = ids
            .map((id) => {
            try {
                return new mongoose_2.default.Types.ObjectId(id);
            }
            catch {
                return null;
            }
        })
            .filter((value) => Boolean(value));
        if (!objectIds.length) {
            return records;
        }
        const categories = await this.levelCategoryModel
            .find({ _id: { $in: objectIds } })
            .lean();
        const categoryMap = new Map();
        categories.forEach((category) => {
            if (category?._id) {
                categoryMap.set(String(category._id), category);
            }
        });
        return records.map((record) => {
            const id = this.extractLevelCategoryId(record?.levelCategory);
            if (!id) {
                return record;
            }
            const category = categoryMap.get(id);
            if (!category) {
                return record;
            }
            return {
                ...record,
                levelCategory: category,
            };
        });
    }
    parseLeaveDays(value) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric) || numeric < 0) {
            throw new common_1.BadRequestException('Leave days must be a non-negative number.');
        }
        return Math.round(numeric);
    }
    normalizeEntityId(entity) {
        if (entity == null)
            return null;
        const value = typeof entity === 'object'
            ? entity?._id ?? entity?.id ?? entity?.entity ?? entity
            : entity;
        const normalized = String(value ?? '').trim();
        return normalized.length ? normalized : null;
    }
    async resolveLeaveSupervisor(leave, employee) {
        const direct = leave?.hodApproval ? await this.staffService.getById(String(leave.hodApproval)) : null;
        if (direct?._id) {
            return direct;
        }
        const supervisor = await this.resolveSupervisorApprover(employee);
        if (supervisor?._id) {
            leave.hodApproval = supervisor._id;
            return supervisor;
        }
        throw new Error('No supervisor (HOD) configured for this leave request.');
    }
    assertEntityAccess(user, entityId, message = 'You do not have access to this entity.') {
        const normalized = this.normalizeEntityId(entityId);
        if (!normalized) {
            throw new common_1.BadRequestException('Entity is required');
        }
        if ((0, access_control_util_1.userHasScope)(user, ['group'])) {
            return;
        }
        const directEntity = this.normalizeEntityId(user?.entity);
        if (directEntity && directEntity === normalized) {
            return;
        }
        const viewers = Array.isArray(user?.entityViewer) ? user.entityViewer : [];
        const hasViewerAccess = viewers.some((candidate) => this.normalizeEntityId(candidate) === normalized);
        if (!hasViewerAccess) {
            throw new common_1.ForbiddenException(message);
        }
    }
    getPortalBaseUrl() {
        const candidates = [
            process.env.HR_PORTAL_WEB_URL,
            process.env.HR_PORTAL_BASE_URL,
            process.env.FRONTEND_BASE_URL,
            process.env.FRONTEND_URL,
        ];
        const fallback = config_1.config.frontendUrl;
        const base = candidates.find((value) => typeof value === 'string' && value.trim().length > 0) ??
            fallback;
        return base.replace(/\/+$/, '');
    }
    buildLeaveLink(id) {
        const linkId = typeof id === 'string'
            ? id
            : String(id?._id ?? id ?? '').trim();
        const base = this.getPortalBaseUrl();
        return `${base}/leave/${linkId}`;
    }
    normalizeLeaveType(input) {
        return String(input ?? '').trim().toLowerCase();
    }
    buildEmployeeNameFromStaff(staff) {
        if (!staff) {
            return undefined;
        }
        const segments = [staff?.firstName, staff?.middleName, staff?.lastName]
            .filter((value) => typeof value === 'string' && value.trim().length > 0)
            .map((value) => value.trim());
        if (segments.length) {
            return segments.join(' ');
        }
        if (typeof staff?.fullName === 'string' && staff.fullName.trim().length) {
            return staff.fullName.trim();
        }
        if (typeof staff?.email === 'string' && staff.email.trim().length) {
            return staff.email.trim();
        }
        return undefined;
    }
    normalizeUserIdCandidate(value) {
        if (!value)
            return null;
        const candidate = typeof value === 'object'
            ? value?._id ?? value?.id ?? value?.userId ?? value?.staffId ?? value
            : value;
        if (typeof candidate === 'string') {
            const trimmed = candidate.trim();
            return trimmed ? trimmed : null;
        }
        if (typeof candidate?.toString === 'function') {
            const str = candidate.toString();
            return str && str !== '[object Object]' ? str : null;
        }
        return null;
    }
    formatLeaveTypeLabel(value) {
        const normalized = this.normalizeLeaveType(value);
        if (!normalized)
            return 'leave';
        return normalized
            .split('_')
            .map((segment) => segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : segment)
            .join(' ');
    }
    formatLeaveStartDate(value) {
        if (!value)
            return 'today';
        const parsed = moment(value, ['DD-MM-YYYY', 'YYYY-MM-DD', moment.ISO_8601], true);
        const safe = parsed.isValid() ? parsed : moment(value);
        if (!safe.isValid()) {
            return String(value);
        }
        return safe.tz('Africa/Lagos').format('DD MMM YYYY');
    }
    async safeCreateLeaveNotice(userId, message) {
        if (!userId || !message)
            return;
        try {
            await this.noticeService.createNotice({
                userId,
                message,
                type: 'leave',
                sendEmail: false,
            });
        }
        catch (error) {
            console.error('Failed to send leave start notice', error);
        }
    }
    normalizeEmail(value) {
        if (typeof value !== 'string')
            return null;
        const trimmed = value.trim();
        return trimmed ? trimmed : null;
    }
    async sendLeaveStartEmail(to, subject, message) {
        if (!this.mailService || !to || !message)
            return;
        try {
            await this.mailService.sendMail({ to, subject, text: message });
        }
        catch (error) {
            console.error('Failed to send leave start email', error);
        }
    }
    formatDateKey(value) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    async getAttendanceConfig() {
        let cfg = await this.attendanceConfigModel.findOne();
        if (!cfg) {
            cfg = await this.attendanceConfigModel.create({});
        }
        return cfg;
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
        };
    }
    async getWorkingDayContext() {
        const cfg = await this.getAttendanceConfig();
        const baseDates = await this.getHolidayBaseDates();
        const { effective } = this.resolveHolidayOverrides(cfg, baseDates);
        return {
            excludeWeekends: cfg.excludeWeekends ?? true,
            holidaySet: new Set(effective),
        };
    }
    isWorkingDay(day, context) {
        const dayKey = day.format('YYYY-MM-DD');
        const isWeekend = context.excludeWeekends && [0, 6].includes(day.day());
        const isHoliday = context.holidaySet.has(dayKey);
        return !(isWeekend || isHoliday);
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
    normalizeLeaveDateInput(value, label) {
        const parsed = this.parseLeaveDate(value);
        if (!parsed) {
            throw new common_1.BadRequestException(`A valid ${label} date is required.`);
        }
        return parsed.tz('Africa/Lagos').format('YYYY-MM-DD');
    }
    async computeLeaveDetails(startDateValue, endDateValue, leaveType, requestedDaysValue) {
        const start = this.parseLeaveDate(startDateValue);
        if (!start) {
            throw new common_1.BadRequestException('A valid start date is required.');
        }
        const startDay = start.clone().tz('Africa/Lagos').startOf('day');
        const context = await this.getWorkingDayContext();
        const normalizedType = this.normalizeLeaveType(leaveType);
        const calendarDayTypes = new Set(['maternity']);
        const hasRequestedDays = requestedDaysValue !== undefined &&
            requestedDaysValue !== null &&
            String(requestedDaysValue).trim().length > 0;
        if (hasRequestedDays) {
            const requestedDays = this.parseNumberOfDays(requestedDaysValue);
            let endDay = startDay.clone();
            if (calendarDayTypes.has(normalizedType)) {
                endDay = startDay.clone().add(requestedDays - 1, 'day');
            }
            else {
                let counted = 0;
                let cursor = startDay.clone();
                while (counted < requestedDays) {
                    if (this.isWorkingDay(cursor, context)) {
                        counted += 1;
                    }
                    if (counted < requestedDays) {
                        cursor = cursor.clone().add(1, 'day');
                    }
                }
                endDay = cursor.clone();
            }
            let nextResumption = endDay.clone().add(1, 'day');
            while (!this.isWorkingDay(nextResumption, context)) {
                nextResumption.add(1, 'day');
            }
            return {
                numberOfDays: requestedDays,
                resumptionDate: nextResumption.format('YYYY-MM-DD'),
            };
        }
        const resumption = this.parseLeaveDate(endDateValue);
        if (!resumption) {
            throw new common_1.BadRequestException('A valid resumption date is required.');
        }
        const endDay = resumption.clone().tz('Africa/Lagos').startOf('day').subtract(1, 'day');
        if (endDay.isBefore(startDay, 'day')) {
            throw new common_1.BadRequestException('Resumption date cannot be before start date.');
        }
        let countedDays = 0;
        if (calendarDayTypes.has(normalizedType)) {
            countedDays = endDay.diff(startDay, 'day') + 1;
        }
        else {
            for (let cursor = startDay.clone(); cursor.isSameOrBefore(endDay, 'day'); cursor.add(1, 'day')) {
                if (this.isWorkingDay(cursor, context)) {
                    countedDays += 1;
                }
            }
        }
        const numberOfDays = this.parseNumberOfDays(countedDays);
        let nextResumption = endDay.clone().add(1, 'day');
        while (!this.isWorkingDay(nextResumption, context)) {
            nextResumption.add(1, 'day');
        }
        return {
            numberOfDays,
            resumptionDate: nextResumption.format('YYYY-MM-DD'),
        };
    }
    mergeFilters(base, extra) {
        if (!base || Object.keys(base).length === 0) {
            return extra;
        }
        return { $and: [base, extra] };
    }
    async buildLeaveStats(filter) {
        const statusCounts = await this.leaveModel.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: { $toLower: { $ifNull: ['$status', ''] } },
                    count: { $sum: 1 },
                },
            },
        ]);
        const statusMap = new Map();
        statusCounts.forEach((row) => {
            const key = typeof row?._id === 'string' ? row._id : '';
            if (key) {
                statusMap.set(key, Number(row.count ?? 0));
            }
        });
        const todayKey = this.formatDateKey(new Date());
        const onLeaveFilter = this.mergeFilters(filter, {
            status: /approved/i,
            startDate: { $lte: todayKey },
            endDate: { $gt: todayKey },
        });
        const [onLeaveCount, onLeaveRows] = await Promise.all([
            this.leaveModel.countDocuments(onLeaveFilter).exec(),
            this.leaveModel
                .find(onLeaveFilter)
                .select('userId')
                .populate({
                path: 'userId',
                model: this.userModel,
                select: '_id firstName lastName middleName email',
            })
                .limit(3)
                .lean()
                .exec(),
        ]);
        const onLeaveNames = (onLeaveRows ?? [])
            .map((row) => this.buildEmployeeNameFromStaff(row?.userId))
            .filter((name) => Boolean(name));
        return {
            pending: statusMap.get('pending') ?? 0,
            approved: statusMap.get('approved') ?? 0,
            rejected: statusMap.get('rejected') ?? 0,
            onLeave: Number(onLeaveCount ?? 0),
            onLeaveNames,
        };
    }
    async notifyLeaveStart() {
        if (!(await this.claimScheduledRun('leave-start-notice')))
            return;
        const now = moment().tz('Africa/Lagos');
        const dayStart = now.clone().startOf('day');
        const dayEnd = now.clone().endOf('day');
        const dateKey = now.format('YYYY-MM-DD');
        const dateClauses = [
            { startDate: { $gte: dayStart.toDate(), $lte: dayEnd.toDate() } },
            { startDate: { $gte: dayStart.toISOString(), $lte: dayEnd.toISOString() } },
            { startDate: { $regex: `^${dateKey}` } },
        ];
        const filter = {
            status: /approved/i,
            $and: [
                { $or: dateClauses },
                {
                    $or: [
                        { startNoticeSentAt: { $exists: false } },
                        { startNoticeSentAt: null },
                    ],
                },
            ],
        };
        const leaves = await this.leaveModel.find(filter).exec();
        if (!leaves.length) {
            return;
        }
        for (const leave of leaves) {
            try {
                const parsed = moment(leave.startDate, ['DD-MM-YYYY', 'YYYY-MM-DD', moment.ISO_8601], true);
                const safeStart = parsed.isValid() ? parsed : moment(leave.startDate);
                if (safeStart.isValid() && !safeStart.tz('Africa/Lagos').isSame(now, 'day')) {
                    continue;
                }
                const claimed = await this.leaveModel
                    .findOneAndUpdate({
                    _id: leave._id,
                    $or: [
                        { startNoticeSentAt: { $exists: false } },
                        { startNoticeSentAt: null },
                    ],
                }, { $set: { startNoticeSentAt: new Date() } })
                    .exec();
                if (!claimed) {
                    continue;
                }
                const employeeId = this.normalizeUserIdCandidate(leave.userId);
                if (!employeeId) {
                    continue;
                }
                const employee = await this.staffService.getById(employeeId).catch(() => null);
                const employeeName = this.buildEmployeeNameFromStaff(employee) ?? 'Employee';
                const leaveTypeLabel = this.formatLeaveTypeLabel(leave.leaveType);
                const startLabel = this.formatLeaveStartDate(leave.startDate);
                const userMessage = `Your ${leaveTypeLabel} leave starts today (${startLabel}).`;
                const supervisorMessage = `${employeeName}'s ${leaveTypeLabel} leave starts today (${startLabel}).`;
                const userEmail = this.normalizeEmail(employee?.email);
                const userSubject = `${leaveTypeLabel} leave starts today`;
                const supervisorSubject = `${employeeName}'s ${leaveTypeLabel} leave starts today`;
                await this.safeCreateLeaveNotice(employeeId, userMessage);
                await this.sendLeaveStartEmail(userEmail, userSubject, userMessage);
                const supervisorIds = new Set();
                const supervisor1 = this.normalizeUserIdCandidate(employee?.supervisorId);
                const supervisor2 = this.normalizeUserIdCandidate(employee?.supervisor2Id);
                if (supervisor1)
                    supervisorIds.add(supervisor1);
                if (supervisor2)
                    supervisorIds.add(supervisor2);
                supervisorIds.delete(employeeId);
                for (const supervisorId of supervisorIds) {
                    await this.safeCreateLeaveNotice(supervisorId, supervisorMessage);
                }
                const supervisors = await Promise.all(Array.from(supervisorIds).map((supervisorId) => this.staffService.getById(supervisorId).catch(() => null)));
                const emailedSupervisors = new Set();
                for (const supervisor of supervisors) {
                    const supervisorEmail = this.normalizeEmail(supervisor?.email);
                    if (!supervisorEmail || supervisorEmail === userEmail)
                        continue;
                    if (emailedSupervisors.has(supervisorEmail))
                        continue;
                    emailedSupervisors.add(supervisorEmail);
                    await this.sendLeaveStartEmail(supervisorEmail, supervisorSubject, supervisorMessage);
                }
                leave.startNoticeSentAt = new Date();
                await leave.save();
            }
            catch (error) {
                console.error('Leave start notice failed', {
                    leaveId: leave?._id,
                    error,
                });
                await this.leaveModel
                    .updateOne({ _id: leave._id }, { $set: { startNoticeSentAt: null } })
                    .exec()
                    .catch(() => undefined);
            }
        }
    }
    buildEmployeeDepartmentFromStaff(staff) {
        if (!staff) {
            return undefined;
        }
        if (typeof staff?.department === 'object') {
            if (typeof staff.department?.name === 'string' && staff.department.name.trim().length) {
                return staff.department.name.trim();
            }
        }
        if (typeof staff?.department === 'string' && staff.department.trim().length) {
            return staff.department.trim();
        }
        if (typeof staff?.departmentName === 'string' && staff.departmentName.trim().length) {
            return staff.departmentName.trim();
        }
        return undefined;
    }
    enrichLeaveRecord(record) {
        const staff = record?.userId ?? record?.employee;
        const employeeName = typeof record?.employeeName === 'string' && record.employeeName.trim().length
            ? record.employeeName.trim()
            : this.buildEmployeeNameFromStaff(staff);
        const directDepartment = typeof record?.department === 'string'
            ? record.department.trim()
            : typeof record?.department?.name === 'string' && record.department.name.trim().length
                ? record.department.name.trim()
                : undefined;
        const employeeDepartment = typeof record?.employeeDepartment === 'string' && record.employeeDepartment.trim().length
            ? record.employeeDepartment.trim()
            : directDepartment ?? this.buildEmployeeDepartmentFromStaff(staff);
        return {
            ...(record ?? {}),
            employeeName,
            employeeDepartment,
        };
    }
    castObjectId(value) {
        if (!value)
            return null;
        if (value instanceof mongoose_2.default.Types.ObjectId)
            return value;
        const normalized = String(value).trim();
        if (!normalized || normalized.toLowerCase() === 'undefined')
            return null;
        if (mongoose_2.default.Types.ObjectId.isValid(normalized)) {
            return new mongoose_2.default.Types.ObjectId(normalized);
        }
        return null;
    }
    normalizeSupervisorScope(scope) {
        if (!scope)
            return [];
        const rawValues = Array.isArray(scope)
            ? scope
            : String(scope)
                .split(',')
                .map((value) => value.trim())
                .filter((value) => value.length > 0);
        const unique = new Map();
        rawValues.forEach((value) => {
            const casted = this.castObjectId(value);
            if (casted) {
                unique.set(casted.toHexString(), casted);
            }
        });
        return Array.from(unique.values());
    }
    extractRoleNames(user) {
        const names = new Set();
        const register = (roleLike) => {
            if (!roleLike)
                return;
            const value = typeof roleLike === "string"
                ? roleLike
                : roleLike?.name ?? roleLike?.label ?? roleLike?.role?.name;
            if (!value || typeof value !== "string")
                return;
            const normalized = value.trim().toLowerCase();
            if (!normalized)
                return;
            names.add(normalized);
            names.add(normalized.replace(/[\s_-]+/g, " "));
            names.add(normalized.replace(/[\s_]+/g, "-"));
        };
        register(user?.role);
        (Array.isArray(user?.roles) ? user.roles : []).forEach(register);
        (Array.isArray(user?.additionalRoles) ? user.additionalRoles : []).forEach((assignment) => register(assignment?.role ?? assignment));
        return names;
    }
    extractPermissionNames(user) {
        const names = new Set();
        const register = (source) => {
            if (!source)
                return;
            const list = Array.isArray(source) ? source : [source];
            list.forEach((permission) => {
                const name = typeof permission === "string" ? permission : typeof permission?.name === "string" ? permission.name : null;
                if (name && name.trim()) {
                    names.add(name.trim().toLowerCase());
                }
            });
        };
        register(user?.permissions);
        register(user?.role?.permissions);
        (Array.isArray(user?.roles) ? user.roles : []).forEach((role) => register(role?.permissions));
        (Array.isArray(user?.additionalRoles) ? user.additionalRoles : []).forEach((assignment) => register((assignment?.role ?? assignment)?.permissions));
        return names;
    }
    resolveProfileKey(user) {
        const fromRole = typeof user?.role === 'object'
            ? (user.role?.profileKey ?? '')
            : '';
        if (fromRole)
            return String(fromRole).trim().toLowerCase();
        const additionalRoles = Array.isArray(user?.additionalRoles) ? user.additionalRoles : [];
        for (const assignment of additionalRoles) {
            const role = assignment?.role ?? assignment;
            const key = typeof role === 'object' ? (role?.profileKey ?? '') : '';
            const normalized = String(key).trim().toLowerCase();
            if (normalized === 'super-admin' || normalized === 'admin')
                return normalized;
        }
        return '';
    }
    hasHrApprovalAuthority(user) {
        if (!user)
            return false;
        const profileKey = this.resolveProfileKey(user);
        if (profileKey === 'admin' || profileKey === 'hr-admin' || profileKey === 'super-admin') {
            return true;
        }
        const roleNames = this.extractRoleNames(user);
        const adminRoleKeywords = [
            'admin', 'super admin', 'super-admin',
            'hr super admin', 'hr-super-admin',
            'gmd', 'group hr director', 'group-hr-director',
            'leave manager', 'leave-manager',
            'leave attendance manager', 'leave-attendance-manager',
        ];
        for (const keyword of adminRoleKeywords) {
            if (roleNames.has(keyword))
                return true;
        }
        const permissions = this.extractPermissionNames(user);
        if (permissions.has('all') || permissions.has('approve leave')) {
            return true;
        }
        return false;
    }
    async getLeavePolicy() {
        let policy = await this.leavePolicyModel.findOne().exec();
        if (!policy) {
            policy = await this.leavePolicyModel.create({});
        }
        const maternityValue = Number(policy.fixedAllocations?.maternity ?? 0);
        if (!Number.isFinite(maternityValue) || maternityValue <= 0) {
            policy.fixedAllocations = {
                ...(policy.fixedAllocations ?? {}),
                maternity: 90,
            };
            await policy.save();
        }
        return policy;
    }
    sanitizeTypeList(values) {
        if (!Array.isArray(values)) {
            return undefined;
        }
        const unique = new Set();
        values.forEach((value) => {
            const normalized = this.normalizeLeaveType(value);
            if (normalized) {
                unique.add(normalized);
            }
        });
        return Array.from(unique);
    }
    sanitizeAllocations(input, existing) {
        if (!input || typeof input !== 'object') {
            return undefined;
        }
        const updated = { ...existing };
        for (const [rawKey, rawValue] of Object.entries(input)) {
            const key = this.normalizeLeaveType(rawKey);
            const numeric = Number(rawValue);
            if (!key)
                continue;
            if (Number.isFinite(numeric) && numeric >= 0) {
                updated[key] = Math.round(numeric);
            }
        }
        return updated;
    }
    serializePolicy(policy) {
        const plain = typeof policy?.toJSON === 'function' ? policy.toJSON() : policy;
        const updatedAt = plain?.updatedAt ? new Date(plain.updatedAt) : undefined;
        const createdAt = plain?.createdAt ? new Date(plain.createdAt) : undefined;
        return {
            id: String((plain?._id ?? policy._id) ?? ''),
            noticePeriodDays: plain?.noticePeriodDays ?? policy.noticePeriodDays ?? 0,
            requireHandoverNote: plain?.requireHandoverNote ?? policy.requireHandoverNote ?? false,
            noticeExemptTypes: (plain?.noticeExemptTypes ?? policy.noticeExemptTypes ?? []).map((type) => this.normalizeLeaveType(type)),
            fixedAllocations: {
                ...(plain?.fixedAllocations ?? policy.fixedAllocations ?? {}),
            },
            companyGL: String(plain?.companyGL ?? policy.companyGL ?? '').trim(),
            leaveGL: String(plain?.leaveGL ?? policy.leaveGL ?? '').trim(),
            updatedAt,
            createdAt,
        };
    }
    async sendEmail(toUser, templateType, templateVariables) {
        if (!toUser?.email)
            return;
        try {
            const enrichedVariables = {
                ...templateVariables,
            };
            if (!enrichedVariables.leaveApplicationUrl && templateVariables?.leaveId) {
                enrichedVariables.leaveApplicationUrl = this.buildLeaveLink(templateVariables.leaveId);
            }
            void this.notificationService
                .sendMail({
                to: toUser.email,
                templateType,
                templateVariables: enrichedVariables,
            })
                .catch((error) => {
                console.error('Failed to send leave email', error);
            });
        }
        catch (error) {
            console.error('Failed to queue leave email', error);
        }
    }
    async resolveSupervisorApprover(employee) {
        if (!employee?.supervisorId) {
            return null;
        }
        const supervisorRef = employee.supervisorId;
        const supervisorId = supervisorRef?._id ?? supervisorRef;
        const supervisor = await this.staffService.getById(String(supervisorId));
        if (!supervisor) {
            return null;
        }
        return supervisor;
    }
    async resolveHrApprover(entity) {
        let approver = await this.staffService.findFirstActiveByProfileKey('admin', entity);
        if (!approver && entity) {
            approver = await this.staffService.findFirstActiveByProfileKey('admin');
        }
        if (approver)
            return approver;
        const superAdminRoleKeywords = [
            "hr super admin",
            "hr-super-admin",
            "super admin",
            "super-admin",
            "gmd",
            "group-hr-director",
            "group hr director",
        ];
        const leaveManagerRoleKeywords = [
            "leave manager",
            "leave-manager",
            "leave attendance manager",
            "leave-attendance-manager",
        ];
        const findByRole = async (keywords, targetEntity) => this.staffService.findFirstActiveByRoleNames(keywords, targetEntity);
        approver = await findByRole(superAdminRoleKeywords, entity);
        if (!approver && entity) {
            approver = await findByRole(superAdminRoleKeywords);
        }
        if (approver)
            return approver;
        approver = await findByRole(leaveManagerRoleKeywords, entity);
        if (!approver && entity) {
            approver = await findByRole(leaveManagerRoleKeywords);
        }
        if (approver)
            return approver;
        return this.staffService.findFirstActiveByPermission("approve leave", entity);
    }
    parseNumberOfDays(value) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric) || numeric <= 0) {
            throw new Error('Number of leave days must be greater than zero.');
        }
        return Math.round(numeric);
    }
    async sumLeaveDays(userId, leaveType, year) {
        if (!userId) {
            return 0;
        }
        const userIds = [String(userId)];
        if (mongoose_2.default.Types.ObjectId.isValid(String(userId))) {
            userIds.push(new mongoose_2.default.Types.ObjectId(String(userId)));
        }
        const leaves = await this.leaveModel
            .find({
            userId: { $in: userIds },
            leaveType: new RegExp(`^${leaveType}$`, 'i'),
            status: { $nin: ['Rejected'] },
        })
            .lean()
            .exec();
        return leaves.reduce((total, leave) => {
            if (year) {
                const startMoment = leave.startDate ? this.parseLeaveDate(leave.startDate) : null;
                if (startMoment && startMoment.year() !== year) {
                    return total;
                }
            }
            return total + Number(leave.numberOfDays ?? 0);
        }, 0);
    }
    assertHandoverRequirement(policy, handoverNoteUrl) {
        if (!policy.requireHandoverNote) {
            return;
        }
        const sanitized = String(handoverNoteUrl ?? '').trim();
        if (!sanitized || sanitized === 'uploads/' || sanitized.endsWith('/')) {
            throw new Error('A handover note is required for leave requests.');
        }
    }
    assertNoticePeriod(policy, leaveType, startDateValue) {
        const noticeDays = Number(policy.noticePeriodDays ?? 0);
        if (!noticeDays || policy.noticeExemptTypes?.includes(leaveType)) {
            return;
        }
        const startMoment = this.parseLeaveDate(startDateValue);
        if (!startMoment) {
            throw new Error('A valid start date is required to submit leave.');
        }
        const start = startMoment.clone().startOf('day');
        const current = moment().tz('Africa/Lagos').startOf('day');
        const diffDays = start.diff(current, 'days');
        if (diffDays < noticeDays) {
            throw new Error(`Leave requests must be submitted at least ${noticeDays} day(s) in advance.`);
        }
    }
    extractRefId(value) {
        if (!value)
            return null;
        if (typeof value === 'string')
            return value.trim() || null;
        const candidate = value._id ?? value;
        const asString = candidate?.toString?.() ?? '';
        return asString && asString !== '[object Object]' ? asString : null;
    }
    async resolveLevelCategoryId(user) {
        const direct = this.extractRefId(user?.level?.category) ?? this.extractRefId(user?.levelCategory);
        if (direct)
            return direct;
        const levelId = this.extractRefId(user?.level);
        if (!levelId || !mongoose_2.default.Types.ObjectId.isValid(levelId))
            return null;
        const level = await this.levelModel.findById(levelId).select('category').lean();
        return this.extractRefId(level?.category);
    }
    async findAnnualLeaveDays(categoryId) {
        if (!categoryId || !mongoose_2.default.Types.ObjectId.isValid(categoryId))
            return 0;
        const rows = await this.leaveMappingModel.collection
            .find({
            levelCategory: { $in: [new mongoose_2.default.Types.ObjectId(categoryId), categoryId] },
        })
            .toArray();
        if (!rows.length)
            return 0;
        const isAnnual = (value) => {
            const normalized = String(value ?? '').trim().toLowerCase().replace(/[\s_-]+/g, '');
            return normalized === 'annual' || normalized === 'annualleave';
        };
        const isUntyped = (row) => !String(row?.leaveType ?? '').trim();
        const match = rows.find((row) => isAnnual(row?.leaveType)) ??
            (rows.length === 1 && isUntyped(rows[0]) ? rows[0] : null);
        return Number(match?.leaveDays ?? 0) || 0;
    }
    async assertLeaveEntitlement(options) {
        const { userId, leaveType, requestedDays, policy, startDate } = options;
        if (!userId || requestedDays <= 0) {
            return;
        }
        const startMoment = this.parseLeaveDate(startDate);
        const currentYear = startMoment ? startMoment.year() : new Date().getFullYear();
        let allocation = 0;
        if (leaveType === 'annual') {
            const user = await this.staffService.getById(String(userId));
            const categoryId = await this.resolveLevelCategoryId(user);
            allocation = await this.findAnnualLeaveDays(categoryId);
        }
        else {
            allocation = Number(policy.fixedAllocations?.[leaveType] ?? 0);
        }
        if (!allocation) {
            return;
        }
        const used = await this.sumLeaveDays(userId, leaveType, currentYear);
        const remaining = Math.max(allocation - used, 0);
        if (requestedDays > remaining) {
            throw new Error(`You only have ${remaining} day(s) remaining for ${leaveType} leave.`);
        }
    }
    async createLeave(leaveData) {
        const policy = await this.getLeavePolicy();
        const leaveType = this.normalizeLeaveType(leaveData?.leaveType);
        const normalizedStartDate = this.normalizeLeaveDateInput(leaveData?.startDate, 'start');
        const isAdminOverride = leaveData?.adminOverride === true || leaveData?.adminOverride === 'true';
        if (!isAdminOverride) {
            this.assertHandoverRequirement(policy, leaveData?.handoverNoteUrl);
            this.assertNoticePeriod(policy, leaveType, normalizedStartDate);
        }
        const hasRequestedDays = leaveData?.numberOfDays !== undefined &&
            leaveData?.numberOfDays !== null &&
            String(leaveData?.numberOfDays).trim().length > 0;
        let requestedDaysValue = leaveData?.numberOfDays;
        if (!hasRequestedDays && leaveType === 'maternity') {
            const fallback = Number(policy.fixedAllocations?.maternity ?? 90);
            requestedDaysValue = Number.isFinite(fallback) && fallback > 0 ? fallback : 90;
        }
        const { numberOfDays, resumptionDate } = await this.computeLeaveDetails(normalizedStartDate, leaveData?.endDate, leaveType, requestedDaysValue);
        await this.assertLeaveEntitlement({
            userId: leaveData?.userId,
            leaveType,
            requestedDays: numberOfDays,
            policy,
            startDate: normalizedStartDate,
        });
        const leave = new this.leaveModel({
            ...leaveData,
            leaveType,
            startDate: normalizedStartDate,
            numberOfDays,
            resumptionDate,
            endDate: resumptionDate ?? leaveData?.endDate,
        });
        const employee = await this.staffService.getById(String(leave.userId));
        const isConfirmed = String(employee?.confirmed ?? '').toLowerCase() === 'true';
        const isCompassionate = leaveType === 'compassionate';
        if (isConfirmed && isCompassionate) {
            throw new common_1.BadRequestException('Compassionate leave is only available to unconfirmed staff.');
        }
        if (!isConfirmed && !isCompassionate) {
            throw new common_1.BadRequestException('Only compassionate leave is available until confirmation.');
        }
        const supervisorApprover = await this.resolveSupervisorApprover(employee);
        if (supervisorApprover) {
            leave.hodApproval = supervisorApprover._id;
            leave.hodStatus = leave.hodStatus || 'Pending';
        }
        if (!leave.hrApproval) {
            const hrApprover = await this.resolveHrApprover(employee?.entity);
            if (hrApprover) {
                leave.hrApproval = hrApprover._id;
                leave.hrStatus = leave.hrStatus || 'Pending';
            }
        }
        const reliever = leave.relievingOfficer
            ? await this.staffService.getById(String(leave.relievingOfficer))
            : null;
        const savedLeave = await leave.save();
        if (leave.relievingOfficer && reliever) {
            await this.noticeService.createNotice({
                userId: String(reliever._id),
                message: `You have been assigned as a reliever for ${employee.firstName} ${employee.lastName}'s leave from ${leave.startDate?.split('T')[0]} to ${leave.endDate?.split('T')[0]}.`,
                link: this.buildLeaveLink(savedLeave._id),
                type: 'leave-reliever',
            });
            await this.sendEmail(reliever, 'leave-relieve', {
                relieverName: reliever.firstName,
                employeeName: employee.firstName,
                leaveType: leave.leaveType,
                startDate: leave.startDate?.split('T')[0],
                endDate: leave.endDate?.split('T')[0],
                reason: leave.reason,
                logo: "https://intranet.addosser.com/img/logo.png",
                leaveId: savedLeave._id,
            });
        }
        return savedLeave;
    }
    async findAllLeaves() {
        return this.leaveModel.find().lean().exec();
    }
    async findLeaveById(id) {
        return this.leaveModel.findOne({
            $or: [
                { _id: new mongoose_2.default.Types.ObjectId(String(id)) },
                { _id: id }
            ]
        })
            .populate({ path: 'userId', model: this.userModel, select: '_id firstName lastName middleName email' })
            .populate({ path: 'hodApproval', model: this.userModel, select: '_id firstName lastName middleName email' })
            .populate({ path: 'hrApproval', model: this.userModel, select: '_id firstName lastName middleName email' })
            .populate({ path: 'relievingOfficer', model: this.userModel, select: '_id firstName lastName middleName email' })
            .lean()
            .exec();
    }
    async findLeaveByUser(id, year) {
        const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
        const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
        const leaves = await this.leaveModel.find({
            $or: [
                { userId: new mongoose_2.default.Types.ObjectId(id) },
                { userId: String(id) }
            ],
            startDate: { $gte: startOfYear.toISOString() },
            endDate: { $lte: endOfYear.toISOString() },
        }).populate({ path: 'userId', model: this.userModel, select: '_id firstName lastName middleName email' })
            .populate({ path: 'hodApproval', model: this.userModel, select: '_id firstName lastName middleName email' })
            .populate({ path: 'hrApproval', model: this.userModel, select: '_id firstName lastName middleName email' })
            .populate({ path: 'relievingOfficer', model: this.userModel, select: '_id firstName lastName middleName email' })
            .lean()
            .exec();
        const usedDays = leaves.reduce((total, leave) => {
            if (String(leave.status ?? '').toLowerCase() === 'approved') {
                return total + (leave.numberOfDays ?? 0);
            }
            return total;
        }, 0);
        return { leaves, usedDays };
    }
    async findApprovedByUser(userId, year, type) {
        const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
        const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
        const filter = {
            $or: [
                { userId: new mongoose_2.default.Types.ObjectId(userId) },
                { userId: String(userId) }
            ],
            status: 'Approved',
            createdAt: {
                $gte: startOfYear,
                $lte: endOfYear,
            },
        };
        const safeType = type?.trim();
        if (safeType) {
            const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.leaveType = new RegExp(`^${escapeRegex(safeType)}$`, 'i');
        }
        const leaves = await this.leaveModel.find(filter).lean();
        const usedDays = leaves.reduce((total, leave) => total + (leave.numberOfDays || 0), 0);
        return {
            usedDays,
            leaves,
        };
    }
    async updateLeave(user, id, updateData) {
        this.requireLeaveAdminScope(user);
        const needsRecalc = Object.prototype.hasOwnProperty.call(updateData, 'startDate') ||
            Object.prototype.hasOwnProperty.call(updateData, 'endDate') ||
            Object.prototype.hasOwnProperty.call(updateData, 'numberOfDays') ||
            Object.prototype.hasOwnProperty.call(updateData, 'leaveType');
        if (!needsRecalc) {
            return this.leaveModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
        }
        const existing = await this.leaveModel.findById(id).lean().exec();
        if (!existing) {
            return this.leaveModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
        }
        const startDateValue = updateData?.startDate !== undefined ? updateData.startDate : existing?.startDate;
        const endDateValue = updateData?.endDate !== undefined ? updateData.endDate : existing?.endDate;
        const leaveTypeValue = updateData?.leaveType !== undefined ? updateData.leaveType : existing?.leaveType;
        const requestedDaysValue = Object.prototype.hasOwnProperty.call(updateData, 'numberOfDays')
            ? updateData?.numberOfDays
            : undefined;
        const normalizedStartDate = this.normalizeLeaveDateInput(startDateValue, 'start');
        const { numberOfDays, resumptionDate } = await this.computeLeaveDetails(normalizedStartDate, endDateValue, leaveTypeValue, requestedDaysValue);
        const payload = {
            ...updateData,
            startDate: normalizedStartDate,
            numberOfDays,
            resumptionDate,
            endDate: resumptionDate,
        };
        return this.leaveModel.findByIdAndUpdate(id, payload, { new: true }).exec();
    }
    async deleteLeave(user, id) {
        this.requireLeaveAdminScope(user);
        return this.leaveModel.findByIdAndDelete(id).exec();
    }
    async findLeavesPaginated(page, limit, role, entity, searchQuery, supervisorId, supervisorScope, relieverId, createdFrom, createdTo, status, statusStage, user) {
        const safePage = Math.max(Number(page) || 1, 1);
        const safeLimit = Math.max(Number(limit) || 10, 1);
        const asObjectId = (v) => {
            if (!v)
                return null;
            const str = String(v);
            return mongoose_2.default.Types.ObjectId.isValid(str)
                ? new mongoose_2.default.Types.ObjectId(str)
                : null;
        };
        const asBothTypes = (v) => {
            const list = [];
            const oid = asObjectId(v);
            if (oid)
                list.push(oid);
            if (v != null)
                list.push(String(v));
            return list;
        };
        const orStringOrObjectId = (field, v) => {
            const clauses = [];
            if (v != null)
                clauses.push({ [field]: String(v) });
            const oid = asObjectId(v);
            if (oid)
                clauses.push({ [field]: oid });
            return clauses.length ? { $or: clauses } : null;
        };
        const and = [];
        const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (searchQuery?.trim()) {
            const trimmed = searchQuery.trim();
            const normalizedSearch = trimmed.toLowerCase().replace(/[\s_-]+/g, ' ').trim();
            const rawTokens = trimmed
                .split(/\s+/)
                .map((token) => token.trim())
                .filter(Boolean);
            const searchTokens = rawTokens.length > 1
                ? rawTokens.filter((token) => token.toLowerCase() !== 'leave')
                : rawTokens;
            const userSearchFields = ['firstName', 'lastName', 'middleName', 'email', 'staffId', 'fullName'];
            const leaveSearchFields = [
                'leaveType',
                'status',
                'relieverStatus',
                'hodStatus',
                'hrStatus',
                'reason',
                'contactDetails',
                'startDate',
                'endDate',
                'resumptionDate',
                'employeeName',
                'employeeDepartment',
            ];
            const leaveTypeAliases = [
                ['annual leave', 'annual'],
                ['annual', 'annual'],
                ['sick leave', 'sick'],
                ['sick', 'sick'],
                ['maternity leave', 'maternity'],
                ['maternity', 'maternity'],
                ['paternity leave', 'paternity'],
                ['paternity', 'paternity'],
                ['compassionate leave', 'compassionate'],
                ['compassionate', 'compassionate'],
                ['unpaid leave', 'unpaid'],
                ['unpaid', 'unpaid'],
            ];
            const termVariants = new Set([trimmed]);
            const withoutLeaveWord = normalizedSearch.replace(/\bleave\b/g, '').replace(/\s+/g, ' ').trim();
            if (withoutLeaveWord) {
                termVariants.add(withoutLeaveWord);
            }
            leaveTypeAliases.forEach(([label, value]) => {
                if (normalizedSearch === label || withoutLeaveWord === value) {
                    termVariants.add(value);
                }
            });
            const buildRegex = (value) => new RegExp(escapeRegex(value), 'i');
            const buildFieldOr = (fields, regex) => fields.map((field) => ({ [field]: regex }));
            const buildLooseNameRegex = (value) => {
                const compact = value.replace(/[^a-z0-9]/gi, '');
                if (compact.length < 5)
                    return null;
                return new RegExp(compact.split('').map((char) => escapeRegex(char)).join('.*'), 'i');
            };
            const buildFullNameExpressions = (regex) => {
                const firstMiddleLast = {
                    $concat: [
                        { $ifNull: ['$firstName', ''] },
                        ' ',
                        { $ifNull: ['$middleName', ''] },
                        ' ',
                        { $ifNull: ['$lastName', ''] },
                    ],
                };
                const lastMiddleFirst = {
                    $concat: [
                        { $ifNull: ['$lastName', ''] },
                        ' ',
                        { $ifNull: ['$middleName', ''] },
                        ' ',
                        { $ifNull: ['$firstName', ''] },
                    ],
                };
                return [firstMiddleLast, lastMiddleFirst].map((input) => ({
                    $expr: {
                        $regexMatch: {
                            input,
                            regex: regex.source,
                            options: 'i',
                        },
                    },
                }));
            };
            const parseSearchDates = (value) => {
                const formats = [
                    'YYYY-MM-DD',
                    'DD-MM-YYYY',
                    'MM-DD-YYYY',
                    'DD/MM/YYYY',
                    'MM/DD/YYYY',
                    'DD MMM YYYY',
                    'D MMM YYYY',
                    'MMM DD YYYY',
                    'MMM D YYYY',
                    moment.ISO_8601,
                ];
                const dates = [];
                formats.forEach((format) => {
                    const parsed = moment(value, format, true);
                    if (parsed.isValid()) {
                        dates.push(parsed);
                    }
                });
                return Array.from(new Map(dates.map((date) => [date.format('YYYY-MM-DD'), date])).values());
            };
            const resolveDepartmentIds = async (term) => {
                const regex = buildRegex(term);
                const departments = await this.departmentModel
                    .find({ name: regex })
                    .collation({ locale: 'en', strength: 2 })
                    .select('_id')
                    .lean()
                    .exec();
                return departments
                    .map((department) => department?._id)
                    .filter(Boolean);
            };
            const resolveUserIds = async (term) => {
                const regex = buildRegex(term);
                const looseNameRegex = buildLooseNameRegex(term);
                const departmentIds = await resolveDepartmentIds(term);
                const userSearchOr = [
                    ...buildFieldOr(userSearchFields, regex),
                    ...buildFullNameExpressions(regex),
                ];
                if (looseNameRegex && term.trim().split(/\s+/).length > 1) {
                    userSearchOr.push(...buildFullNameExpressions(looseNameRegex));
                }
                if (departmentIds.length) {
                    userSearchOr.push({ department: { $in: departmentIds } });
                }
                const users = await this.userModel
                    .find({ $or: userSearchOr })
                    .collation({ locale: 'en', strength: 2 })
                    .select('_id')
                    .lean()
                    .exec();
                return users.flatMap((user) => asBothTypes(user?._id)).filter(Boolean);
            };
            const directOr = [];
            const phraseUserIds = new Set();
            for (const variant of termVariants) {
                const regex = buildRegex(variant);
                directOr.push(...buildFieldOr(leaveSearchFields, regex));
                const looseNameRegex = buildLooseNameRegex(variant);
                if (looseNameRegex && variant.trim().split(/\s+/).length > 1) {
                    directOr.push({ employeeName: looseNameRegex });
                }
                const variantUserIds = await resolveUserIds(variant);
                variantUserIds.forEach((id) => phraseUserIds.add(id));
            }
            if (phraseUserIds.size) {
                directOr.push({ userId: { $in: Array.from(phraseUserIds) } });
            }
            const numericSearch = Number(trimmed);
            if (Number.isFinite(numericSearch)) {
                directOr.push({ numberOfDays: numericSearch });
            }
            const searchObjectId = asObjectId(trimmed);
            if (searchObjectId) {
                directOr.push({ _id: searchObjectId }, { userId: searchObjectId });
            }
            parseSearchDates(trimmed).forEach((date) => {
                const dateKey = date.format('YYYY-MM-DD');
                directOr.push({ createdAt: { $gte: date.clone().startOf('day').toDate(), $lte: date.clone().endOf('day').toDate() } }, { startDate: { $regex: `^${escapeRegex(dateKey)}` } }, { endDate: { $regex: `^${escapeRegex(dateKey)}` } }, { resumptionDate: { $regex: `^${escapeRegex(dateKey)}` } });
            });
            const tokenClauses = [];
            for (const token of searchTokens) {
                const tokenRegex = buildRegex(token);
                const tokenUserIds = await resolveUserIds(token);
                const tokenOr = buildFieldOr(leaveSearchFields, tokenRegex);
                if (tokenUserIds.length) {
                    tokenOr.push({ userId: { $in: tokenUserIds } });
                }
                tokenClauses.push({ $or: tokenOr });
            }
            and.push({
                $or: [
                    ...directOr,
                    ...(tokenClauses.length > 1 ? [{ $and: tokenClauses }] : []),
                ],
            });
        }
        const createdAtRange = {};
        const parseDate = (value) => {
            if (!value)
                return null;
            const trimmed = value.trim();
            if (!trimmed)
                return null;
            const parsed = moment(trimmed, ['DD-MM-YYYY', 'YYYY-MM-DD', moment.ISO_8601], true);
            if (parsed.isValid()) {
                return parsed.toDate();
            }
            const fallback = moment(trimmed);
            return fallback.isValid() ? fallback.toDate() : null;
        };
        const fromDate = parseDate(createdFrom);
        const toDate = parseDate(createdTo);
        if (fromDate) {
            fromDate.setHours(0, 0, 0, 0);
            createdAtRange.$gte = fromDate;
        }
        if (toDate) {
            toDate.setHours(23, 59, 59, 999);
            createdAtRange.$lte = toDate;
        }
        if (Object.keys(createdAtRange).length) {
            and.push({ createdAt: createdAtRange });
        }
        const normalizedStatus = typeof status === "string" ? status.trim().toLowerCase() : "";
        if (normalizedStatus && normalizedStatus !== "all") {
            const stage = typeof statusStage === "string" ? statusStage.trim().toLowerCase() : "";
            const field = stage === "hr"
                ? "hrStatus"
                : stage === "hod"
                    ? "hodStatus"
                    : stage === "reliever"
                        ? "relieverStatus"
                        : "status";
            const regex = new RegExp(`^${escapeRegex(normalizedStatus)}$`, "i");
            and.push({ [field]: regex });
        }
        if (role === "supervisor") {
            const supIds = this.normalizeSupervisorScope(supervisorScope ?? supervisorId) || [];
            if (!supIds.length)
                return { data: [], total: 0, page: 1, limit: safeLimit, totalPages: 1 };
            const supAsBoth = supIds.flatMap((id) => asBothTypes(id));
            and.push({ hodApproval: { $in: supAsBoth } });
        }
        else if (role === "reliever" && relieverId) {
            const relieverBoth = asBothTypes(relieverId);
            if (!relieverBoth.length)
                return { data: [], total: 0, page: 1, limit: safeLimit, totalPages: 1 };
            and.push({ relievingOfficer: { $in: relieverBoth } });
        }
        else {
            const scopedEntityId = this.normalizeEntityId(entity) ?? this.normalizeEntityId(user?.entity);
            const entityOr = orStringOrObjectId("entity", scopedEntityId);
            if (entityOr)
                and.push(entityOr);
        }
        const filter = and.length === 0 ? {} : and.length === 1 ? and[0] : { $and: and };
        const total = await this.leaveModel
            .countDocuments(filter)
            .collation({ locale: 'en', strength: 2 })
            .exec();
        const totalPages = total > 0 ? Math.ceil(total / safeLimit) : 1;
        const effectivePage = Math.min(safePage, totalPages);
        const data = await this.leaveModel
            .find(filter)
            .collation({ locale: 'en', strength: 2 })
            .populate({
            path: "userId",
            model: this.userModel,
            select: "_id firstName lastName middleName email department role",
        })
            .sort({ createdAt: -1, startDate: -1 })
            .skip((effectivePage - 1) * safeLimit)
            .limit(safeLimit)
            .lean()
            .exec();
        const enriched = Array.isArray(data)
            ? data.map((row) => this.enrichLeaveRecord(row))
            : [];
        const stats = await this.buildLeaveStats(filter);
        return {
            data: enriched,
            total,
            page: effectivePage,
            limit: safeLimit,
            totalPages,
            stats: { ...stats, total },
        };
    }
    async getHolidays() {
        const year = new Date().getFullYear();
        await this.ensureHolidaysLoaded(year);
        return await this.holidayModel.find().exec();
    }
    async createHoliday(user, payload) {
        this.requirePolicyScope(user);
        const trimmedName = String(payload?.name ?? '').trim();
        if (!trimmedName) {
            throw new common_1.BadRequestException('Holiday name is required.');
        }
        const dateValue = String(payload?.date ?? '').trim();
        if (!dateValue) {
            throw new common_1.BadRequestException('Holiday date is required.');
        }
        const parsedDate = new Date(dateValue);
        if (Number.isNaN(parsedDate.getTime())) {
            throw new common_1.BadRequestException('Invalid holiday date.');
        }
        const description = String(payload?.description ?? '').trim();
        const holiday = await this.holidayModel.create({
            name: trimmedName,
            date: parsedDate,
            ...(description ? { description } : {}),
        });
        return holiday;
    }
    async updateHolidayName(user, id, name) {
        this.requirePolicyScope(user);
        const trimmed = String(name ?? '').trim();
        if (!trimmed) {
            throw new common_1.BadRequestException('Holiday name is required.');
        }
        if (!id || !mongoose_2.default.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid holiday id.');
        }
        const holiday = await this.holidayModel.findById(id).exec();
        if (!holiday) {
            throw new common_1.NotFoundException('Holiday not found.');
        }
        holiday.name = trimmed;
        await holiday.save();
        return holiday;
    }
    async deleteHoliday(user, id) {
        this.requirePolicyScope(user);
        if (!id || !mongoose_2.default.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid holiday id.');
        }
        const holiday = await this.holidayModel.findByIdAndDelete(id).exec();
        if (!holiday) {
            throw new common_1.NotFoundException('Holiday not found.');
        }
        return { deleted: true };
    }
    async getUserEntitlements(userId) {
        const [user, policy] = await Promise.all([
            this.staffService.getById(userId),
            this.getLeavePolicy(),
        ]);
        const categoryId = await this.resolveLevelCategoryId(user);
        const annualDays = await this.findAnnualLeaveDays(categoryId);
        return {
            userId,
            levelCategory: categoryId,
            totalDays: annualDays,
            annualConfigured: annualDays > 0,
            allocations: {
                annual: annualDays,
                maternity: Number(policy.fixedAllocations?.maternity ?? 0),
                paternity: Number(policy.fixedAllocations?.paternity ?? 0),
                sick: Number(policy.fixedAllocations?.sick ?? 0),
                casual: Number(policy.fixedAllocations?.casual ?? 0),
                unpaid: Number(policy.fixedAllocations?.unpaid ?? 0),
                compassionate: Number(policy.fixedAllocations?.compassionate ?? 0),
            }
        };
    }
    async getLeaveSettings() {
        const policy = await this.getLeavePolicy();
        return this.serializePolicy(policy);
    }
    async listLeaveMappings() {
        const rows = await this.leaveMappingModel.find().lean();
        const enriched = await this.hydrateLevelCategories(rows);
        return { status: 200, data: enriched };
    }
    async upsertLeaveMapping(user, payload) {
        this.requirePolicyScope(user);
        const levelCategory = this.normalizeLevelCategory(payload?.levelCategory);
        const leaveType = typeof payload?.leaveType === 'string' && payload.leaveType.trim()
            ? payload.leaveType.trim().toLowerCase()
            : 'annual';
        const leaveDays = String(this.parseLeaveDays(payload?.leaveDays));
        const query = payload?._id
            ? { _id: payload._id }
            : { levelCategory, leaveType };
        const mapping = await this.leaveMappingModel
            .findOneAndUpdate(query, {
            $set: {
                levelCategory,
                leaveType,
                leaveDays,
            },
        }, { upsert: true, new: true, setDefaultsOnInsert: true })
            .lean();
        const [enriched] = await this.hydrateLevelCategories([mapping].filter(Boolean));
        return { status: 200, data: enriched ?? mapping };
    }
    async updateLeaveSettings(user, update) {
        this.requirePolicyScope(user);
        const policy = await this.getLeavePolicy();
        if (update.noticePeriodDays !== undefined) {
            const value = Number(update.noticePeriodDays);
            policy.noticePeriodDays = Number.isFinite(value) && value >= 0 ? Math.round(value) : policy.noticePeriodDays;
        }
        if (typeof update.requireHandoverNote === 'boolean') {
            policy.requireHandoverNote = update.requireHandoverNote;
        }
        const noticeTypes = this.sanitizeTypeList(update.noticeExemptTypes);
        if (noticeTypes) {
            policy.noticeExemptTypes = noticeTypes;
        }
        const allocations = this.sanitizeAllocations(update.fixedAllocations, policy.fixedAllocations ?? {});
        if (allocations) {
            policy.fixedAllocations = allocations;
        }
        if (update.companyGL !== undefined) {
            policy.companyGL = String(update.companyGL ?? '').trim();
        }
        if (update.leaveGL !== undefined) {
            policy.leaveGL = String(update.leaveGL ?? '').trim();
        }
        await policy.save();
        return this.serializePolicy(policy);
    }
    async updateHolidays() {
        const apiUrl = `https://calendarific.com/api/v2/holidays?api_key=p6QH0nNAHUd90IQwVbTCYPH8pUW0vCMP&country=NG&year=${new Date().getFullYear()}`;
        const { data } = await axios_1.default.get(apiUrl);
        const rawHolidays = Array.isArray(data?.response?.holidays)
            ? data.response.holidays
            : [];
        const holidays = rawHolidays
            .map((item) => {
            const types = Array.isArray(item?.type) ? item.type : [];
            return {
                name: item?.name,
                date: item?.date?.iso ?? item?.date,
                description: item?.description,
                types,
            };
        })
            .filter((item) => item.name && item.date)
            .filter((item) => item.types.some((t) => {
            const value = String(t ?? '').toLowerCase();
            return value.includes('national') || value.includes('public');
        }))
            .map((item) => ({
            name: String(item.name).trim(),
            date: new Date(item.date),
            ...(item.description ? { description: String(item.description).trim() } : {}),
        }));
        for (const holiday of holidays) {
            await this.holidayModel.updateOne({ name: holiday.name, date: holiday.date }, { $set: holiday }, { upsert: true });
        }
    }
    async approveLeave(id, type, approverId, action = 'approve', comment) {
        const leave = await this.leaveModel.findById(id);
        if (!leave)
            throw new Error('Leave not found');
        const approved = action === 'approve' ? 'Approved' : 'Rejected';
        const trimmedComment = typeof comment === 'string' ? comment.trim() : '';
        const rejectionNote = action === 'reject' ? trimmedComment : '';
        const employee = await this.staffService.getById(String(leave?.userId)).catch(() => null);
        if (!employee) {
            throw new Error('Employee record not found for this leave request.');
        }
        const supervisorId = typeof employee?.supervisorId === 'object' && employee?.supervisorId?._id
            ? employee.supervisorId._id
            : employee?.supervisorId ?? leave?.hodApproval;
        const supervisor = supervisorId
            ? await this.staffService.getById(String(supervisorId)).catch(() => null)
            : null;
        const hrApprover = leave.hrApproval
            ? await this.staffService.getById(String(leave?.hrApproval)).catch(() => null)
            : await this.resolveHrApprover(employee?.entity);
        if (!leave?.hrApproval && hrApprover) {
            leave.hrApproval = hrApprover?._id;
        }
        const approver = approverId ? await this.staffService.getById(String(approverId)).catch(() => null) : null;
        const approverHasHrAuthority = this.hasHrApprovalAuthority(approver);
        const ensureMatch = (expected, actual) => {
            if (!expected)
                return true;
            return String(expected) === String(actual);
        };
        const relieverStatus = String(leave?.relieverStatus ?? '').trim().toLowerCase();
        const relieverApproved = relieverStatus === 'approved';
        if (type === 'hod' && leave?.relievingOfficer && !relieverApproved) {
            throw new common_1.BadRequestException('Reliever approval is required before supervisor approval.');
        }
        if (type === 'reliever') {
            if (!ensureMatch(leave.relievingOfficer, approverId)) {
                throw new Error('You are not authorized to approve this request at this stage.');
            }
            leave.relieverApproval = approverId;
            leave.relieverStatus = approved;
            if (rejectionNote) {
                leave.relieverComment = rejectionNote;
            }
            if (action === 'approve') {
                await this.noticeService.createNotice({
                    userId: employee?._id,
                    message: `Your leave request has been approved by your reliever.`,
                    link: this.buildLeaveLink(leave?._id),
                    type: 'leave-reliever-approved',
                });
                await this.sendEmail(employee, 'leave-status-update', {
                    employeeName: `${employee.firstName} ${employee.lastName}`,
                    leaveType: leave.leaveType,
                    startDate: leave.startDate?.split('T')[0],
                    endDate: leave.endDate?.split('T')[0],
                    status: 'Awaiting Supervisor Approval',
                    leaveId: leave?._id,
                });
                if (supervisor) {
                    await this.noticeService.createNotice({
                        userId: supervisor?._id,
                        message: `Leave request for ${employee.firstName} ${employee.lastName} is awaiting your approval.`,
                        link: this.buildLeaveLink(leave?._id),
                        type: 'leave-hod-approval',
                    });
                    await this.sendEmail(supervisor, 'leave-approval-notice', {
                        approverName: supervisor.firstName,
                        employeeName: `${employee.firstName} ${employee.lastName}`,
                        leaveType: leave.leaveType,
                        startDate: leave.startDate?.split('T')[0],
                        endDate: leave.endDate?.split('T')[0],
                        stage: 'Supervisor',
                        leaveId: leave?._id,
                    });
                }
            }
        }
        else if (type === 'hod') {
            if (!ensureMatch(leave.hodApproval, approverId)) {
                throw new Error('You are not authorized to approve this request at this stage.');
            }
            leave.hodApproval = approverId;
            leave.hodStatus = approved;
            if (rejectionNote) {
                leave.hodComment = rejectionNote;
            }
            if (action === 'approve') {
                await this.noticeService.createNotice({
                    userId: employee._id,
                    message: `Your leave request has been approved by your supervisor.`,
                    link: this.buildLeaveLink(leave?._id),
                    type: 'leave-hod-approved',
                });
                await this.sendEmail(employee, 'leave-status-update', {
                    employeeName: `${employee.firstName} ${employee.lastName}`,
                    leaveType: leave.leaveType,
                    startDate: leave.startDate?.split('T')[0],
                    endDate: leave.endDate?.split('T')[0],
                    status: 'Awaiting HR Approval',
                    leaveId: leave?._id,
                });
                if (leave.hrApproval && hrApprover) {
                    await this.noticeService.createNotice({
                        userId: hrApprover?._id,
                        message: `Leave request for ${employee.firstName} ${employee.lastName} is awaiting your approval.`,
                        link: this.buildLeaveLink(leave?._id),
                        type: 'leave-hr-approval',
                    });
                    await this.sendEmail(hrApprover, 'leave-approval-notice', {
                        approverName: hrApprover.firstName,
                        employeeName: `${employee.firstName} ${employee.lastName}`,
                        leaveType: leave.leaveType,
                        startDate: leave.startDate?.split('T')[0],
                        endDate: leave.endDate?.split('T')[0],
                        stage: 'Final Approver',
                        leaveId: leave?._id,
                    });
                }
            }
        }
        else if (type === 'hr') {
            if (!ensureMatch(leave.hrApproval, approverId) && !approverHasHrAuthority) {
                throw new Error('You are not authorized to approve this request at this stage.');
            }
            if (approverId) {
                leave.hrApproval = approverId;
            }
            leave.hrStatus = approved;
            if (rejectionNote) {
                leave.hrComment = rejectionNote;
            }
        }
        const normalizeStatus = (value) => String(value ?? '').trim().toLowerCase();
        const isApproved = (value) => normalizeStatus(value) === 'approved';
        const isRejected = (value) => normalizeStatus(value) === 'rejected';
        const stageApproved = (expected, status) => !expected || isApproved(status);
        const fullyApproved = stageApproved(leave.relievingOfficer, leave.relieverStatus) &&
            stageApproved(leave.hodApproval, leave.hodStatus) &&
            stageApproved(leave.hrApproval, leave.hrStatus);
        const hasRejection = [leave.relieverStatus, leave.hodStatus, leave.hrStatus].some((value) => isRejected(value));
        if (hasRejection) {
            leave.status = 'Rejected';
            const startLabel = leave.startDate ? leave.startDate.split('T')[0] : '';
            const endLabel = leave.endDate ? leave.endDate.split('T')[0] : '';
            const rejectionMessage = rejectionNote
                ? `Your leave request from ${startLabel} to ${endLabel} has been rejected. Note: ${rejectionNote}`
                : `Your leave request from ${startLabel} to ${endLabel} has been rejected.`;
            await this.noticeService.createNotice({
                userId: employee._id,
                message: rejectionMessage,
                link: this.buildLeaveLink(leave._id),
                type: 'leave-rejected',
            });
            const noteLine = rejectionNote ? `\nNote: ${rejectionNote}` : '';
            await this.sendEmail(employee, 'leave-status-update', {
                employeeName: `${employee.firstName} ${employee.lastName}`,
                leaveType: leave.leaveType,
                startDate: startLabel,
                endDate: endLabel,
                status: 'Rejected',
                leaveId: leave._id,
                note: rejectionNote,
                noteLine,
            });
        }
        else {
            const supervisorApproved = isApproved(leave.hodStatus);
            const hrApproved = isApproved(leave.hrStatus);
            leave.status = fullyApproved ? 'Approved' : 'Pending';
            if (fullyApproved && (supervisorApproved || hrApproved)) {
                const startLabel = leave.startDate ? leave.startDate.split('T')[0] : '';
                const endLabel = leave.endDate ? leave.endDate.split('T')[0] : '';
                await this.noticeService.createNotice({
                    userId: employee._id,
                    message: `Your leave request from ${startLabel} to ${endLabel} has been fully approved.`,
                    link: this.buildLeaveLink(leave._id),
                    type: 'leave-approved',
                });
                await this.sendEmail(employee, 'leave-status-update', {
                    employeeName: `${employee.firstName} ${employee.lastName}`,
                    leaveType: leave.leaveType,
                    startDate: startLabel,
                    endDate: endLabel,
                    status: 'Approved',
                    leaveId: leave._id,
                });
            }
        }
        await leave.save();
        return { msg: `${type} ${action}d`, leave };
    }
    async reassignSupervisorApprover(id, supervisorId, actor) {
        if (!this.hasHrApprovalAuthority(actor)) {
            throw new common_1.ForbiddenException('You are not authorized to reassign supervisor approvals.');
        }
        const leave = await this.leaveModel.findById(id);
        if (!leave) {
            throw new common_1.NotFoundException('Leave request not found.');
        }
        const normalizedSupervisorId = this.normalizeUserIdCandidate(supervisorId);
        if (!normalizedSupervisorId) {
            throw new common_1.BadRequestException('A valid supervisor id is required.');
        }
        const normalizeStatus = (value) => String(value ?? '').trim().toLowerCase();
        const hodStatus = normalizeStatus(leave.hodStatus);
        if (hodStatus === 'approved' || hodStatus === 'rejected') {
            throw new common_1.BadRequestException('Supervisor stage has already been completed.');
        }
        if (String(leave.status ?? '').toLowerCase() === 'rejected') {
            throw new common_1.BadRequestException('Cannot reassign a rejected leave request.');
        }
        const supervisor = await this.staffService
            .getById(String(normalizedSupervisorId))
            .catch(() => null);
        if (!supervisor) {
            throw new common_1.NotFoundException('Supervisor not found.');
        }
        leave.hodApproval = supervisor._id ?? normalizedSupervisorId;
        leave.hodStatus = 'Pending';
        leave.hodComment = undefined;
        leave.hodApprovalDate = undefined;
        await leave.save();
        const employee = await this.staffService.getById(String(leave?.userId)).catch(() => null);
        const employeeName = this.buildEmployeeNameFromStaff(employee) ?? 'Employee';
        await this.noticeService.createNotice({
            userId: String(supervisor._id ?? normalizedSupervisorId),
            message: `Leave request for ${employeeName} is awaiting your approval.`,
            link: this.buildLeaveLink(leave?._id),
            type: 'leave-hod-approval',
        });
        await this.sendEmail(supervisor, 'leave-approval-notice', {
            approverName: supervisor?.firstName ?? 'Supervisor',
            employeeName,
            leaveType: leave?.leaveType,
            startDate: leave?.startDate?.split('T')[0],
            endDate: leave?.endDate?.split('T')[0],
            stage: 'Supervisor',
            leaveId: leave?._id,
        });
        return { message: 'Supervisor approver reassigned.', leave };
    }
    async reassignRelieverApprover(id, relieverId, actor) {
        if (!this.hasHrApprovalAuthority(actor)) {
            throw new common_1.ForbiddenException('You are not authorized to reassign reliever approvals.');
        }
        const leave = await this.leaveModel.findById(id);
        if (!leave) {
            throw new common_1.NotFoundException('Leave request not found.');
        }
        const normalizedRelieverId = this.normalizeUserIdCandidate(relieverId);
        if (!normalizedRelieverId) {
            throw new common_1.BadRequestException('A valid reliever id is required.');
        }
        const normalizeStatus = (value) => String(value ?? '').trim().toLowerCase();
        const relieverStatus = normalizeStatus(leave.relieverStatus);
        if (relieverStatus === 'approved' || relieverStatus === 'rejected') {
            throw new common_1.BadRequestException('Reliever stage has already been completed.');
        }
        if (String(leave.status ?? '').toLowerCase() === 'rejected') {
            throw new common_1.BadRequestException('Cannot reassign a rejected leave request.');
        }
        const reliever = await this.staffService
            .getById(String(normalizedRelieverId))
            .catch(() => null);
        if (!reliever) {
            throw new common_1.NotFoundException('Reliever not found.');
        }
        leave.relievingOfficer = reliever._id ?? normalizedRelieverId;
        leave.relieverStatus = 'Pending';
        leave.relieverApproval = undefined;
        leave.relieverComment = undefined;
        leave.relieverApprovalDate = undefined;
        await leave.save();
        const employee = await this.staffService.getById(String(leave?.userId)).catch(() => null);
        const employeeName = this.buildEmployeeNameFromStaff(employee) ?? 'Employee';
        await this.noticeService.createNotice({
            userId: String(reliever._id ?? normalizedRelieverId),
            message: `You have been assigned as a reliever for ${employeeName}'s leave from ${leave.startDate?.split('T')[0]} to ${leave.endDate?.split('T')[0]}.`,
            link: this.buildLeaveLink(leave?._id),
            type: 'leave-reliever',
        });
        await this.sendEmail(reliever, 'leave-relieve', {
            relieverName: reliever.firstName,
            employeeName: employeeName,
            leaveType: leave.leaveType,
            startDate: leave.startDate?.split('T')[0],
            endDate: leave.endDate?.split('T')[0],
            reason: leave.reason,
            logo: "https://intranet.addosser.com/img/logo.png",
            leaveId: leave?._id,
        });
        return { message: 'Reliever reassigned.', leave };
    }
    async nudgeLeaveApprover(id, actor) {
        const leave = await this.leaveModel.findById(id);
        if (!leave) {
            throw new common_1.NotFoundException('Leave request not found.');
        }
        const actorId = this.normalizeUserIdCandidate(actor?._id ?? actor?.id ?? actor?.userId);
        if (!actorId) {
            throw new common_1.ForbiddenException('Unable to determine your user account.');
        }
        const requesterId = this.normalizeUserIdCandidate(leave?.userId);
        const canNudge = (requesterId && actorId === requesterId) || this.hasHrApprovalAuthority(actor);
        if (!canNudge) {
            throw new common_1.ForbiddenException('You are not allowed to nudge approvers for this leave request.');
        }
        const normalizeStatus = (value) => String(value ?? '').trim().toLowerCase();
        const isRejected = (value) => normalizeStatus(value) === 'rejected';
        const isPending = (value) => {
            const normalized = normalizeStatus(value);
            return !normalized || normalized === 'pending';
        };
        if ([leave.relieverStatus, leave.hodStatus, leave.hrStatus].some((status) => isRejected(status))) {
            throw new common_1.BadRequestException('Leave request has already been rejected.');
        }
        const stages = [
            {
                type: 'reliever',
                approver: leave.relievingOfficer,
                status: leave.relieverStatus,
                label: 'Relief Officer',
                stageLabel: 'Relief Officer',
            },
            {
                type: 'hod',
                approver: leave.hodApproval,
                status: leave.hodStatus,
                label: 'Supervisor',
                stageLabel: 'Supervisor',
            },
            {
                type: 'hr',
                approver: leave.hrApproval,
                status: leave.hrStatus,
                label: 'Final Approver',
                stageLabel: 'Final Approver',
            },
        ];
        const pendingStage = stages.find((stage) => stage.approver && isPending(stage.status));
        if (!pendingStage) {
            return { message: 'No pending approver found for this leave request.' };
        }
        const approverId = this.normalizeUserIdCandidate(pendingStage.approver);
        if (!approverId) {
            throw new common_1.BadRequestException('Pending approver is missing.');
        }
        if (approverId === actorId) {
            throw new common_1.BadRequestException('You are already the pending approver for this leave request.');
        }
        const approver = await this.staffService.getById(String(approverId)).catch(() => null);
        if (!approver) {
            throw new common_1.NotFoundException('Pending approver not found.');
        }
        const employee = await this.staffService.getById(String(leave?.userId)).catch(() => null);
        const employeeName = this.buildEmployeeNameFromStaff(employee) ?? 'Employee';
        await this.noticeService.createNotice({
            userId: String(approverId),
            message: `Reminder: Leave request for ${employeeName} is awaiting your approval.`,
            link: this.buildLeaveLink(leave?._id),
            type: 'leave-approval-reminder',
        });
        await this.sendEmail(approver, 'leave-approval-notice', {
            approverName: approver.firstName,
            employeeName,
            leaveType: leave.leaveType,
            startDate: leave.startDate?.split('T')[0],
            endDate: leave.endDate?.split('T')[0],
            stage: pendingStage.stageLabel,
            leaveId: leave?._id,
        });
        return { message: `Reminder sent to ${pendingStage.label}.` };
    }
};
exports.LeaveService = LeaveService;
__decorate([
    (0, schedule_1.Cron)('0 6 * * *', { timeZone: 'Africa/Lagos' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeaveService.prototype, "notifyLeaveStart", null);
exports.LeaveService = LeaveService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(leave_schema_1.Leave.name)),
    __param(1, (0, mongoose_1.InjectModel)(holiday_schema_1.Holiday.name)),
    __param(2, (0, mongoose_1.InjectModel)(attendanceConfig_schema_1.AttendanceConfig.name)),
    __param(3, (0, mongoose_1.InjectModel)(leaveMapping_schema_1.LeaveMapping.name)),
    __param(4, (0, mongoose_1.InjectModel)(leave_policy_schema_1.LeavePolicy.name)),
    __param(5, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(6, (0, mongoose_1.InjectModel)(department_schema_1.Department.name)),
    __param(7, (0, mongoose_1.InjectModel)(level_schema_1.Level.name)),
    __param(8, (0, mongoose_1.InjectModel)(level_category_schema_1.LevelCategory.name)),
    __param(12, (0, common_1.Optional)()),
    __param(13, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mail_service_1.MailService,
        user_service_1.StaffService,
        notice_service_1.NoticeService,
        mail_service_1.MailService,
        notification_dispatch_service_1.NotificationDispatchService])
], LeaveService);
//# sourceMappingURL=leave.service.js.map