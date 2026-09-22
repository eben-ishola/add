import { PayrollService } from '../../services/payroll/payroll.service';
import { PayrollAccountSwitchService } from '../../services/payroll/payroll-account-switch.service';
import { CbaService } from 'src/services/compensation/cba.service';
import { LeaveAllowanceApprovalApproveDto, LeaveAllowanceApprovalRejectDto } from 'src/dto/leave-allowance-approval.dto';
import { FinanceCommentDto, PayrollApprovalApproveDto, PayrollApprovalCommentDto, PayrollApprovalRejectDto } from 'src/dto/payroll-approval.dto';
export declare class PayrollController {
    private readonly payrollService;
    private readonly cbaService;
    private readonly payrollAccountSwitchService;
    constructor(payrollService: PayrollService, cbaService: CbaService, payrollAccountSwitchService: PayrollAccountSwitchService);
    calculatePayroll(payload: any): Promise<any>;
    calculateTotal(): Promise<any>;
    processPayroll(payload: any, user: any): Promise<any>;
    previewPayroll(payload: any, user: any): Promise<any>;
    getAttendanceSummary(payload: any, user: any): Promise<any>;
    createPayroll(payload: any, user: any): Promise<any>;
    getTaxConfigs(entity?: string): Promise<any>;
    saveTaxConfig(payload: any): Promise<any>;
    mapPayroll(payload: any): Promise<any>;
    findAll(page: number, limit: number, entity: any, user: any): Promise<any>;
    findAllMap(page: number, limit: number, entity: any, user: any): Promise<any>;
    generatePayroll(payload: any, user: any): Promise<any>;
    savePayrollPerformance(payload: any): Promise<any>;
    getPayrollPerformance(entity?: string, month?: string, staffId?: string): Promise<any>;
    getPayrollApprovals(user: any, status?: string, entity?: string, userId?: string, assignedId?: string, approverOnly?: string, assignedOnly?: string, workflowType?: string, month?: string, year?: string): Promise<any>;
    getLeaveAllowancePaidUsers(user: any, entity?: string, year?: string): Promise<any>;
    getApprovalStaff(approvalId: string, user: any): Promise<any>;
    getPayrollApprovalById(approvalId: string, user: any): Promise<any>;
    switchPayrollApprovalAccount(approvalId: string, body: {
        staffId?: string;
        employeeId?: string;
        accountType?: string;
        applyToAll?: boolean | string;
    }, user: any): Promise<any>;
    fetchSalaryCallOver(user: any, narration?: string, approvalId?: string, batchId?: string, entity?: string, month?: string, type?: string): Promise<{
        status: number;
        data: any[];
        comparison: any[];
        summary: {
            calloverCount: number;
            payrollCount: number;
            matched: number;
            mismatched: number;
            missing: number;
            unexpected: number;
            hasIssues: boolean;
            comparisonSkipped: boolean;
        };
        payrollCount?: undefined;
    } | {
        status: number;
        data: any[];
        payrollCount: number;
        comparison: import("../../utils/payroll/payroll-callover.util").PayrollCalloverComparisonRow[];
        summary: import("../../utils/payroll/payroll-callover.util").PayrollCalloverComparisonSummary;
    }>;
    updatePayrollApprovalComment(approvalId: string, payload: PayrollApprovalCommentDto, user: any): Promise<any>;
    updatePayrollApprovalFinanceComment(approvalId: string, payload: FinanceCommentDto, user: any): Promise<any>;
    getMyPayslips(userId: string, user: any): Promise<any>;
    requestPayslipApproval(payload: any, user: any): Promise<any>;
    getPayslipApprovals(user: any, status?: string, entity?: string): Promise<any>;
    getPayslipApprovalById(approvalId: string, user: any): Promise<any>;
    approvePayslipApproval(approvalId: string, user: any): Promise<any>;
    rejectPayslipApproval(approvalId: string, payload: PayrollApprovalRejectDto, user: any): Promise<any>;
    approvePayroll(approvalId: string, payload: PayrollApprovalApproveDto, user: any): Promise<any>;
    rejectPayroll(approvalId: string, payload: PayrollApprovalRejectDto, user: any): Promise<any>;
    markPostingComplete(approvalId: string, user: any): Promise<any>;
    getWorkflowConfigs(user: any, entity?: string): Promise<any>;
    getWorkflowRole(user: any, entity?: string, scanAll?: string): Promise<any>;
    getLeaveWorkflowRole(user: any, entity?: string, scanAll?: string): Promise<any>;
    saveWorkflowConfig(user: any, payload: any): Promise<any>;
    getLeaveWorkflowConfigs(user: any, entity?: string): Promise<any>;
    saveLeaveWorkflowConfig(user: any, payload: any): Promise<any>;
    getLeaveApprovals(user: any, status?: string, entity?: string, userId?: string, assignedId?: string, assignedOnly?: string): Promise<{
        status: number;
        data: (import("mongoose").FlattenMaps<import("../../schemas/leave-allowance-approval.schema").LeaveAllowanceApproval> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[];
    }>;
    getLeaveApprovalById(id: string, user: any): Promise<{
        status: number;
        data: import("mongoose").FlattenMaps<import("../../schemas/leave-allowance-approval.schema").LeaveAllowanceApproval> & Required<{
            _id: import("mongoose").FlattenMaps<unknown>;
        }> & {
            __v: number;
        };
    }>;
    approveLeaveApproval(id: string, user: any, body: LeaveAllowanceApprovalApproveDto): Promise<{
        status: number;
        message: string;
    }>;
    rejectLeaveApproval(id: string, user: any, body: LeaveAllowanceApprovalRejectDto): Promise<{
        status: number;
        message: string;
    }>;
    markLeaveApprovalPosted(id: string, user: any): Promise<{
        status: number;
        message: string;
    }>;
    updateLeaveApprovalFinanceComment(id: string, body: FinanceCommentDto, user: any): Promise<any>;
    switchLeaveApprovalAccount(id: string, body: {
        staffId?: string;
        employeeId?: string;
        accountType?: string;
        applyToAll?: boolean | string;
    }, user: any): Promise<any>;
    findByLevel(gradeLevel: string, entity: string): Promise<any>;
    fetchProcessedPayrollByStaffId(staffId: string, user: any): Promise<any>;
    fetchProcessedPayroll(entity: string, month: string, type?: string): Promise<any>;
    fetchProcessedPayrollById(id: string, user: any): Promise<any>;
    uploadXlsx(file: Express.Multer.File): Promise<any>;
    uploadCSV(file: Express.Multer.File): {
        message: string;
        file: string;
        fileName: string;
        filePath: string;
        fileUrl: string;
    };
    findById(id: string): Promise<import("../../schemas/payroll.schema").Payroll>;
}
