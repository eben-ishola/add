"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const config_1 = require("../config");
const leave_allowance_approval_schema_1 = require("../schemas/leave-allowance-approval.schema");
const user_schema_1 = require("../schemas/user.schema");
const normalizeText = (value) => {
    if (value === null || value === undefined)
        return '';
    const trimmed = String(value).trim();
    if (!trimmed)
        return '';
    const lowered = trimmed.toLowerCase();
    if (lowered === 'null' || lowered === 'undefined')
        return '';
    return trimmed;
};
const parseArgs = () => {
    const args = process.argv.slice(2);
    const hasFlag = (flag) => args.includes(flag);
    const readValue = (flag) => {
        const withEquals = args.find((arg) => arg.startsWith(`${flag}=`));
        if (withEquals)
            return withEquals.slice(flag.length + 1);
        const index = args.indexOf(flag);
        if (index >= 0 && args[index + 1])
            return args[index + 1];
        return undefined;
    };
    const limitRaw = Number(readValue('--limit'));
    return {
        dryRun: hasFlag('--dry-run'),
        limit: Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : undefined,
        approvalId: normalizeText(readValue('--approval')) || undefined,
        entity: normalizeText(readValue('--entity')) || undefined,
    };
};
const toObjectId = (value) => {
    if (!value)
        return null;
    return mongoose_1.default.Types.ObjectId.isValid(value) ? new mongoose_1.default.Types.ObjectId(value) : null;
};
const resolveRows = (value, depth = 0) => {
    if (Array.isArray(value))
        return value;
    if (!value || depth > 3)
        return [];
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed)
            return [];
        try {
            const parsed = JSON.parse(trimmed);
            return resolveRows(parsed, depth + 1);
        }
        catch {
            return [];
        }
    }
    if (typeof value === 'object') {
        if (Array.isArray(value.data))
            return value.data;
        if (Array.isArray(value.rows))
            return value.rows;
        if (value.data)
            return resolveRows(value.data, depth + 1);
    }
    return [];
};
const rewriteRowsContainer = (original, nextRows) => {
    if (Array.isArray(original))
        return nextRows;
    if (original && typeof original === 'object') {
        if (Array.isArray(original.data)) {
            return { ...original, data: nextRows };
        }
        if (Array.isArray(original.rows)) {
            return { ...original, rows: nextRows };
        }
    }
    return nextRows;
};
const main = async () => {
    const options = parseArgs();
    const mongoUri = normalizeText(process.env.MONGO_URI) ||
        normalizeText(config_1.config.mainDB) ||
        normalizeText(config_1.config.neutralDB) ||
        normalizeText(config_1.config.authDB);
    if (!mongoUri) {
        throw new Error('Missing MongoDB connection string (set MONGO_URI or config.mainDB).');
    }
    await mongoose_1.default.connect(mongoUri);
    const LeaveApprovalModel = mongoose_1.default.models[leave_allowance_approval_schema_1.LeaveAllowanceApproval.name] ||
        mongoose_1.default.model(leave_allowance_approval_schema_1.LeaveAllowanceApproval.name, leave_allowance_approval_schema_1.LeaveAllowanceApprovalSchema);
    const UserModel = mongoose_1.default.models[user_schema_1.User.name] ||
        mongoose_1.default.model(user_schema_1.User.name, user_schema_1.UserSchema);
    const query = {
        data: { $exists: true },
    };
    if (options.approvalId) {
        const id = toObjectId(options.approvalId);
        query._id = id ?? options.approvalId;
    }
    if (options.entity) {
        query.entity = options.entity;
    }
    const summary = {
        dryRun: options.dryRun,
        limit: options.limit ?? null,
        approvalId: options.approvalId ?? null,
        entity: options.entity ?? null,
        scanned: 0,
        updatedDocuments: 0,
        updatedRows: 0,
        resolvedFromUsers: 0,
        skippedRowsMissingAddosser: 0,
        errors: 0,
    };
    const cursor = LeaveApprovalModel.find(query)
        .select('_id payrollApprovalId entity data')
        .sort({ _id: 1 })
        .lean()
        .cursor();
    for await (const approval of cursor) {
        if (options.limit && summary.scanned >= options.limit)
            break;
        summary.scanned += 1;
        const sourceRows = resolveRows(approval?.data);
        if (!sourceRows.length)
            continue;
        const userObjectIds = new Set();
        const staffKeys = new Set();
        const emailKeys = new Set();
        sourceRows.forEach((row) => {
            if (!row || typeof row !== 'object')
                return;
            const objectIdCandidates = [row?.userId, row?.staffObjectId, row?.id];
            objectIdCandidates.forEach((candidate) => {
                const normalized = normalizeText(candidate);
                if (normalized && mongoose_1.default.Types.ObjectId.isValid(normalized)) {
                    userObjectIds.add(normalized);
                }
            });
            const staffCandidates = [row?.staffId, row?.employeeId];
            staffCandidates.forEach((candidate) => {
                const normalized = normalizeText(candidate);
                if (normalized)
                    staffKeys.add(normalized);
            });
            const email = normalizeText(row?.email);
            if (email)
                emailKeys.add(email.toLowerCase());
        });
        const accountLookup = new Map();
        if (userObjectIds.size || staffKeys.size || emailKeys.size) {
            const userQuery = { $or: [] };
            if (userObjectIds.size) {
                userQuery.$or.push({
                    _id: { $in: Array.from(userObjectIds).map((value) => new mongoose_1.default.Types.ObjectId(value)) },
                });
            }
            if (staffKeys.size) {
                userQuery.$or.push({ staffId: { $in: Array.from(staffKeys) } });
            }
            if (emailKeys.size) {
                userQuery.$or.push({ email: { $in: Array.from(emailKeys) } });
            }
            if (userQuery.$or.length) {
                const users = await UserModel.find(userQuery)
                    .select('_id staffId email addosserAccount')
                    .lean()
                    .exec();
                users.forEach((user) => {
                    const account = normalizeText(user?.addosserAccount);
                    if (!account)
                        return;
                    const keys = [
                        normalizeText(user?._id),
                        normalizeText(user?.staffId),
                        normalizeText(user?.email).toLowerCase(),
                    ].filter(Boolean);
                    keys.forEach((key) => accountLookup.set(key, account));
                });
            }
        }
        let touched = false;
        const nextRows = sourceRows.map((row) => {
            if (!row || typeof row !== 'object')
                return row;
            let addosserAccount = normalizeText(row?.addosserAccount);
            if (!addosserAccount) {
                const lookupKeys = [
                    normalizeText(row?.userId),
                    normalizeText(row?.staffObjectId),
                    normalizeText(row?.id),
                    normalizeText(row?.staffId),
                    normalizeText(row?.employeeId),
                    normalizeText(row?.email).toLowerCase(),
                ].filter(Boolean);
                for (const key of lookupKeys) {
                    const matched = accountLookup.get(key);
                    if (matched) {
                        addosserAccount = matched;
                        summary.resolvedFromUsers += 1;
                        break;
                    }
                }
            }
            if (!addosserAccount) {
                summary.skippedRowsMissingAddosser += 1;
                return row;
            }
            const leaveAccount = normalizeText(row?.leaveAccount);
            const account = normalizeText(row?.account);
            const storedAddosser = normalizeText(row?.addosserAccount);
            if (leaveAccount === addosserAccount &&
                account === addosserAccount &&
                storedAddosser === addosserAccount) {
                return row;
            }
            touched = true;
            summary.updatedRows += 1;
            return {
                ...row,
                addosserAccount,
                leaveAccount: addosserAccount,
                account: addosserAccount,
            };
        });
        if (!touched)
            continue;
        summary.updatedDocuments += 1;
        if (options.dryRun)
            continue;
        try {
            const nextData = rewriteRowsContainer(approval?.data, nextRows);
            await LeaveApprovalModel.updateOne({ _id: approval._id }, { $set: { data: nextData } }).exec();
        }
        catch {
            summary.errors += 1;
        }
    }
    await mongoose_1.default.disconnect();
    console.log(JSON.stringify(summary, null, 2));
};
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
//# sourceMappingURL=backfill-leave-approval-addosser-account.js.map