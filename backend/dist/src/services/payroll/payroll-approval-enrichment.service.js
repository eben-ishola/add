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
exports.PayrollApprovalEnrichmentService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const payrollApproval_schema_1 = require("../../schemas/payrollApproval.schema");
const user_service_1 = require("../user/user.service");
const subsidiary_service_1 = require("../org/subsidiary.service");
const payroll_identity_util_1 = require("../../utils/payroll/payroll-identity.util");
const payroll_display_util_1 = require("../../utils/payroll/payroll-display.util");
let PayrollApprovalEnrichmentService = class PayrollApprovalEnrichmentService {
    constructor(payrollApprovalModel, staffService, entityService) {
        this.payrollApprovalModel = payrollApprovalModel;
        this.staffService = staffService;
        this.entityService = entityService;
    }
    async enrichPayrollApprovals(approvals, entityHint) {
        if (!Array.isArray(approvals) || approvals.length === 0) {
            return approvals ?? [];
        }
        const staffIds = new Set();
        const entityIds = new Set();
        const registerStaff = (value) => {
            const key = typeof value === 'string' || typeof value === 'number'
                ? String(value).trim()
                : typeof value === 'object'
                    ? String(value?._id ?? value?.id ?? value?.userId ?? value ?? '').trim()
                    : String(value ?? '').trim();
            if (key) {
                staffIds.add(key);
            }
        };
        approvals.forEach((approval) => {
            const entityId = (0, payroll_identity_util_1.resolvePayrollEntityId)(approval?.entity);
            if (entityId) {
                entityIds.add(entityId);
            }
            registerStaff(approval?.initiatorId);
            registerStaff(approval?.requestedBy);
            registerStaff(approval?.reviewerApprovedBy);
            registerStaff(approval?.approverApprovedBy);
            registerStaff(approval?.postingApprovedBy);
            (approval?.reviewerIds ?? []).forEach(registerStaff);
            (approval?.approverIds ?? []).forEach(registerStaff);
            (approval?.postingIds ?? []).forEach(registerStaff);
            (approval?.auditViewerIds ?? []).forEach(registerStaff);
        });
        const staffDirectory = new Map();
        const registerDirectory = (entries) => {
            (entries ?? []).forEach((entry) => {
                const name = typeof entry?.name === 'string' ? entry.name.trim() : '';
                if (!name)
                    return;
                const staffId = typeof entry?.staffId === 'string' ? entry.staffId.trim() : '';
                const staffObjectId = typeof entry?.staffObjectId === 'string' ? entry.staffObjectId.trim() : '';
                const userId = typeof entry?.userId === 'string' ? entry.userId.trim() : '';
                const email = typeof entry?.email === 'string' ? entry.email.trim() : '';
                const registerKey = (key) => {
                    if (!key)
                        return;
                    staffDirectory.set(key, name);
                    staffDirectory.set(key.toLowerCase(), name);
                    staffDirectory.set(key.toUpperCase(), name);
                };
                registerKey(staffId);
                registerKey(staffObjectId);
                registerKey(userId);
                registerKey(email);
            });
        };
        if (staffIds.size) {
            const directory = await this.staffService
                .resolveStaffDirectory(Array.from(staffIds), entityHint)
                .catch(() => ({ data: [], missing: [] }));
            registerDirectory(directory?.data ?? []);
            const missing = Array.isArray(directory?.missing) ? directory.missing : [];
            if (missing.length) {
                const fallback = await this.staffService
                    .resolveStaffDirectory(missing)
                    .catch(() => ({ data: [] }));
                registerDirectory(fallback?.data ?? []);
            }
        }
        const entityDirectory = new Map();
        if (entityIds.size) {
            const entries = await Promise.all(Array.from(entityIds).map(async (id) => {
                const response = await this.entityService.findSubsidiaryById(id).catch(() => null);
                const entity = response?.data ?? response;
                if (entity?._id) {
                    return { id, entity };
                }
                return null;
            }));
            entries.forEach((entry) => {
                if (!entry)
                    return;
                entityDirectory.set(entry.id, entry.entity);
            });
        }
        const resolveName = (value) => {
            if (typeof value !== 'string')
                return undefined;
            const trimmed = value.trim();
            return trimmed ? trimmed : undefined;
        };
        const pendingUpdates = [];
        const enriched = approvals.map((approval) => {
            const entityId = (0, payroll_identity_util_1.resolvePayrollEntityId)(approval?.entity);
            const entityDetails = entityId ? entityDirectory.get(entityId) : null;
            const resolvedEntity = entityDetails ?? approval?.entity;
            const entityName = (0, payroll_display_util_1.resolvePayrollEntityLabel)(resolvedEntity) ??
                approval?.entityName;
            const initiatorDisplayName = resolveName(approval?.initiatorName) ??
                resolveName(approval?.requestedByName) ??
                (0, payroll_display_util_1.resolvePayrollStaffLabel)(staffDirectory, approval?.initiatorId) ??
                (0, payroll_display_util_1.resolvePayrollStaffLabel)(staffDirectory, approval?.requestedBy);
            const reviewerApprovedByName = resolveName(approval?.reviewerApprovedByName) ??
                (0, payroll_display_util_1.resolvePayrollStaffLabel)(staffDirectory, approval?.reviewerApprovedBy);
            const reviewerNames = (approval?.reviewerIds ?? [])
                .map((id) => (0, payroll_display_util_1.resolvePayrollStaffLabel)(staffDirectory, id))
                .filter((name) => Boolean(name));
            const reviewerDisplayName = resolveName(approval?.reviewerDisplayName) ??
                reviewerApprovedByName ??
                (reviewerNames.length ? reviewerNames.join(', ') : undefined);
            const approverApprovedByName = resolveName(approval?.approverApprovedByName) ??
                (0, payroll_display_util_1.resolvePayrollStaffLabel)(staffDirectory, approval?.approverApprovedBy);
            const approverNames = (approval?.approverIds ?? [])
                .map((id) => (0, payroll_display_util_1.resolvePayrollStaffLabel)(staffDirectory, id))
                .filter((name) => Boolean(name));
            const approverDisplayName = resolveName(approval?.approverDisplayName) ??
                approverApprovedByName ??
                (approverNames.length ? approverNames.join(', ') : undefined);
            const postingApprovedByName = resolveName(approval?.postingApprovedByName) ??
                (0, payroll_display_util_1.resolvePayrollStaffLabel)(staffDirectory, approval?.postingApprovedBy);
            const postingNames = (approval?.postingIds ?? [])
                .map((id) => (0, payroll_display_util_1.resolvePayrollStaffLabel)(staffDirectory, id))
                .filter((name) => Boolean(name));
            const postingDisplayName = resolveName(approval?.postingDisplayName) ??
                postingApprovedByName ??
                (postingNames.length ? postingNames.join(', ') : undefined);
            const auditViewerNames = (approval?.auditViewerIds ?? [])
                .map((id) => (0, payroll_display_util_1.resolvePayrollStaffLabel)(staffDirectory, id))
                .filter((name) => Boolean(name));
            const updatePayload = {};
            const hasReviewerApprovedByName = Boolean(resolveName(approval?.reviewerApprovedByName));
            const hasApproverApprovedByName = Boolean(resolveName(approval?.approverApprovedByName));
            const hasPostingApprovedByName = Boolean(resolveName(approval?.postingApprovedByName));
            if (!hasReviewerApprovedByName && reviewerApprovedByName) {
                updatePayload.reviewerApprovedByName = reviewerApprovedByName;
            }
            if (!hasApproverApprovedByName && approverApprovedByName) {
                updatePayload.approverApprovedByName = approverApprovedByName;
            }
            if (!hasPostingApprovedByName && postingApprovedByName) {
                updatePayload.postingApprovedByName = postingApprovedByName;
            }
            if (approval?._id && Object.keys(updatePayload).length) {
                pendingUpdates.push({
                    updateOne: {
                        filter: { _id: approval._id },
                        update: { $set: updatePayload },
                    },
                });
            }
            return {
                ...approval,
                entity: resolvedEntity,
                entityName,
                initiatorDisplayName,
                reviewerApprovedByName,
                reviewerNames,
                reviewerDisplayName,
                approverApprovedByName,
                approverNames,
                approverDisplayName,
                postingApprovedByName,
                postingNames,
                postingDisplayName,
                auditViewerNames,
            };
        });
        if (pendingUpdates.length) {
            try {
                await this.payrollApprovalModel.bulkWrite(pendingUpdates, { ordered: false });
            }
            catch (error) {
                console.error('Failed to backfill payroll approval names', error);
            }
        }
        return enriched;
    }
};
exports.PayrollApprovalEnrichmentService = PayrollApprovalEnrichmentService;
exports.PayrollApprovalEnrichmentService = PayrollApprovalEnrichmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(payrollApproval_schema_1.PayrollApproval.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        user_service_1.StaffService,
        subsidiary_service_1.SubsidiaryService])
], PayrollApprovalEnrichmentService);
//# sourceMappingURL=payroll-approval-enrichment.service.js.map