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
exports.StaffRideController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const user_decorator_1 = require("../../auth/decorators/user.decorator");
const staff_ride_service_1 = require("../../services/staff-ride/staff-ride.service");
const access_control_util_1 = require("../../utils/shared/access-control.util");
const MANAGE_PERMISSIONS = ['manage staff ride'];
const VIEW_PERMISSIONS = ['view staff ride', 'manage staff ride'];
let StaffRideController = class StaffRideController {
    constructor(staffRideService) {
        this.staffRideService = staffRideService;
    }
    isManager(user) {
        return ((0, access_control_util_1.userIsSuperAdmin)(user) ||
            (0, access_control_util_1.userHasPermission)(user, MANAGE_PERMISSIONS) ||
            ((0, access_control_util_1.userHasPermission)(user, VIEW_PERMISSIONS) && (0, access_control_util_1.userHasScope)(user, ['group', 'entity'])));
    }
    assertCanManage(user) {
        if (!this.isManager(user)) {
            throw new common_1.ForbiddenException('You do not have permission to manage staff ride.');
        }
    }
    actor(user) {
        const id = String(user?._id ?? user?.id ?? '');
        const name = [user?.lastName, user?.firstName, user?.middleName]
            .map((part) => String(part ?? '').trim())
            .filter(Boolean)
            .join(' ')
            .trim();
        const departmentValue = typeof user?.department === 'object' && user?.department !== null
            ? user.department.name
            : user?.department;
        const entityValue = typeof user?.entity === 'object' && user?.entity !== null
            ? user.entity.name
            : '';
        return {
            id,
            name: name || String(user?.email ?? 'Unnamed staff'),
            staffId: String(user?.staffId ?? '').trim(),
            department: String(departmentValue ?? '').trim(),
            entityName: String(entityValue ?? '').trim(),
            isManager: this.isManager(user),
        };
    }
    access(user) {
        return { canManage: this.isManager(user) };
    }
    listLocations(user) {
        this.assertCanManage(user);
        return this.staffRideService.listLocations();
    }
    createLocation(body, user) {
        this.assertCanManage(user);
        return this.staffRideService.createLocation(body);
    }
    updateLocation(id, body, user) {
        this.assertCanManage(user);
        return this.staffRideService.updateLocation(id, body);
    }
    removeLocation(id, user) {
        this.assertCanManage(user);
        return this.staffRideService.removeLocation(id);
    }
    listVehicles(user) {
        this.assertCanManage(user);
        return this.staffRideService.listVehicles();
    }
    createVehicle(body, user) {
        this.assertCanManage(user);
        return this.staffRideService.createVehicle(body);
    }
    updateVehicle(id, body, user) {
        this.assertCanManage(user);
        return this.staffRideService.updateVehicle(id, body);
    }
    removeVehicle(id, user) {
        this.assertCanManage(user);
        return this.staffRideService.removeVehicle(id);
    }
    listRoutes(user) {
        this.assertCanManage(user);
        return this.staffRideService.listRoutes();
    }
    createRoute(body, user) {
        this.assertCanManage(user);
        return this.staffRideService.createRoute(body);
    }
    updateRoute(id, body, user) {
        this.assertCanManage(user);
        return this.staffRideService.updateRoute(id, body);
    }
    startBooking(id, body, user) {
        this.assertCanManage(user);
        return this.staffRideService.startBooking(id, body, this.actor(user));
    }
    stopBooking(id, body, user) {
        this.assertCanManage(user);
        return this.staffRideService.stopBooking(id);
    }
    removeRoute(id, user) {
        this.assertCanManage(user);
        return this.staffRideService.removeRoute(id);
    }
    exportBatch(id, user) {
        this.assertCanManage(user);
        return this.staffRideService.exportBatch(id);
    }
    listBookings(user, route, status, search, month) {
        this.assertCanManage(user);
        return this.staffRideService.listBookings({ routeId: route, status, search, month });
    }
    listBookableRoutes(user) {
        return this.staffRideService.listBookableRoutes(this.actor(user));
    }
    listMyBookings(user) {
        return this.staffRideService.listMyBookings(this.actor(user));
    }
    createBooking(body, user) {
        return this.staffRideService.createBooking(body, this.actor(user), user);
    }
    cancelBooking(id, body, user) {
        return this.staffRideService.cancelBooking(id, this.actor(user));
    }
};
exports.StaffRideController = StaffRideController;
__decorate([
    (0, common_1.Get)('access'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StaffRideController.prototype, "access", null);
__decorate([
    (0, common_1.Get)('locations'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StaffRideController.prototype, "listLocations", null);
__decorate([
    (0, common_1.Post)('locations'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], StaffRideController.prototype, "createLocation", null);
__decorate([
    (0, common_1.Patch)('locations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], StaffRideController.prototype, "updateLocation", null);
__decorate([
    (0, common_1.Delete)('locations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StaffRideController.prototype, "removeLocation", null);
__decorate([
    (0, common_1.Get)('vehicles'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StaffRideController.prototype, "listVehicles", null);
__decorate([
    (0, common_1.Post)('vehicles'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], StaffRideController.prototype, "createVehicle", null);
__decorate([
    (0, common_1.Patch)('vehicles/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], StaffRideController.prototype, "updateVehicle", null);
__decorate([
    (0, common_1.Delete)('vehicles/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StaffRideController.prototype, "removeVehicle", null);
__decorate([
    (0, common_1.Get)('routes'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StaffRideController.prototype, "listRoutes", null);
__decorate([
    (0, common_1.Post)('routes'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], StaffRideController.prototype, "createRoute", null);
__decorate([
    (0, common_1.Patch)('routes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], StaffRideController.prototype, "updateRoute", null);
__decorate([
    (0, common_1.Post)('routes/:id/start-booking'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], StaffRideController.prototype, "startBooking", null);
__decorate([
    (0, common_1.Post)('routes/:id/stop-booking'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], StaffRideController.prototype, "stopBooking", null);
__decorate([
    (0, common_1.Delete)('routes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StaffRideController.prototype, "removeRoute", null);
__decorate([
    (0, common_1.Get)('routes/:id/export'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StaffRideController.prototype, "exportBatch", null);
__decorate([
    (0, common_1.Get)('bookings'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __param(1, (0, common_1.Query)('route')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], StaffRideController.prototype, "listBookings", null);
__decorate([
    (0, common_1.Get)('available'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StaffRideController.prototype, "listBookableRoutes", null);
__decorate([
    (0, common_1.Get)('my-bookings'),
    __param(0, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StaffRideController.prototype, "listMyBookings", null);
__decorate([
    (0, common_1.Post)('bookings'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], StaffRideController.prototype, "createBooking", null);
__decorate([
    (0, common_1.Patch)('bookings/:id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.UserOne)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], StaffRideController.prototype, "cancelBooking", null);
exports.StaffRideController = StaffRideController = __decorate([
    (0, common_1.Controller)('staff-ride'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [staff_ride_service_1.StaffRideService])
], StaffRideController);
//# sourceMappingURL=staff-ride.controller.js.map