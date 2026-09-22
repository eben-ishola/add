"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLateHireForCycle = exports.resolveReviewerForStage = exports.getPerformanceReviewStageReviewLabel = exports.getPerformanceReviewStageLabel = exports.normalizePerformanceReviewStatus = exports.normalizePerformanceReviewStage = void 0;
const STAGE_LABELS = {
    employee: 'Employee',
    supervisor: 'Supervisor',
    supervisor2: 'Second supervisor',
    hr: 'HR',
    completed: 'Completed',
};
const STAGE_REVIEW_LABELS = {
    employee: 'Employee review',
    supervisor: 'Supervisor review',
    supervisor2: 'Second-level review',
    hr: 'HR review',
    completed: 'Completed',
};
const normalizePerformanceReviewStage = (value) => {
    const normalized = String(value ?? '').trim().toLowerCase();
    if (normalized === 'employee' ||
        normalized === 'supervisor' ||
        normalized === 'supervisor2' ||
        normalized === 'hr' ||
        normalized === 'completed') {
        return normalized;
    }
    return null;
};
exports.normalizePerformanceReviewStage = normalizePerformanceReviewStage;
const normalizePerformanceReviewStatus = (value) => {
    const normalized = String(value ?? '').trim().toLowerCase();
    if (normalized === 'pending' ||
        normalized === 'pending employee review' ||
        normalized === 'in progress' ||
        normalized === 'completed' ||
        normalized === 'scheduled') {
        return normalized;
    }
    return null;
};
exports.normalizePerformanceReviewStatus = normalizePerformanceReviewStatus;
const getPerformanceReviewStageLabel = (stage) => (stage ? STAGE_LABELS[stage] : 'Supervisor');
exports.getPerformanceReviewStageLabel = getPerformanceReviewStageLabel;
const getPerformanceReviewStageReviewLabel = (stage) => (stage ? STAGE_REVIEW_LABELS[stage] : 'Next review');
exports.getPerformanceReviewStageReviewLabel = getPerformanceReviewStageReviewLabel;
const firstString = (value) => {
    if (Array.isArray(value)) {
        const first = value.find((item) => String(item ?? '').trim());
        return firstString(first);
    }
    const trimmed = String(value ?? '').trim();
    return trimmed || undefined;
};
const resolveReviewerForStage = (review) => {
    const stage = (0, exports.normalizePerformanceReviewStage)(review?.reviewStage);
    if (stage === 'supervisor2') {
        return {
            stage,
            id: firstString(review?.reviewer2Id),
            name: firstString(review?.reviewer2Name),
            label: STAGE_LABELS[stage],
        };
    }
    if (stage === 'hr') {
        return {
            stage,
            id: firstString(review?.hrReviewerIds),
            label: STAGE_LABELS[stage],
        };
    }
    return {
        stage: stage ?? 'supervisor',
        id: firstString(review?.reviewerId),
        name: firstString(review?.reviewerName),
        label: STAGE_LABELS.supervisor,
    };
};
exports.resolveReviewerForStage = resolveReviewerForStage;
const toValidDate = (value) => {
    if (!value)
        return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};
const isLateHireForCycle = (employeeStart, cycleStart) => {
    const employeeStartDate = toValidDate(employeeStart);
    const cycleStartDate = toValidDate(cycleStart);
    return Boolean(employeeStartDate && cycleStartDate && employeeStartDate > cycleStartDate);
};
exports.isLateHireForCycle = isLateHireForCycle;
//# sourceMappingURL=performance-review.util.js.map