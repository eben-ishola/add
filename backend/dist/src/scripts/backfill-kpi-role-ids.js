"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const config_1 = require("../config");
const kpi_schema_1 = require("../schemas/kpi.schema");
const role_schema_1 = require("../schemas/role.schema");
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
const normalizeLookupKey = (value) => {
    const text = normalizeText(value);
    if (!text)
        return '';
    return text.toLowerCase().replace(/[^a-z0-9]/g, '');
};
const parseArgs = () => {
    const args = process.argv.slice(2);
    const hasFlag = (flag) => args.includes(flag);
    const readValue = (flag) => {
        const withEquals = args.find((arg) => arg.startsWith(`${flag}=`));
        if (withEquals) {
            return withEquals.slice(flag.length + 1);
        }
        const index = args.indexOf(flag);
        if (index >= 0 && args[index + 1]) {
            return args[index + 1];
        }
        return undefined;
    };
    const limitValue = Number(readValue('--limit'));
    const entity = normalizeText(readValue('--entity'));
    return {
        dryRun: hasFlag('--dry-run'),
        limit: Number.isFinite(limitValue) && limitValue > 0 ? limitValue : undefined,
        entity: entity || undefined,
    };
};
const buildRoleNameRegex = (roleName) => {
    const escaped = roleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`^${escaped}$`, 'i');
};
const main = async () => {
    const { dryRun, limit, entity } = parseArgs();
    const mongoUri = normalizeText(process.env.MONGO_URI) ||
        normalizeText(config_1.config.mainDB) ||
        normalizeText(config_1.config.neutralDB) ||
        normalizeText(config_1.config.authDB);
    if (!mongoUri) {
        throw new Error('Missing MongoDB connection string (set MONGO_URI or config.mainDB).');
    }
    await mongoose_1.default.connect(mongoUri);
    const KpiModel = mongoose_1.default.models[kpi_schema_1.PerformanceKpi.name] ||
        mongoose_1.default.model(kpi_schema_1.PerformanceKpi.name, kpi_schema_1.PerformanceKpiSchema);
    const RoleModel = mongoose_1.default.models[role_schema_1.Role.name] ||
        mongoose_1.default.model(role_schema_1.Role.name, role_schema_1.RoleSchema);
    const missingRoleIdFilter = {
        roleName: { $exists: true, $nin: [null, '', 'null', 'undefined'] },
        $or: [
            { roleId: { $exists: false } },
            { roleId: null },
            { roleId: '' },
            { roleId: 'null' },
            { roleId: 'undefined' },
        ],
    };
    if (entity) {
        missingRoleIdFilter.entity = entity;
    }
    const summary = {
        dryRun,
        entity: entity ?? null,
        processed: 0,
        updated: 0,
        skippedNoRoleName: 0,
        skippedNoMatch: 0,
        errors: 0,
    };
    const roleCache = new Map();
    const resolveRoleByName = async (roleNameRaw, entityRaw) => {
        const roleName = normalizeText(roleNameRaw);
        if (!roleName)
            return null;
        const kpiEntity = normalizeText(entityRaw);
        const cacheKey = `${kpiEntity || '*'}|${normalizeLookupKey(roleName)}`;
        if (roleCache.has(cacheKey)) {
            return roleCache.get(cacheKey) ?? null;
        }
        const candidates = (await RoleModel.find({ name: buildRoleNameRegex(roleName) })
            .select('_id name entity')
            .lean()
            .exec());
        if (!candidates.length) {
            roleCache.set(cacheKey, null);
            return null;
        }
        let chosen = candidates[0];
        if (kpiEntity) {
            const entityMatch = candidates.find((candidate) => normalizeText(candidate?.entity).toLowerCase() === kpiEntity.toLowerCase());
            if (entityMatch) {
                chosen = entityMatch;
            }
            else {
                const noEntity = candidates.find((candidate) => !normalizeText(candidate?.entity));
                if (noEntity) {
                    chosen = noEntity;
                }
            }
        }
        const resolved = {
            id: String(chosen._id),
            name: normalizeText(chosen?.name) || roleName,
            entity: normalizeText(chosen?.entity) || undefined,
        };
        roleCache.set(cacheKey, resolved);
        return resolved;
    };
    const cursor = KpiModel.find(missingRoleIdFilter)
        .select('_id roleName roleId entity type title')
        .sort({ _id: 1 })
        .lean()
        .cursor();
    for await (const kpi of cursor) {
        if (limit && summary.processed >= limit)
            break;
        summary.processed += 1;
        const roleName = normalizeText(kpi?.roleName);
        if (!roleName) {
            summary.skippedNoRoleName += 1;
            continue;
        }
        const resolved = await resolveRoleByName(roleName, kpi?.entity);
        if (!resolved?.id) {
            summary.skippedNoMatch += 1;
            continue;
        }
        if (!dryRun) {
            try {
                await KpiModel.updateOne({ _id: kpi._id }, {
                    $set: {
                        roleId: resolved.id,
                        roleName: resolved.name,
                    },
                }).exec();
            }
            catch (error) {
                summary.errors += 1;
                continue;
            }
        }
        summary.updated += 1;
    }
    await mongoose_1.default.disconnect();
    console.log(JSON.stringify(summary, null, 2));
};
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
//# sourceMappingURL=backfill-kpi-role-ids.js.map