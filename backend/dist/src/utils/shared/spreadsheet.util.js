"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.csvBufferToObjects = exports.csvBufferToRowArrays = exports.csvRowsToObjects = exports.parseCsvText = exports.worksheetToObjects = exports.worksheetToRowArrays = exports.getFirstWorksheet = exports.loadWorkbook = void 0;
const path = require("path");
const ExcelJS = require("exceljs");
const normalizeCellValue = (cell, options) => {
    if (!cell || cell.value === null || cell.value === undefined) {
        return options.defval;
    }
    if (options.useText) {
        const text = cell.text ?? '';
        if (text !== '') {
            return text;
        }
    }
    const value = cell.value;
    if (value && typeof value === 'object') {
        if ('result' in value && value.result !== undefined) {
            return value.result;
        }
        if ('text' in value && value.text !== undefined) {
            return value.text;
        }
        if ('richText' in value && Array.isArray(value.richText)) {
            return value.richText.map((part) => part?.text ?? '').join('');
        }
    }
    return value;
};
const loadWorkbook = async (source, fileName) => {
    const reference = typeof source === 'string' ? source : fileName ?? '';
    const ext = reference ? path.extname(reference).toLowerCase() : '';
    if (ext === '.xls') {
        throw new Error('Legacy .xls files are not supported. Please save as .xlsx or .xlsm.');
    }
    const workbook = new ExcelJS.Workbook();
    if (typeof source === 'string') {
        await workbook.xlsx.readFile(source);
    }
    else {
        let data;
        if (Buffer.isBuffer(source)) {
            data = source;
        }
        else if (source instanceof ArrayBuffer) {
            data = Buffer.from(source);
        }
        else {
            data = Buffer.from(source.buffer, source.byteOffset, source.byteLength);
        }
        await workbook.xlsx.load(data);
    }
    return workbook;
};
exports.loadWorkbook = loadWorkbook;
const getFirstWorksheet = (workbook) => workbook.worksheets[0];
exports.getFirstWorksheet = getFirstWorksheet;
const worksheetToRowArrays = (worksheet, options = {}) => {
    const rows = [];
    worksheet.eachRow({ includeEmpty: false }, (row) => {
        if (!row.hasValues)
            return;
        const rowValues = [];
        for (let col = 1; col <= row.cellCount; col += 1) {
            const cell = row.getCell(col);
            rowValues.push(normalizeCellValue(cell, options));
        }
        rows.push(rowValues);
    });
    return rows;
};
exports.worksheetToRowArrays = worksheetToRowArrays;
const worksheetToObjects = (worksheet, options = {}) => {
    const headerRow = worksheet.getRow(1);
    const headerCellCount = Math.max(headerRow.cellCount, worksheet.columnCount);
    const headers = Array.from({ length: headerCellCount }, (_unused, index) => {
        const cell = headerRow.getCell(index + 1);
        return String(normalizeCellValue(cell, options) ?? '');
    });
    const rows = [];
    for (let rowIndex = 2; rowIndex <= worksheet.rowCount; rowIndex += 1) {
        const row = worksheet.getRow(rowIndex);
        if (!row || !row.hasValues)
            continue;
        const record = {};
        headers.forEach((header, index) => {
            if (!header)
                return;
            const cell = row.getCell(index + 1);
            record[header] = normalizeCellValue(cell, options);
        });
        rows.push(record);
    }
    return { headers, rows };
};
exports.worksheetToObjects = worksheetToObjects;
const stripBom = (value) => value && value.charCodeAt(0) === 0xfeff ? value.slice(1) : value;
const parseCsvText = (text) => {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;
    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        if (inQuotes) {
            if (char === '"') {
                const next = text[index + 1];
                if (next === '"') {
                    field += '"';
                    index += 1;
                }
                else {
                    inQuotes = false;
                }
            }
            else {
                field += char;
            }
            continue;
        }
        if (char === '"') {
            inQuotes = true;
            continue;
        }
        if (char === ",") {
            row.push(field);
            field = "";
            continue;
        }
        if (char === "\n" || char === "\r") {
            if (char === "\r" && text[index + 1] === "\n") {
                index += 1;
            }
            row.push(field);
            field = "";
            if (row.some((value) => String(value ?? "").trim() !== "")) {
                rows.push(row);
            }
            row = [];
            continue;
        }
        field += char;
    }
    if (field.length || row.length) {
        row.push(field);
        if (row.some((value) => String(value ?? "").trim() !== "")) {
            rows.push(row);
        }
    }
    return rows;
};
exports.parseCsvText = parseCsvText;
const csvRowsToObjects = (rows, options = {}) => {
    if (!rows.length)
        return { headers: [], rows: [] };
    const trimValues = options.trim !== false;
    const headers = rows[0].map((header) => {
        const value = stripBom(String(header ?? ""));
        return trimValues ? value.trim() : value;
    });
    const records = [];
    rows.slice(1).forEach((row) => {
        const record = {};
        headers.forEach((header, index) => {
            if (!header)
                return;
            const raw = row[index] ?? options.defval ?? "";
            const value = String(raw ?? "");
            record[header] = trimValues ? value.trim() : value;
        });
        records.push(record);
    });
    return { headers, rows: records };
};
exports.csvRowsToObjects = csvRowsToObjects;
const csvBufferToRowArrays = (source) => {
    const text = typeof source === "string" ? source : source.toString("utf-8");
    return (0, exports.parseCsvText)(text);
};
exports.csvBufferToRowArrays = csvBufferToRowArrays;
const csvBufferToObjects = (source, options = {}) => {
    return (0, exports.csvRowsToObjects)((0, exports.csvBufferToRowArrays)(source), options);
};
exports.csvBufferToObjects = csvBufferToObjects;
//# sourceMappingURL=spreadsheet.util.js.map