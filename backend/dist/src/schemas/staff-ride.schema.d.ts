import { Document, Types } from 'mongoose';
export type RideLocationType = 'Pickup Point' | 'Destination' | 'Both';
export type RideBookingStatus = 'Confirmed' | 'Cancelled' | 'Completed';
export type RideLocationDocument = RideLocation & Document;
export type RideVehicleDocument = RideVehicle & Document;
export type RideRouteDocument = RideRoute & Document;
export type RideBookingDocument = RideBooking & Document;
export declare class RideLocation {
    name: string;
    address?: string;
    type: RideLocationType;
    amount: number;
    active: boolean;
}
export declare const RideLocationSchema: import("mongoose").Schema<RideLocation, import("mongoose").Model<RideLocation, any, any, any, Document<unknown, any, RideLocation, any, {}> & RideLocation & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, RideLocation, Document<unknown, {}, import("mongoose").FlatRecord<RideLocation>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<RideLocation> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare class RideVehicle {
    label: string;
    plateNumber: string;
    totalSeats: number;
    active: boolean;
}
export declare const RideVehicleSchema: import("mongoose").Schema<RideVehicle, import("mongoose").Model<RideVehicle, any, any, any, Document<unknown, any, RideVehicle, any, {}> & RideVehicle & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, RideVehicle, Document<unknown, {}, import("mongoose").FlatRecord<RideVehicle>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<RideVehicle> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare class RideRouteStop {
    location: Types.ObjectId;
    order: number;
    pickupTime: string;
}
export declare const RideRouteStopSchema: import("mongoose").Schema<RideRouteStop, import("mongoose").Model<RideRouteStop, any, any, any, Document<unknown, any, RideRouteStop, any, {}> & RideRouteStop & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, RideRouteStop, Document<unknown, {}, import("mongoose").FlatRecord<RideRouteStop>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<RideRouteStop> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare class RideRoute {
    name: string;
    stops: RideRouteStop[];
    finalDestination: Types.ObjectId;
    vehicle: Types.ObjectId;
    driverName: string;
    runDate: string;
    active: boolean;
    bookingOpen: boolean;
    reservedSeats: number;
    notifyEmails: string[];
    bookingOpenedAt?: Date | null;
    bookingOpenedBy?: Types.ObjectId | null;
    bookingClosedAt?: Date | null;
}
export declare const RideRouteSchema: import("mongoose").Schema<RideRoute, import("mongoose").Model<RideRoute, any, any, any, Document<unknown, any, RideRoute, any, {}> & RideRoute & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, RideRoute, Document<unknown, {}, import("mongoose").FlatRecord<RideRoute>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<RideRoute> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare class RideBooking {
    entity?: Types.ObjectId | null;
    entityName?: string;
    staff: Types.ObjectId;
    staffName: string;
    staffId?: string;
    department?: string;
    route: Types.ObjectId;
    pickupLocation: Types.ObjectId;
    seatNumber: number;
    status: RideBookingStatus;
    seatHeld: boolean;
    bookedAt: Date;
    cancelledAt?: Date | null;
}
export declare const RideBookingSchema: import("mongoose").Schema<RideBooking, import("mongoose").Model<RideBooking, any, any, any, Document<unknown, any, RideBooking, any, {}> & RideBooking & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, RideBooking, Document<unknown, {}, import("mongoose").FlatRecord<RideBooking>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<RideBooking> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
