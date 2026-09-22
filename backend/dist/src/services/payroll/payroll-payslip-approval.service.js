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
exports.PayrollPayslipApprovalService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const payslipApproval_schema_1 = require("../../schemas/payslipApproval.schema");
const payroll_workflow_schema_1 = require("../../schemas/payroll-workflow.schema");
const user_service_1 = require("../user/user.service");
const notice_service_1 = require("../comms/notice.service");
const subsidiary_service_1 = require("../org/subsidiary.service");
const payroll_workflow_config_service_1 = require("./payroll-workflow-config.service");
const access_control_util_1 = require("../../utils/shared/access-control.util");
const payroll_approval_visibility_util_1 = require("../../utils/payroll/payroll-approval-visibility.util");
const payroll_access_util_1 = require("../../utils/payroll/payroll-access.util");
const payroll_identity_util_1 = require("../../utils/payroll/payroll-identity.util");
const payroll_period_util_1 = require("../../utils/payroll/payroll-period.util");
const payroll_display_util_1 = require("../../utils/payroll/payroll-display.util");
const PAYSLIP_APPROVAL_STATUS = {
    PENDING_REVIEW: 'PENDING_REVIEW',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
};
const access_control_util_2 = require("../../utils/shared/access-control.util");
const PAYSLIP_SUPER_ADMIN_ROLE_NAMES = access_control_util_2.SUPER_ADMIN_ROLE_NAME_SET;
let PayrollPayslipApprovalService = class PayrollPayslipApprovalService {
    constructor(processedPayrollModel, payslipApprovalModel, payrollWorkflowModel, staffService, noticeService, entityService, payrollWorkflowConfigService) {
        this.processedPayrollModel = processedPayrollModel;
        this.payslipApprovalModel = payslipApprovalModel;
        this.payrollWorkflowModel = payrollWorkflowModel;
        this.staffService = staffService;
        this.noticeService = noticeService;
        this.entityService = entityService;
        this.payrollWorkflowConfigService = payrollWorkflowConfigService;
    }
    hasFinanceScope(user) {
        return (0, access_control_util_1.userHasScope)(user, ['finance', 'group']);
    }
    userHasSuperAdminRole(user) {
        return (0, payroll_access_util_1.payrollUserHasSuperAdminRole)(user, PAYSLIP_SUPER_ADMIN_ROLE_NAMES);
    }
    async normalizeEntityIdStrict(value) {
        const resolved = (0, payroll_identity_util_1.resolvePayrollEntityId)(value);
        if (!resolved) {
            throw new common_1.BadRequestException('Entity is required');
        }
        const normalized = String(resolved).trim();
        if (mongoose_2.Types.ObjectId.isValid(normalized)) {
            return new mongoose_2.Types.ObjectId(normalized).toHexString();
        }
        const entity = await this.entityService.getSubsidiaryByShort(normalized).catch(() => null);
        if (entity?._id) {
            return String(entity._id);
        }
        throw new common_1.BadRequestException('Entity is required');
    }
    async loadPayrollWorkflowConfig(entityId) {
        if (this.payrollWorkflowConfigService) {
            return this.payrollWorkflowConfigService.loadPayrollWorkflowConfig(entityId);
        }
        const normalizedEntityId = await this.normalizeEntityIdStrict(entityId);
        const workflow = await this.payrollWorkflowModel
            .findOne({ entity: new mongoose_2.Types.ObjectId(normalizedEntityId) })
            .lean();
        if (!workflow) {
            throw new common_1.BadRequestException('Payroll workflow configuration is missing for this entity.');
        }
        const reviewerIds = (0, payroll_identity_util_1.normalizePayrollUserIdList)(workflow.reviewerIds);
        const approverIds = (0, payroll_identity_util_1.normalizePayrollUserIdList)(workflow.approverIds);
        const auditViewerIds = (0, payroll_identity_util_1.normalizePayrollUserIdList)(workflow.auditViewerIds);
        const postingIds = (0, payroll_identity_util_1.normalizePayrollUserIdList)(workflow.postingIds);
        return {
            workflow,
            reviewerIds,
            approverIds,
            auditViewerIds,
            postingIds,
            entityId: normalizedEntityId,
        };
    }
    buildPayslipStaffQuery(identifiers) {
        return (0, payroll_identity_util_1.buildPayrollStaffIdentityQuery)(identifiers);
    }
    buildPayslipPeriodQuery(periodKey, start, end) {
        return {
            $or: [
                { periodKey },
                { periodKey: periodKey.toLowerCase() },
                { periodDate: { $gte: start, $lt: end } },
                { createdAt: { $gte: start, $lt: end } },
            ],
        };
    }
    buildProcessedPayrollEntityMatch(entityId) {
        return (0, payroll_identity_util_1.buildProcessedPayrollEntityMatch)(entityId);
    }
    async updateProcessedPayrollPayslipApproval(identifiers, periodWindow, entityId, status) {
        if (!identifiers.length)
            return;
        const staffQuery = this.buildPayslipStaffQuery(identifiers);
        const periodQuery = this.buildPayslipPeriodQuery(periodWindow.periodKey, periodWindow.start, periodWindow.end);
        const entityQuery = this.buildProcessedPayrollEntityMatch(entityId);
        const statusFilter = status === 'Approved' ? {} : { payslipApproval: { $ne: 'Approved' } };
        await this.processedPayrollModel.updateMany({ ...staffQuery, ...periodQuery, ...entityQuery, ...statusFilter }, { $set: { payslipApproval: status } });
    }
    async requestPayslipApproval(payload, requester) {
        const isPrivileged = this.hasFinanceScope(requester) || this.userHasSuperAdminRole(requester);
        const requesterIdentifiers = (0, payroll_identity_util_1.collectPayrollIdentifierValues)(requester?._id, requester?.id, requester?.userId, requester?.staffId, requester?.employeeId, requester?.email);
        const requestedFor = payload?.staffId ??
            payload?.employeeId ??
            payload?.userId ??
            payload?.staffObjectId ??
            payload?.staff ??
            null;
        if (!isPrivileged && requestedFor) {
            const target = String(requestedFor).trim();
            if (target && !requesterIdentifiers.includes(target)) {
                throw new common_1.ForbiddenException('You can only request your own payslip approval.');
            }
        }
        const targetRef = requestedFor ??
            requester?.staffId ??
            requester?.employeeId ??
            requester?._id ??
            requester?.id ??
            requester?.userId ??
            null;
        if (!targetRef) {
            throw new common_1.BadRequestException('Staff ID is required');
        }
        const staff = await this.staffService.getById(String(targetRef)).catch(() => null);
        const staffId = typeof staff?.staffId === 'string' && staff.staffId.trim()
            ? staff.staffId.trim()
            : String(targetRef).trim();
        const staffObjectId = staff?._id ? String(staff._id) : (0, payroll_identity_util_1.normalizePayrollUserId)(targetRef) ?? undefined;
        const employeeId = staff?.employeeId ?? staff?.id ?? undefined;
        const staffName = staff
            ? `${staff?.lastName ?? ''} ${staff?.firstName ?? ''}`.trim()
            : undefined;
        const periodWindow = (0, payroll_period_util_1.resolvePayslipPeriodWindow)(payload?.periodKey ?? payload?.period ?? payload?.month ?? payload?.periodDate);
        let entityRef = payload?.entity ?? staff?.entity ?? null;
        if (!entityRef) {
            const fallbackIdentifiers = (0, payroll_identity_util_1.collectPayrollIdentifierValues)(staffId, staffObjectId, employeeId, targetRef);
            const fallbackRow = await this.processedPayrollModel
                .findOne(this.buildPayslipStaffQuery(fallbackIdentifiers))
                .lean();
            entityRef = fallbackRow?.entity ?? null;
        }
        if (!entityRef) {
            throw new common_1.BadRequestException('Entity is required to request payslip approval.');
        }
        const { reviewerIds, approverIds, entityId } = await this.loadPayrollWorkflowConfig(entityRef);
        if (!approverIds.length) {
            throw new common_1.BadRequestException('At least one approver must be configured for this entity.');
        }
        const identifiers = (0, payroll_identity_util_1.collectPayrollIdentifierValues)(staffId, staffObjectId, employeeId, targetRef, staff?.userId, staff?.email);
        const staffQuery = this.buildPayslipStaffQuery(identifiers);
        const periodQuery = this.buildPayslipPeriodQuery(periodWindow.periodKey, periodWindow.start, periodWindow.end);
        const entityQuery = this.buildProcessedPayrollEntityMatch(entityId);
        const existingPayroll = await this.processedPayrollModel
            .findOne({ ...staffQuery, ...periodQuery, ...entityQuery })
            .lean();
        if (!existingPayroll) {
            throw new common_1.NotFoundException('No processed payroll found for the requested period.');
        }
        const alreadyApproved = await this.processedPayrollModel.exists({
            ...staffQuery,
            ...periodQuery,
            ...entityQuery,
            payslipApproval: 'Approved',
        });
        if (alreadyApproved) {
            return { status: 200, message: 'Payslip already approved for this period.' };
        }
        const approvalQuery = {
            periodKey: periodWindow.periodKey,
            status: { $in: [PAYSLIP_APPROVAL_STATUS.PENDING_REVIEW, PAYSLIP_APPROVAL_STATUS.PENDING_APPROVAL] },
        };
        const approvalOr = [];
        if (staffId)
            approvalOr.push({ staffId });
        if (staffObjectId)
            approvalOr.push({ staffObjectId });
        if (employeeId)
            approvalOr.push({ employeeId });
        if (approvalOr.length) {
            approvalQuery.$or = approvalOr;
        }
        const pendingApproval = await this.payslipApprovalModel.findOne(approvalQuery).lean();
        if (pendingApproval) {
            return { status: 200, message: 'Payslip approval already pending.', data: pendingApproval };
        }
        const hasReviewers = reviewerIds.length > 0;
        const status = hasReviewers
            ? PAYSLIP_APPROVAL_STATUS.PENDING_REVIEW
            : PAYSLIP_APPROVAL_STATUS.PENDING_APPROVAL;
        const currentStage = hasReviewers ? 'REVIEWER' : 'APPROVER';
        const requesterId = (0, payroll_identity_util_1.normalizePayrollUserId)(requester?._id);
        const approval = await this.payslipApprovalModel.create({
            staffId,
            staffObjectId,
            employeeId,
            staffName,
            entity: entityId,
            periodKey: periodWindow.periodKey,
            period: periodWindow.periodLabel,
            periodDate: periodWindow.periodDate,
            status,
            currentStage,
            reviewerIds,
            approverIds,
            requestedBy: requesterId ?? undefined,
            requestedByName: (0, payroll_display_util_1.composePayrollUserName)(requester),
        });
        await this.updateProcessedPayrollPayslipApproval(identifiers, periodWindow, entityId, 'Pending');
        const recipients = hasReviewers ? reviewerIds : approverIds;
        const subjectName = staffName || staffId || 'staff member';
        const noticeMessage = `Payslip approval requested for ${subjectName} (${periodWindow.periodLabel}).`;
        await Promise.all(recipients.map((userId) => this.noticeService.createNotice({
            userId,
            message: noticeMessage,
            link: '/payroll/payslip-approvals',
            type: 'payslip-approval',
        })));
        return {
            status: 200,
            message: 'Payslip approval request submitted.',
            data: approval,
        };
    }
    async getPayslipApprovals(user, status, entity) {
        const query = {};
        if (status) {
            query.status = status;
        }
        else {
            query.status = {
                $in: [PAYSLIP_APPROVAL_STATUS.PENDING_REVIEW, PAYSLIP_APPROVAL_STATUS.PENDING_APPROVAL],
            };
        }
        if (entity) {
            query.entity = entity;
        }
        const userId = (0, payroll_identity_util_1.normalizePayrollUserId)(user?._id);
        const hasFinanceScope = this.hasFinanceScope(user) || this.userHasSuperAdminRole(user);
        if (!hasFinanceScope) {
            if (!userId) {
                throw new common_1.ForbiddenException('You are not allowed to view payslip approvals.');
            }
            query.$or = [{ requestedBy: userId }, { reviewerIds: userId }, { approverIds: userId }];
        }
        const approvals = await this.payslipApprovalModel.find(query).sort({ createdAt: -1 }).lean();
        return { status: 200, data: approvals };
    }
    async getPayslipApprovalById(user, approvalId) {
        const approval = await this.payslipApprovalModel.findById(approvalId).lean();
        if (!approval) {
            throw new common_1.NotFoundException('Payslip approval request not found');
        }
        const hasFinanceScope = this.hasFinanceScope(user) || this.userHasSuperAdminRole(user);
        const canView = hasFinanceScope ||
            (0, payroll_approval_visibility_util_1.isPayslipApprovalReviewer)(user, approval) ||
            (0, payroll_approval_visibility_util_1.isPayslipApprovalApprover)(user, approval) ||
            (approval.requestedBy && (0, payroll_identity_util_1.normalizePayrollUserId)(user?._id) === approval.requestedBy);
        if (!canView) {
            throw new common_1.ForbiddenException('You are not allowed to view this payslip approval request');
        }
        return { status: 200, data: approval };
    }
    async approvePayslipApproval(approvalId, user) {
        const approval = await this.payslipApprovalModel.findById(approvalId);
        if (!approval) {
            throw new common_1.NotFoundException('Payslip approval request not found');
        }
        if (approval.status === PAYSLIP_APPROVAL_STATUS.APPROVED) {
            throw new common_1.BadRequestException('Payslip approval already completed');
        }
        if (approval.status === PAYSLIP_APPROVAL_STATUS.REJECTED) {
            throw new common_1.BadRequestException('Payslip approval has been rejected');
        }
        const userId = (0, payroll_identity_util_1.normalizePayrollUserId)(user?._id);
        const hasFinanceScope = this.hasFinanceScope(user);
        const isSuperAdmin = this.userHasSuperAdminRole(user);
        if (approval.status === PAYSLIP_APPROVAL_STATUS.PENDING_REVIEW) {
            if (!(0, payroll_approval_visibility_util_1.isPayslipApprovalReviewer)(user, approval) && !hasFinanceScope && !isSuperAdmin) {
                throw new common_1.ForbiddenException('Only configured reviewers can approve at this stage');
            }
            approval.reviewerApprovedBy = userId ?? approval.reviewerApprovedBy;
            approval.reviewerApprovedAt = new Date();
            approval.status = PAYSLIP_APPROVAL_STATUS.PENDING_APPROVAL;
            approval.currentStage = 'APPROVER';
            await approval.save();
            const recipients = approval.approverIds ?? [];
            const subjectName = approval.staffName ?? approval.staffId ?? 'staff member';
            const noticeMessage = `Payslip approval for ${subjectName} (${approval.period ?? approval.periodKey}) requires your approval.`;
            await Promise.all(recipients.map((recipientId) => this.noticeService.createNotice({
                userId: recipientId,
                message: noticeMessage,
                link: '/payroll/payslip-approvals',
                type: 'payslip-approval',
            })));
            return { status: 200, message: 'Payslip approval escalated to final approvers.' };
        }
        if (approval.status === PAYSLIP_APPROVAL_STATUS.PENDING_APPROVAL) {
            if (!(0, payroll_approval_visibility_util_1.isPayslipApprovalApprover)(user, approval) && !hasFinanceScope && !isSuperAdmin) {
                throw new common_1.ForbiddenException('Only configured approvers can approve at this stage');
            }
            approval.approverApprovedBy = userId ?? approval.approverApprovedBy;
            approval.approverApprovedAt = new Date();
            approval.status = PAYSLIP_APPROVAL_STATUS.APPROVED;
            approval.currentStage = 'APPROVED';
            await approval.save();
            const periodWindow = (0, payroll_period_util_1.resolvePayslipPeriodWindow)(approval.periodKey ?? approval.periodDate);
            const identifiers = (0, payroll_identity_util_1.collectPayrollIdentifierValues)(approval.staffId, approval.staffObjectId, approval.employeeId);
            await this.updateProcessedPayrollPayslipApproval(identifiers, periodWindow, approval.entity, 'Approved');
            if (approval.requestedBy) {
                const noticeMessage = `Payslip approval completed for ${approval.period ?? approval.periodKey}.`;
                await this.noticeService.createNotice({
                    userId: approval.requestedBy,
                    message: noticeMessage,
                    link: `/my-payslips`,
                    type: 'payslip-approval-completed',
                });
            }
            return { status: 200, message: 'Payslip approval completed.' };
        }
        throw new common_1.BadRequestException('Invalid payslip approval status');
    }
    async rejectPayslipApproval(approvalId, user, reason) {
        const approval = await this.payslipApprovalModel.findById(approvalId);
        if (!approval) {
            throw new common_1.NotFoundException('Payslip approval request not found');
        }
        if (approval.status === PAYSLIP_APPROVAL_STATUS.APPROVED) {
            throw new common_1.BadRequestException('Payslip approval already completed');
        }
        if (approval.status === PAYSLIP_APPROVAL_STATUS.REJECTED) {
            throw new common_1.BadRequestException('Payslip approval has already been rejected');
        }
        const hasFinanceScope = this.hasFinanceScope(user);
        const isSuperAdmin = this.userHasSuperAdminRole(user);
        if (approval.status === PAYSLIP_APPROVAL_STATUS.PENDING_REVIEW) {
            if (!(0, payroll_approval_visibility_util_1.isPayslipApprovalReviewer)(user, approval) && !hasFinanceScope && !isSuperAdmin) {
                throw new common_1.ForbiddenException('Only configured reviewers can reject at this stage');
            }
        }
        else if (approval.status === PAYSLIP_APPROVAL_STATUS.PENDING_APPROVAL) {
            if (!(0, payroll_approval_visibility_util_1.isPayslipApprovalApprover)(user, approval) && !hasFinanceScope && !isSuperAdmin) {
                throw new common_1.ForbiddenException('Only configured approvers can reject at this stage');
            }
        }
        approval.status = PAYSLIP_APPROVAL_STATUS.REJECTED;
        approval.currentStage = 'REJECTED';
        approval.rejectionReason = reason;
        await approval.save();
        const periodWindow = (0, payroll_period_util_1.resolvePayslipPeriodWindow)(approval.periodKey ?? approval.periodDate);
        const identifiers = (0, payroll_identity_util_1.collectPayrollIdentifierValues)(approval.staffId, approval.staffObjectId, approval.employeeId);
        await this.updateProcessedPayrollPayslipApproval(identifiers, periodWindow, approval.entity, 'Rejected');
        if (approval.requestedBy) {
            const noticeMessage = `Payslip approval for ${approval.period ?? approval.periodKey} was rejected.`;
            await this.noticeService.createNotice({
                userId: approval.requestedBy,
                message: noticeMessage,
                link: `/my-payslips`,
                type: 'payslip-approval-rejected',
            });
        }
        return { status: 200, message: 'Payslip approval rejected.' };
    }
};
exports.PayrollPayslipApprovalService = PayrollPayslipApprovalService;
exports.PayrollPayslipApprovalService = PayrollPayslipApprovalService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('ProcessedPayroll')),
    __param(1, (0, mongoose_1.InjectModel)(payslipApproval_schema_1.PayslipApproval.name)),
    __param(2, (0, mongoose_1.InjectModel)(payroll_workflow_schema_1.PayrollWorkflowConfig.name)),
    __param(6, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        user_service_1.StaffService,
        notice_service_1.NoticeService,
        subsidiary_service_1.SubsidiaryService,
        payroll_workflow_config_service_1.PayrollWorkflowConfigService])
], PayrollPayslipApprovalService);
//# sourceMappingURL=payroll-payslip-approval.service.js.map