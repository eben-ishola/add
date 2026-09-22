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
var ProcurementReminderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcurementReminderService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const procurement_requisition_schema_1 = require("../../schemas/procurement-requisition.schema");
const notice_service_1 = require("../comms/notice.service");
const notification_dispatch_service_1 = require("../comms/notification-dispatch.service");
const procurement_service_1 = require("./procurement.service");
let ProcurementReminderService = ProcurementReminderService_1 = class ProcurementReminderService {
    constructor(requisitionModel, noticeService, dispatch) {
        this.requisitionModel = requisitionModel;
        this.noticeService = noticeService;
        this.dispatch = dispatch;
        this.logger = new common_1.Logger(ProcurementReminderService_1.name);
    }
    async remindOutstandingReceipts() {
        if (this.dispatch) {
            const owned = await this.dispatch.claimScheduledRun('procurement-receipt-reminder');
            if (!owned)
                return;
        }
        try {
            const overdue = await this.requisitionModel
                .find((0, procurement_service_1.buildOverdueReceiptQuery)())
                .select('_id reference title requestedBy receiptDueAt disbursedAt')
                .lean()
                .exec();
            if (!overdue.length) {
                this.logger.log('No procurement receipts outstanding.');
                return;
            }
            let sent = 0;
            for (const requisition of overdue) {
                const userId = String(requisition?.requestedBy ?? '').trim();
                if (!userId)
                    continue;
                const reference = requisition?.reference ?? 'your requisition';
                try {
                    await this.noticeService.createNotice({
                        userId,
                        message: `Receipt outstanding for ${reference} — ${requisition?.title ?? 'a procurement request'}. Please upload it to close the request.`,
                        link: `/procurement/${requisition._id}`,
                        type: 'procurement-receipt-reminder',
                    });
                    sent += 1;
                }
                catch (error) {
                    this.logger.error(`Could not remind ${userId} about ${reference}: ${error?.message ?? error}`);
                }
            }
            this.logger.log(`Procurement receipt reminders: ${sent} sent for ${overdue.length} outstanding requisition(s).`);
        }
        catch (error) {
            this.logger.error(`Procurement receipt reminder run failed: ${error?.message ?? error}`);
        }
    }
};
exports.ProcurementReminderService = ProcurementReminderService;
__decorate([
    (0, schedule_1.Cron)('0 5 * * *', { timeZone: 'Africa/Lagos' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProcurementReminderService.prototype, "remindOutstandingReceipts", null);
exports.ProcurementReminderService = ProcurementReminderService = ProcurementReminderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(procurement_requisition_schema_1.ProcurementRequisition.name)),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        notice_service_1.NoticeService,
        notification_dispatch_service_1.NotificationDispatchService])
], ProcurementReminderService);
//# sourceMappingURL=procurement-reminder.service.js.map