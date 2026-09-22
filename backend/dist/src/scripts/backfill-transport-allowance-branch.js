"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const config_1 = require("../config");
const transport_allowance_schema_1 = require("../schemas/transport-allowance.schema");
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
    console.log('Backfill transport-allowance records with branch snapshot');
    console.log(`  dryRun: ${options.dryRun}`);
    if (options.limit)
        console.log(`  limit: ${options.limit}`);
    await mongoose_1.default.connect(config_1.config.neutralDB);
    console.log('Connected to DB');
    const TransportModel = mongoose_1.default.model(transport_allowance_schema_1.TransportAllowance.name, transport_allowance_schema_1.TransportAllowanceSchema);
    const UserModel = mongoose_1.default.model(user_schema_1.User.name, user_schema_1.UserSchema);
    mongoose_1.default.model(branch_schema_1.Branch.name, branch_schema_1.BranchSchema);
    const filter = {
        $or: [
            { branchName: { $exists: false } },
            { branchName: '' },
            { branchName: null },
        ],
    };
    const query = TransportModel.find(filter).sort({ createdAt: -1 });
    if (options.limit)
        query.limit(options.limit);
    const docs = await query.lean();
    console.log(`Found ${docs.length} transport-allowance record(s) to consider`);
    const staffIdSet = new Set();
    for (const doc of docs) {
        const sid = String(doc.staff ?? '');
        if (sid && mongoose_1.default.Types.ObjectId.isValid(sid)) {
            staffIdSet.add(sid);
        }
    }
    console.log(`Looking up branch for ${staffIdSet.size} staff member(s)`);
    const staffIds = Array.from(staffIdSet).map((id) => new mongoose_1.default.Types.ObjectId(id));
    const users = await UserModel.find({ _id: { $in: staffIds } })
        .populate('branch', '_id name gl')
        .select('_id branch')
        .lean();
    const branchByStaff = new Map();
    for (const u of users) {
        const branch = u?.branch;
        if (branch && typeof branch === 'object') {
            branchByStaff.set(String(u._id), {
                branchId: branch?._id,
                name: branch?.name ?? '',
                gl: branch?.gl ?? '',
            });
        }
    }
    console.log(`Resolved branch for ${branchByStaff.size} / ${staffIdSet.size} staff member(s)`);
    let updated = 0;
    let skippedNoBranch = 0;
    for (const doc of docs) {
        const sid = String(doc.staff ?? '');
        const info = branchByStaff.get(sid);
        if (!info) {
            skippedNoBranch++;
            continue;
        }
        if (options.dryRun) {
            console.log(`[DRY-RUN] Would update record ${doc._id}: branch=${info.name}`);
            updated++;
            continue;
        }
        const setFields = {
            branchName: info.name ?? '',
            branchGL: info.gl ?? '',
        };
        if (info.branchId)
            setFields.branch = info.branchId;
        await TransportModel.updateOne({ _id: doc._id }, { $set: setFields });
        updated++;
    }
    console.log('');
    console.log('Summary:');
    console.log(`  Records updated: ${updated}`);
    console.log(`  Records skipped (staff has no branch): ${skippedNoBranch}`);
    await mongoose_1.default.disconnect();
    console.log('Done');
}
run().catch((err) => {
    console.error('Backfill failed:', err);
    process.exit(1);
});
//# sourceMappingURL=backfill-transport-allowance-branch.js.map