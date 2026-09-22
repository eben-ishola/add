"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv = require("dotenv");
const fs_1 = require("fs");
const path_1 = require("path");
const resolveEnvPath = () => {
    const candidates = [
        (0, path_1.resolve)(process.cwd(), '.env'),
        (0, path_1.resolve)(__dirname, '..', '.env'),
        (0, path_1.resolve)(__dirname, '..', '..', '.env'),
    ];
    const found = candidates.find((candidate) => (0, fs_1.existsSync)(candidate));
    if (!found) {
        throw new Error(`Missing backend .env file. Checked: ${candidates.join(', ')}`);
    }
    return found;
};
const envPath = resolveEnvPath();
const envResult = dotenv.config({ path: envPath, quiet: true, override: true });
if (envResult.error || !envResult.parsed) {
    throw new Error(`Unable to load backend .env file at ${envPath}`);
}
const envFile = envResult.parsed;
const readEnv = (name, options) => {
    if (!Object.prototype.hasOwnProperty.call(envFile, name)) {
        throw new Error(`Missing required environment variable in .env: ${name}`);
    }
    const value = envFile[name]?.trim() ?? '';
    if (!value && !options?.allowEmpty) {
        throw new Error(`Environment variable in .env cannot be empty: ${name}`);
    }
    return value;
};
const readOptionalEnv = (name) => readEnv(name, { allowEmpty: true });
const readNumberEnv = (name) => {
    const raw = readEnv(name);
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
        throw new Error(`Invalid number for environment variable: ${name}`);
    }
    return parsed;
};
const readBooleanEnv = (name) => {
    const raw = readEnv(name).toLowerCase();
    if (raw === 'true')
        return true;
    if (raw === 'false')
        return false;
    throw new Error(`Invalid boolean for environment variable: ${name}`);
};
const readCsvEnv = (name) => {
    const values = readEnv(name)
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);
    if (!values.length) {
        throw new Error(`Environment variable in .env must contain at least one value: ${name}`);
    }
    return values;
};
const readMongoUri = () => {
    const uri = readEnv('MONGO_URI');
    try {
        const parsed = new URL(uri);
        if (!parsed.pathname || parsed.pathname === '/') {
            throw new Error();
        }
    }
    catch {
        throw new Error('MONGO_URI must be a valid MongoDB URI with a database name, e.g. mongodb://host:27017/hrms?authSource=admin');
    }
    return uri;
};
const mongoUri = readMongoUri();
exports.config = {
    neutralDB: mongoUri,
    authDB: mongoUri,
    mainDB: mongoUri,
    incentivesDB: mongoUri,
    savingsDB: mongoUri,
    cbaUrl: readEnv('CBA_URL'),
    cbaApiKey: readEnv('CBA_API_KEY'),
    performanceKpiOpenDay: readNumberEnv('PERF_KPI_OPEN_DAY'),
    performanceKpiApiImportDay: readNumberEnv('PERF_KPI_API_IMPORT_DAY'),
    performanceKpiApiUrl: readOptionalEnv('PERF_KPI_API_URL'),
    performanceKpiApiToken: readOptionalEnv('PERF_KPI_API_TOKEN'),
    performanceKpiApiPeriodOffsetMonths: readNumberEnv('PERF_KPI_API_PERIOD_OFFSET_MONTHS'),
    port: readNumberEnv('PORT'),
    frontendUrl: readEnv('FRONTEND_URL'),
    corsOrigins: readCsvEnv('CORS_ORIGINS'),
    bodyLimit: readEnv('BODY_LIMIT'),
    swaggerEnabled: readBooleanEnv('SWAGGER_ENABLED'),
    jwtSecret: readEnv('JWT_SECRET'),
    mfaChallengeSecret: readEnv('MFA_CHALLENGE_SECRET'),
};
//# sourceMappingURL=config.js.map