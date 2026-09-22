"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const config_1 = require("../config");
const user_schema_1 = require("../schemas/user.schema");
const user_name_util_1 = require("../utils/user/user-name.util");
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
    };
};
async function run() {
    const options = parseArgs();
    console.log('Backfill staff name casing (Title Case)');
    console.log(`  dryRun: ${options.dryRun}`);
    if (options.limit)
        console.log(`  limit: ${options.limit}`);
    await mongoose_1.default.connect(config_1.config.neutralDB);
    console.log('Connected to DB');
    const UserModel = mongoose_1.default.model(user_schema_1.User.name, user_schema_1.UserSchema);
    const query = UserModel.find({}).select('_id staffId firstName middleName lastName');
    if (options.limit)
        query.limit(options.limit);
    const users = await query.lean();
    console.log(`Found ${users.length} staff record(s)`);
    let updated = 0;
    let unchanged = 0;
    const samples = [];
    for (const user of users) {
        const setFields = {};
        for (const field of user_name_util_1.NAME_FIELDS) {
            const current = user[field];
            if (current === null || current === undefined || current === '')
                continue;
            const normalized = (0, user_name_util_1.toTitleCaseName)(current);
            if (normalized && normalized !== String(current)) {
                setFields[field] = normalized;
            }
        }
        if (!Object.keys(setFields).length) {
            unchanged++;
            continue;
        }
        if (samples.length < 10) {
            const before = user_name_util_1.NAME_FIELDS.map((f) => user[f]).filter(Boolean).join(' ');
            const after = user_name_util_1.NAME_FIELDS.map((f) => setFields[f] ?? user[f]).filter(Boolean).join(' ');
            samples.push(`  ${user.staffId ?? user._id}: "${before}" -> "${after}"`);
        }
        if (!options.dryRun) {
            await UserModel.updateOne({ _id: user._id }, { $set: setFields });
        }
        updated++;
    }
    console.log('');
    if (samples.length) {
        console.log(options.dryRun ? 'Sample changes (dry run):' : 'Sample changes:');
        samples.forEach((line) => console.log(line));
        console.log('');
    }
    console.log('Summary:');
    console.log(`  Records ${options.dryRun ? 'that would be updated' : 'updated'}: ${updated}`);
    console.log(`  Records already correct: ${unchanged}`);
    await mongoose_1.default.disconnect();
    console.log('Done');
}
run().catch((err) => {
    console.error('Backfill failed:', err);
    process.exit(1);
});
//# sourceMappingURL=backfill-staff-name-casing.js.map