"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const config_1 = require("../config");
const compensation_others_schema_1 = require("../schemas/compensation-others.schema");
const user_schema_1 = require("../schemas/user.schema");
const branch_schema_1 = require("../schemas/branch.schema");
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
    console.log('Backfill compensation-others entries with branch snapshot');
    console.log(`  dryRun: ${options.dryRun}`);
    if (options.limit)
        console.log(`  limit: ${options.limit}`);
    await mongoose_1.default.connect(config_1.config.neutralDB);
    console.log('Connected to DB');
    const OthersModel = mongoose_1.default.model(compensation_others_schema_1.CompensationOthers.name, compensation_others_schema_1.CompensationOthersSchema);
    const UserModel = mongoose_1.default.model(user_schema_1.User.name, user_schema_1.UserSchema);
    mongoose_1.default.model(branch_schema_1.Branch.name, branch_schema_1.BranchSchema);
    const query = OthersModel.find({}).sort({ createdAt: -1 });
    if (options.limit)
        query.limit(options.limit);
    const docs = await query.lean();
    console.log(`Found ${docs.length} compensation-others record(s)`);
    const userIdSet = new Set();
    for (const doc of docs) {
        for (const entry of doc.entries ?? []) {
            const uid = String(entry.userId ?? '');
            if (uid && mongoose_1.default.Types.ObjectId.isValid(uid)) {
                userIdSet.add(uid);
            }
        }
    }
    console.log(`Looking up branch for ${userIdSet.size} user(s)`);
    const userIds = Array.from(userIdSet).map((id) => new mongoose_1.default.Types.ObjectId(id));
    const users = await UserModel.find({ _id: { $in: userIds } })
        .populate('branch', '_id name gl')
        .select('_id branch')
        .lean();
    const branchByUser = new Map();
    for (const u of users) {
        const branch = u?.branch;
        if (branch && typeof branch === 'object') {
            branchByUser.set(String(u._id), {
                branchId: branch?._id,
                name: branch?.name ?? '',
                gl: branch?.gl ?? '',
            });
        }
    }
    console.log(`Resolved branch for ${branchByUser.size} / ${userIdSet.size} user(s)`);
    let updatedDocs = 0;
    let updatedEntries = 0;
    let skippedAlreadySet = 0;
    let skippedNoBranch = 0;
    for (const doc of docs) {
        const entries = doc.entries ?? [];
        let docChanged = false;
        const updates = [];
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const existing = String(entry.branchName ?? '').trim();
            if (existing) {
                skippedAlreadySet++;
                continue;
            }
            const uid = String(entry.userId ?? '');
            const info = branchByUser.get(uid);
            if (!info) {
                skippedNoBranch++;
                continue;
            }
            updates.push({
                index: i,
                branchId: info.branchId,
                branchName: info.name ?? '',
                branchGL: info.gl ?? '',
            });
            docChanged = true;
        }
        if (!docChanged)
            continue;
        if (options.dryRun) {
            console.log(`[DRY-RUN] Would update doc ${doc._id}: ${updates.length} entry(ies)`);
            updatedDocs++;
            updatedEntries += updates.length;
            continue;
        }
        const setFields = {};
        for (const u of updates) {
            if (u.branchId)
                setFields[`entries.${u.index}.branch`] = u.branchId;
            setFields[`entries.${u.index}.branchName`] = u.branchName;
            setFields[`entries.${u.index}.branchGL`] = u.branchGL;
        }
        await OthersModel.updateOne({ _id: doc._id }, { $set: setFields });
        updatedDocs++;
        updatedEntries += updates.length;
    }
    console.log('');
    console.log('Summary:');
    console.log(`  Records updated: ${updatedDocs}`);
    console.log(`  Entries updated: ${updatedEntries}`);
    console.log(`  Entries skipped (already set): ${skippedAlreadySet}`);
    console.log(`  Entries skipped (user has no branch): ${skippedNoBranch}`);
    await mongoose_1.default.disconnect();
    console.log('Done');
}
run().catch((err) => {
    console.error('Backfill failed:', err);
    process.exit(1);
});
//# sourceMappingURL=backfill-others-branch.js.map