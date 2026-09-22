"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MFA_TRUST_TTL_DAYS = void 0;
exports.issueMfaTrustToken = issueMfaTrustToken;
exports.verifyMfaTrustToken = verifyMfaTrustToken;
const crypto_1 = require("crypto");
exports.MFA_TRUST_TTL_DAYS = 2;
const TTL_SECONDS = exports.MFA_TRUST_TTL_DAYS * 24 * 60 * 60;
const PURPOSE = 'mfa_trust';
function trustSecret(baseSecret) {
    return (process.env.MFA_TRUST_SECRET?.trim() ||
        (0, crypto_1.createHmac)('sha256', baseSecret).update('mfa-trust-v1').digest('hex'));
}
function fingerprint(totpSecret) {
    return (0, crypto_1.createHash)('sha256').update(totpSecret).digest('hex').slice(0, 16);
}
function sign(secret, body) {
    return (0, crypto_1.createHmac)('sha256', secret).update(body).digest('base64url');
}
function safeEqual(a, b) {
    return (0, crypto_1.timingSafeEqual)((0, crypto_1.createHash)('sha256').update(a ?? '').digest(), (0, crypto_1.createHash)('sha256').update(b ?? '').digest());
}
function issueMfaTrustToken(baseSecret, userId, totpSecret) {
    if (!totpSecret)
        return null;
    const payload = {
        sub: String(userId),
        purpose: PURPOSE,
        fp: fingerprint(totpSecret),
        exp: Math.floor(Date.now() / 1000) + TTL_SECONDS,
    };
    const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
    return `${body}.${sign(trustSecret(baseSecret), body)}`;
}
function verifyMfaTrustToken(baseSecret, token, userId, totpSecret) {
    if (!token || !totpSecret)
        return false;
    const [body, signature] = String(token).split('.');
    if (!body || !signature)
        return false;
    if (!safeEqual(sign(trustSecret(baseSecret), body), signature))
        return false;
    let payload;
    try {
        payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    }
    catch {
        return false;
    }
    return (payload?.purpose === PURPOSE &&
        String(payload?.sub) === String(userId) &&
        payload?.fp === fingerprint(totpSecret) &&
        Number(payload?.exp) > Math.floor(Date.now() / 1000));
}
//# sourceMappingURL=mfa-trust.js.map