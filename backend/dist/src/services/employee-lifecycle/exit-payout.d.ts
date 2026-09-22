export type ExitPayoutInput = {
    staffName?: string;
    staffId?: string;
    accountNumber?: string;
    baseNarration?: string;
    clearanceStatus?: string | null;
    clearanceCompletedAt?: Date | string | null;
    payrollRunDate?: Date | string | null;
    exitAccountNumber?: string | null;
};
export type ExitPayoutDecision = {
    accountNumber: string;
    narration: string;
    redirected: boolean;
    reason?: string;
};
export declare const clearedByPayrollRun: (input: ExitPayoutInput) => boolean;
export declare const resolveExitPayout: (input: ExitPayoutInput) => ExitPayoutDecision;
