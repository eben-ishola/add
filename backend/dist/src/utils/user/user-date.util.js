"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStaffImportDate = void 0;
const calendar_date_util_1 = require("../shared/calendar-date.util");
const STAFF_IMPORT_DATE_FORMATS = [
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
    'YYYY-MM-DD',
    'YYYY/MM/DD',
    'YYYY-MM-DD HH:mm:ss',
    'YYYY/MM/DD HH:mm:ss',
    'MM/DD/YYYY',
    'MM/DD/YY',
    'M/D/YYYY',
    'M/D/YY',
    'DD/MM/YYYY HH:mm:ss',
    'MM/DD/YYYY HH:mm:ss',
    'DD.MM.YYYY',
    'D.MM.YYYY',
    'MMM DD, YYYY',
    'MMMM DD, YYYY',
];
const parseStaffImportDate = (input) => (0, calendar_date_util_1.parseCalendarDate)(input, STAFF_IMPORT_DATE_FORMATS);
exports.parseStaffImportDate = parseStaffImportDate;
//# sourceMappingURL=user-date.util.js.map