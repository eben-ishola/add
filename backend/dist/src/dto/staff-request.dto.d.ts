declare class StaffRequestBaseDto {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    email?: string;
    staffId?: string;
    staffID?: string;
    phoneNumber?: string;
    status?: string;
    confirmed?: string;
    orbitID?: string;
    orbitId?: string;
    transportLevel?: string;
    inconvenienceLevel?: string;
    addosserAccount?: string;
    atlasAccount?: string;
    aftaAccount?: string;
    application?: string;
    photo?: string;
    id?: unknown;
    branch?: unknown;
    additionalBranch?: unknown;
    allowMultiBranch?: unknown;
    department?: unknown;
    businessUnit?: unknown;
    entity?: unknown;
    entityId?: unknown;
    subsidiary?: unknown;
    subsidiaryId?: unknown;
    entityViewer?: unknown;
    level?: unknown;
    role?: unknown;
    additionalRoles?: unknown;
    assignedApps?: unknown;
    supervisor?: unknown;
    supervisorId?: unknown;
    supervisor2Id?: unknown;
    startDate?: unknown;
    exitDate?: unknown;
    confirmDate?: unknown;
    dateOfBirth?: unknown;
    additionalAfta?: unknown;
    addToGross?: unknown;
    employeeInformation?: Record<string, unknown>;
    rent?: unknown;
    rentStartDate?: unknown;
    rentEndDate?: unknown;
    rentStart?: unknown;
    rentEnd?: unknown;
    rentReceipt?: unknown;
    rentSupporting?: unknown;
}
export declare class CreateStaffDto extends StaffRequestBaseDto {
    email?: string;
    staffId?: string;
}
export declare class UpdateStaffDto extends StaffRequestBaseDto {
}
export {};
