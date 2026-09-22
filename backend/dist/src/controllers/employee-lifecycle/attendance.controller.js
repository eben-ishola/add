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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const attendance_service_1 = require("../../services/employee-lifecycle/attendance.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const fs = require("fs");
const path = require("path");
const attendancePhotoStorage = (0, multer_1.diskStorage)({
    destination: (_req, _file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads', 'attendance');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = file?.originalname ? path.extname(file.originalname) : '';
        const safeExt = ext || '.jpg';
        cb(null, `attendance-${Date.now()}${safeExt}`);
    },
});
let AttendanceController = class AttendanceController {
    constructor(svc) {
        this.svc = svc;
    }
    async clockIn(body, file) {
        if (!file) {
            throw new common_1.BadRequestException('Clock-in photo is required.');
        }
        const fileUrl = `uploads/attendance/${file.filename}`;
        return this.svc.clockIn(body.employeeId, { ...body, clockInPhotoUrl: fileUrl });
    }
    async clockOut(body, file) {
        const fileUrl = file ? `uploads/attendance/${file.filename}` : undefined;
        return this.svc.clockOut(body.employeeId, { ...body, clockOutPhotoUrl: fileUrl }, body.mode);
    }
    async addNote(attendanceId, body) {
        return this.svc.updateNote(attendanceId, body.note);
    }
    async getConfig() {
        return this.svc.getAttendanceConfig();
    }
    async updateConfig(body) {
        return this.svc.updateAttendanceConfig(body ?? {});
    }
    async getMonthlyStats(employeeId) {
        return await this.svc.getMonthlyAttendanceStats(employeeId);
    }
    async getRecords(employeeId, month, year, page = 1, limit = 10, includeFullData) {
        const includeFull = includeFullData === 'true' ||
            includeFullData === '1' ||
            includeFullData === 'yes';
        return this.svc.getAttendance(employeeId, +month, +year, +page, +limit, {
            includeFullData: includeFull,
        });
    }
    async getAttendance(viewMode, date, search, role, entity, page = 1, limit = 10, status, mode, department, branch, supervisorId) {
        const isHrUser = role === 'hr';
        const supervisorRef = role === 'supervisor' && supervisorId ? supervisorId : undefined;
        const params = {
            viewMode,
            date,
            page: +page,
            limit: +limit,
            isHR: isHrUser,
            entity,
            supervisorId: supervisorRef,
            search,
            status,
            mode,
            department,
            branch,
        };
        return this.svc.getAttendanceAdmin(params);
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('clock-in'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('clockInPhoto', {
        storage: attendancePhotoStorage,
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "clockIn", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('clock-out'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('clockOutPhoto', {
        storage: attendancePhotoStorage,
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "clockOut", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id/note'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "addNote", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getConfig", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('config'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('stats/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getMonthlyStats", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('clock'),
    __param(0, (0, common_1.Query)('employeeId')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('year')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('includeFullData')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Object, Object, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getRecords", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('admin'),
    __param(0, (0, common_1.Query)('viewMode')),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('role')),
    __param(4, (0, common_1.Query)('entity')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __param(7, (0, common_1.Query)('status')),
    __param(8, (0, common_1.Query)('mode')),
    __param(9, (0, common_1.Query)('department')),
    __param(10, (0, common_1.Query)('branch')),
    __param(11, (0, common_1.Query)('supervisorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object, Object, Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getAttendance", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, common_1.Controller)('attendance'),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map