"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCalendarDate = exports.parseCalendarDate = exports.startOfCalendarDayUtc = exports.APP_TIME_ZONE = void 0;
const moment = require("moment-timezone");
exports.APP_TIME_ZONE = 'Africa/Lagos';
const EXCEL_DATE_MIN_SERIAL = 59;
const EXCEL_DATE_MAX_SERIAL = 2958465;
const CALENDAR_DATE_FORMATS = [
    'YYYY-MM-DD',
    'YYYY/MM/DD',
    'YYYY-MM-DDTHH:mm:ss',
    'YYYY-MM-DD HH:mm:ss',
    'YYYY/MM/DD HH:mm:ss',
    'DD-MMM-YY',
    'DD-MMM-YYYY',
    'D-MMM-YY',
    'D-MMM-YYYY',
    'DD/MM/YYYY',
    'DD/MM/YY',
    'D/M/YYYY',
    'D/M/YY',
    'DD-MM-YYYY',
    'DD-MM-YY',
    'D-M-YYYY',
    'D-M-YY',
    'DD-MM-YYYY HH:mm:ss',
    'DD/MM/YYYY HH:mm:ss',
    'MM/DD/YYYY',
    'MM/DD/YY',
    'M/D/YYYY',
    'M/D/YY',
    'MM/DD/YYYY HH:mm:ss',
    'DD.MM.YYYY',
    'D.MM.YYYY',
    'MMM DD, YYYY',
    'MMMM DD, YYYY',
];
const startOfCalendarDayUtc = (value) => moment(value).tz(exports.APP_TIME_ZONE).format('YYYY-MM-DD') === 'Invalid date'
    ? value
    : moment
        .utc(moment(value).tz(exports.APP_TIME_ZONE).format('YYYY-MM-DD'), 'YYYY-MM-DD')
        .toDate();
exports.startOfCalendarDayUtc = startOfCalendarDayUtc;
const parseCalendarDate = (input, formats = CALENDAR_DATE_FORMATS) => {
    try {
        if (input === null || input === undefined || input === '') {
            return null;
        }
        if (input instanceof Date) {
            return Number.isNaN(input.getTime()) ? null : (0, exports.startOfCalendarDayUtc)(input);
        }
        const asNumber = typeof input === 'number' ? input : Number(input);
        if (!Number.isNaN(asNumber) &&
            String(input).trim() !== '' &&
            asNumber > EXCEL_DATE_MIN_SERIAL &&
            asNumber < EXCEL_DATE_MAX_SERIAL) {
            return moment.utc('1899-12-30', 'YYYY-MM-DD').add(asNumber, 'days').toDate();
        }
        if (typeof input === 'string') {
            const trimmed = input.trim();
            if (!trimmed) {
                return null;
            }
            const parsed = moment.utc(trimmed, formats, true);
            if (parsed.isValid()) {
                return parsed.startOf('day').toDate();
            }
            const iso = moment.utc(trimmed, moment.ISO_8601);
            if (iso.isValid()) {
                return (0, exports.startOfCalendarDayUtc)(iso.toDate());
            }
        }
        return null;
    }
    catch (error) {
        console.error('Failed to convert calendar date:', input, error?.message || error);
        return null;
    }
};
exports.parseCalendarDate = parseCalendarDate;
const formatCalendarDate = (value, fallback = '') => {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }
    const parsed = moment(value instanceof Date ? value : new Date(value));
    if (!parsed.isValid()) {
        return fallback;
    }
    return parsed.tz(exports.APP_TIME_ZONE).format('YYYY-MM-DD');
};
exports.formatCalendarDate = formatCalendarDate;
//# sourceMappingURL=calendar-date.util.js.map