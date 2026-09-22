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
exports.StaffRideService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const mail_service_1 = require("../comms/mail.service");
const user_schema_1 = require("../../schemas/user.schema");
const staff_ride_schema_1 = require("../../schemas/staff-ride.schema");
const LOCATION_TYPES = ['Pickup Point', 'Destination', 'Both'];
const BOOKING_STATUSES = ['Confirmed', 'Cancelled', 'Completed'];
const DUPLICATE_KEY = 11000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let StaffRideService = class StaffRideService {
    constructor(locationModel, vehicleModel, routeModel, bookingModel, mailService, userModel) {
        this.locationModel = locationModel;
        this.vehicleModel = vehicleModel;
        this.routeModel = routeModel;
        this.bookingModel = bookingModel;
        this.mailService = mailService;
        this.userModel = userModel;
    }
    text(value) {
        return String(value ?? '').trim();
    }
    objectId(value, label) {
        const raw = this.text(value?._id ?? value?.id ?? value);
        if (!raw || !mongoose_2.Types.ObjectId.isValid(raw)) {
            throw new common_1.BadRequestException(`${label} is required.`);
        }
        return new mongoose_2.Types.ObjectId(raw);
    }
    resolveEntity(explicit, user) {
        const candidate = this.text(explicit) || this.text(user?.entity?._id ?? user?.entity);
        if (!candidate || !mongoose_2.Types.ObjectId.isValid(candidate))
            return null;
        return new mongoose_2.Types.ObjectId(candidate);
    }
    locationType(value, fallback = 'Pickup Point') {
        const normalized = this.text(value);
        if (!normalized)
            return fallback;
        const match = LOCATION_TYPES.find((type) => type.toLowerCase() === normalized.toLowerCase());
        if (!match) {
            throw new common_1.BadRequestException(`Location type must be one of: ${LOCATION_TYPES.join(', ')}.`);
        }
        return match;
    }
    fareAmount(value) {
        if (value === undefined || value === null || value === '')
            return 0;
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed < 0) {
            throw new common_1.BadRequestException('Amount must be a number of 0 or more.');
        }
        return Number(parsed.toFixed(2));
    }
    seats(value) {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed < 1 || !Number.isInteger(parsed)) {
            throw new common_1.BadRequestException('Total seats must be a whole number of at least 1.');
        }
        return parsed;
    }
    mapLocation(doc) {
        return {
            id: String(doc?._id ?? ''),
            name: this.text(doc?.name),
            address: this.text(doc?.address) || undefined,
            type: doc?.type ?? 'Pickup Point',
            amount: Math.max(0, Number(doc?.amount ?? 0)),
            active: doc?.active !== false,
        };
    }
    mapVehicle(doc) {
        return {
            id: String(doc?._id ?? ''),
            label: this.text(doc?.label),
            plateNumber: this.text(doc?.plateNumber),
            totalSeats: Number(doc?.totalSeats ?? 0),
            active: doc?.active !== false,
        };
    }
    mapRoute(doc, bookedSeats = 0) {
        const stops = Array.isArray(doc?.stops) ? doc.stops : [];
        return {
            id: String(doc?._id ?? ''),
            name: this.text(doc?.name),
            stops: stops
                .map((stop) => ({
                locationId: String(stop?.location ?? ''),
                order: Number(stop?.order ?? 0),
                pickupTime: this.text(stop?.pickupTime),
            }))
                .sort((a, b) => a.order - b.order),
            finalDestinationId: String(doc?.finalDestination ?? ''),
            vehicleId: String(doc?.vehicle ?? ''),
            driverName: this.text(doc?.driverName),
            runDate: this.text(doc?.runDate),
            active: doc?.active !== false,
            bookingOpen: doc?.bookingOpen === true,
            reservedSeats: Math.max(0, Number(doc?.reservedSeats ?? 0)),
            notifyEmails: Array.isArray(doc?.notifyEmails) ? doc.notifyEmails : [],
            bookingOpenedAt: doc?.bookingOpenedAt
                ? new Date(doc.bookingOpenedAt).toISOString()
                : null,
            bookedSeats,
        };
    }
    parseEmailList(raw) {
        const source = Array.isArray(raw) ? raw.join(',') : this.text(raw);
        const candidates = source
            .split(/[,;\n]/)
            .map((value) => value.trim().toLowerCase())
            .filter(Boolean);
        if (!candidates.length) {
            throw new common_1.BadRequestException('Enter at least one email address to notify, separated by commas.');
        }
        const invalid = candidates.filter((value) => !EMAIL_PATTERN.test(value));
        if (invalid.length) {
            throw new common_1.BadRequestException(`These do not look like email addresses: ${invalid.join(', ')}.`);
        }
        return Array.from(new Set(candidates));
    }
    mapBooking(doc) {
        return {
            id: String(doc?._id ?? ''),
            staffId: this.text(doc?.staffId) || '-',
            staffObjectId: String(doc?.staff ?? ''),
            staffName: this.text(doc?.staffName) || 'Unnamed staff',
            department: this.text(doc?.department) || '-',
            routeId: String(doc?.route ?? ''),
            pickupLocationId: String(doc?.pickupLocation ?? ''),
            seatNumber: Number(doc?.seatNumber ?? 0),
            status: doc?.status ?? 'Confirmed',
            bookedAt: doc?.bookedAt ? new Date(doc.bookedAt).toISOString() : null,
        };
    }
    async bookedSeatsByRoute(routeIds) {
        if (!routeIds.length)
            return new Map();
        const rows = await this.bookingModel
            .aggregate([
            { $match: { route: { $in: routeIds }, seatHeld: true } },
            { $group: { _id: '$route', count: { $sum: 1 } } },
        ])
            .exec();
        return new Map(rows.map((row) => [String(row?._id ?? ''), Number(row?.count ?? 0)]));
    }
    async listLocations() {
        const docs = await this.locationModel
            .find()
            .sort({ name: 1 })
            .lean()
            .exec();
        const routes = await this.routeModel
            .find({ active: true })
            .select('stops finalDestination')
            .lean()
            .exec();
        return docs.map((doc) => {
            const id = String(doc?._id ?? '');
            const activeRoutes = routes.filter((route) => String(route?.finalDestination ?? '') === id ||
                (Array.isArray(route?.stops) &&
                    route.stops.some((stop) => String(stop?.location ?? '') === id))).length;
            return { ...this.mapLocation(doc), activeRoutes };
        });
    }
    async createLocation(payload) {
        const name = this.text(payload?.name);
        if (!name)
            throw new common_1.BadRequestException('Location name is required.');
        const existing = await this.locationModel
            .findOne({ name: { $regex: `^${this.escape(name)}$`, $options: 'i' } })
            .lean()
            .exec();
        if (existing) {
            throw new common_1.ConflictException(`A location named "${name}" already exists.`);
        }
        const created = await this.locationModel.create({
            name,
            address: this.text(payload?.address),
            type: this.locationType(payload?.type),
            amount: this.fareAmount(payload?.amount),
            active: payload?.active !== false,
        });
        return { ...this.mapLocation(created.toObject()), activeRoutes: 0 };
    }
    async updateLocation(id, payload) {
        const location = await this.locationModel
            .findOne({ _id: this.objectId(id, 'Location') })
            .exec();
        if (!location)
            throw new common_1.NotFoundException('Location not found.');
        if (payload?.name !== undefined) {
            const name = this.text(payload.name);
            if (!name)
                throw new common_1.BadRequestException('Location name is required.');
            location.name = name;
        }
        if (payload?.address !== undefined)
            location.address = this.text(payload.address);
        if (payload?.type !== undefined)
            location.type = this.locationType(payload.type, location.type);
        if (payload?.amount !== undefined)
            location.amount = this.fareAmount(payload.amount);
        if (payload?.active !== undefined)
            location.active = Boolean(payload.active);
        await location.save();
        return this.mapLocation(location.toObject());
    }
    async removeLocation(id) {
        const locationId = this.objectId(id, 'Location');
        const location = await this.locationModel.findOne({ _id: locationId }).lean().exec();
        if (!location)
            throw new common_1.NotFoundException('Location not found.');
        const inUse = await this.routeModel
            .countDocuments({
            $or: [{ finalDestination: locationId }, { 'stops.location': locationId }],
        })
            .exec();
        if (inUse > 0) {
            throw new common_1.ConflictException(`This location is used by ${inUse} route${inUse === 1 ? '' : 's'}. Remove it from those routes first.`);
        }
        await this.locationModel.deleteOne({ _id: locationId }).exec();
        return { deleted: true };
    }
    escape(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    async listVehicles() {
        const docs = await this.vehicleModel.find().sort({ label: 1 }).lean().exec();
        const routes = await this.routeModel
            .find()
            .select('_id name vehicle')
            .lean()
            .exec();
        const bookedByRoute = await this.bookedSeatsByRoute(routes.map((route) => route?._id).filter(Boolean));
        return docs.map((doc) => {
            const id = String(doc?._id ?? '');
            const assigned = routes.filter((route) => String(route?.vehicle ?? '') === id);
            return {
                ...this.mapVehicle(doc),
                assignedRoutes: assigned.map((route) => ({
                    id: String(route?._id ?? ''),
                    name: this.text(route?.name),
                })),
                bookedSeats: assigned.reduce((sum, route) => sum + (bookedByRoute.get(String(route?._id ?? '')) ?? 0), 0),
            };
        });
    }
    async createVehicle(payload) {
        const label = this.text(payload?.label);
        const plateNumber = this.text(payload?.plateNumber).toUpperCase();
        if (!label)
            throw new common_1.BadRequestException('Bus label is required.');
        if (!plateNumber)
            throw new common_1.BadRequestException('Plate number is required.');
        const existing = await this.vehicleModel.findOne({ plateNumber }).lean().exec();
        if (existing) {
            throw new common_1.ConflictException(`A bus with plate ${plateNumber} already exists.`);
        }
        const created = await this.vehicleModel.create({
            label,
            plateNumber,
            totalSeats: this.seats(payload?.totalSeats),
            active: payload?.active !== false,
        });
        return { ...this.mapVehicle(created.toObject()), assignedRoutes: [], bookedSeats: 0 };
    }
    async updateVehicle(id, payload) {
        const vehicle = await this.vehicleModel
            .findOne({ _id: this.objectId(id, 'Bus') })
            .exec();
        if (!vehicle)
            throw new common_1.NotFoundException('Bus not found.');
        if (payload?.label !== undefined) {
            const label = this.text(payload.label);
            if (!label)
                throw new common_1.BadRequestException('Bus label is required.');
            vehicle.label = label;
        }
        if (payload?.plateNumber !== undefined) {
            const plateNumber = this.text(payload.plateNumber).toUpperCase();
            if (!plateNumber)
                throw new common_1.BadRequestException('Plate number is required.');
            vehicle.plateNumber = plateNumber;
        }
        if (payload?.totalSeats !== undefined) {
            const nextSeats = this.seats(payload.totalSeats);
            const routes = await this.routeModel
                .find({ vehicle: vehicle._id })
                .select('_id')
                .lean()
                .exec();
            const booked = await this.bookedSeatsByRoute(routes.map((route) => route?._id).filter(Boolean));
            const highest = Math.max(0, ...Array.from(booked.values()));
            if (nextSeats < highest) {
                throw new common_1.ConflictException(`This bus already has ${highest} seats booked on a route. Cancel those bookings before reducing capacity.`);
            }
            vehicle.totalSeats = nextSeats;
        }
        if (payload?.active !== undefined)
            vehicle.active = Boolean(payload.active);
        await vehicle.save();
        return this.mapVehicle(vehicle.toObject());
    }
    async removeVehicle(id) {
        const vehicleId = this.objectId(id, 'Bus');
        const vehicle = await this.vehicleModel.findOne({ _id: vehicleId }).lean().exec();
        if (!vehicle)
            throw new common_1.NotFoundException('Bus not found.');
        const assigned = await this.routeModel.countDocuments({ vehicle: vehicleId }).exec();
        if (assigned > 0) {
            throw new common_1.ConflictException(`This bus is assigned to ${assigned} route${assigned === 1 ? '' : 's'}. Reassign or delete those routes first.`);
        }
        await this.vehicleModel.deleteOne({ _id: vehicleId }).exec();
        return { deleted: true };
    }
    async listRoutes(options) {
        const query = {};
        if (options?.activeOnly)
            query.active = true;
        const docs = await this.routeModel
            .find(query)
            .sort({ runDate: -1, createdAt: -1 })
            .lean()
            .exec();
        const booked = await this.bookedSeatsByRoute(docs.map((doc) => doc?._id).filter(Boolean));
        return docs.map((doc) => this.mapRoute(doc, booked.get(String(doc?._id ?? '')) ?? 0));
    }
    async buildRoutePayload(payload) {
        const name = this.text(payload?.name);
        if (!name)
            throw new common_1.BadRequestException('Route name is required.');
        const rawStops = Array.isArray(payload?.stops) ? payload.stops : [];
        if (!rawStops.length) {
            throw new common_1.BadRequestException('A route needs at least one pickup stop.');
        }
        const stops = rawStops.map((stop, index) => {
            const location = this.objectId(stop?.locationId ?? stop?.location, 'Stop location');
            const pickupTime = this.text(stop?.pickupTime);
            if (!pickupTime) {
                throw new common_1.BadRequestException(`Stop ${index + 1} needs a pickup time.`);
            }
            return { location, order: index + 1, pickupTime };
        });
        const duplicate = stops.find((stop, index) => stops.findIndex((other) => other.location.equals(stop.location)) !== index);
        if (duplicate) {
            throw new common_1.BadRequestException('A route cannot pick up from the same location twice.');
        }
        const finalDestination = this.objectId(payload?.finalDestinationId, 'Final destination');
        const vehicle = this.objectId(payload?.vehicleId, 'Bus');
        const driverName = this.text(payload?.driverName);
        const runDate = this.text(payload?.runDate);
        if (!driverName)
            throw new common_1.BadRequestException('Driver name is required.');
        if (!runDate)
            throw new common_1.BadRequestException('Run date is required.');
        const locationIds = [...stops.map((stop) => stop.location), finalDestination];
        const knownLocations = await this.locationModel
            .countDocuments({ _id: { $in: locationIds } })
            .exec();
        if (knownLocations !== new Set(locationIds.map(String)).size) {
            throw new common_1.BadRequestException('One or more selected locations do not exist.');
        }
        const bus = await this.vehicleModel.findOne({ _id: vehicle }).lean().exec();
        if (!bus)
            throw new common_1.BadRequestException('The selected bus does not exist.');
        return {
            name,
            stops,
            finalDestination,
            vehicle,
            driverName,
            runDate,
            active: payload?.active !== false,
        };
    }
    async createRoute(payload) {
        const data = await this.buildRoutePayload(payload);
        const created = await this.routeModel.create({ ...data });
        return this.mapRoute(created.toObject(), 0);
    }
    async updateRoute(id, payload) {
        const routeId = this.objectId(id, 'Route');
        const route = await this.routeModel.findOne({ _id: routeId }).exec();
        if (!route)
            throw new common_1.NotFoundException('Route not found.');
        const onlyToggling = payload?.active !== undefined &&
            payload?.name === undefined &&
            payload?.stops === undefined &&
            payload?.finalDestinationId === undefined &&
            payload?.vehicleId === undefined &&
            payload?.driverName === undefined &&
            payload?.runDate === undefined;
        if (onlyToggling) {
            route.active = Boolean(payload.active);
            if (!route.active && route.bookingOpen) {
                route.bookingOpen = false;
                route.bookingClosedAt = new Date();
            }
            await route.save();
        }
        else {
            const data = await this.buildRoutePayload(payload);
            const booked = await this.bookingModel
                .countDocuments({ route: routeId, seatHeld: true })
                .exec();
            const bus = await this.vehicleModel.findById(data.vehicle).lean().exec();
            if (bus && booked > Number(bus.totalSeats ?? 0)) {
                throw new common_1.ConflictException(`This route already has ${booked} seats booked, more than the ${bus.totalSeats} on the selected bus.`);
            }
            route.set(data);
            await route.save();
        }
        const bookedSeats = await this.bookingModel
            .countDocuments({ route: routeId, seatHeld: true })
            .exec();
        return this.mapRoute(route.toObject(), bookedSeats);
    }
    buildBookingAnnouncement(route, vehicle, locationNames, openSeats) {
        const stops = (route?.stops ?? [])
            .slice()
            .sort((a, b) => Number(a?.order ?? 0) - Number(b?.order ?? 0));
        const stopLines = stops.map((stop) => `  ${stop.order}. ${locationNames.get(String(stop.location)) ?? 'Unknown'} at ${this.text(stop.pickupTime)}`);
        const destination = locationNames.get(String(route?.finalDestination)) ?? 'Unknown';
        const frontendUrl = String(process.env.FRONTEND_URL ?? '').trim();
        const link = frontendUrl ? `${frontendUrl.replace(/\/+$/, '')}/staff-ride` : '';
        const subject = `Staff ride booking is open: ${this.text(route?.name)}`;
        const text = [
            `Booking is now open for the ${this.text(route?.name)} staff ride.`,
            '',
            `Run date: ${this.text(route?.runDate)}`,
            `Bus: ${this.text(vehicle?.label)} (${this.text(vehicle?.plateNumber)})`,
            `Driver: ${this.text(route?.driverName)}`,
            `Seats open for booking: ${openSeats}`,
            '',
            'Pickup stops:',
            ...stopLines,
            `  Arrives: ${destination}`,
            '',
            'Seats are assigned in the order they are booked.',
            link ? `Book your seat here: ${link}` : '',
        ]
            .filter((line) => line !== null && line !== undefined)
            .join('\n')
            .trim();
        return { subject, text };
    }
    reservedSeatCount(value, totalSeats) {
        if (value === undefined || value === null || value === '')
            return 0;
        const parsed = Number(value);
        if (!Number.isInteger(parsed) || parsed < 0) {
            throw new common_1.BadRequestException('Reserved seats must be a whole number of 0 or more.');
        }
        if (parsed >= totalSeats) {
            throw new common_1.BadRequestException(`Reserve fewer than ${totalSeats} seats, otherwise there is nothing left for staff to book.`);
        }
        return parsed;
    }
    async startBooking(id, payload, actor) {
        const routeId = this.objectId(id, 'Route');
        const emails = this.parseEmailList(payload?.emails);
        const route = await this.routeModel.findOne({ _id: routeId }).exec();
        if (!route)
            throw new common_1.NotFoundException('Route not found.');
        if (route.active === false) {
            throw new common_1.ConflictException('Activate this route before opening it for booking.');
        }
        const vehicle = await this.vehicleModel.findById(route.vehicle).lean().exec();
        if (!vehicle)
            throw new common_1.ConflictException('This route has no bus assigned.');
        if (vehicle.active === false) {
            throw new common_1.ConflictException('The bus on this route is out of service.');
        }
        const totalSeats = Number(vehicle.totalSeats ?? 0);
        const reservedSeats = this.reservedSeatCount(payload?.reservedSeats, totalSeats);
        const alreadyBooked = await this.bookingModel
            .countDocuments({ route: routeId, seatHeld: true })
            .exec();
        if (alreadyBooked > totalSeats - reservedSeats) {
            throw new common_1.ConflictException(`${alreadyBooked} seats are already booked, so at most ${totalSeats - alreadyBooked} can be reserved.`);
        }
        route.bookingOpen = true;
        route.reservedSeats = reservedSeats;
        route.notifyEmails = emails;
        route.bookingOpenedAt = new Date();
        route.bookingOpenedBy = mongoose_2.Types.ObjectId.isValid(actor.id)
            ? new mongoose_2.Types.ObjectId(actor.id)
            : null;
        route.bookingClosedAt = null;
        await route.save();
        const locationIds = [
            ...(route.stops ?? []).map((stop) => stop.location),
            route.finalDestination,
        ];
        const locations = await this.locationModel
            .find({ _id: { $in: locationIds } })
            .select('_id name')
            .lean()
            .exec();
        const locationNames = new Map(locations.map((location) => [String(location?._id ?? ''), this.text(location?.name)]));
        const announcement = this.buildBookingAnnouncement(route.toObject(), vehicle, locationNames, totalSeats - reservedSeats);
        const notified = [];
        const failed = [];
        if (this.mailService) {
            const results = await Promise.allSettled(emails.map(async (to) => {
                const result = await this.mailService.sendMail({
                    to,
                    subject: announcement.subject,
                    text: announcement.text,
                });
                if (!result?.success) {
                    throw new Error(result?.message ?? 'Email sending failed.');
                }
                return to;
            }));
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    notified.push(emails[index]);
                }
                else {
                    failed.push({
                        email: emails[index],
                        reason: String(result.reason?.message ?? result.reason ?? 'Unknown error'),
                    });
                }
            });
        }
        else {
            emails.forEach((email) => failed.push({ email, reason: 'Email sending is not configured.' }));
        }
        const bookedSeats = await this.bookingModel
            .countDocuments({ route: routeId, seatHeld: true })
            .exec();
        return {
            route: this.mapRoute(route.toObject(), bookedSeats),
            notified,
            failed,
        };
    }
    async stopBooking(id) {
        const routeId = this.objectId(id, 'Route');
        const route = await this.routeModel.findOne({ _id: routeId }).exec();
        if (!route)
            throw new common_1.NotFoundException('Route not found.');
        if (route.bookingOpen !== true) {
            throw new common_1.ConflictException('Booking is not open on this route.');
        }
        route.bookingOpen = false;
        route.bookingClosedAt = new Date();
        await route.save();
        const bookedSeats = await this.bookingModel
            .countDocuments({ route: routeId, seatHeld: true })
            .exec();
        return this.mapRoute(route.toObject(), bookedSeats);
    }
    async removeRoute(id) {
        const routeId = this.objectId(id, 'Route');
        const route = await this.routeModel.findOne({ _id: routeId }).lean().exec();
        if (!route)
            throw new common_1.NotFoundException('Route not found.');
        const held = await this.bookingModel.countDocuments({ route: routeId, seatHeld: true }).exec();
        if (held > 0) {
            throw new common_1.ConflictException(`This route has ${held} live booking${held === 1 ? '' : 's'}. Deactivate it instead, or cancel the bookings first.`);
        }
        await this.bookingModel.deleteMany({ route: routeId }).exec();
        await this.routeModel.deleteOne({ _id: routeId }).exec();
        return { deleted: true };
    }
    async exportBatch(id) {
        const routeId = this.objectId(id, 'Route');
        const route = await this.routeModel.findOne({ _id: routeId }).lean().exec();
        if (!route)
            throw new common_1.NotFoundException('Route not found.');
        const [vehicle, locations, bookings] = await Promise.all([
            this.vehicleModel.findById(route.vehicle).lean().exec(),
            this.locationModel.find().select('_id name amount').lean().exec(),
            this.bookingModel
                .find({ route: routeId, seatHeld: true })
                .sort({ seatNumber: 1 })
                .lean()
                .exec(),
        ]);
        const locationById = new Map(locations.map((location) => [String(location?._id ?? ''), location]));
        const staffIds = bookings
            .map((booking) => booking?.staff)
            .filter((value) => value && mongoose_2.Types.ObjectId.isValid(String(value)));
        const staff = this.userModel
            ? await this.userModel
                .find({ _id: { $in: staffIds } })
                .select('_id staffId addosserAccount atlasAccount entity')
                .populate('entity', 'name')
                .lean()
                .exec()
            : [];
        const staffById = new Map(staff.map((row) => [String(row?._id ?? ''), row]));
        const rows = bookings.map((booking) => {
            const pickup = locationById.get(String(booking?.pickupLocation ?? ''));
            const person = staffById.get(String(booking?.staff ?? ''));
            const amount = Math.max(0, Number(pickup?.amount ?? 0));
            const company = this.text(booking?.entityName) ||
                this.text(person?.entity?.name) ||
                '-';
            return {
                seatNumber: Number(booking?.seatNumber ?? 0),
                staffId: this.text(booking?.staffId) || this.text(person?.staffId) || '-',
                staffName: this.text(booking?.staffName) || 'Unnamed staff',
                department: this.text(booking?.department) || '-',
                company,
                accountNumber: this.text(person?.addosserAccount) || '',
                alternateAccountNumber: this.text(person?.atlasAccount) || '',
                pickupLocation: this.text(pickup?.name) || 'Unknown',
                amount,
                status: booking?.status ?? 'Confirmed',
                bookedAt: booking?.bookedAt ? new Date(booking.bookedAt).toISOString() : null,
            };
        });
        const missingAccounts = rows.filter((row) => !row.accountNumber).length;
        const unpricedStops = rows.filter((row) => row.amount <= 0).length;
        return {
            route: {
                id: String(route?._id ?? ''),
                name: this.text(route?.name),
                runDate: this.text(route?.runDate),
                driverName: this.text(route?.driverName),
                vehicleLabel: this.text(vehicle?.label),
                vehiclePlateNumber: this.text(vehicle?.plateNumber),
                bookingOpen: route?.bookingOpen === true,
            },
            rows,
            totals: {
                passengers: rows.length,
                amount: Number(rows.reduce((sum, row) => sum + row.amount, 0).toFixed(2)),
                missingAccounts,
                unpricedStops,
            },
        };
    }
    normalizeMonth(value) {
        const raw = this.text(value);
        if (!raw)
            return '';
        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(raw)) {
            throw new common_1.BadRequestException('Month must be in YYYY-MM form.');
        }
        return raw;
    }
    async routeIdsForMonth(month) {
        const routes = await this.routeModel
            .find({ runDate: { $regex: `^${this.escape(month)}` } })
            .select('_id')
            .lean()
            .exec();
        return routes.map((route) => route._id);
    }
    async listBookings(filters = {}) {
        const query = {};
        const month = this.normalizeMonth(filters.month);
        if (month) {
            const routeIds = await this.routeIdsForMonth(month);
            if (!routeIds.length)
                return [];
            query.route = { $in: routeIds };
        }
        if (filters.routeId && filters.routeId !== 'all') {
            const routeId = this.objectId(filters.routeId, 'Route');
            if (month) {
                const withinMonth = query.route.$in.some((id) => id.equals(routeId));
                if (!withinMonth)
                    return [];
            }
            query.route = routeId;
        }
        if (filters.status && filters.status !== 'all') {
            const status = BOOKING_STATUSES.find((value) => value.toLowerCase() === this.text(filters.status).toLowerCase());
            if (!status)
                throw new common_1.BadRequestException('Unknown booking status.');
            query.status = status;
        }
        const search = this.text(filters.search);
        if (search) {
            query.$or = [
                { staffName: { $regex: this.escape(search), $options: 'i' } },
                { staffId: { $regex: this.escape(search), $options: 'i' } },
            ];
        }
        const docs = await this.bookingModel
            .find(query)
            .sort({ bookedAt: -1 })
            .lean()
            .exec();
        return docs.map((doc) => this.mapBooking(doc));
    }
    async listMyBookings(actor) {
        const docs = await this.bookingModel
            .find({ staff: this.objectId(actor.id, 'Staff') })
            .sort({ bookedAt: -1 })
            .lean()
            .exec();
        return docs.map((doc) => this.mapBooking(doc));
    }
    async createBooking(payload, actor, user) {
        const entity = this.resolveEntity(null, user);
        const routeId = this.objectId(payload?.routeId, 'Route');
        const pickupLocation = this.objectId(payload?.pickupLocationId, 'Pickup location');
        const staff = this.objectId(actor.id, 'Staff');
        const route = await this.routeModel.findOne({ _id: routeId }).lean().exec();
        if (!route)
            throw new common_1.NotFoundException('Route not found.');
        if (route.active === false) {
            throw new common_1.ConflictException('This route is no longer taking bookings.');
        }
        if (route.bookingOpen !== true) {
            throw new common_1.ConflictException('Booking has not been opened for this route yet.');
        }
        const servesPickup = (route.stops ?? []).some((stop) => String(stop?.location ?? '') === String(pickupLocation));
        if (!servesPickup) {
            throw new common_1.BadRequestException('This route does not pick up from the selected location.');
        }
        const vehicle = await this.vehicleModel.findById(route.vehicle).lean().exec();
        if (!vehicle)
            throw new common_1.ConflictException('This route has no bus assigned.');
        if (vehicle.active === false) {
            throw new common_1.ConflictException('The bus on this route is out of service.');
        }
        const existing = await this.bookingModel
            .findOne({ route: routeId, staff, seatHeld: true })
            .lean()
            .exec();
        if (existing) {
            throw new common_1.ConflictException('You already have a seat booked on this route.');
        }
        const totalSeats = Number(vehicle.totalSeats ?? 0);
        const openSeats = Math.max(0, totalSeats - Math.max(0, Number(route.reservedSeats ?? 0)));
        const held = await this.bookingModel
            .find({ route: routeId, seatHeld: true })
            .select('seatNumber')
            .lean()
            .exec();
        if (held.length >= openSeats) {
            throw new common_1.ConflictException('This bus is full.');
        }
        const taken = new Set(held.map((row) => Number(row?.seatNumber ?? 0)));
        for (let seatNumber = 1; seatNumber <= openSeats; seatNumber += 1) {
            if (taken.has(seatNumber))
                continue;
            try {
                const created = await this.bookingModel.create({
                    entity,
                    entityName: actor.entityName,
                    staff,
                    staffName: actor.name,
                    staffId: actor.staffId,
                    department: actor.department,
                    route: routeId,
                    pickupLocation,
                    seatNumber,
                    status: 'Confirmed',
                    seatHeld: true,
                    bookedAt: new Date(),
                });
                return this.mapBooking(created.toObject());
            }
            catch (error) {
                if (error?.code === DUPLICATE_KEY)
                    continue;
                throw error;
            }
        }
        throw new common_1.ConflictException('This bus is full.');
    }
    async cancelBooking(id, actor) {
        const booking = await this.bookingModel
            .findOne({ _id: this.objectId(id, 'Booking') })
            .exec();
        if (!booking)
            throw new common_1.NotFoundException('Booking not found.');
        const ownsBooking = String(booking.staff ?? '') === String(actor.id);
        if (!ownsBooking && !actor.isManager) {
            throw new common_1.ForbiddenException('You can only cancel your own bookings.');
        }
        if (booking.status === 'Cancelled') {
            throw new common_1.ConflictException('This booking is already cancelled.');
        }
        booking.status = 'Cancelled';
        booking.seatHeld = false;
        booking.cancelledAt = new Date();
        await booking.save();
        return this.mapBooking(booking.toObject());
    }
    async listBookableRoutes(actor) {
        const [locations, vehicles, routes] = await Promise.all([
            this.locationModel.find().lean().exec(),
            this.vehicleModel.find().lean().exec(),
            this.routeModel
                .find({ active: true, bookingOpen: true })
                .sort({ runDate: 1 })
                .lean()
                .exec(),
        ]);
        const routeIds = routes.map((route) => route?._id).filter(Boolean);
        const booked = await this.bookedSeatsByRoute(routeIds);
        const mine = await this.bookingModel
            .find({ staff: this.objectId(actor.id, 'Staff'), seatHeld: true })
            .lean()
            .exec();
        const myRouteIds = new Set(mine.map((row) => String(row?.route ?? '')));
        const vehicleById = new Map(vehicles.map((vehicle) => [String(vehicle?._id ?? ''), vehicle]));
        return {
            locations: locations.map((doc) => this.mapLocation(doc)),
            vehicles: vehicles.map((doc) => this.mapVehicle(doc)),
            routes: routes
                .filter((route) => vehicleById.get(String(route?.vehicle ?? ''))?.active !== false)
                .map((route) => {
                const id = String(route?._id ?? '');
                const vehicle = vehicleById.get(String(route?.vehicle ?? ''));
                const totalSeats = Number(vehicle?.totalSeats ?? 0);
                const reservedSeats = Math.max(0, Number(route?.reservedSeats ?? 0));
                return {
                    ...this.mapRoute(route, booked.get(id) ?? 0),
                    totalSeats,
                    openSeats: Math.max(0, totalSeats - reservedSeats),
                    vehicleLabel: this.text(vehicle?.label),
                    vehiclePlateNumber: this.text(vehicle?.plateNumber),
                    bookedByMe: myRouteIds.has(id),
                };
            }),
            myBookings: mine.map((doc) => this.mapBooking(doc)),
        };
    }
};
exports.StaffRideService = StaffRideService;
exports.StaffRideService = StaffRideService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(staff_ride_schema_1.RideLocation.name)),
    __param(1, (0, mongoose_1.InjectModel)(staff_ride_schema_1.RideVehicle.name)),
    __param(2, (0, mongoose_1.InjectModel)(staff_ride_schema_1.RideRoute.name)),
    __param(3, (0, mongoose_1.InjectModel)(staff_ride_schema_1.RideBooking.name)),
    __param(4, (0, common_1.Optional)()),
    __param(5, (0, common_1.Optional)()),
    __param(5, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mail_service_1.MailService,
        mongoose_2.Model])
], StaffRideService);
//# sourceMappingURL=staff-ride.service.js.map