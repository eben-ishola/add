"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const bson_1 = require("bson");
const ExcelJS = require("exceljs");
const mongoose_1 = require("mongoose");
const config_1 = require("../config");
const DEFAULT_EMPLOYEE_ID = '66414b2af2279f72de95bc79';
const DEFAULT_EMPLOYEE_NAME = 'IFEOMA NKWONTA';
const DEFAULT_PERIOD = '2026-03';
const DEFAULT_BSON_PATH = 'C:\\Users\\ebeni\\Documents\\performancekpiresults.bson';
const DEFAULT_EMPLOYEE_EXPORT_PATH = path.resolve(process.cwd(), 'exports', 'user-kpis.xlsx');
const DEFAULT_KPI_EXPORT_PATHS = [
    'C:\\Users\\ebeni\\OneDrive\\Desktop\\M\\hrms.performancekpis.json',
    'C:\\Users\\ebeni\\OneDrive\\Desktop\\M\\performancekpis.from-bson.json',
];
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
const normalizeTitle = (value) => normalizeText(value)
    .toLowerCase()
    .replace(/\s*\(copy\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
const parseMaybeNumber = (value) => {
    const text = normalizeText(value);
    if (!text)
        return undefined;
    const parsed = Number(text.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : text;
};
const objectIdText = (value) => {
    if (!value)
        return '';
    if (typeof value === 'string')
        return value;
    if (value instanceof mongoose_1.Types.ObjectId)
        return value.toHexString();
    if (value?._bsontype === 'ObjectId' && typeof value.toHexString === 'function') {
        return value.toHexString();
    }
    if (value?.$oid)
        return String(value.$oid);
    return String(value);
};
const objectId = (value, label) => {
    if (!mongoose_1.Types.ObjectId.isValid(value))
        throw new Error(`Invalid ${label}: ${value}`);
    return new mongoose_1.Types.ObjectId(value);
};
const scalarValue = (value) => {
    if (value === null || value === undefined)
        return undefined;
    if (value instanceof Date)
        return value;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value;
    }
    if (value?.$numberInt !== undefined)
        return Number(value.$numberInt);
    if (value?.$numberLong !== undefined)
        return Number(value.$numberLong);
    if (value?.$numberDouble !== undefined)
        return Number(value.$numberDouble);
    if (value?._bsontype === 'Long' || value?.constructor?.name === 'Long') {
        return Number(value.toString());
    }
    if (value?._bsontype === 'Double' || value?.constructor?.name === 'Double') {
        return Number(value.valueOf());
    }
    return value;
};
const parseDate = (value) => {
    if (value instanceof Date && !Number.isNaN(value.getTime()))
        return value;
    const text = normalizeText(value);
    if (!text)
        return undefined;
    const date = new Date(text);
    return Number.isNaN(date.getTime()) ? undefined : date;
};
const resolveAchievement = (score, weight) => {
    const scoreNumber = Number(score);
    const weightNumber = Number(weight);
    if (!Number.isFinite(scoreNumber) || !Number.isFinite(weightNumber) || weightNumber <= 0) {
        return undefined;
    }
    return Math.max(0, Math.min(1, scoreNumber / weightNumber));
};
const compactObject = (input) => {
    const output = {};
    Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined)
            output[key] = value;
    });
    return output;
};
const parseArgs = () => {
    const args = process.argv.slice(2);
    const readValue = (flag) => {
        const withEquals = args.find((arg) => arg.startsWith(`${flag}=`));
        if (withEquals)
            return withEquals.slice(flag.length + 1);
        const index = args.indexOf(flag);
        if (index >= 0)
            return args[index + 1];
        return undefined;
    };
    const kpiExportPaths = args
        .filter((arg) => arg.startsWith('--kpi-export='))
        .map((arg) => arg.slice('--kpi-export='.length))
        .filter(Boolean);
    return {
        apply: args.includes('--apply'),
        employeeId: normalizeText(readValue('--employee-id')) || DEFAULT_EMPLOYEE_ID,
        employeeName: normalizeText(readValue('--employee-name')) || DEFAULT_EMPLOYEE_NAME,
        period: normalizeText(readValue('--period')) || DEFAULT_PERIOD,
        bsonPath: readValue('--bson') ?? DEFAULT_BSON_PATH,
        employeeExportPath: readValue('--employee-export') ?? DEFAULT_EMPLOYEE_EXPORT_PATH,
        kpiExportPaths: kpiExportPaths.length ? kpiExportPaths : DEFAULT_KPI_EXPORT_PATHS,
    };
};
const readBsonDocuments = (filePath) => {
    const buffer = fs.readFileSync(filePath);
    const documents = [];
    let offset = 0;
    while (offset < buffer.length) {
        const size = buffer.readInt32LE(offset);
        if (!size || size < 5 || offset + size > buffer.length) {
            throw new Error(`Invalid BSON document size ${size} at offset ${offset}.`);
        }
        documents.push(bson_1.BSON.deserialize(buffer.subarray(offset, offset + size)));
        offset += size;
    }
    return documents;
};
const readJsonExportItems = (filePath) => {
    if (!fs.existsSync(filePath))
        return [];
    const text = fs.readFileSync(filePath, 'utf8').trim();
    if (!text)
        return [];
    if (filePath.endsWith('from-bson.json')) {
        return text
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => JSON.parse(line));
    }
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
};
const readKpiMap = (filePaths) => {
    const map = new Map();
    for (const filePath of filePaths) {
        for (const item of readJsonExportItems(filePath)) {
            const id = objectIdText(item?._id);
            if (id)
                map.set(id, item);
        }
    }
    return map;
};
const readEmployeeSourceRows = async (filePath, employeeName, period) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const rows = new Map();
    workbook.eachSheet((sheet) => {
        const headers = {};
        sheet.getRow(1).eachCell({ includeEmpty: true }, (cell, column) => {
            headers[column] = normalizeText(cell.value);
        });
        sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1)
                return;
            const record = {};
            row.eachCell({ includeEmpty: true }, (cell, column) => {
                const header = headers[column];
                if (header)
                    record[header] = cell.value;
            });
            if (normalizeText(record.Employee).toUpperCase() !== employeeName.toUpperCase())
                return;
            if (normalizeText(record.Period) !== period)
                return;
            if (normalizeText(record.Source).toLowerCase() !== 'employee')
                return;
            const title = normalizeText(record['KPI Title']);
            if (!title)
                return;
            rows.set(normalizeTitle(title), {
                title,
                status: normalizeText(record.Status) || 'submitted',
                value: parseMaybeNumber(record.Actual),
                score: parseMaybeNumber(record.Score),
                updatedAt: parseDate(record.Updated),
            });
        });
    });
    return rows;
};
const buildWrites = (input) => {
    const writes = [];
    for (const reviewerRow of input.reviewerRows) {
        const kpiId = objectIdText(reviewerRow.kpiId);
        const kpi = input.kpiMap.get(kpiId);
        const title = normalizeText(kpi?.title) || kpiId;
        const employeeRow = input.employeeRows.get(normalizeTitle(title));
        if (!employeeRow) {
            throw new Error(`Missing source=employee row for KPI '${title}'.`);
        }
        const kpiObjectId = objectId(kpiId, 'kpiId');
        const scopeKey = `employee:${input.employeeId}`;
        const baseFilter = {
            kpiId: kpiObjectId,
            period: input.period,
            scopeKey,
        };
        const baseFields = {
            kpiId: kpiObjectId,
            period: input.period,
            scopeKey,
            scopeType: 'employee',
            scopeId: input.employeeId,
            employeeId: input.employeeId,
            employeeName: input.employeeName,
            entity: normalizeText(reviewerRow.entity),
            isActualValueLocked: Boolean(reviewerRow.isActualValueLocked),
        };
        const weight = scalarValue(kpi?.weight);
        const employeeScore = scalarValue(employeeRow.score);
        const employeeUpdate = compactObject({
            ...baseFields,
            source: 'employee',
            status: employeeRow.status || 'submitted',
            actualValue: employeeRow.value,
            achievement: resolveAchievement(employeeScore, weight),
            score: employeeScore,
            submittedBy: input.employeeId,
            submittedAt: employeeRow.updatedAt ?? reviewerRow.submittedAt ?? new Date(),
            updatedAt: employeeRow.updatedAt ?? reviewerRow.submittedAt ?? new Date(),
        });
        writes.push({
            source: 'employee',
            title,
            filter: { ...baseFilter, source: 'employee' },
            update: employeeUpdate,
            preview: {
                title,
                source: 'employee',
                actualValue: employeeUpdate.actualValue,
                score: employeeUpdate.score,
                status: employeeUpdate.status,
            },
        });
        const reviewerUpdate = compactObject({
            ...baseFields,
            source: 'reviewer',
            status: normalizeText(reviewerRow.status) || 'approved',
            actualValue: scalarValue(reviewerRow.actualValue),
            achievement: scalarValue(reviewerRow.achievement),
            score: scalarValue(reviewerRow.score),
            submittedBy: normalizeText(reviewerRow.submittedBy) || input.employeeId,
            submittedAt: reviewerRow.submittedAt,
            reviewedBy: normalizeText(reviewerRow.reviewedBy),
            reviewerName: normalizeText(reviewerRow.reviewerName),
            reviewedAt: reviewerRow.reviewedAt,
            updatedAt: reviewerRow.updatedAt ?? new Date(),
        });
        writes.push({
            source: 'reviewer',
            title,
            filter: { ...baseFilter, source: 'reviewer' },
            update: reviewerUpdate,
            insert: {
                _id: objectId(objectIdText(reviewerRow._id), '_id'),
                createdAt: reviewerRow.createdAt ?? new Date(),
            },
            preview: {
                title,
                source: 'reviewer',
                actualValue: reviewerUpdate.actualValue,
                score: reviewerUpdate.score,
                status: reviewerUpdate.status,
                reviewerName: reviewerUpdate.reviewerName,
            },
        });
    }
    return writes;
};
const recreateSourceUniqueIndex = async () => {
    const collection = mongoose_1.default.connection.collection('performancekpiresults');
    const indexes = await collection.indexes();
    const oldUnique = indexes.find((index) => index.unique &&
        JSON.stringify(index.key) === JSON.stringify({ kpiId: 1, period: 1, scopeKey: 1 }));
    if (oldUnique?.name) {
        await collection.dropIndex(oldUnique.name);
    }
    await collection.createIndex({ kpiId: 1, period: 1, scopeKey: 1, source: 1 }, { unique: true, name: 'kpiId_1_period_1_scopeKey_1_source_1' });
};
const main = async () => {
    const args = parseArgs();
    const documents = readBsonDocuments(args.bsonPath);
    const kpiMap = readKpiMap(args.kpiExportPaths);
    const employeeRows = await readEmployeeSourceRows(args.employeeExportPath, args.employeeName, args.period);
    const reviewerRows = documents.filter((row) => {
        const matchesEmployee = normalizeText(row.employeeId) === args.employeeId ||
            normalizeText(row.scopeId) === args.employeeId ||
            normalizeText(row.scopeKey) === `employee:${args.employeeId}` ||
            normalizeText(row.employeeName).toUpperCase() === args.employeeName.toUpperCase();
        return (matchesEmployee &&
            normalizeText(row.period) === args.period &&
            normalizeText(row.source).toLowerCase() === 'reviewer');
    });
    const writes = buildWrites({
        reviewerRows,
        employeeRows,
        kpiMap,
        employeeId: args.employeeId,
        employeeName: args.employeeName,
        period: args.period,
    });
    const summary = {
        apply: args.apply,
        employeeId: args.employeeId,
        employeeName: args.employeeName,
        period: args.period,
        reviewerRows: reviewerRows.length,
        employeeSourceRows: employeeRows.size,
        writes: writes.length,
        rows: writes.map((write) => write.preview),
    };
    if (!args.apply) {
        console.log(JSON.stringify({ ...summary, message: 'Dry run only. Re-run with --apply to write separate source rows.' }, null, 2));
        return;
    }
    await mongoose_1.default.connect(config_1.config.mainDB);
    try {
        await recreateSourceUniqueIndex();
        const collection = mongoose_1.default.connection.collection('performancekpiresults');
        const result = writes.length
            ? await collection.bulkWrite(writes.map((write) => ({
                updateOne: {
                    filter: write.filter,
                    update: {
                        $set: write.update,
                        ...(write.insert ? { $setOnInsert: write.insert } : {}),
                    },
                    upsert: true,
                },
            })), { ordered: false })
            : null;
        console.log(JSON.stringify({
            ...summary,
            matched: result?.matchedCount ?? 0,
            modified: result?.modifiedCount ?? 0,
            upserted: result?.upsertedCount ?? 0,
        }, null, 2));
    }
    finally {
        await mongoose_1.default.disconnect();
    }
};
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
//# sourceMappingURL=populate-ifeoma-kpi-result-sources.js.map