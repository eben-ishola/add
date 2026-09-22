"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffRideModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const staff_ride_controller_1 = require("../controllers/staff-ride/staff-ride.controller");
const staff_ride_schema_1 = require("../schemas/staff-ride.schema");
const mail_service_1 = require("../services/comms/mail.service");
const staff_ride_service_1 = require("../services/staff-ride/staff-ride.service");
const user_schema_1 = require("../schemas/user.schema");
let StaffRideModule = class StaffRideModule {
};
exports.StaffRideModule = StaffRideModule;
exports.StaffRideModule = StaffRideModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: staff_ride_schema_1.RideLocation.name, schema: staff_ride_schema_1.RideLocationSchema },
                { name: staff_ride_schema_1.RideVehicle.name, schema: staff_ride_schema_1.RideVehicleSchema },
                { name: staff_ride_schema_1.RideRoute.name, schema: staff_ride_schema_1.RideRouteSchema },
                { name: staff_ride_schema_1.RideBooking.name, schema: staff_ride_schema_1.RideBookingSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
        ],
        controllers: [staff_ride_controller_1.StaffRideController],
        providers: [staff_ride_service_1.StaffRideService, mail_service_1.MailService],
        exports: [staff_ride_service_1.StaffRideService],
    })
], StaffRideModule);
//# sourceMappingURL=staff-ride.module.js.map