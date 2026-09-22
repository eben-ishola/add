import { StaffRideService } from 'src/services/staff-ride/staff-ride.service';
export declare class StaffRideController {
    private readonly staffRideService;
    constructor(staffRideService: StaffRideService);
    private isManager;
    private assertCanManage;
    private actor;
    access(user: any): {
        canManage: boolean;
    };
    listLocations(user: any): Promise<{
        activeRoutes: number;
        id: string;
        name: string;
        address: string;
        type: any;
        amount: number;
        active: boolean;
    }[]>;
    createLocation(body: any, user: any): Promise<{
        activeRoutes: number;
        id: string;
        name: string;
        address: string;
        type: any;
        amount: number;
        active: boolean;
    }>;
    updateLocation(id: string, body: any, user: any): Promise<{
        id: string;
        name: string;
        address: string;
        type: any;
        amount: number;
        active: boolean;
    }>;
    removeLocation(id: string, user: any): Promise<{
        deleted: boolean;
    }>;
    listVehicles(user: any): Promise<{
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
    createVehicle(body: any, user: any): Promise<{
        assignedRoutes: any[];
        bookedSeats: number;
        id: string;
        label: string;
        plateNumber: string;
        totalSeats: number;
        active: boolean;
    }>;
    updateVehicle(id: string, body: any, user: any): Promise<{
        id: string;
        label: string;
        plateNumber: string;
        totalSeats: number;
        active: boolean;
    }>;
    removeVehicle(id: string, user: any): Promise<{
        deleted: boolean;
    }>;
    listRoutes(user: any): Promise<{
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
    createRoute(body: any, user: any): Promise<{
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
    updateRoute(id: string, body: any, user: any): Promise<{
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
    startBooking(id: string, body: any, user: any): Promise<{
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
    stopBooking(id: string, body: any, user: any): Promise<{
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
    removeRoute(id: string, user: any): Promise<{
        deleted: boolean;
    }>;
    exportBatch(id: string, user: any): Promise<{
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
    listBookings(user: any, route?: string, status?: string, search?: string, month?: string): Promise<{
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
    listBookableRoutes(user: any): Promise<{
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
    listMyBookings(user: any): Promise<{
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
    createBooking(body: any, user: any): Promise<{
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
    cancelBooking(id: string, body: any, user: any): Promise<{
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
}
