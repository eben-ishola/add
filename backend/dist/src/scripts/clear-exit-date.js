"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const config_1 = require("../config");
const user_schema_1 = require("../schemas/user.schema");
const DEFAULT_NAME_TARGETS = ['fasiku', 'ofeton'];
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
    const splitList = (value) => (value ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    const names = splitList(readValue('--names'));
    return {
        apply: hasFlag('--apply'),
        names: names.length ? names : DEFAULT_NAME_TARGETS,
        staffIds: splitList(readValue('--staff-ids')),
    };
};
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const describe = (doc) => {
    const name = [doc?.firstName, doc?.middleName, doc?.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();
    return `${name || '(no name)'} [staffId=${doc?.staffId ?? '-'}, status=${doc?.status ?? '-'}, _id=${doc?._id}]`;
};
const formatExitDate = (value) => {
    if (value === null || value === undefined || value === '')
        return '(none)';
    const parsed = value instanceof Date ? value : new Date(String(value));
    return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
};
async function run() {
    const options = parseArgs();
    console.log('Clear exitDate on staff records');
    console.log(`  mode: ${options.apply ? 'APPLY (will write)' : 'DRY RUN (no writes)'}`);
    if (options.staffIds.length) {
        console.log(`  staffIds: ${options.staffIds.join(', ')}`);
    }
    else {
        console.log(`  names: ${options.names.join(', ')}`);
    }
    await mongoose_1.default.connect(config_1.config.neutralDB);
    console.log('Connected to DB');
    const UserModel = mongoose_1.default.model(user_schema_1.User.name, user_schema_1.UserSchema);
    const projection = 'firstName middleName lastName staffId status exitDate startDate';
    const targets = [];
    if (options.staffIds.length) {
        for (const staffId of options.staffIds) {
            const docs = await UserModel.find({
                staffId: new RegExp(`^${escapeRegex(staffId)}$`, 'i'),
            })
                .select(projection)
                .lean();
            targets.push({ label: staffId, docs });
        }
    }
    else {
        for (const name of options.names) {
            const pattern = new RegExp(escapeRegex(name), 'i');
            const docs = await UserModel.find({
                $or: [{ firstName: pattern }, { middleName: pattern }, { lastName: pattern }],
            })
                .select(projection)
                .lean();
            targets.push({ label: name, docs });
        }
    }
    let cleared = 0;
    let alreadyClear = 0;
    let skipped = 0;
    for (const target of targets) {
        console.log('');
        console.log(`Target "${target.label}": ${target.docs.length} match(es)`);
        if (target.docs.length === 0) {
            console.log('  !! no match — skipped');
            skipped++;
            continue;
        }
        if (target.docs.length > 1) {
            console.log('  !! ambiguous — skipped. Re-run with --staff-ids to pick one of:');
            target.docs.forEach((doc) => console.log(`     - ${describe(doc)}`));
            skipped++;
            continue;
        }
        const doc = target.docs[0];
        console.log(`  ${describe(doc)}`);
        console.log(`  exitDate (before): ${formatExitDate(doc?.exitDate)}`);
        if (doc?.exitDate === null || doc?.exitDate === undefined || doc?.exitDate === '') {
            console.log('  -> already has no exitDate, nothing to do');
            alreadyClear++;
            continue;
        }
        if (!options.apply) {
            console.log('  -> [DRY RUN] would set exitDate = null');
            cleared++;
            continue;
        }
        await UserModel.updateOne({ _id: doc._id }, { $set: { exitDate: null } });
        console.log('  -> exitDate set to null');
        cleared++;
    }
    console.log('');
    console.log('Summary:');
    console.log(`  ${options.apply ? 'Cleared' : 'Would clear'}: ${cleared}`);
    console.log(`  Already clear: ${alreadyClear}`);
    console.log(`  Skipped (no match / ambiguous): ${skipped}`);
    if (!options.apply) {
        console.log('');
        console.log('Dry run only — no changes were written. Re-run with --apply to commit.');
    }
    await mongoose_1.default.disconnect();
    console.log('Done');
}
run().catch((err) => {
    console.error('clear-exit-date failed:', err);
    process.exit(1);
});
//# sourceMappingURL=clear-exit-date.js.map