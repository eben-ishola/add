"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const config_1 = require("../config");
const document_library_schema_1 = require("../schemas/document-library.schema");
const user_schema_1 = require("../schemas/user.schema");
const EMPLOYEE_DOCUMENT_CATEGORY = 'Employee Documents';
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
const normalizeId = (value) => {
    const text = normalizeText(value);
    return text || null;
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
    const passportValue = normalizeText(readValue('--passport')).toLowerCase();
    const passportMode = passportValue === 'always' || passportValue === 'never'
        ? passportValue
        : 'if-empty';
    const limitValue = Number(readValue('--limit'));
    return {
        dryRun: hasFlag('--dry-run'),
        passportMode,
        limit: Number.isFinite(limitValue) && limitValue > 0 ? limitValue : undefined,
    };
};
const isPassportDocument = (doc) => {
    const tags = Array.isArray(doc?.tags) ? doc.tags : [];
    const fields = [doc?.title, doc?.description, ...tags]
        .filter((value) => typeof value === 'string' && value.trim().length);
    return fields.some((value) => /passport/i.test(value));
};
const resolveLatestVersion = (versions) => {
    if (!Array.isArray(versions) || versions.length === 0) {
        return null;
    }
    let latest = versions[0];
    let latestVersion = Number.isFinite(Number(latest?.version))
        ? Number(latest?.version)
        : null;
    let latestUpdatedAt = latest?.updatedAt
        ? new Date(latest.updatedAt).getTime()
        : 0;
    for (let index = 1; index < versions.length; index += 1) {
        const entry = versions[index];
        const entryVersion = Number.isFinite(Number(entry?.version))
            ? Number(entry?.version)
            : null;
        const entryUpdatedAt = entry?.updatedAt
            ? new Date(entry.updatedAt).getTime()
            : 0;
        if (entryVersion !== null) {
            if (latestVersion === null || entryVersion > latestVersion) {
                latest = entry;
                latestVersion = entryVersion;
                latestUpdatedAt = entryUpdatedAt;
                continue;
            }
            if (entryVersion === latestVersion && entryUpdatedAt > latestUpdatedAt) {
                latest = entry;
                latestUpdatedAt = entryUpdatedAt;
            }
            continue;
        }
        if (latestVersion === null && entryUpdatedAt > latestUpdatedAt) {
            latest = entry;
            latestUpdatedAt = entryUpdatedAt;
        }
    }
    return latest ?? null;
};
const resolveFileInfo = (doc) => {
    const latestVersion = resolveLatestVersion(doc?.versions);
    const fileUrl = normalizeText(doc?.fileUrl) || normalizeText(latestVersion?.fileUrl);
    const fileType = normalizeText(doc?.fileType) || normalizeText(latestVersion?.fileType);
    const fileSize = typeof doc?.fileSize === 'number'
        ? doc.fileSize
        : typeof latestVersion?.fileSize === 'number'
            ? latestVersion.fileSize
            : undefined;
    return { fileUrl, fileType, fileSize };
};
const buildDocumentEntry = (doc, fileInfo) => {
    const uploadedAt = doc?.createdAt ?? doc?.updatedAt ?? new Date();
    return {
        documentId: normalizeId(doc?._id) ?? undefined,
        title: doc?.title,
        category: doc?.category,
        description: doc?.description,
        fileUrl: fileInfo.fileUrl,
        fileType: fileInfo.fileType || undefined,
        fileSize: fileInfo.fileSize,
        uploadedAt,
        uploadedBy: normalizeId(doc?.createdBy) ?? normalizeId(doc?.owner) ?? undefined,
    };
};
const main = async () => {
    const { dryRun, passportMode, limit } = parseArgs();
    const mongoUri = normalizeText(process.env.MONGO_URI) || normalizeText(config_1.config.mainDB);
    if (!mongoUri) {
        throw new Error('Missing MongoDB connection string (set MONGO_URI or config.mainDB).');
    }
    await mongoose_1.default.connect(mongoUri);
    const DocumentModel = mongoose_1.default.models[document_library_schema_1.DocumentLibrary.name] ||
        mongoose_1.default.model(document_library_schema_1.DocumentLibrary.name, document_library_schema_1.DocumentLibrarySchema);
    const UserModel = mongoose_1.default.models[user_schema_1.User.name] ||
        mongoose_1.default.model(user_schema_1.User.name, user_schema_1.UserSchema);
    const cursor = DocumentModel.find({
        category: new RegExp(`^${EMPLOYEE_DOCUMENT_CATEGORY}$`, 'i'),
    })
        .select({
        _id: 1,
        title: 1,
        category: 1,
        description: 1,
        fileUrl: 1,
        fileType: 1,
        fileSize: 1,
        versions: 1,
        tags: 1,
        owner: 1,
        createdBy: 1,
        createdAt: 1,
        updatedAt: 1,
    })
        .sort({ updatedAt: 1, createdAt: 1, _id: 1 })
        .lean()
        .cursor();
    const ownerCache = new Map();
    const touchedOwners = new Set();
    const summary = {
        processed: 0,
        attached: 0,
        skippedNoOwner: 0,
        skippedNoUser: 0,
        skippedMissingFile: 0,
        skippedExisting: 0,
        passportUpdates: 0,
    };
    for await (const doc of cursor) {
        if (limit && summary.processed >= limit) {
            break;
        }
        summary.processed += 1;
        const ownerId = normalizeId(doc?.owner);
        if (!ownerId) {
            summary.skippedNoOwner += 1;
            continue;
        }
        const fileInfo = resolveFileInfo(doc);
        if (!fileInfo.fileUrl) {
            summary.skippedMissingFile += 1;
            continue;
        }
        let cache = ownerCache.get(ownerId);
        if (!cache) {
            const user = (await UserModel.findOne({ _id: ownerId })
                .select({ employeeInformation: 1 })
                .lean()
                .exec());
            if (!user) {
                summary.skippedNoUser += 1;
                continue;
            }
            const info = user?.employeeInformation ?? {};
            const existingDocs = Array.isArray(info?.documents) ? info.documents : [];
            cache = {
                docIds: new Set(existingDocs
                    .map((entry) => normalizeId(entry?.documentId))
                    .filter(Boolean)),
                fileUrls: new Set(existingDocs
                    .map((entry) => normalizeText(entry?.fileUrl))
                    .filter(Boolean)),
                photo: normalizeText(info?.photo),
                passportPhoto: normalizeText(info?.passportPhoto),
                profileImage: normalizeText(info?.profileImage),
            };
            ownerCache.set(ownerId, cache);
        }
        const documentId = normalizeId(doc?._id);
        const fileUrl = normalizeText(fileInfo.fileUrl);
        if ((documentId && cache.docIds.has(documentId)) ||
            (fileUrl && cache.fileUrls.has(fileUrl))) {
            summary.skippedExisting += 1;
            continue;
        }
        const entry = buildDocumentEntry(doc, fileInfo);
        const update = {
            $push: { 'employeeInformation.documents': entry },
        };
        if (passportMode !== 'never' && isPassportDocument(doc) && fileUrl) {
            const passportUpdates = {};
            if (passportMode === 'always' || !cache.photo) {
                passportUpdates['employeeInformation.photo'] = fileUrl;
            }
            if (passportMode === 'always' || !cache.passportPhoto) {
                passportUpdates['employeeInformation.passportPhoto'] = fileUrl;
            }
            if (passportMode === 'always' || !cache.profileImage) {
                passportUpdates['employeeInformation.profileImage'] = fileUrl;
            }
            if (Object.keys(passportUpdates).length) {
                update.$set = passportUpdates;
            }
        }
        if (!dryRun) {
            await UserModel.updateOne({ _id: ownerId }, update).exec();
        }
        summary.attached += 1;
        touchedOwners.add(ownerId);
        if (documentId) {
            cache.docIds.add(documentId);
        }
        if (fileUrl) {
            cache.fileUrls.add(fileUrl);
        }
        if (update.$set?.['employeeInformation.photo']) {
            cache.photo = update.$set['employeeInformation.photo'];
        }
        if (update.$set?.['employeeInformation.passportPhoto']) {
            cache.passportPhoto = update.$set['employeeInformation.passportPhoto'];
        }
        if (update.$set?.['employeeInformation.profileImage']) {
            cache.profileImage = update.$set['employeeInformation.profileImage'];
        }
        if (update.$set) {
            summary.passportUpdates += 1;
        }
    }
    await mongoose_1.default.disconnect();
    const ownersTouched = touchedOwners.size;
    console.log(JSON.stringify({
        dryRun,
        passportMode,
        limit: limit ?? null,
        ownersTouched,
        ...summary,
    }, null, 2));
};
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
//# sourceMappingURL=backfill-employee-documents.js.map