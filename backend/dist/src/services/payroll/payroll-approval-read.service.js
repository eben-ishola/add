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
exports.PayrollApprovalReadService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const payrollApproval_schema_1 = require("../../schemas/payrollApproval.schema");
const user_schema_1 = require("../../schemas/user.schema");
const user_service_1 = require("../user/user.service");
let PayrollApprovalReadService = class PayrollApprovalReadService {
    constructor(payrollApprovalModel, staffModel, staffService) {
        this.payrollApprovalModel = payrollApprovalModel;
        this.staffModel = staffModel;
        this.staffService = staffService;
    }
    async getPayrollApprovals(params, handlers) {
        const { user, status, entity, approverOnly = false, assignedOnly = false, userIdFilter, workflowType, month, year, } = params;
        const query = {};
        if (workflowType) {
            query.workflowType = workflowType;
        }
        else {
            query.workflowType = { $ne: 'leave-allowance' };
        }
        const normalizedStatus = typeof status === 'string' && status.trim() ? status.trim().toUpperCase() : undefined;
        const userId = handlers.normalizeUserId(user?._id);
        const currentUserIdentifiers = this.normalizeIdentifierList(handlers, user?.id, user?._id, user?.userId, user?.email);
        const requestedUserIdentifiers = this.normalizeIdentifierList(handlers, userIdFilter);
        const currentUserIdentifierSet = new Set(currentUserIdentifiers.map((value) => value.toLowerCase()));
        const requestedMatchesCurrent = requestedUserIdentifiers.some((value) => currentUserIdentifierSet.has(value.toLowerCase()));
        const targetUserIdentifiers = requestedUserIdentifiers.length
            ? (requestedMatchesCurrent
                ? Array.from(new Set([...requestedUserIdentifiers, ...currentUserIdentifiers]))
                : requestedUserIdentifiers)
            : currentUserIdentifiers;
        const targetUserObjectIds = targetUserIdentifiers
            .filter((value) => mongoose_2.Types.ObjectId.isValid(value))
            .map((value) => new mongoose_2.Types.ObjectId(value));
        const isSuperAdmin = handlers.userHasSuperAdminRole(user);
        const isFinanceOrAudit = handlers.hasFinanceScope(user) || handlers.isAuditDepartment(user);
        const restrictToUser = assignedOnly === true || requestedUserIdentifiers.length > 0;
        const hasSuperAdminAccess = isSuperAdmin && !restrictToUser;
        const hasFinanceOrAuditAccess = isFinanceOrAudit && !restrictToUser;
        const requestedEntityId = handlers.resolveEntityId(entity);
        if (requestedUserIdentifiers.length && !isSuperAdmin && !isFinanceOrAudit) {
            const currentUserSet = new Set(currentUserIdentifiers.map((value) => value.toLowerCase()));
            const requestingOwnScope = requestedUserIdentifiers.some((value) => currentUserSet.has(value.toLowerCase()));
            if (!requestingOwnScope) {
                throw new common_1.ForbiddenException('You are not allowed to filter payroll approvals for another user.');
            }
        }
        if (requestedEntityId) {
            query.entity = requestedEntityId;
        }
        if (hasFinanceOrAuditAccess && !hasSuperAdminAccess && !approverOnly) {
            const scoped = this.applyFinanceEntityScope(query, user, requestedEntityId, handlers);
            if (scoped)
                return scoped;
        }
        const emptyResult = this.applyRoleStatusScope(query, {
            approverOnly,
            normalizedStatus,
            targetUserIdentifiers,
            targetUserObjectIds,
            userId,
            hasSuperAdminAccess,
            hasFinanceOrAuditAccess,
        }, handlers);
        if (emptyResult)
            return emptyResult;
        if (!query.createdAt) {
            const now = new Date();
            const m = Number.isFinite(month) && month >= 1 && month <= 12 ? month - 1 : now.getMonth();
            const y = Number.isFinite(year) && year >= 2020 ? year : now.getFullYear();
            query.createdAt = {
                $gte: new Date(y, m, 1),
                $lt: new Date(y, m + 1, 1),
            };
        }
        const approvals = await this.payrollApprovalModel
            .find(query)
            .populate(this.getApprovalActorPopulate())
            .sort({ createdAt: -1 })
            .lean();
        const approvalsWithBreakdown = await Promise.all((approvals ?? []).map(async (approval) => this.withApprovalDisplayBreakdown(approval, handlers)));
        const enriched = await handlers.enrichPayrollApprovals(approvalsWithBreakdown, entity);
        return { status: 200, data: enriched };
    }
    async getApprovalStaff(user, approvalId, handlers) {
        const approval = await this.payrollApprovalModel
            .findById(approvalId)
            .populate(this.getApprovalActorPopulate())
            .lean();
        if (!approval) {
            throw new common_1.NotFoundException('Payroll approval request not found');
        }
        if (!handlers.canViewPayrollApproval(user, approval)) {
            throw new common_1.ForbiddenException('You are not allowed to view this approval request');
        }
        const entityId = await handlers.normalizeEntityIdStrict(approval.entity);
        const staff = await this.staffService.getStaffList(entityId);
        return { status: 200, data: staff };
    }
    async getPayrollApprovalById(user, approvalId, handlers) {
        const approval = await this.payrollApprovalModel.findById(approvalId).lean();
        if (!approval) {
            throw new common_1.NotFoundException('Payroll approval request not found');
        }
        if (!handlers.canViewPayrollApproval(user, approval)) {
            throw new common_1.ForbiddenException('You are not allowed to view this approval request');
        }
        const responsePayload = await this.buildApprovalDetailPayload(approval, handlers);
        const [enriched] = await handlers.enrichPayrollApprovals([responsePayload], approval.entity);
        return {
            status: 200,
            data: enriched ?? responsePayload,
        };
    }
    async getProcessedPayrollById(user, id, handlers) {
        const approval = await this.payrollApprovalModel.findById(id).lean();
        if (!approval) {
            throw new common_1.NotFoundException('Payroll approval request not found');
        }
        if (!handlers.canViewPayrollApproval(user, approval)) {
            throw new common_1.ForbiddenException('You are not allowed to access batch files.');
        }
        const status = String(approval?.status ?? '').toUpperCase();
        if (!['PENDING_POSTING', 'APPROVED'].includes(status)) {
            return { status: 200, data: [] };
        }
        const baseData = handlers.resolvePayrollApprovalRows(approval.data);
        if (!baseData.length) {
            return { status: 200, data: [] };
        }
        const approvalPeriodDate = this.resolveApprovalPeriodDate(approval);
        try {
            const breakdown = await handlers.buildApprovalDisplayData(baseData, approval.entity, approvalPeriodDate);
            if (breakdown?.rows?.length) {
                return { status: 200, data: breakdown.rows };
            }
            return { status: 200, data: baseData };
        }
        catch (error) {
            throw new Error(`Error building approval display data: ${error.message}`);
        }
    }
    normalizeIdentifierList(handlers, ...values) {
        const identifiers = handlers.collectIdentifierValues(...values)
            .map((value) => String(value ?? '').trim())
            .filter((value) => value &&
            value.toLowerCase() !== 'null' &&
            value.toLowerCase() !== 'undefined' &&
            value.toLowerCase() !== '[object object]');
        return Array.from(new Set(identifiers));
    }
    applyFinanceEntityScope(query, user, requestedEntityId, handlers) {
        const mappedEntities = new Set();
        const registerEntity = (value) => {
            const resolved = handlers.resolveEntityId(value);
            if (resolved) {
                mappedEntities.add(resolved);
            }
        };
        registerEntity(user?.entity ?? user?.entityId);
        if (Array.isArray(user?.additionalRoles)) {
            user.additionalRoles.forEach((assignment) => registerEntity(assignment?.entity));
        }
        const allowedEntities = Array.from(mappedEntities);
        if (!allowedEntities.length) {
            return { status: 200, data: [] };
        }
        if (requestedEntityId) {
            if (!allowedEntities.includes(requestedEntityId)) {
                return { status: 200, data: [] };
            }
            query.entity = requestedEntityId;
        }
        else if (allowedEntities.length === 1) {
            query.entity = allowedEntities[0];
        }
        else {
            query.entity = { $in: allowedEntities };
        }
        return null;
    }
    applyRoleStatusScope(query, scope, handlers) {
        const statuses = handlers.statusSets;
        if (scope.approverOnly) {
            if (!scope.targetUserIdentifiers.length) {
                return { status: 200, data: [] };
            }
            if (scope.normalizedStatus && !statuses.approverViewStatuses.has(scope.normalizedStatus)) {
                return { status: 200, data: [] };
            }
            query.status = scope.normalizedStatus ?? { $in: Array.from(statuses.approverViewStatuses) };
            query.$or = [{ approverIds: { $in: scope.targetUserIdentifiers } }];
            if (scope.targetUserObjectIds.length) {
                query.$or.push({ approverIds: { $in: scope.targetUserObjectIds } });
                query.$or.push({ approverApprovedBy: { $in: scope.targetUserObjectIds } });
            }
            return null;
        }
        if (scope.hasSuperAdminAccess) {
            query.status =
                scope.normalizedStatus ?? { $in: Array.from(statuses.defaultApprovalViewStatuses) };
            return null;
        }
        if (scope.hasFinanceOrAuditAccess) {
            if (scope.normalizedStatus &&
                !statuses.financeAuditViewStatuses.has(scope.normalizedStatus)) {
                return { status: 200, data: [] };
            }
            query.status =
                scope.normalizedStatus ?? { $in: Array.from(statuses.financeAuditViewStatuses) };
            return null;
        }
        if (!scope.targetUserIdentifiers.length && !scope.userId) {
            throw new common_1.ForbiddenException('You are not allowed to view payroll approvals.');
        }
        query.status =
            scope.normalizedStatus ?? { $in: Array.from(statuses.defaultApprovalViewStatuses) };
        query.$or = this.buildParticipantRoleFilters(scope.targetUserIdentifiers, scope.targetUserObjectIds, statuses);
        return null;
    }
    buildParticipantRoleFilters(targetUserIdentifiers, targetUserObjectIds, statuses) {
        const roleFilters = [
            { initiatorId: { $in: targetUserIdentifiers } },
            { requestedBy: { $in: targetUserIdentifiers } },
            {
                reviewerIds: { $in: targetUserIdentifiers },
                status: { $in: Array.from(statuses.reviewerViewStatuses) },
            },
            {
                auditViewerIds: { $in: targetUserIdentifiers },
                status: { $in: Array.from(statuses.financeAuditViewStatuses) },
            },
            {
                approverIds: { $in: targetUserIdentifiers },
                status: { $in: Array.from(statuses.approverViewStatuses) },
            },
            {
                postingIds: { $in: targetUserIdentifiers },
                status: { $in: Array.from(statuses.posterViewStatuses) },
            },
        ];
        if (targetUserObjectIds.length) {
            roleFilters.push({ initiatorId: { $in: targetUserObjectIds } }, { requestedBy: { $in: targetUserObjectIds } }, {
                reviewerIds: { $in: targetUserObjectIds },
                status: { $in: Array.from(statuses.reviewerViewStatuses) },
            }, {
                auditViewerIds: { $in: targetUserObjectIds },
                status: { $in: Array.from(statuses.financeAuditViewStatuses) },
            }, {
                approverIds: { $in: targetUserObjectIds },
                status: { $in: Array.from(statuses.approverViewStatuses) },
            }, {
                postingIds: { $in: targetUserObjectIds },
                status: { $in: Array.from(statuses.posterViewStatuses) },
            }, {
                reviewerApprovedBy: { $in: targetUserObjectIds },
                status: { $in: Array.from(statuses.reviewerViewStatuses) },
            }, { approverApprovedBy: { $in: targetUserObjectIds } }, { postingApprovedBy: { $in: targetUserObjectIds } });
        }
        return roleFilters;
    }
    getApprovalActorPopulate() {
        return [
            {
                path: 'reviewerApprovedBy',
                model: this.staffModel,
                select: 'firstName lastName middleName email staffId',
            },
            {
                path: 'approverApprovedBy',
                model: this.staffModel,
                select: 'firstName lastName middleName email staffId',
            },
            {
                path: 'postingApprovedBy',
                model: this.staffModel,
                select: 'firstName lastName middleName email staffId',
            },
        ];
    }
    async withApprovalDisplayBreakdown(approval, handlers) {
        const baseData = handlers.resolvePayrollApprovalRows(approval?.data);
        if (!baseData.length)
            return approval;
        const approvalPeriodDate = this.resolveApprovalPeriodDate(approval);
        let viewData = baseData;
        let viewTypes = Array.isArray(approval.types) && approval.types.length
            ? approval.types
            : Array.from(new Set(baseData.map((row) => row?.type).filter(Boolean)));
        try {
            const breakdown = await handlers.buildApprovalDisplayData(baseData, approval.entity, approvalPeriodDate);
            if (breakdown?.rows?.length) {
                viewData = breakdown.rows;
                viewTypes = breakdown.types;
            }
            else if (breakdown?.types?.length) {
                viewTypes = breakdown.types;
            }
        }
        catch {
            return approval;
        }
        return { ...approval, data: viewData, types: viewTypes };
    }
    async buildApprovalDetailPayload(approval, handlers) {
        const display = await this.withApprovalDisplayBreakdown(approval, handlers);
        const viewData = display?.data ?? handlers.resolvePayrollApprovalRows(approval.data);
        const viewTypes = Array.isArray(display?.types) && display.types.length
            ? display.types
            : Array.from(new Set(viewData.map((row) => row?.type).filter(Boolean)));
        const totals = handlers.computeSectionTotals(viewData);
        return { ...approval, data: viewData, totals, types: viewTypes };
    }
    resolveApprovalPeriodDate(approval) {
        return (approval.processedAt ??
            approval.postingApprovedAt ??
            approval.approverApprovedAt ??
            approval.reviewerApprovedAt ??
            approval.createdAt ??
            new Date());
    }
};
exports.PayrollApprovalReadService = PayrollApprovalReadService;
exports.PayrollApprovalReadService = PayrollApprovalReadService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(payrollApproval_schema_1.PayrollApproval.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        user_service_1.StaffService])
], PayrollApprovalReadService);
//# sourceMappingURL=payroll-approval-read.service.js.map