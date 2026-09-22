import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type ROIncentiveDocument = ROIncentive & Document;
export declare class ROIncentive {
    OFFICER: string;
    userId: Types.ObjectId;
    FOR_MONTH: Date;
    USER_ID: any;
    EARNINGS_TARGET: number;
    EARNINGS_ACHIEVED: number;
    VOLUME_TARGET: number;
    VOLUME_ACHIEVED: number;
    COUNT_TARGET: number;
    NO_BOOKED: number;
    PDO: number;
    PAR: number;
    EARNING_RESULT: number;
    VOLUME_RESULT: number;
    EARNING_INCENTIVE: number;
    VOLUME_INCENTIVE: number;
    STAR_BONUS: number;
    PAYABLE: number;
    AMOUNT: number;
    MODE: string;
}
export declare const ROIncentiveSchema: MongooseSchema<ROIncentive, import("mongoose").Model<ROIncentive, any, any, any, Document<unknown, any, ROIncentive, any, {}> & ROIncentive & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ROIncentive, Document<unknown, {}, import("mongoose").FlatRecord<ROIncentive>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ROIncentive> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
