import { Types } from 'mongoose';
type MutableUser = {
    _id?: unknown;
    set?: (path: string, value: unknown, options?: {
        strict?: boolean;
    }) => void;
    hasSubordinates?: boolean;
    directReportCount?: number;
};
declare const buildSupervisorFilter: (userId: Types.ObjectId) => {
    $or: ({
        supervisorId: Types.ObjectId;
        supervisor2Id?: undefined;
    } | {
        supervisor2Id: Types.ObjectId;
        supervisorId?: undefined;
    })[];
};
type SupervisorFilter = ReturnType<typeof buildSupervisorFilter>;
type StaffModelWithSupervisorCount = {
    countDocuments: (filter: SupervisorFilter) => PromiseLike<number> | number;
};
export declare const injectSupervisorMetadata: (staffModel: StaffModelWithSupervisorCount, user: MutableUser) => Promise<void>;
export {};
