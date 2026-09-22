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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobController = void 0;
const common_1 = require("@nestjs/common");
const job_service_1 = require("../../services/jobs/job.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const user_decorator_1 = require("../../auth/decorators/user.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
let JobController = class JobController {
    constructor(jobService) {
        this.jobService = jobService;
    }
    createJob(data) {
        return this.jobService.createJob(data);
    }
    listVacancies(location, status, search, page = '1', limit = '10', entity) {
        return this.jobService.listVacancies({ location, status, search, entity }, parseInt(page), parseInt(limit));
    }
    async apply(resume, data) {
        const payload = {
            ...data,
            resumeUrl: resume?.path,
        };
        return this.jobService.applyToJob(payload);
    }
    listApplications(status, search, entity, page = '1', limit = '10') {
        return this.jobService.listApplications({ status, search, entity }, parseInt(page), parseInt(limit));
    }
    updateApplicationStatus(id, payload, user) {
        const { date, status, note } = payload;
        return this.jobService.updateApplicationStatus(id, status, date, note, user);
    }
    updateJob(id, data) {
        return this.jobService.updateJob(id, data);
    }
    getJob(id) {
        return this.jobService.getJob(id);
    }
    deleteJob(id) {
        return this.jobService.deleteJob(id);
    }
    getApplication(id) {
        return this.jobService.getApplication(id);
    }
};
exports.JobController = JobController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('vacancies'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], JobController.prototype, "createJob", null);
__decorate([
    (0, common_1.Get)('vacancies'),
    __param(0, (0, common_1.Query)('location')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, Object, String]),
    __metadata("design:returntype", void 0)
], JobController.prototype, "listVacancies", null);
__decorate([
    (0, common_1.Post)('apply'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('resume', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/resumes',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `${file.fieldname}-${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], JobController.prototype, "apply", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('applications'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('entity')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], JobController.prototype, "listApplications", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('applications/status/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], JobController.prototype, "updateApplicationStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('vacancies/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JobController.prototype, "updateJob", null);
__decorate([
    (0, common_1.Get)('vacancies/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JobController.prototype, "getJob", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('vacancies/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JobController.prototype, "deleteJob", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('applications/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JobController.prototype, "getApplication", null);
exports.JobController = JobController = __decorate([
    (0, common_1.Controller)('jobs'),
    __metadata("design:paramtypes", [job_service_1.JobService])
], JobController);
//# sourceMappingURL=job.controller.js.map