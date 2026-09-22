export type PerformanceReviewStage = 'employee' | 'supervisor' | 'supervisor2' | 'hr' | 'completed';
export type PerformanceReviewStatus = 'pending' | 'pending employee review' | 'in progress' | 'completed' | 'scheduled';
export declare const normalizePerformanceReviewStage: (value: unknown) => PerformanceReviewStage | null;
export declare const normalizePerformanceReviewStatus: (value: unknown) => PerformanceReviewStatus | null;
export declare const getPerformanceReviewStageLabel: (stage: PerformanceReviewStage | null) => string;
export declare const getPerformanceReviewStageReviewLabel: (stage: PerformanceReviewStage | null) => string;
export declare const resolveReviewerForStage: (review: {
    reviewStage?: unknown;
    reviewerId?: unknown;
    reviewerName?: unknown;
    reviewer2Id?: unknown;
    reviewer2Name?: unknown;
    hrReviewerIds?: unknown;
}) => {
    stage: "supervisor2";
    id: string;
    name: string;
    label: string;
} | {
    stage: "hr";
    id: string;
    label: string;
    name?: undefined;
} | {
    stage: "supervisor" | "employee" | "completed";
    id: string;
    name: string;
    label: string;
};
export declare const isLateHireForCycle: (employeeStart: unknown, cycleStart: unknown) => boolean;
