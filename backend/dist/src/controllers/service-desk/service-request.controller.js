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
exports.ServiceRequestController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const service_request_service_1 = require("../../services/service-desk/service-request.service");
let ServiceRequestController = class ServiceRequestController {
    constructor(serviceRequestService) {
        this.serviceRequestService = serviceRequestService;
    }
    async create(req, body) {
        return this.serviceRequestService.createRequest(body, String(req.user._id));
    }
    async list(req, role, status, page, limit, supervisorScope, department) {
        return this.serviceRequestService.listRequests(String(req.user._id), {
            role,
            status: status,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            supervisorScope,
            department,
        });
    }
    async adminList(status, startDate, endDate, requesterId, resolverId, serviceArea, page, limit) {
        return this.serviceRequestService.adminListRequests({
            status: status,
            startDate,
            endDate,
            requesterId,
            resolverId,
            serviceArea,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });
    }
    async get(id, req) {
        return this.serviceRequestService.getRequest(id, String(req.user._id));
    }
    async comment(id, req, body) {
        return this.serviceRequestService.addComment(id, String(req.user._id), body);
    }
    async accept(id, req, body) {
        return this.serviceRequestService.acceptRequest(id, String(req.user._id), body);
    }
    async reject(id, req, body) {
        return this.serviceRequestService.rejectRequest(id, String(req.user._id), body);
    }
    async resolve(id, req, body) {
        return this.serviceRequestService.resolveRequest(id, String(req.user._id), body);
    }
    async rate(id, req, body) {
        return this.serviceRequestService.rateRequest(id, String(req.user._id), body);
    }
    async assign(id, req, body) {
        return this.serviceRequestService.assignRequest(id, String(req.user._id), body);
    }
};
exports.ServiceRequestController = ServiceRequestController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ServiceRequestController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('role')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('supervisorScope')),
    __param(6, (0, common_1.Query)('department')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ServiceRequestController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('admin'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('requesterId')),
    __param(4, (0, common_1.Query)('resolverId')),
    __param(5, (0, common_1.Query)('serviceArea')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ServiceRequestController.prototype, "adminList", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ServiceRequestController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ServiceRequestController.prototype, "comment", null);
__decorate([
    (0, common_1.Post)(':id/accept'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ServiceRequestController.prototype, "accept", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ServiceRequestController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)(':id/resolve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ServiceRequestController.prototype, "resolve", null);
__decorate([
    (0, common_1.Post)(':id/rate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ServiceRequestController.prototype, "rate", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ServiceRequestController.prototype, "assign", null);
exports.ServiceRequestController = ServiceRequestController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('service-requests'),
    __metadata("design:paramtypes", [service_request_service_1.ServiceRequestService])
], ServiceRequestController);
//# sourceMappingURL=service-request.controller.js.map