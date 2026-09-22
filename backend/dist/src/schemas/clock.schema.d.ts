import { Document } from 'mongoose';
export declare class Clock extends Document {
    user: string;
    status: string;
    location: string;
    timestamp: Date;
}
export declare const ClockSchema: import("mongoose").Schema<Clock, import("mongoose").Model<Clock, any, any, any, Document<unknown, any, Clock, any, {}> & Clock & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Clock, Document<unknown, {}, import("mongoose").FlatRecord<Clock>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Clock> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
