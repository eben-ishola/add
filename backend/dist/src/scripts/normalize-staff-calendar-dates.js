"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const config_1 = require("../config");
const user_schema_1 = require("../schemas/user.schema");
const calendar_date_util_1 = require("../utils/shared/calendar-date.util");
const DATE_FIELDS = ['dateOfBirth', 'startDate', 'exitDate'];
const parseArgs = () => {
    const args = process.argv.slice(2);
    const readValue = (flag) => {
        const withEquals = args.find((arg) => arg.startsWith(`${flag}=`));
        if (withEquals)
            return withEquals.slice(flag.length + 1);
        const index = args.indexOf(flag);
        if (index >= 0 && args[index + 1])
            return args[index + 1];
        return undefined;
    };
    const rawLimit = Number(readValue('--limit'));
    return {
        apply: args.includes('--apply'),
        limit: Number.isFinite(rawLimit) && rawLimit > 0 ? Math.trunc(rawLimit) : null,
    };
};
const describe = (doc) => {
    const name = [doc?.firstName, doc?.middleName, doc?.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();
    return `${name || '(no name)'} [staffId=${doc?.staffId ?? '-'}, _id=${doc?._id}]`;
};
async function run() {
    const options = parseArgs();
    console.log('Normalize staff calendar dates to UTC midnight');
    console.log(`  mode: ${options.apply ? 'APPLY (will write)' : 'DRY RUN (no writes)'}`);
    if (options.limit) {
        console.log(`  limit: ${options.limit} document(s)`);
    }
    await mongoose_1.default.connect(config_1.config.neutralDB);
    console.log('Connected to DB');
    const UserModel = mongoose_1.default.model(user_schema_1.User.name, user_schema_1.UserSchema);
    const query = UserModel.find({
        $or: DATE_FIELDS.map((field) => ({ [field]: { $type: 'date' } })),
    })
        .select(`firstName middleName lastName staffId ${DATE_FIELDS.join(' ')}`)
        .lean();
    if (options.limit) {
        query.limit(options.limit);
    }
    const docs = await query.exec();
    console.log(`Scanning ${docs.length} staff record(s)`);
    let changedDocs = 0;
    let changedFields = 0;
    for (const doc of docs) {
        const updates = {};
        for (const field of DATE_FIELDS) {
            const current = doc?.[field];
            if (!(current instanceof Date) || Number.isNaN(current.getTime()))
                continue;
            const normalized = (0, calendar_date_util_1.startOfCalendarDayUtc)(current);
            if (normalized.getTime() === current.getTime())
                continue;
            updates[field] = normalized;
            console.log(`  ${describe(doc)} ${field}: ${current.toISOString()} -> ${normalized.toISOString()} ` +
                `(day stays ${(0, calendar_date_util_1.formatCalendarDate)(current)})`);
            changedFields++;
        }
        if (!Object.keys(updates).length)
            continue;
        changedDocs++;
        if (options.apply) {
            await UserModel.updateOne({ _id: doc._id }, { $set: updates }).exec();
        }
    }
    console.log('');
    console.log(`Documents needing correction: ${changedDocs}`);
    console.log(`Fields needing correction:    ${changedFields}`);
    if (!options.apply && changedDocs) {
        console.log('Re-run with --apply to write these changes.');
    }
    await mongoose_1.default.disconnect();
    console.log('Done');
}
run().catch(async (error) => {
    console.error('normalize-staff-calendar-dates failed', error);
    await mongoose_1.default.disconnect().catch(() => undefined);
    process.exit(1);
});
//# sourceMappingURL=normalize-staff-calendar-dates.js.map