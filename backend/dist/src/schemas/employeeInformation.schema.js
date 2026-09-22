"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeInformationSchema = exports.EmployeeDocumentSchema = exports.EducationRecordSchema = exports.EmploymentRecordSchema = exports.AccountDetailSchema = exports.SocialLinksSchema = exports.AddressInfoSchema = exports.RelationshipContactSchema = exports.EmployeeInformation = exports.EmployeeDocument = exports.EducationRecord = exports.EmploymentRecord = exports.AccountDetail = exports.SocialLinks = exports.AddressInfo = exports.RelationshipContact = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let RelationshipContact = class RelationshipContact {
};
exports.RelationshipContact = RelationshipContact;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], RelationshipContact.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], RelationshipContact.prototype, "firstName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], RelationshipContact.prototype, "lastName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], RelationshipContact.prototype, "phoneNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], RelationshipContact.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], RelationshipContact.prototype, "relationship", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], RelationshipContact.prototype, "address", void 0);
exports.RelationshipContact = RelationshipContact = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], RelationshipContact);
let AddressInfo = class AddressInfo {
};
exports.AddressInfo = AddressInfo;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AddressInfo.prototype, "residentialAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AddressInfo.prototype, "nearestBusStop", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AddressInfo.prototype, "nearestLandMark", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AddressInfo.prototype, "city", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AddressInfo.prototype, "state", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AddressInfo.prototype, "country", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AddressInfo.prototype, "lga", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AddressInfo.prototype, "proofOfAddress", void 0);
exports.AddressInfo = AddressInfo = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], AddressInfo);
let SocialLinks = class SocialLinks {
};
exports.SocialLinks = SocialLinks;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SocialLinks.prototype, "facebook", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SocialLinks.prototype, "twitter", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SocialLinks.prototype, "linkedin", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], SocialLinks.prototype, "instagram", void 0);
exports.SocialLinks = SocialLinks = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], SocialLinks);
let AccountDetail = class AccountDetail {
};
exports.AccountDetail = AccountDetail;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AccountDetail.prototype, "bankName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AccountDetail.prototype, "accountName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AccountDetail.prototype, "accountNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AccountDetail.prototype, "bvn", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AccountDetail.prototype, "taxProfileId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AccountDetail.prototype, "nhf", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AccountDetail.prototype, "pensionAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AccountDetail.prototype, "pensionProvider", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AccountDetail.prototype, "payeAccount", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AccountDetail.prototype, "swiftCode", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AccountDetail.prototype, "sortCode", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AccountDetail.prototype, "pfa", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], AccountDetail.prototype, "rsaNumber", void 0);
exports.AccountDetail = AccountDetail = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], AccountDetail);
let EmploymentRecord = class EmploymentRecord {
};
exports.EmploymentRecord = EmploymentRecord;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmploymentRecord.prototype, "company", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmploymentRecord.prototype, "position", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmploymentRecord.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmploymentRecord.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmploymentRecord.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmploymentRecord.prototype, "reasonForLeaving", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], EmploymentRecord.prototype, "startDate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], EmploymentRecord.prototype, "endDate", void 0);
exports.EmploymentRecord = EmploymentRecord = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], EmploymentRecord);
let EducationRecord = class EducationRecord {
};
exports.EducationRecord = EducationRecord;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EducationRecord.prototype, "institution", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EducationRecord.prototype, "course", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EducationRecord.prototype, "degree", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EducationRecord.prototype, "grade", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], EducationRecord.prototype, "startDate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], EducationRecord.prototype, "endDate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EducationRecord.prototype, "document", void 0);
exports.EducationRecord = EducationRecord = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], EducationRecord);
let EmployeeDocument = class EmployeeDocument {
};
exports.EmployeeDocument = EmployeeDocument;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "documentId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "fileUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "fileType", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], EmployeeDocument.prototype, "fileSize", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], EmployeeDocument.prototype, "uploadedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "uploadedBy", void 0);
exports.EmployeeDocument = EmployeeDocument = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], EmployeeDocument);
let EmployeeInformation = class EmployeeInformation {
};
exports.EmployeeInformation = EmployeeInformation;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmployeeInformation.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmployeeInformation.prototype, "gender", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmployeeInformation.prototype, "maritalStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmployeeInformation.prototype, "placeOfBirth", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmployeeInformation.prototype, "mothersMaidenName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmployeeInformation.prototype, "spouseName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmployeeInformation.prototype, "spousePhoneNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], EmployeeInformation.prototype, "numberOfChildren", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmployeeInformation.prototype, "religion", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmployeeInformation.prototype, "ethnicGroup", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmployeeInformation.prototype, "bloodGroup", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmployeeInformation.prototype, "genotype", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmployeeInformation.prototype, "allergies", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmployeeInformation.prototype, "medicalHistory", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmployeeInformation.prototype, "photo", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmployeeInformation.prototype, "passportPhoto", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EmployeeInformation.prototype, "profileImage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: AddressInfo, default: {} }),
    __metadata("design:type", AddressInfo)
], EmployeeInformation.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: RelationshipContact, default: {} }),
    __metadata("design:type", RelationshipContact)
], EmployeeInformation.prototype, "nextOfKin", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [RelationshipContact], default: [] }),
    __metadata("design:type", Array)
], EmployeeInformation.prototype, "dependents", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [RelationshipContact], default: [] }),
    __metadata("design:type", Array)
], EmployeeInformation.prototype, "familyMembers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: SocialLinks, default: {} }),
    __metadata("design:type", SocialLinks)
], EmployeeInformation.prototype, "socialLinks", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], EmployeeInformation.prototype, "healthBenefits", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: AccountDetail, default: {} }),
    __metadata("design:type", AccountDetail)
], EmployeeInformation.prototype, "accountDetail", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [EmploymentRecord], default: [] }),
    __metadata("design:type", Array)
], EmployeeInformation.prototype, "employmentHistory", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [EducationRecord], default: [] }),
    __metadata("design:type", Array)
], EmployeeInformation.prototype, "educationHistory", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [EmployeeDocument], default: [] }),
    __metadata("design:type", Array)
], EmployeeInformation.prototype, "documents", void 0);
exports.EmployeeInformation = EmployeeInformation = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], EmployeeInformation);
exports.RelationshipContactSchema = mongoose_1.SchemaFactory.createForClass(RelationshipContact);
exports.AddressInfoSchema = mongoose_1.SchemaFactory.createForClass(AddressInfo);
exports.SocialLinksSchema = mongoose_1.SchemaFactory.createForClass(SocialLinks);
exports.AccountDetailSchema = mongoose_1.SchemaFactory.createForClass(AccountDetail);
exports.EmploymentRecordSchema = mongoose_1.SchemaFactory.createForClass(EmploymentRecord);
exports.EducationRecordSchema = mongoose_1.SchemaFactory.createForClass(EducationRecord);
exports.EmployeeDocumentSchema = mongoose_1.SchemaFactory.createForClass(EmployeeDocument);
exports.EmployeeInformationSchema = mongoose_1.SchemaFactory.createForClass(EmployeeInformation);
//# sourceMappingURL=employeeInformation.schema.js.map