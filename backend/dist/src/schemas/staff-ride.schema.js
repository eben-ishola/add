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
exports.RideBookingSchema = exports.RideBooking = exports.RideRouteSchema = exports.RideRoute = exports.RideRouteStopSchema = exports.RideRouteStop = exports.RideVehicleSchema = exports.RideVehicle = exports.RideLocationSchema = exports.RideLocation = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let RideLocation = class RideLocation {
};
exports.RideLocation = RideLocation;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], RideLocation.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], RideLocation.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['Pickup Point', 'Destination', 'Both'],
        default: 'Pickup Point',
    }),
    __metadata("design:type", String)
], RideLocation.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0, min: 0 }),
    __metadata("design:type", Number)
], RideLocation.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], RideLocation.prototype, "active", void 0);
exports.RideLocation = RideLocation = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], RideLocation);
exports.RideLocationSchema = mongoose_1.SchemaFactory.createForClass(RideLocation);
exports.RideLocationSchema.index({ name: 1 }, { unique: true });
let RideVehicle = class RideVehicle {
};
exports.RideVehicle = RideVehicle;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], RideVehicle.prototype, "label", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, uppercase: true }),
    __metadata("design:type", String)
], RideVehicle.prototype, "plateNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    __metadata("design:type", Number)
], RideVehicle.prototype, "totalSeats", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], RideVehicle.prototype, "active", void 0);
exports.RideVehicle = RideVehicle = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], RideVehicle);
exports.RideVehicleSchema = mongoose_1.SchemaFactory.createForClass(RideVehicle);
exports.RideVehicleSchema.index({ plateNumber: 1 }, { unique: true });
let RideRouteStop = class RideRouteStop {
};
exports.RideRouteStop = RideRouteStop;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'RideLocation', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], RideRouteStop.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    __metadata("design:type", Number)
], RideRouteStop.prototype, "order", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], RideRouteStop.prototype, "pickupTime", void 0);
exports.RideRouteStop = RideRouteStop = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], RideRouteStop);
exports.RideRouteStopSchema = mongoose_1.SchemaFactory.createForClass(RideRouteStop);
let RideRoute = class RideRoute {
};
exports.RideRoute = RideRoute;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], RideRoute.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.RideRouteStopSchema], default: [] }),
    __metadata("design:type", Array)
], RideRoute.prototype, "stops", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'RideLocation', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], RideRoute.prototype, "finalDestination", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'RideVehicle', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], RideRoute.prototype, "vehicle", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], RideRoute.prototype, "driverName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], RideRoute.prototype, "runDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], RideRoute.prototype, "active", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], RideRoute.prototype, "bookingOpen", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0, min: 0 }),
    __metadata("design:type", Number)
], RideRoute.prototype, "reservedSeats", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], RideRoute.prototype, "notifyEmails", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], RideRoute.prototype, "bookingOpenedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], RideRoute.prototype, "bookingOpenedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], RideRoute.prototype, "bookingClosedAt", void 0);
exports.RideRoute = RideRoute = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], RideRoute);
exports.RideRouteSchema = mongoose_1.SchemaFactory.createForClass(RideRoute);
exports.RideRouteSchema.index({ runDate: -1, createdAt: -1 });
let RideBooking = class RideBooking {
};
exports.RideBooking = RideBooking;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Subsidiary', default: null, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], RideBooking.prototype, "entity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], RideBooking.prototype, "entityName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], RideBooking.prototype, "staff", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], RideBooking.prototype, "staffName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], RideBooking.prototype, "staffId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: '' }),
    __metadata("design:type", String)
], RideBooking.prototype, "department", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'RideRoute', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], RideBooking.prototype, "route", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'RideLocation', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], RideBooking.prototype, "pickupLocation", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    __metadata("design:type", Number)
], RideBooking.prototype, "seatNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['Confirmed', 'Cancelled', 'Completed'],
        default: 'Confirmed',
        index: true,
    }),
    __metadata("design:type", String)
], RideBooking.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true, index: true }),
    __metadata("design:type", Boolean)
], RideBooking.prototype, "seatHeld", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: () => new Date() }),
    __metadata("design:type", Date)
], RideBooking.prototype, "bookedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], RideBooking.prototype, "cancelledAt", void 0);
exports.RideBooking = RideBooking = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], RideBooking);
exports.RideBookingSchema = mongoose_1.SchemaFactory.createForClass(RideBooking);
exports.RideBookingSchema.index({ route: 1, seatNumber: 1 }, { unique: true, partialFilterExpression: { seatHeld: true } });
exports.RideBookingSchema.index({ route: 1, staff: 1 }, { unique: true, partialFilterExpression: { seatHeld: true } });
//# sourceMappingURL=staff-ride.schema.js.map