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
exports.PayrollApprovalTransitionService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const payrollApproval_schema_1 = require("../../schemas/payrollApproval.schema");
const access_control_util_1 = require("../../utils/shared/access-control.util");
const payroll_access_util_1 = require("../../utils/payroll/payroll-access.util");
const payroll_approval_visibility_util_1 = require("../../utils/payroll/payroll-approval-visibility.util");
const payroll_identity_util_1 = require("../../utils/payroll/payroll-identity.util");
const payroll_display_util_1 = require("../../utils/payroll/payroll-display.util");
const subsidiary_service_1 = require("../org/subsidiary.service");
const workflow_notifier_service_1 = require("../comms/workflow-notifier.service");
const PAYROLL_APPROVAL_STATUS = {
    PENDING_REVIEW: 'PENDING_REVIEW',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    PENDING_POSTING: 'PENDING_POSTING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
};
const access_control_util_2 = require("../../utils/shared/access-control.util");
const PAYROLL_TRANSITION_SUPER_ADMIN_ROLE_NAMES = access_control_util_2.SUPER_ADMIN_ROLE_NAME_SET;
let PayrollApprovalTransitionService = class PayrollApprovalTransitionService {
    constructor(payrollApprovalModel, entityService, workflowNotifier) {
        this.payrollApprovalModel = payrollApprovalModel;
        this.entityService = entityService;
        this.workflowNotifier = workflowNotifier;
    }
    async approvePayroll(approvalId, user, comment, handlers) {
        const approval = await this.payrollApprovalModel.findById(approvalId);
        if (!approval) {
            throw new common_1.NotFoundException('Payroll approval request not found');
        }
        this.assertCanMutate(user);
        if (approval.status === PAYROLL_APPROVAL_STATUS.APPROVED) {
            throw new common_1.BadRequestException('Payroll batch already approved');
        }
        if (approval.status === PAYROLL_APPROVAL_STATUS.REJECTED) {
            throw new common_1.BadRequestException('Payroll batch has been rejected');
        }
        const userId = (0, payroll_identity_util_1.normalizePayrollUserId)(user?._id);
        const actorName = (0, payroll_display_util_1.composePayrollUserName)(user);
        const entityName = await this.resolveEntityName(approval.entity, handlers);
        const hasFinanceScope = this.hasFinanceScope(user);
        const isSuperAdmin = this.userHasSuperAdminRole(user);
        const reviewerComment = typeof comment === 'string' && comment.trim() ? comment.trim() : '';
        if (approval.status === PAYROLL_APPROVAL_STATUS.PENDING_REVIEW) {
            if (!(0, payroll_approval_visibility_util_1.isPayrollApprovalReviewer)(user, approval) && !hasFinanceScope) {
                throw new common_1.ForbiddenException('Only configured reviewers can approve at this stage');
            }
            approval.reviewerApprovedBy = userId ?? approval.reviewerApprovedBy;
            approval.reviewerApprovedByName = actorName ?? approval.reviewerApprovedByName;
            approval.reviewerApprovedAt = new Date();
            if (reviewerComment) {
                approval.reviewerComment = reviewerComment;
            }
            approval.status = PAYROLL_APPROVAL_STATUS.PENDING_APPROVAL;
            approval.currentStage = 'APPROVER';
            await approval.save();
            await handlers.syncLeaveAllowanceApprovalRecord(approval);
            const monthLabel = (0, payroll_display_util_1.resolvePayrollApprovalMonthLabel)(approval);
            await handlers.notifyStageAssignees(approval.approverIds ?? [], approval._id.toString(), entityName, monthLabel, 'APPROVER');
            await this.workflowNotifier?.dispatch({
                module: 'payroll',
                event: 'reviewed',
                doc: approval,
                skipStageRecipients: true,
            });
            return {
                status: 200,
                message: 'Payroll approved and escalated to final approvers.',
            };
        }
        if (approval.status === PAYROLL_APPROVAL_STATUS.PENDING_APPROVAL) {
            if (!(0, payroll_approval_visibility_util_1.isPayrollApprovalApprover)(user, approval) && !hasFinanceScope) {
                throw new common_1.ForbiddenException('Only configured approvers can approve at this stage');
            }
            approval.approverApprovedBy = userId ?? approval.approverApprovedBy;
            approval.approverApprovedByName = actorName ?? approval.approverApprovedByName;
            approval.approverApprovedAt = new Date();
            approval.status = PAYROLL_APPROVAL_STATUS.PENDING_POSTING;
            approval.currentStage = 'POSTING';
            await this.assertNoExistingApprovedPayroll(approval);
            const periodDate = this.resolveProcessingPeriodDate(approval);
            await handlers.persistProcessedPayroll(approval.batchId, approval.data, approval.entity, periodDate);
            await approval.save();
            await handlers.syncLeaveAllowanceApprovalRecord(approval);
            const monthLabel = (0, payroll_display_util_1.resolvePayrollApprovalMonthLabel)(approval);
            await handlers.notifyStageAssignees(approval.postingIds ?? [], approval._id.toString(), entityName, monthLabel, 'POSTING');
            await this.workflowNotifier?.dispatch({
                module: 'payroll',
                event: 'approved',
                doc: approval,
                skipStageRecipients: true,
            });
            return {
                status: 200,
                message: 'Payroll approved and forwarded for posting.',
            };
        }
        if (approval.status === PAYROLL_APPROVAL_STATUS.PENDING_POSTING) {
            const canPost = (0, payroll_approval_visibility_util_1.isPayrollApprovalPoster)(user, approval) || hasFinanceScope || isSuperAdmin;
            if (!canPost) {
                throw new common_1.ForbiddenException('Only the configured poster or super admin can complete posting at this stage');
            }
            approval.postingApprovedBy = userId ?? approval.postingApprovedBy;
            approval.postingApprovedByName = actorName ?? approval.postingApprovedByName;
            approval.postingApprovedAt = new Date();
            approval.status = PAYROLL_APPROVAL_STATUS.APPROVED;
            approval.currentStage = 'POSTING';
            approval.processedAt = new Date();
            const periodDate = this.resolveProcessingPeriodDate(approval);
            await handlers.persistProcessedPayroll(approval.batchId, approval.data, approval.entity, periodDate);
            await approval.save();
            await handlers.syncLeaveAllowanceApprovalRecord(approval);
            await handlers.notifyCompletion(approval, entityName);
            await this.workflowNotifier?.dispatch({
                module: 'payroll',
                event: 'posted',
                doc: approval,
                skipStageRecipients: true,
            });
            return {
                status: 200,
                message: 'Payroll posted and processed successfully.',
            };
        }
        throw new common_1.BadRequestException('Invalid approval status');
    }
    async rejectPayroll(approvalId, user, reason, handlers) {
        const approval = await this.payrollApprovalModel.findById(approvalId);
        if (!approval) {
            throw new common_1.NotFoundException('Payroll approval request not found');
        }
        this.assertCanMutate(user);
        if (approval.status === PAYROLL_APPROVAL_STATUS.APPROVED) {
            throw new common_1.BadRequestException('Payroll batch already approved');
        }
        if (approval.status === PAYROLL_APPROVAL_STATUS.REJECTED) {
            throw new common_1.BadRequestException('Payroll batch has already been rejected');
        }
        const hasFinanceScope = this.hasFinanceScope(user);
        const entityName = await this.resolveEntityName(approval.entity, handlers);
        if (approval.status === PAYROLL_APPROVAL_STATUS.PENDING_REVIEW) {
            if (!(0, payroll_approval_visibility_util_1.isPayrollApprovalReviewer)(user, approval) && !hasFinanceScope) {
                throw new common_1.ForbiddenException('Only the assigned reviewer can reject at this stage');
            }
        }
        else if (approval.status === PAYROLL_APPROVAL_STATUS.PENDING_APPROVAL) {
            if (!(0, payroll_approval_visibility_util_1.isPayrollApprovalApprover)(user, approval) && !hasFinanceScope) {
                throw new common_1.ForbiddenException('Only the assigned approver can reject at this stage');
            }
        }
        else if (approval.status === PAYROLL_APPROVAL_STATUS.PENDING_POSTING) {
            const canPost = (0, payroll_approval_visibility_util_1.isPayrollApprovalPoster)(user, approval) ||
                hasFinanceScope ||
                this.userHasSuperAdminRole(user);
            if (!canPost) {
                throw new common_1.ForbiddenException('Only the assigned poster can reject at this stage');
            }
        }
        else {
            throw new common_1.BadRequestException('This payroll batch can no longer be rejected');
        }
        approval.status = PAYROLL_APPROVAL_STATUS.REJECTED;
        approval.rejectionReason = reason;
        await approval.save();
        await handlers.syncLeaveAllowanceApprovalRecord(approval);
        await handlers.notifyRejection(approval, entityName);
        await this.workflowNotifier?.dispatch({
            module: 'payroll',
            event: 'rejected',
            doc: approval,
            skipStageRecipients: true,
        });
        return { status: 200, message: 'Payroll batch rejected successfully.' };
    }
    async markPostingComplete(approvalId, user, handlers) {
        const approval = await this.payrollApprovalModel.findById(approvalId);
        if (!approval) {
            throw new common_1.NotFoundException('Payroll approval request not found');
        }
        this.assertCanMutate(user);
        const canPost = (0, payroll_approval_visibility_util_1.isPayrollApprovalPoster)(user, approval) ||
            this.hasFinanceScope(user) ||
            this.userHasSuperAdminRole(user);
        if (!canPost) {
            throw new common_1.ForbiddenException('Only the posting assignee or super admin can mark posting as completed.');
        }
        const userId = (0, payroll_identity_util_1.normalizePayrollUserId)(user?._id);
        const actorName = (0, payroll_display_util_1.composePayrollUserName)(user);
        approval.postingApprovedBy = userId ?? approval.postingApprovedBy;
        approval.postingApprovedByName = actorName ?? approval.postingApprovedByName;
        approval.postingApprovedAt = new Date();
        approval.status = PAYROLL_APPROVAL_STATUS.APPROVED;
        approval.currentStage = 'POSTED';
        await approval.save();
        await handlers.syncLeaveAllowanceApprovalRecord(approval);
        return { message: 'Posting status updated successfully', data: approval };
    }
    assertCanMutate(user) {
        if ((0, payroll_access_util_1.isPayrollAuditDepartment)(user)) {
            throw new common_1.ForbiddenException('Audit department has read-only access to payroll approvals.');
        }
    }
    hasFinanceScope(user) {
        return (0, access_control_util_1.userHasScope)(user, ['finance', 'group']);
    }
    userHasSuperAdminRole(user) {
        return (0, payroll_access_util_1.payrollUserHasSuperAdminRole)(user, PAYROLL_TRANSITION_SUPER_ADMIN_ROLE_NAMES);
    }
    async assertNoExistingApprovedPayroll(approval) {
        const entityId = await this.normalizeEntityIdStrict(approval.entity);
        const refDate = approval.processedAt ?? approval.createdAt ?? new Date();
        const periodStart = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
        const periodEnd = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 1);
        const types = (approval.types?.length
            ? approval.types
            : approval.data.map((row) => row?.type).filter(Boolean)) || [];
        const uniqueTypes = Array.from(new Set(types.length ? types : ['salary']));
        const entityVariants = [entityId, approval.entity].filter(Boolean);
        const existing = await this.payrollApprovalModel.exists({
            _id: { $ne: approval._id },
            entity: { $in: entityVariants },
            types: { $in: uniqueTypes },
            status: 'APPROVED',
            createdAt: { $gte: periodStart, $lt: periodEnd },
        });
        if (existing) {
            throw new common_1.BadRequestException(`A processed payroll already exists for ${uniqueTypes.join(', ')} in ${periodStart.toLocaleString('default', {
                month: 'long',
                year: 'numeric',
            })}.`);
        }
    }
    resolveProcessingPeriodDate(approval) {
        return (approval.processedAt ??
            approval.postingApprovedAt ??
            approval.approverApprovedAt ??
            approval.reviewerApprovedAt ??
            approval.createdAt ??
            new Date());
    }
    resolveEntityId(input) {
        return (0, payroll_identity_util_1.resolvePayrollEntityId)(input);
    }
    async normalizeEntityIdStrict(value) {
        const resolved = this.resolveEntityId(value);
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
    async resolveEntityName(entityRef, handlers) {
        if (handlers?.resolveEntityName) {
            return handlers.resolveEntityName(entityRef);
        }
        const candidate = entityRef?.data ?? entityRef;
        if (candidate && typeof candidate === 'object') {
            const label = candidate?.name ??
                candidate?.short ??
                candidate?.title ??
                candidate?.code ??
                candidate?.abbr ??
                candidate?.label ??
                candidate?.entityName ??
                candidate?.subsidiaryName;
            if (label) {
                return String(label).trim();
            }
        }
        const rawText = typeof candidate === 'string' ? candidate.trim() : '';
        if (rawText && !mongoose_2.Types.ObjectId.isValid(rawText)) {
            const entityByShort = await this.entityService
                .getSubsidiaryByShort(rawText)
                .catch(() => null);
            const shortLabel = entityByShort?.name ?? entityByShort?.short;
            if (shortLabel) {
                return String(shortLabel).trim();
            }
            return rawText;
        }
        const entityId = this.resolveEntityId(candidate ?? entityRef);
        if (!entityId)
            return 'the entity';
        try {
            const entity = await this.entityService.findSubsidiaryById(entityId);
            const resolved = entity?.data?.name || entity?.data?.short;
            return resolved ? String(resolved).trim() : 'the entity';
        }
        catch {
            return 'the entity';
        }
    }
};
exports.PayrollApprovalTransitionService = PayrollApprovalTransitionService;
exports.PayrollApprovalTransitionService = PayrollApprovalTransitionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(payrollApproval_schema_1.PayrollApproval.name)),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        subsidiary_service_1.SubsidiaryService,
        workflow_notifier_service_1.WorkflowNotifier])
], PayrollApprovalTransitionService);
//# sourceMappingURL=payroll-approval-transition.service.js.map