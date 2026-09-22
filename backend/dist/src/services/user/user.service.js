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
exports.StaffService = void 0;
const common_1 = require("@nestjs/common");
const user_date_util_1 = require("../../utils/user/user-date.util");
const user_credential_service_1 = require("./user-credential.service");
const user_directory_service_1 = require("./user-directory.service");
const user_import_service_1 = require("./user-import.service");
const user_onboarding_service_1 = require("./user-onboarding.service");
const user_supervisor_service_1 = require("./user-supervisor.service");
let StaffService = class StaffService {
    constructor(userCredentialService, userDirectoryService, userImportService, userOnboardingService, userSupervisorService) {
        this.userCredentialService = userCredentialService;
        this.userDirectoryService = userDirectoryService;
        this.userImportService = userImportService;
        this.userOnboardingService = userOnboardingService;
        this.userSupervisorService = userSupervisorService;
    }
    async getStaffByRoleKeywords(keywords, entity) {
        return this.userDirectoryService.getStaffByRoleKeywords(keywords, entity);
    }
    async createOrUpdateStaff(createStaffDto) {
        return this.userOnboardingService.createOrUpdateStaff(createStaffDto);
    }
    async createStaff(createStaffDto) {
        return this.userOnboardingService.createStaff(createStaffDto);
    }
    async updateUploadedStaff(createStaffDto, options) {
        return this.userOnboardingService.updateUploadedStaff(createStaffDto, options);
    }
    async resetPassword(userId, preferredPassword, actingUserId) {
        return this.userCredentialService.resetPassword(userId, preferredPassword, actingUserId);
    }
    async updateStaff(createStaffDto) {
        return this.userOnboardingService.updateStaff(createStaffDto);
    }
    async resetRent(staffId) {
        return this.userOnboardingService.resetRent(staffId);
    }
    async updateSupervisor(data) {
        return this.userSupervisorService.updateSupervisor(data);
    }
    async uploadSupervisor(source, fileName) {
        return this.userImportService.uploadSupervisors(source, fileName, {
            updateSupervisor: this.updateSupervisor.bind(this),
        });
    }
    async getWorkflowSummary(type, entity, supervisorId) {
        return this.userOnboardingService.getWorkflowSummary(type, entity, supervisorId);
    }
    async approveUser(userId, approverId, type, action = 'approve', payload) {
        return this.userOnboardingService.approveUser(userId, approverId, type, action, payload);
    }
    async uploadXlsx(source, fileName, user) {
        return this.userImportService.uploadStaff(source, fileName, {
            user,
            updateUploadedStaff: this.updateUploadedStaff.bind(this),
        });
    }
    async getBySupervisor(short, options) {
        return this.userDirectoryService.getBySupervisor(short, options);
    }
    async getStaffList(short, options) {
        return this.userDirectoryService.getStaffList(short, options);
    }
    async findFirstActiveByRoleNames(roleNames, entity) {
        return this.userDirectoryService.findFirstActiveByRoleNames(roleNames, entity);
    }
    async findFirstActiveByProfileKey(profileKey, entity) {
        return this.userDirectoryService.findFirstActiveByProfileKey(profileKey, entity);
    }
    async findFirstActiveByPermission(permissionName, entity) {
        return this.userDirectoryService.findFirstActiveByPermission(permissionName, entity);
    }
    async getStaffList2(subsidiaryId, supervisorScope) {
        return this.userDirectoryService.getStaffList2(subsidiaryId, supervisorScope);
    }
    async exportUser(params) {
        return this.userDirectoryService.exportUser(params);
    }
    async getRecentlyJoined(subsidiaryId, startDate, endDate, supervisorScope) {
        return this.userDirectoryService.getRecentlyJoined(subsidiaryId, startDate, endDate, supervisorScope);
    }
    async getRecentlyExit(subsidiaryId, startDate, endDate, supervisorScope) {
        return this.userDirectoryService.getRecentlyExit(subsidiaryId, startDate, endDate, supervisorScope);
    }
    async getStaffTurnover(subsidiaryId, startDate, endDate) {
        return this.userDirectoryService.getStaffTurnover(subsidiaryId, startDate, endDate);
    }
    async getPaginatedStaff(quer, user) {
        return this.userDirectoryService.getPaginatedStaff(quer, user);
    }
    async getStaffById(staffId) {
        return this.userDirectoryService.getStaffById(staffId);
    }
    async resolveStaffDirectory(staffIds, entity, options) {
        return this.userDirectoryService.resolveStaffDirectory(staffIds, entity, options);
    }
    async getById(id) {
        return this.userDirectoryService.getById(id);
    }
    async getAttendanceIdentity(id) {
        return this.userDirectoryService.getAttendanceIdentity(id);
    }
    async deactivateExitedStaff() {
        return this.userDirectoryService.deactivateExitedStaff();
    }
    async getStaffByLevel(payGrade, subsidiaryId) {
        return this.userDirectoryService.getStaffByLevel(payGrade, subsidiaryId);
    }
    async getStaffByBranch(branch) {
        return this.userDirectoryService.getStaffByBranch(branch);
    }
    async convertDate(input) {
        return (0, user_date_util_1.parseStaffImportDate)(input);
    }
    async getBirthdaysToday() {
        return this.userDirectoryService.getBirthdaysToday();
    }
    async getBirthdaysThisMonth() {
        return this.userDirectoryService.getBirthdaysThisMonth();
    }
    async getWorkAnniversaryToday() {
        return this.userDirectoryService.getWorkAnniversaryToday();
    }
    async getWorkAnniversaryThisMonth() {
        return this.userDirectoryService.getWorkAnniversaryThisMonth();
    }
};
exports.StaffService = StaffService;
exports.StaffService = StaffService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_credential_service_1.UserCredentialService,
        user_directory_service_1.UserDirectoryService,
        user_import_service_1.UserImportService,
        user_onboarding_service_1.UserOnboardingService,
        user_supervisor_service_1.UserSupervisorService])
], StaffService);
//# sourceMappingURL=user.service.js.map