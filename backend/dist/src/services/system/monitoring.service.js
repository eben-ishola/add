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
exports.MonitoringService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const activity_schema_1 = require("../../schemas/activity.schema");
const clock_schema_1 = require("../../schemas/clock.schema");
let MonitoringService = class MonitoringService {
    constructor(activityModel, clockModel) {
        this.activityModel = activityModel;
        this.clockModel = clockModel;
    }
    async logActivity(payload) {
        return await this.activityModel.create(payload);
    }
    async clockInOut(payload) {
        return await this.clockModel.create(payload);
    }
    async getUserActivities(user, startDate, endDate) {
        const totalActiveDuration = await this.activityModel.aggregate([
            {
                $match: {
                    user: user,
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate),
                    },
                    idleTime: { $eq: 0 }
                }
            },
            {
                $group: {
                    _id: "$user",
                    totalActiveDuration: { $sum: "$duration" },
                    actions: { $addToSet: "$action" }
                }
            }
        ]);
        return await this.activityModel.find({ user }).sort({ createdAt: -1 });
    }
    async getNormalActivity(user, startDate, endDate, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [totalRecords, normalQuery] = await Promise.all([
            this.activityModel.aggregate([
                {
                    $match: {
                        user: user,
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $count: "total"
                }
            ]),
            this.activityModel.aggregate([
                {
                    $match: {
                        user: user,
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $addFields: {
                        durationNum: { $toDouble: "$duration" },
                        idleTimeNum: { $toDouble: "$idleTime" }
                    }
                },
                {
                    $project: {
                        user: 1,
                        action: 1,
                        url: 1,
                        duration: "$durationNum",
                        idleTime: "$idleTimeNum",
                        createdAt: 1,
                        images: 1,
                        description: 1
                    }
                },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit }
            ])
        ]);
        const total = totalRecords.length && totalRecords[0].total ? totalRecords[0].total : 0;
        const totalPages = total > 0 ? Math.ceil(total / limit) : 1;
        return {
            totalPages,
            currentPage: page,
            data: normalQuery
        };
    }
    async getDetailedActivity(user, startDate, endDate, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [totalRecords, detailedQuery] = await Promise.all([
            this.activityModel.aggregate([
                {
                    $match: {
                        user: user,
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $count: "total"
                }
            ]),
            this.activityModel.aggregate([
                {
                    $match: {
                        user: user,
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $addFields: {
                        durationNum: { $toDouble: "$duration" },
                        idleTimeNum: { $toDouble: "$idleTime" }
                    }
                },
                {
                    $group: {
                        _id: {
                            user: "$user",
                            action: "$action"
                        },
                        totalDuration: { $sum: "$durationNum" },
                        totalIdleTime: { $sum: "$idleTimeNum" },
                        records: { $push: {
                                user: "$user",
                                action: "$action",
                                duration: "$durationNum",
                                idleTime: "$idleTimeNum",
                                createdAt: "$createdAt",
                                description: "$description"
                            } }
                    }
                },
                { $sort: { "_id.action": 1 } },
                { $skip: skip },
                { $limit: limit }
            ])
        ]);
        const total = totalRecords.length ? totalRecords[0].total : 0;
        const totalPages = Math.ceil(total / limit);
        return {
            totalPages,
            currentPage: page,
            data: detailedQuery
        };
    }
    async getSummarizedActivity(user, startDate, endDate, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [totalRecords, summarizedQuery] = await Promise.all([
            this.activityModel.aggregate([
                {
                    $match: {
                        user: user,
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $count: "total"
                }
            ]),
            this.activityModel.aggregate([
                {
                    $match: {
                        user: user,
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $addFields: {
                        durationNum: { $toDouble: "$duration" },
                        idleTimeNum: { $toDouble: "$idleTime" }
                    }
                },
                {
                    $group: {
                        _id: "$user",
                        totalDuration: { $sum: "$durationNum" },
                        totalIdleTime: { $sum: "$idleTimeNum" },
                        activityCount: { $sum: 1 }
                    }
                },
                { $skip: skip },
                { $limit: limit }
            ])
        ]);
        const total = totalRecords.length ? totalRecords[0].total : 0;
        const totalPages = Math.ceil(total / limit);
        return {
            totalPages,
            currentPage: page,
            data: summarizedQuery
        };
    }
    async getClockHistory(user) {
        return await this.clockModel.find({ user }).sort({ timestamp: -1 });
    }
    async confirmUninstall(password) {
    }
    async handleUninstallAttempt(user) {
    }
    async verifyAdminPassword(password) {
        if (password !== 'admin_password') {
            throw new common_1.UnauthorizedException('Invalid admin password');
        }
        return { message: 'Password verified' };
    }
    async findGroupedActivities(page = 1, limit = 10, startDate, endDate, user) {
        const matchStage = {};
        if (startDate && endDate) {
            matchStage["createdAt"] = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }
        if (user) {
            matchStage["user"] = user;
        }
        const skip = (page - 1) * limit;
        const activities = await this.activityModel.aggregate([
            { $match: matchStage },
            { $addFields: { date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } } },
            { $sort: { updatedAt: -1 } },
            {
                $group: {
                    _id: { date: "$date", action: "$action" },
                    mostRecent: { $first: "$$ROOT" },
                    totalDuration: { $sum: "$duration" },
                    allDescriptions: {
                        $push: { description: "$description", timestamp: "$createdAt", date: "$date" },
                    },
                },
            },
            {
                $addFields: {
                    descriptions: {
                        $filter: {
                            inPost: "$allDescriptions",
                            as: "desc",
                            cond: { $eq: ["$$desc.date", "$mostRecent.date"] },
                        },
                    },
                },
            },
            {
                $addFields: {
                    "mostRecent.descriptions": {
                        $map: {
                            inPost: "$descriptions",
                            as: "desc",
                            in: { description: "$$desc.description", timestamp: "$$desc.timestamp" },
                        },
                    },
                    "mostRecent.duration": "$mostRecent.duration",
                },
            },
            { $replaceRoot: { newRoot: "$mostRecent" } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
        ]);
        const total = await this.activityModel.countDocuments(matchStage);
        const totalDurationResult = await this.activityModel.aggregate([
            { $match: matchStage },
            { $group: { _id: null, totalDuration: { $sum: "$duration" } } },
        ]);
        const totalDuration = totalDurationResult.length > 0 ? totalDurationResult[0].totalDuration : 0;
        return {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            totalDuration,
            data: activities,
        };
    }
    async findUserActivities(page = 1, limit = 10, startDate, endDate) {
        const matchStage = {};
        if (startDate && endDate) {
            matchStage["createdAt"] = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }
        const skip = (page - 1) * limit;
        const activities = await this.activityModel.aggregate([
            { $match: matchStage },
            { $addFields: { date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } } },
            { $sort: { updatedAt: -1 } },
            {
                $group: {
                    _id: { user: "$user", date: "$date", action: "$action" },
                    mostRecent: { $first: "$$ROOT" },
                    totalDuration: { $sum: "$duration" },
                    allDescriptions: {
                        $push: { description: "$description", timestamp: "$createdAt", date: "$date" },
                    },
                },
            },
            {
                $addFields: {
                    descriptions: {
                        $filter: {
                            inPost: "$allDescriptions",
                            as: "desc",
                            cond: { $eq: ["$$desc.date", "$mostRecent.date"] },
                        },
                    },
                },
            },
            {
                $addFields: {
                    "mostRecent.descriptions": {
                        $map: {
                            inPost: "$descriptions",
                            as: "desc",
                            in: { description: "$$desc.description", timestamp: "$$desc.timestamp" },
                        },
                    },
                    "mostRecent.duration": "$mostRecent.duration",
                    "mostRecent.totalDuration": "$totalDuration",
                },
            },
            { $replaceRoot: { newRoot: "$mostRecent" } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
        ]);
        const total = await this.activityModel.countDocuments(matchStage);
        return {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: activities,
        };
    }
};
exports.MonitoringService = MonitoringService;
exports.MonitoringService = MonitoringService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(activity_schema_1.Activity.name)),
    __param(1, (0, mongoose_1.InjectModel)(clock_schema_1.Clock.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], MonitoringService);
//# sourceMappingURL=monitoring.service.js.map