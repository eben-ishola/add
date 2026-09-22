"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeAchievement = void 0;
const parseKpiNumber = (value) => {
    if (typeof value === 'number' && Number.isFinite(value))
        return value;
    if (typeof value === 'string') {
        const cleaned = value.replace(/[, ]/g, '').trim();
        if (!cleaned)
            return null;
        const parsed = Number(cleaned);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};
const computeAchievement = (actualValue, targetValue, scoreDirection, scoringMethod) => {
    const actual = parseKpiNumber(actualValue);
    const target = parseKpiNumber(targetValue);
    if (actual === null || target === null || target === 0)
        return null;
    const direction = String(scoreDirection ?? 'higher').trim().toLowerCase();
    const method = String(scoringMethod ?? 'ratio').trim().toLowerCase();
    let ratio = 0;
    if (method === 'binary') {
        ratio = direction === 'lower' ? (actual <= target ? 1 : 0) : (actual >= target ? 1 : 0);
    }
    else if (direction === 'lower') {
        ratio = actual === 0 ? 0 : target / actual;
    }
    else {
        ratio = actual / target;
    }
    return Math.max(0, Math.min(1, ratio));
};
exports.computeAchievement = computeAchievement;
//# sourceMappingURL=kpi-scoring.js.map