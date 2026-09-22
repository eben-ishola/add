"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateRangeForMonth = exports.parseYearMonth = exports.buildNoticePayload = exports.resolvePortalBaseUrl = exports.normalizeStage = exports.normalizeStatus = exports.normalizeToken = exports.normalizeText = void 0;
const normalizeText = (value) => String(value ?? "").trim().replace(/\s+/g, " ");
exports.normalizeText = normalizeText;
const normalizeToken = (value) => (0, exports.normalizeText)(value).toLowerCase();
exports.normalizeToken = normalizeToken;
const normalizeStatus = (value) => (0, exports.normalizeToken)(value).replace(/[\s_]+/g, "-");
exports.normalizeStatus = normalizeStatus;
const normalizeStage = (value) => (0, exports.normalizeStatus)(value);
exports.normalizeStage = normalizeStage;
const resolvePortalBaseUrl = (value = process.env.FRONTEND_URL ?? process.env.CLIENT_URL) => {
    const normalized = (0, exports.normalizeText)(value);
    return (normalized || "http://localhost:8080").replace(/\/+$/, "");
};
exports.resolvePortalBaseUrl = resolvePortalBaseUrl;
const buildNoticePayload = (user, message, extra = {}) => ({
    user,
    message: (0, exports.normalizeText)(message),
    read: false,
    createdAt: new Date(),
    ...extra,
});
exports.buildNoticePayload = buildNoticePayload;
const parseYearMonth = (value, now = new Date()) => {
    const raw = (0, exports.normalizeText)(value);
    const match = raw.match(/^(\d{4})[-/](\d{1,2})$/);
    const parsed = match
        ? new Date(Number(match[1]), Number(match[2]) - 1, 1)
        : raw
            ? new Date(raw)
            : new Date(now.getFullYear(), now.getMonth(), 1);
    const date = Number.isNaN(parsed.getTime())
        ? new Date(now.getFullYear(), now.getMonth(), 1)
        : parsed;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    return {
        year,
        month,
        start,
        end,
        key: `${year}-${String(month).padStart(2, "0")}`,
    };
};
exports.parseYearMonth = parseYearMonth;
const dateRangeForMonth = (value, now = new Date()) => {
    const { start, end, key } = (0, exports.parseYearMonth)(value, now);
    return { start, end, key };
};
exports.dateRangeForMonth = dateRangeForMonth;
//# sourceMappingURL=domain-normalizers.util.js.map