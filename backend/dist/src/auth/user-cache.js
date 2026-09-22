"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearUserCache = exports.invalidateUserCache = exports.dropUserCacheKey = exports.writeUserCache = exports.readUserCache = exports.buildUserCacheKey = void 0;
const USER_CACHE_TTL_MS = 60 * 1000;
const USER_CACHE_MAX = 500;
const USER_CACHE = new Map();
const buildUserCacheKey = (payload) => {
    const sub = typeof payload?.sub === 'string' ? payload.sub.trim() : '';
    if (sub)
        return sub;
    const email = typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : '';
    if (email)
        return email;
    const staffId = typeof payload?.staffId === 'string' ? payload.staffId.trim() : '';
    return staffId || '';
};
exports.buildUserCacheKey = buildUserCacheKey;
const readUserCache = (key) => {
    if (!key)
        return null;
    const cached = USER_CACHE.get(key);
    if (!cached)
        return null;
    if (cached.expiresAt <= Date.now()) {
        USER_CACHE.delete(key);
        return null;
    }
    return cached.user;
};
exports.readUserCache = readUserCache;
const pruneUserCache = () => {
    const now = Date.now();
    for (const [key, entry] of USER_CACHE.entries()) {
        if (entry.expiresAt <= now) {
            USER_CACHE.delete(key);
        }
    }
    if (USER_CACHE.size <= USER_CACHE_MAX)
        return;
    const overflow = USER_CACHE.size - USER_CACHE_MAX;
    const keys = USER_CACHE.keys();
    for (let index = 0; index < overflow; index += 1) {
        const next = keys.next();
        if (next.done)
            break;
        USER_CACHE.delete(next.value);
    }
};
const writeUserCache = (key, user) => {
    if (!key)
        return;
    USER_CACHE.set(key, { user, expiresAt: Date.now() + USER_CACHE_TTL_MS });
    pruneUserCache();
};
exports.writeUserCache = writeUserCache;
const dropUserCacheKey = (key) => {
    if (key)
        USER_CACHE.delete(key);
};
exports.dropUserCacheKey = dropUserCacheKey;
const invalidateUserCache = (userId) => {
    const id = String(userId ?? '').trim();
    if (!id)
        return;
    USER_CACHE.delete(id);
    for (const [key, entry] of USER_CACHE.entries()) {
        const cachedId = String(entry.user?.id ?? entry.user?._id ?? '');
        if (cachedId && cachedId === id) {
            USER_CACHE.delete(key);
        }
    }
};
exports.invalidateUserCache = invalidateUserCache;
const clearUserCache = () => {
    USER_CACHE.clear();
};
exports.clearUserCache = clearUserCache;
//# sourceMappingURL=user-cache.js.map