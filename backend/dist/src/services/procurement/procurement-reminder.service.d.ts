import { Model } from 'mongoose';
import { ProcurementRequisition } from 'src/schemas/procurement-requisition.schema';
import { NoticeService } from 'src/services/comms/notice.service';
import { NotificationDispatchService } from 'src/services/comms/notification-dispatch.service';
export declare class ProcurementReminderService {
    private readonly requisitionModel;
    private readonly noticeService;
    private readonly dispatch?;
    private readonly logger;
    constructor(requisitionModel: Model<ProcurementRequisition>, noticeService: NoticeService, dispatch?: NotificationDispatchService);
    remindOutstandingReceipts(): Promise<void>;
}
