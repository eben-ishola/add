import { Model, Types } from 'mongoose';
import { MailService } from 'src/services/comms/mail.service';
import { UserDocument } from 'src/schemas/user.schema';
import { RideBookingDocument, RideLocationDocument, RideRouteDocument, RideVehicleDocument } from 'src/schemas/staff-ride.schema';
export type StaffRideActor = {
    id: string;
    name: string;
    staffId: string;
    department: string;
    entityName: string;
    isManager: boolean;
};
type LocationInput = {
    name?: string;
    address?: string;
    type?: string;
    amount?: number | string;
    active?: boolean;
};
type VehicleInput = {
    label?: string;
    plateNumber?: string;
    totalSeats?: number | string;
    active?: boolean;
};
type RouteStopInput = {
    locationId?: string;
    location?: string;
    order?: number | string;
    pickupTime?: string;
};
type RouteInput = {
    name?: string;
    stops?: RouteStopInput[];
    finalDestinationId?: string;
    vehicleId?: string;
    driverName?: string;
    runDate?: string;
    active?: boolean;
};
type BookingFilters = {
    routeId?: string;
    status?: string;
    search?: string;
    month?: string;
};
export declare class StaffRideService {
    private readonly locationModel;
    private readonly vehicleModel;
    private readonly routeModel;
    private readonly bookingModel;
    private readonly mailService?;
    private readonly userModel?;
    constructor(locationModel: Model<RideLocationDocument>, vehicleModel: Model<RideVehicleDocument>, routeModel: Model<RideRouteDocument>, bookingModel: Model<RideBookingDocument>, mailService?: MailService, userModel?: Model<UserDocument>);
    private text;
    private objectId;
    resolveEntity(explicit: any, user: any): Types.ObjectId | null;
    private locationType;
    private fareAmount;
    private seats;
    private mapLocation;
    private mapVehicle;
    private mapRoute;
    parseEmailList(raw: any): string[];
    private mapBooking;
    private bookedSeatsByRoute;
    listLocations(): Promise<{
        activeRoutes: number;
        id: string;
        name: string;
        address: string;
        type: any;
        amount: number;
        active: boolean;
    }[]>;
    createLocation(payload: LocationInput): Promise<{
        activeRoutes: number;
        id: string;
        name: string;
        address: string;
        type: any;
        amount: number;
        active: boolean;
    }>;
    updateLocation(id: string, payload: LocationInput): Promise<{
        id: string;
        name: string;
        address: string;
        type: any;
        amount: number;
        active: boolean;
    }>;
    removeLocation(id: string): Promise<{
        deleted: boolean;
    }>;
    private escape;
    listVehicles(): Promise<{
        assignedRoutes: {
            id: string;
            name: string;
        }[];
        bookedSeats: number;
        id: string;
        label: string;
        plateNumber: string;
        totalSeats: number;
        active: boolean;
    }[]>;
    createVehicle(payload: VehicleInput): Promise<{
        assignedRoutes: any[];
        bookedSeats: number;
        id: string;
        label: string;
        plateNumber: string;
        totalSeats: number;
        active: boolean;
    }>;
    updateVehicle(id: string, payload: VehicleInput): Promise<{
        id: string;
        label: string;
        plateNumber: string;
        totalSeats: number;
        active: boolean;
    }>;
    removeVehicle(id: string): Promise<{
        deleted: boolean;
    }>;
    listRoutes(options?: {
        activeOnly?: boolean;
    }): Promise<{
        id: string;
        name: string;
        stops: any;
        finalDestinationId: string;
        vehicleId: string;
        driverName: string;
        runDate: string;
        active: boolean;
        bookingOpen: boolean;
        reservedSeats: number;
        notifyEmails: any;
        bookingOpenedAt: string;
        bookedSeats: number;
    }[]>;
    private buildRoutePayload;
    createRoute(payload: RouteInput): Promise<{
        id: string;
        name: string;
        stops: any;
        finalDestinationId: string;
        vehicleId: string;
        driverName: string;
        runDate: string;
        active: boolean;
        bookingOpen: boolean;
        reservedSeats: number;
        notifyEmails: any;
        bookingOpenedAt: string;
        bookedSeats: number;
    }>;
    updateRoute(id: string, payload: RouteInput): Promise<{
        id: string;
        name: string;
        stops: any;
        finalDestinationId: string;
        vehicleId: string;
        driverName: string;
        runDate: string;
        active: boolean;
        bookingOpen: boolean;
        reservedSeats: number;
        notifyEmails: any;
        bookingOpenedAt: string;
        bookedSeats: number;
    }>;
    private buildBookingAnnouncement;
    private reservedSeatCount;
    startBooking(id: string, payload: {
        emails?: string | string[];
        reservedSeats?: number | string;
    }, actor: StaffRideActor): Promise<{
        route: {
            id: string;
            name: string;
            stops: any;
            finalDestinationId: string;
            vehicleId: string;
            driverName: string;
            runDate: string;
            active: boolean;
            bookingOpen: boolean;
            reservedSeats: number;
            notifyEmails: any;
            bookingOpenedAt: string;
            bookedSeats: number;
        };
        notified: string[];
        failed: {
            email: string;
            reason: string;
        }[];
    }>;
    stopBooking(id: string): Promise<{
        id: string;
        name: string;
        stops: any;
        finalDestinationId: string;
        vehicleId: string;
        driverName: string;
        runDate: string;
        active: boolean;
        bookingOpen: boolean;
        reservedSeats: number;
        notifyEmails: any;
        bookingOpenedAt: string;
        bookedSeats: number;
    }>;
    removeRoute(id: string): Promise<{
        deleted: boolean;
    }>;
    exportBatch(id: string): Promise<{
        route: {
            id: string;
            name: string;
            runDate: string;
            driverName: string;
            vehicleLabel: string;
            vehiclePlateNumber: string;
            bookingOpen: boolean;
        };
        rows: {
            seatNumber: number;
            staffId: string;
            staffName: string;
            department: string;
            company: string;
            accountNumber: string;
            alternateAccountNumber: string;
            pickupLocation: string;
            amount: number;
            status: any;
            bookedAt: string;
        }[];
        totals: {
            passengers: number;
            amount: number;
            missingAccounts: number;
            unpricedStops: number;
        };
    }>;
    normalizeMonth(value: any): string;
    routeIdsForMonth(month: string): Promise<Types.ObjectId[]>;
    listBookings(filters?: BookingFilters): Promise<{
        id: string;
        staffId: string;
        staffObjectId: string;
        staffName: string;
        department: string;
        routeId: string;
        pickupLocationId: string;
        seatNumber: number;
        status: any;
        bookedAt: string;
    }[]>;
    listMyBookings(actor: StaffRideActor): Promise<{
        id: string;
        staffId: string;
        staffObjectId: string;
        staffName: string;
        department: string;
        routeId: string;
        pickupLocationId: string;
        seatNumber: number;
        status: any;
        bookedAt: string;
    }[]>;
    createBooking(payload: {
        routeId?: string;
        pickupLocationId?: string;
    }, actor: StaffRideActor, user: any): Promise<{
        id: string;
        staffId: string;
        staffObjectId: string;
        staffName: string;
        department: string;
        routeId: string;
        pickupLocationId: string;
        seatNumber: number;
        status: any;
        bookedAt: string;
    }>;
    cancelBooking(id: string, actor: StaffRideActor): Promise<{
        id: string;
        staffId: string;
        staffObjectId: string;
        staffName: string;
        department: string;
        routeId: string;
        pickupLocationId: string;
        seatNumber: number;
        status: any;
        bookedAt: string;
    }>;
    listBookableRoutes(actor: StaffRideActor): Promise<{
        locations: {
            id: string;
            name: string;
            address: string;
            type: any;
            amount: number;
            active: boolean;
        }[];
        vehicles: {
            id: string;
            label: string;
            plateNumber: string;
            totalSeats: number;
            active: boolean;
        }[];
        routes: {
            totalSeats: number;
            openSeats: number;
            vehicleLabel: string;
            vehiclePlateNumber: string;
            bookedByMe: boolean;
            id: string;
            name: string;
            stops: any;
            finalDestinationId: string;
            vehicleId: string;
            driverName: string;
            runDate: string;
            active: boolean;
            bookingOpen: boolean;
            reservedSeats: number;
            notifyEmails: any;
            bookingOpenedAt: string;
            bookedSeats: number;
        }[];
        myBookings: {
            id: string;
            staffId: string;
            staffObjectId: string;
            staffName: string;
            department: string;
            routeId: string;
            pickupLocationId: string;
            seatNumber: number;
            status: any;
            bookedAt: string;
        }[];
    }>;
}
export {};
