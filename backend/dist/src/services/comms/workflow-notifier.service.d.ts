import { Model } from 'mongoose';
import { NoticeService } from 'src/services/comms/notice.service';
import { MailService } from 'src/services/comms/mail.service';
import { User } from 'src/schemas/user.schema';
import { Subsidiary } from 'src/schemas/subsidiary.schema';
export type WorkflowModule = 'payroll' | 'leave_allowance' | 'transport_allowance' | 'inconvenience_allowance' | 'procurement' | 'others';
export type WorkflowEvent = 'submitted' | 'reviewed' | 'approved' | 'posted' | 'rejected';
export interface DispatchInput {
    module: WorkflowModule;
    event: WorkflowEvent;
    doc: any;
    skipStageRecipients?: boolean;
    extraRecipients?: string[];
}
export declare class WorkflowNotifier {
    private readonly noticeService;
    private readonly mailService?;
    private readonly userModel?;
    private readonly subsidiaryModel?;
    private readonly logger;
    constructor(noticeService: NoticeService, mailService?: MailService, userModel?: Model<User>, subsidiaryModel?: Model<Subsidiary>);
    dispatch(input: DispatchInput): Promise<void>;
    private sendEmails;
    private resolveContext;
    private resolvePayrollContext;
    private resolveLeaveAllowanceContext;
    private resolveProcurementContext;
    private procurementRecipients;
    private resolveInconvenienceContext;
    private resolveTransportContext;
    private resolveOthersContext;
    private recipientsFromArrayDoc;
    private recipientsFromOthersDoc;
    private normalizeId;
    private normalizeIdList;
    private formatPayrollLabel;
    private payrollNoticeType;
    private eventVerb;
    private stageMessage;
    private initiatorMessage;
    private titleCase;
    private formatMonthLabel;
    private formatMonthLabelFromYearMonth;
    private formatMonthOnlyLabel;
    private lookupEntityName;
}
