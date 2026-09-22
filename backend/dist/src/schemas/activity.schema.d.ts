import { Document } from 'mongoose';
export declare class Activity extends Document {
    user: string;
    action: string;
    location: string;
    url: string;
    description: string;
    duration: string;
    idleTime: string;
    images: string;
}
export declare const ActivitySchema: import("mongoose").Schema<Activity, import("mongoose").Model<Activity, any, any, any, Document<unknown, any, Activity, any, {}> & Activity & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Activity, Document<unknown, {}, import("mongoose").FlatRecord<Activity>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Activity> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
