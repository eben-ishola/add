"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const moment = require("moment-timezone");
const config_1 = require("../config");
const leave_schema_1 = require("../schemas/leave.schema");
const holiday_schema_1 = require("../schemas/holiday.schema");
const attendanceConfig_schema_1 = require("../schemas/attendanceConfig.schema");
const CALENDAR_DAY_TYPES = new Set(['maternity']);
const MATERNITY_DEFAULT_DAYS = 90;
const normalizeText = (value) => {
    if (value === null || value === undefined)
        return '';
    const trimmed = String(value).trim();
    if (!trimmed)
        return '';
    const lower = trimmed.toLowerCase();
    if (lower === 'null' || lower === 'undefined')
        return '';
    return trimmed;
};
const parseArgs = () => {
    const args = process.argv.slice(2);
    const hasFlag = (flag) => args.includes(flag);
    const readValue = (flag) => {
        const withEquals = args.find((arg) => arg.startsWith(`${flag}=`));
        if (withEquals) {
            return withEquals.slice(flag.length + 1);
        }
        const index = args.indexOf(flag);
        if (index >= 0 && args[index + 1]) {
            return args[index + 1];
        }
        return undefined;
    };
    const limitValue = Number(readValue('--limit'));
    return {
        dryRun: hasFlag('--dry-run'),
        limit: Number.isFinite(limitValue) && limitValue > 0 ? limitValue : undefined,
    };
};
const normalizeHolidayDate = (value) => {
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
        return normalizeHolidayDate(value?.date ?? value?.holidayDate);
    }
    return null;
};
const normalizeHolidayList = (source) => {
    const list = Array.isArray(source)
        ? source
        : typeof source === 'string'
            ? source.split(/\r?\n/)
            : [];
    const normalized = list
        .map((value) => normalizeHolidayDate(value))
        .filter((value) => Boolean(value));
    return Array.from(new Set(normalized)).sort();
};
const resolveHolidayOverrides = (cfg, baseDates) => {
    const additions = normalizeHolidayList(cfg?.publicHolidayAdditions ?? cfg?.holidayAdditions);
    const removals = normalizeHolidayList(cfg?.publicHolidayRemovals ?? cfg?.holidayRemovals);
    const legacyOverride = normalizeHolidayList(cfg?.publicHolidays);
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
};
const isWorkingDay = (day, context) => {
    const dayKey = day.format('YYYY-MM-DD');
    const isWeekend = context.excludeWeekends && [0, 6].includes(day.day());
    const isHoliday = context.holidaySet.has(dayKey);
    return !(isWeekend || isHoliday);
};
const parseLeaveDate = (value) => {
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
};
const computeLeaveDetails = (startDateValue, endDateValue, leaveType, context, requestedDaysValue) => {
    const start = parseLeaveDate(startDateValue);
    if (!start)
        return null;
    const startDay = start.clone().tz('Africa/Lagos').startOf('day');
    const normalizedType = normalizeText(leaveType).toLowerCase();
    const parseRequestedDays = (value) => {
        const numeric = Number(value);
        if (!Number.isFinite(numeric) || numeric <= 0)
            return null;
        return Math.round(numeric);
    };
    const requestedDays = parseRequestedDays(requestedDaysValue);
    if (CALENDAR_DAY_TYPES.has(normalizedType)) {
        const fixedDays = requestedDays ?? MATERNITY_DEFAULT_DAYS;
        const endDay = startDay.clone().add(fixedDays - 1, 'day');
        let nextResumption = endDay.clone().add(1, 'day');
        while (!isWorkingDay(nextResumption, context)) {
            nextResumption.add(1, 'day');
        }
        return {
            numberOfDays: fixedDays,
            resumptionDate: nextResumption.format('YYYY-MM-DD'),
        };
    }
    const resumption = parseLeaveDate(endDateValue);
    if (!resumption)
        return null;
    const endDay = resumption.clone().tz('Africa/Lagos').startOf('day').subtract(1, 'day');
    if (endDay.isBefore(startDay, 'day'))
        return null;
    let countedDays = 0;
    for (let cursor = startDay.clone(); cursor.isSameOrBefore(endDay, 'day'); cursor.add(1, 'day')) {
        if (isWorkingDay(cursor, context)) {
            countedDays += 1;
        }
    }
    if (!Number.isFinite(countedDays) || countedDays <= 0) {
        return null;
    }
    let nextResumption = endDay.clone().add(1, 'day');
    while (!isWorkingDay(nextResumption, context)) {
        nextResumption.add(1, 'day');
    }
    return {
        numberOfDays: Math.round(countedDays),
        resumptionDate: nextResumption.format('YYYY-MM-DD'),
    };
};
const main = async () => {
    const { dryRun, limit } = parseArgs();
    const mongoUri = normalizeText(process.env.MONGO_URI) ||
        normalizeText(config_1.config.mainDB) ||
        normalizeText(config_1.config.neutralDB) ||
        normalizeText(config_1.config.authDB);
    if (!mongoUri) {
        throw new Error('Missing MongoDB connection string (set MONGO_URI or config.mainDB).');
    }
    await mongoose_1.default.connect(mongoUri);
    const LeaveModel = mongoose_1.default.models[leave_schema_1.Leave.name] ||
        mongoose_1.default.model(leave_schema_1.Leave.name, leave_schema_1.LeaveSchema);
    const HolidayModel = mongoose_1.default.models[holiday_schema_1.Holiday.name] ||
        mongoose_1.default.model(holiday_schema_1.Holiday.name, holiday_schema_1.HolidaySchema);
    const AttendanceConfigModel = mongoose_1.default.models[attendanceConfig_schema_1.AttendanceConfig.name] ||
        mongoose_1.default.model(attendanceConfig_schema_1.AttendanceConfig.name, attendanceConfig_schema_1.AttendanceConfigSchema);
    const cfg = ((await AttendanceConfigModel.findOne().lean().exec()) ?? {});
    const holidays = await HolidayModel.find().select('date').lean().exec();
    const baseDates = normalizeHolidayList(holidays.map((holiday) => holiday?.date));
    const overrides = resolveHolidayOverrides(cfg, baseDates);
    const context = {
        excludeWeekends: cfg?.excludeWeekends ?? true,
        holidaySet: new Set(overrides.effective),
    };
    const cursor = LeaveModel.find({})
        .select({
        _id: 1,
        leaveType: 1,
        startDate: 1,
        endDate: 1,
        numberOfDays: 1,
        resumptionDate: 1,
    })
        .sort({ _id: 1 })
        .lean()
        .cursor();
    const summary = {
        dryRun,
        processed: 0,
        updated: 0,
        skippedNoDates: 0,
        skippedInvalidRange: 0,
        skippedNoChange: 0,
        errors: 0,
    };
    for await (const leave of cursor) {
        if (limit && summary.processed >= limit) {
            break;
        }
        summary.processed += 1;
        if (!leave?.startDate || !leave?.endDate) {
            summary.skippedNoDates += 1;
            continue;
        }
        const details = computeLeaveDetails(leave.startDate, leave.endDate, leave.leaveType, context, leave?.numberOfDays);
        if (!details) {
            summary.skippedInvalidRange += 1;
            continue;
        }
        const existingDays = Number(leave?.numberOfDays ?? 0);
        const existingResumption = normalizeText(leave?.resumptionDate);
        const existingEndDate = normalizeText(leave?.endDate);
        if (existingDays === details.numberOfDays &&
            existingResumption === details.resumptionDate &&
            existingEndDate === details.resumptionDate) {
            summary.skippedNoChange += 1;
            continue;
        }
        if (!dryRun) {
            try {
                await LeaveModel.updateOne({ _id: leave._id }, {
                    $set: {
                        numberOfDays: details.numberOfDays,
                        resumptionDate: details.resumptionDate,
                        endDate: details.resumptionDate,
                    },
                }).exec();
            }
            catch (error) {
                summary.errors += 1;
                continue;
            }
        }
        summary.updated += 1;
    }
    await mongoose_1.default.disconnect();
    console.log(JSON.stringify(summary, null, 2));
};
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
//# sourceMappingURL=backfill-leave-days.js.map