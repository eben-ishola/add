import { Types } from 'mongoose';
export type NormalizedAdditionalRole = {
    role: Types.ObjectId;
    entity: Types.ObjectId | null;
};
export declare const normalizeAdditionalRoleAssignments: (input: any) => {
    assignments: NormalizedAdditionalRole[];
    mutated: boolean;
};
