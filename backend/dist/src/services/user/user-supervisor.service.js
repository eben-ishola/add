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
exports.UserSupervisorService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let UserSupervisorService = class UserSupervisorService {
    constructor(staffModel) {
        this.staffModel = staffModel;
    }
    async updateSupervisor(data) {
        try {
            const { staffId, supervisorId, supervisor2Id } = data;
            if (!staffId) {
                throw new Error('staffId is required');
            }
            const updateData = {};
            if (supervisorId) {
                const supervisor = await this.staffModel.findOne({ staffId: supervisorId });
                if (!supervisor) {
                    throw new Error('Supervisor not found');
                }
                updateData.supervisorId = supervisor._id;
            }
            if (supervisor2Id) {
                const supervisor2 = await this.staffModel.findOne({ staffId: supervisor2Id });
                if (!supervisor2) {
                    throw new Error('Supervisor 2 not found');
                }
                updateData.supervisor2Id = supervisor2._id;
            }
            const staff = await this.staffModel.updateOne({ staffId }, updateData);
            if (!staff)
                throw new Error('Staff not found');
            return { msg: 'Supervisor updated successfully', supervisorId: updateData.supervisorId };
        }
        catch (e) {
            console.error('Update supervisor error:', e);
            throw new Error(e.message);
        }
    }
};
exports.UserSupervisorService = UserSupervisorService;
exports.UserSupervisorService = UserSupervisorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UserSupervisorService);
//# sourceMappingURL=user-supervisor.service.js.map