export declare class RelationshipContact {
    title?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
    relationship?: string;
    address?: string;
}
export declare class AddressInfo {
    residentialAddress?: string;
    nearestBusStop?: string;
    nearestLandMark?: string;
    city?: string;
    state?: string;
    country?: string;
    lga?: string;
    proofOfAddress?: string;
}
export declare class SocialLinks {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
}
export declare class AccountDetail {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    bvn?: string;
    taxProfileId?: string;
    nhf?: string;
    pensionAccount?: string;
    pensionProvider?: string;
    payeAccount?: string;
    swiftCode?: string;
    sortCode?: string;
    pfa?: string;
    rsaNumber?: string;
}
export declare class EmploymentRecord {
    company?: string;
    position?: string;
    address?: string;
    phone?: string;
    email?: string;
    reasonForLeaving?: string;
    startDate?: Date;
    endDate?: Date;
}
export declare class EducationRecord {
    institution?: string;
    course?: string;
    degree?: string;
    grade?: string;
    startDate?: Date;
    endDate?: Date;
    document?: string;
}
export declare class EmployeeDocument {
    documentId?: string;
    title?: string;
    category?: string;
    description?: string;
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
    uploadedAt?: Date;
    uploadedBy?: string;
}
export declare class EmployeeInformation {
    title?: string;
    gender?: string;
    maritalStatus?: string;
    placeOfBirth?: string;
    mothersMaidenName?: string;
    spouseName?: string;
    spousePhoneNumber?: string;
    numberOfChildren?: number;
    religion?: string;
    ethnicGroup?: string;
    bloodGroup?: string;
    genotype?: string;
    allergies?: string;
    medicalHistory?: string;
    photo?: string;
    passportPhoto?: string;
    profileImage?: string;
    address?: AddressInfo;
    nextOfKin?: RelationshipContact;
    dependents?: RelationshipContact[];
    familyMembers?: RelationshipContact[];
    socialLinks?: SocialLinks;
    healthBenefits?: boolean;
    accountDetail?: AccountDetail;
    employmentHistory?: EmploymentRecord[];
    educationHistory?: EducationRecord[];
    documents?: EmployeeDocument[];
}
export declare const RelationshipContactSchema: import("mongoose").Schema<RelationshipContact, import("mongoose").Model<RelationshipContact, any, any, any, import("mongoose").Document<unknown, any, RelationshipContact, any, {}> & RelationshipContact & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, RelationshipContact, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<RelationshipContact>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<RelationshipContact> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare const AddressInfoSchema: import("mongoose").Schema<AddressInfo, import("mongoose").Model<AddressInfo, any, any, any, import("mongoose").Document<unknown, any, AddressInfo, any, {}> & AddressInfo & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AddressInfo, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<AddressInfo>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<AddressInfo> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare const SocialLinksSchema: import("mongoose").Schema<SocialLinks, import("mongoose").Model<SocialLinks, any, any, any, import("mongoose").Document<unknown, any, SocialLinks, any, {}> & SocialLinks & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SocialLinks, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<SocialLinks>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<SocialLinks> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare const AccountDetailSchema: import("mongoose").Schema<AccountDetail, import("mongoose").Model<AccountDetail, any, any, any, import("mongoose").Document<unknown, any, AccountDetail, any, {}> & AccountDetail & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AccountDetail, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<AccountDetail>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<AccountDetail> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare const EmploymentRecordSchema: import("mongoose").Schema<EmploymentRecord, import("mongoose").Model<EmploymentRecord, any, any, any, import("mongoose").Document<unknown, any, EmploymentRecord, any, {}> & EmploymentRecord & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EmploymentRecord, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<EmploymentRecord>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<EmploymentRecord> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare const EducationRecordSchema: import("mongoose").Schema<EducationRecord, import("mongoose").Model<EducationRecord, any, any, any, import("mongoose").Document<unknown, any, EducationRecord, any, {}> & EducationRecord & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EducationRecord, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<EducationRecord>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<EducationRecord> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare const EmployeeDocumentSchema: import("mongoose").Schema<EmployeeDocument, import("mongoose").Model<EmployeeDocument, any, any, any, import("mongoose").Document<unknown, any, EmployeeDocument, any, {}> & EmployeeDocument & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EmployeeDocument, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<EmployeeDocument>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<EmployeeDocument> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare const EmployeeInformationSchema: import("mongoose").Schema<EmployeeInformation, import("mongoose").Model<EmployeeInformation, any, any, any, import("mongoose").Document<unknown, any, EmployeeInformation, any, {}> & EmployeeInformation & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EmployeeInformation, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<EmployeeInformation>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<EmployeeInformation> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
