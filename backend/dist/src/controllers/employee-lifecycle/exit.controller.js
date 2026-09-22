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
exports.ExitController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const exit_interview_schema_1 = require("../../schemas/exit-interview.schema");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const user_decorator_1 = require("../../auth/decorators/user.decorator");
const exit_service_1 = require("../../services/employee-lifecycle/exit.service");
const access_control_util_1 = require("../../utils/shared/access-control.util");
const HR_PERMISSIONS = ['manage exit clearance', 'view exit clearance'];
const handoverUploadOptions = {
    storage: (0, multer_1.diskStorage)({
        destination: 'uploads/exit',
        filename: (_req, file, cb) => {
            const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            cb(null, `handover-${unique}${(0, path_1.extname)(file.originalname)}`);
        },
    }),
    limits: { fileSize: 15 * 1024 * 1024 },
};
let ExitController = class ExitController {
    constructor(exitService) {
        this.exitService = exitService;
    }
    actor(user) {
        const name = [user?.lastName, user?.firstName, user?.middleName]
            .map((part) => String(part ?? '').trim())
            .filter(Boolean)
            .join(' ')
            .trim();
        return {
            id: String(user?._id ?? user?.id ?? ''),
            name: name || String(user?.email ?? 'Unnamed staff'),
            isHr: (0, access_control_util_1.userIsSuperAdmin)(user) || (0, access_control_util_1.userHasPermission)(user, HR_PERMISSIONS),
            isSuperAdmin: (0, access_control_util_1.userIsSuperAdmin)(user),
        };
    }
    access(user) {
        return this.exitService.resolveAccess(user, this.actor(user));
    }
    listMine(user) {
        return this.exitService.listMine(this.actor(user));
    }
    list(user, status, search) {
        return this.exitService.list({ status, search }, this.actor(user));
    }
    getOne(id, user) {
        return this.exitService.getOne(id, this.actor(user));
    }
    getWorkflowConfig(user, entity) {
        return this.exitService.getWorkflowConfig(entity, this.actor(user));
    }
    saveWorkflowConfig(body, user) {
        return this.exitService.saveWorkflowConfig(body, this.actor(user));
    }
    attachHandover(id, files, user) {
        return this.exitService.attachHandover(id, files ?? [], this.actor(user));
    }
    interviewQuestions() {
        return { data: exit_interview_schema_1.EXIT_INTERVIEW_QUESTIONS };
    }
    getMyInterview(user) {
        return this.exitService.getMyInterview(this.actor(user));
    }
    saveMyInterview(body, user) {
        return this.exitService.saveMyInterview(body, this.actor(user));
    }
    getInterviewFor(id, user) {
        return this.exitService.getInterviewFor(id, this.actor(user));
    }
    getMyClearance(user) {
        return this.exitService.getMyClearance(this.actor(user));
    }
    getClearance(id, user) {
        return this.exitService.getClearance(id, user, this.actor(user));
    }
    saveSection(id, key, body, user) {
        return this.exitService.saveSection(id, key, body, user, this.actor(user));
    }
    setItemStatus(id, key, body, user) {
        return this.exitService.setItemStatus(id, key, body, user, this.actor(user));
    }
    completeClearance(id, user) {
        return this.exitService.completeClearance(id, this.actor(user));
    }
    listClearances(user) {
        return this.exitService.listClearances(this.actor(user), user);
    }
};
exports.ExitController = ExitController;
__decorate([
    (0, common_1.Get)('access'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExitController.prototype, "access", null);
__decorate([
    (0, common_1.Get)('requests/mine'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExitController.prototype, "listMine", null);
__decorate([
    (0, common_1.Get)('requests'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ExitController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('requests/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ExitController.prototype, "getOne", null);
__decorate([
    (0, common_1.Get)('workflow-config'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('entity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ExitController.prototype, "getWorkflowConfig", null);
__decorate([
    (0, common_1.Post)('workflow-config'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ExitController.prototype, "saveWorkflowConfig", null);
__decorate([
    (0, common_1.Post)('requests/:id/handover'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, handoverUploadOptions)),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", void 0)
], ExitController.prototype, "attachHandover", null);
__decorate([
    (0, common_1.Get)('interview/questions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExitController.prototype, "interviewQuestions", null);
__decorate([
    (0, common_1.Get)('interview/mine'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExitController.prototype, "getMyInterview", null);
__decorate([
    (0, common_1.Post)('interview/mine'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ExitController.prototype, "saveMyInterview", null);
__decorate([
    (0, common_1.Get)('requests/:id/interview'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ExitController.prototype, "getInterviewFor", null);
__decorate([
    (0, common_1.Get)('clearances/mine'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExitController.prototype, "getMyClearance", null);
__decorate([
    (0, common_1.Get)('clearances/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ExitController.prototype, "getClearance", null);
__decorate([
    (0, common_1.Post)('clearances/:id/sections/:key'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('key')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], ExitController.prototype, "saveSection", null);
__decorate([
    (0, common_1.Post)('clearances/:id/items/:key'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('key')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], ExitController.prototype, "setItemStatus", null);
__decorate([
    (0, common_1.Post)('clearances/:id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ExitController.prototype, "completeClearance", null);
__decorate([
    (0, common_1.Get)('clearances'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExitController.prototype, "listClearances", null);
exports.ExitController = ExitController = __decorate([
    (0, common_1.Controller)('exit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [exit_service_1.ExitService])
], ExitController);
//# sourceMappingURL=exit.controller.js.map