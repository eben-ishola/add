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
var UserExitCleanupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserExitCleanupService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../../schemas/user.schema");
const SENTINEL_EXIT_BEFORE = new Date('2000-01-01T00:00:00.000Z');
let UserExitCleanupService = UserExitCleanupService_1 = class UserExitCleanupService {
    constructor(userModel) {
        this.userModel = userModel;
        this.logger = new common_1.Logger(UserExitCleanupService_1.name);
    }
    async onApplicationBootstrap() {
        try {
            const filter = {
                status: { $regex: /^active$/i },
                exitDate: { $ne: null, $lt: SENTINEL_EXIT_BEFORE },
            };
            const affected = await this.userModel.countDocuments(filter);
            if (!affected) {
                return;
            }
            const result = await this.userModel.updateMany(filter, {
                $set: { exitDate: null },
            });
            this.logger.log(`Cleared sentinel exitDate from ${result.modifiedCount ?? affected} active staff record(s).`);
        }
        catch (error) {
            this.logger.warn(`Exit-date cleanup skipped: ${error?.message ?? error}`);
        }
    }
};
exports.UserExitCleanupService = UserExitCleanupService;
exports.UserExitCleanupService = UserExitCleanupService = UserExitCleanupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UserExitCleanupService);
//# sourceMappingURL=user-exit-cleanup.service.js.map