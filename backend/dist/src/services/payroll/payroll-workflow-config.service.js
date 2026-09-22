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
exports.PayrollWorkflowConfigService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const leave_allowance_workflow_schema_1 = require("../../schemas/leave-allowance-workflow.schema");
const payroll_workflow_schema_1 = require("../../schemas/payroll-workflow.schema");
const access_control_util_1 = require("../../utils/shared/access-control.util");
const payroll_access_util_1 = require("../../utils/payroll/payroll-access.util");
const payroll_identity_util_1 = require("../../utils/payroll/payroll-identity.util");
const payroll_row_util_1 = require("../../utils/payroll/payroll-row.util");
const subsidiary_service_1 = require("../org/subsidiary.service");
const access_control_util_2 = require("../../utils/shared/access-control.util");
const WORKFLOW_SUPER_ADMIN_ROLE_NAMES = access_control_util_2.SUPER_ADMIN_ROLE_NAME_SET;
let PayrollWorkflowConfigService = class PayrollWorkflowConfigService {
    constructor(payrollWorkflowModel, leaveAllowanceWorkflowModel, entityService) {
        this.payrollWorkflowModel = payrollWorkflowModel;
        this.leaveAllowanceWorkflowModel = leaveAllowanceWorkflowModel;
        this.entityService = entityService;
    }
    hasFinanceScope(user) {
        return (0, access_control_util_1.userHasScope)(user, ['finance', 'group']);
    }
    userHasSuperAdminRole(user) {
        return (0, payroll_access_util_1.payrollUserHasSuperAdminRole)(user, WORKFLOW_SUPER_ADMIN_ROLE_NAMES);
    }
    buildWorkflowMemberQuery(user) {
        const identifierTokens = Array.from(new Set((0, payroll_identity_util_1.collectPayrollIdentifierValues)(user?.id, user?._id, user?.userId, user?.email)
            .map((value) => String(value ?? '').trim())
            .filter((value) => value &&
            value.toLowerCase() !== 'null' &&
            value.toLowerCase() !== 'undefined' &&
            value.toLowerCase() !== '[object object]')));
        const identifierObjectIds = identifierTokens
            .filter((value) => mongoose_2.Types.ObjectId.isValid(value))
            .map((value) => new mongoose_2.Types.ObjectId(value));
        if (!identifierTokens.length && !identifierObjectIds.length) {
            return null;
        }
        const or = [
            { initiatorIds: { $in: identifierTokens } },
            { reviewerIds: { $in: identifierTokens } },
            { auditViewerIds: { $in: identifierTokens } },
            { approverIds: { $in: identifierTokens } },
            { postingIds: { $in: identifierTokens } },
            { initiators: { $in: identifierTokens } },
            { reviewers: { $in: identifierTokens } },
            { auditViewers: { $in: identifierTokens } },
            { approvers: { $in: identifierTokens } },
            { posters: { $in: identifierTokens } },
            { posterIds: { $in: identifierTokens } },
        ];
        if (identifierObjectIds.length) {
            or.push({ initiatorIds: { $in: identifierObjectIds } }, { reviewerIds: { $in: identifierObjectIds } }, { auditViewerIds: { $in: identifierObjectIds } }, { approverIds: { $in: identifierObjectIds } }, { postingIds: { $in: identifierObjectIds } });
        }
        return { $or: or };
    }
    assertSuperAdmin(user) {
        if (!this.userHasSuperAdminRole(user)) {
            throw new common_1.ForbiddenException('Only HR super admin can update workflow configurations.');
        }
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
        const normalizedEntityId = await this.normalizeEntityIdStrict(entityId);
        const workflow = await this.payrollWorkflowModel
            .findOne({ entity: new mongoose_2.Types.ObjectId(normalizedEntityId) })
            .lean();
        if (!workflow) {
            throw new common_1.BadRequestException('Payroll workflow configuration is missing for this entity.');
        }
        return {
            workflow,
            reviewerIds: (0, payroll_identity_util_1.normalizePayrollUserIdList)(workflow.reviewerIds),
            approverIds: (0, payroll_identity_util_1.normalizePayrollUserIdList)(workflow.approverIds),
            auditViewerIds: (0, payroll_identity_util_1.normalizePayrollUserIdList)(workflow.auditViewerIds),
            postingIds: (0, payroll_identity_util_1.normalizePayrollUserIdList)(workflow.postingIds),
            entityId: normalizedEntityId,
        };
    }
    async validatePayrollInitiation(entityId, initiator) {
        const loaded = await this.loadPayrollWorkflowConfig(entityId);
        this.assertWorkflowCanInitiate(loaded.reviewerIds, loaded.approverIds, loaded.postingIds);
        const initiatorId = (0, payroll_identity_util_1.normalizePayrollUserId)(initiator?._id);
        const allowedInitiators = (0, payroll_identity_util_1.normalizePayrollUserIdList)(loaded.workflow.initiatorIds);
        const isInitiatorAllowed = this.hasFinanceScope(initiator) ||
            (initiatorId ? allowedInitiators.includes(initiatorId) : false);
        if (!isInitiatorAllowed) {
            throw new common_1.ForbiddenException('You are not allowed to initiate payroll for this entity.');
        }
        return { ...loaded, initiatorId };
    }
    async loadLeaveAllowanceWorkflowConfig(entityId) {
        const normalizedEntityId = await this.normalizeEntityIdStrict(entityId);
        const workflow = await this.leaveAllowanceWorkflowModel
            .findOne({ entity: new mongoose_2.Types.ObjectId(normalizedEntityId) })
            .lean();
        if (!workflow) {
            throw new common_1.BadRequestException('Leave allowance workflow configuration is missing for this entity.');
        }
        return {
            workflow,
            reviewerIds: (0, payroll_identity_util_1.normalizePayrollUserIdList)(workflow.reviewerIds),
            approverIds: (0, payroll_identity_util_1.normalizePayrollUserIdList)(workflow.approverIds),
            auditViewerIds: (0, payroll_identity_util_1.normalizePayrollUserIdList)(workflow.auditViewerIds),
            postingIds: (0, payroll_identity_util_1.normalizePayrollUserIdList)(workflow.postingIds),
            entityId: normalizedEntityId,
        };
    }
    async validateLeaveAllowanceInitiation(entityId, initiator) {
        const loaded = await this.loadLeaveAllowanceWorkflowConfig(entityId);
        this.assertWorkflowCanInitiate(loaded.reviewerIds, loaded.approverIds, loaded.postingIds);
        const initiatorId = (0, payroll_identity_util_1.normalizePayrollUserId)(initiator?._id);
        const allowedInitiators = (0, payroll_identity_util_1.normalizePayrollUserIdList)(loaded.workflow.initiatorIds);
        const isInitiatorAllowed = this.hasFinanceScope(initiator) ||
            (initiatorId ? allowedInitiators.includes(initiatorId) : false);
        if (!isInitiatorAllowed) {
            throw new common_1.ForbiddenException('You are not allowed to initiate leave allowance for this entity.');
        }
        return { ...loaded, initiatorId };
    }
    async validateWorkflowInitiation(entityId, initiator, workflowType) {
        if (workflowType === 'leave-allowance') {
            return this.validateLeaveAllowanceInitiation(entityId, initiator);
        }
        return this.validatePayrollInitiation(entityId, initiator);
    }
    async getPayrollWorkflowConfigs(user, entity) {
        const hasFullAccess = this.hasFinanceScope(user) || this.userHasSuperAdminRole(user);
        const memberQuery = this.buildWorkflowMemberQuery(user);
        if (!hasFullAccess && !memberQuery) {
            throw new common_1.ForbiddenException('You do not have permission to view workflow configurations.');
        }
        const query = {};
        if (entity) {
            query.entity = new mongoose_2.Types.ObjectId(await this.normalizeEntityIdStrict(entity));
        }
        if (!hasFullAccess && memberQuery) {
            Object.assign(query, memberQuery);
        }
        const configs = await this.payrollWorkflowModel
            .find(query)
            .populate('entity', 'name short code')
            .lean();
        return { status: 200, data: configs };
    }
    async savePayrollWorkflowConfig(user, payload) {
        this.assertSuperAdmin(user);
        if (!this.hasFinanceScope(user)) {
            throw new common_1.ForbiddenException('You do not have permission to update workflow configurations.');
        }
        const entityId = await this.normalizeEntityIdStrict(payload?.entity);
        const initiatorIds = (0, payroll_identity_util_1.normalizePayrollUserIdList)(payload?.initiators);
        const reviewerIds = (0, payroll_identity_util_1.normalizePayrollUserIdList)(payload?.reviewers);
        const auditViewerIds = (0, payroll_identity_util_1.normalizePayrollUserIdList)(payload?.auditViewers);
        const approverIds = (0, payroll_identity_util_1.normalizePayrollUserIdList)(payload?.approvers);
        const postingIds = (0, payroll_identity_util_1.normalizePayrollUserIdList)(payload?.posters ?? payload?.postingIds);
        const financeIds = (0, payroll_identity_util_1.normalizePayrollUserIdList)(payload?.finance ?? payload?.financeIds);
        this.assertWorkflowSelections(reviewerIds, approverIds, postingIds);
        const config = await this.payrollWorkflowModel
            .findOneAndUpdate({ entity: new mongoose_2.Types.ObjectId(entityId) }, {
            $set: {
                entity: new mongoose_2.Types.ObjectId(entityId),
                initiatorIds,
                reviewerIds,
                auditViewerIds,
                approverIds,
                postingIds,
                financeIds,
            },
        }, { upsert: true, new: true, setDefaultsOnInsert: true })
            .populate('entity', 'name short code')
            .lean();
        return { status: 200, data: config };
    }
    async getLeaveAllowanceWorkflowConfigs(user, entity) {
        const hasFullAccess = this.hasFinanceScope(user) || this.userHasSuperAdminRole(user);
        const memberQuery = this.buildWorkflowMemberQuery(user);
        if (!hasFullAccess && !memberQuery) {
            throw new common_1.ForbiddenException('You do not have permission to view workflow configurations.');
        }
        const query = {};
        if (entity) {
            query.entity = new mongoose_2.Types.ObjectId(await this.normalizeEntityIdStrict(entity));
        }
        if (!hasFullAccess && memberQuery) {
            Object.assign(query, memberQuery);
        }
        const configs = await this.leaveAllowanceWorkflowModel
            .find(query)
            .populate('entity', 'name short code')
            .lean();
        return { status: 200, data: configs };
    }
    async saveLeaveAllowanceWorkflowConfig(user, payload) {
        this.assertSuperAdmin(user);
        if (!this.hasFinanceScope(user)) {
            throw new common_1.ForbiddenException('You do not have permission to update workflow configurations.');
        }
        const entityId = await this.normalizeEntityIdStrict(payload?.entity);
        const initiatorIds = (0, payroll_identity_util_1.normalizePayrollUserIdList)(payload?.initiators);
        const reviewerIds = (0, payroll_identity_util_1.normalizePayrollUserIdList)(payload?.reviewers);
        const auditViewerIds = (0, payroll_identity_util_1.normalizePayrollUserIdList)(payload?.auditViewers);
        const approverIds = (0, payroll_identity_util_1.normalizePayrollUserIdList)(payload?.approvers);
        const postingIds = (0, payroll_identity_util_1.normalizePayrollUserIdList)(payload?.posters ?? payload?.postingIds);
        const hasCompanyGL = payload?.companyGL !== undefined;
        const companyGL = hasCompanyGL
            ? (0, payroll_row_util_1.normalizePayrollTextValue)(payload?.companyGL) ?? ''
            : undefined;
        this.assertWorkflowSelections(reviewerIds, approverIds, postingIds);
        const updatePayload = {
            entity: new mongoose_2.Types.ObjectId(entityId),
            initiatorIds,
            reviewerIds,
            auditViewerIds,
            approverIds,
            postingIds,
            financeIds: (0, payroll_identity_util_1.normalizePayrollUserIdList)(payload?.finance ?? payload?.financeIds),
        };
        if (hasCompanyGL) {
            updatePayload.companyGL = companyGL;
        }
        const config = await this.leaveAllowanceWorkflowModel
            .findOneAndUpdate({ entity: new mongoose_2.Types.ObjectId(entityId) }, {
            $set: updatePayload,
        }, { upsert: true, new: true, setDefaultsOnInsert: true })
            .populate('entity', 'name short code')
            .lean();
        return { status: 200, data: config };
    }
    async getPayrollWorkflowRole(user, entity, scanAll = false) {
        return this.getWorkflowRoleFromModel(this.payrollWorkflowModel, user, entity, scanAll);
    }
    async getLeaveAllowanceWorkflowRole(user, entity, scanAll = false) {
        return this.getWorkflowRoleFromModel(this.leaveAllowanceWorkflowModel, user, entity, scanAll);
    }
    assertWorkflowCanInitiate(reviewerIds, approverIds, postingIds) {
        if (!reviewerIds.length) {
            throw new common_1.BadRequestException('At least one reviewer must be configured for this entity.');
        }
        if (!approverIds.length) {
            throw new common_1.BadRequestException('At least one approver must be configured for this entity.');
        }
        if (!postingIds.length) {
            throw new common_1.BadRequestException('At least one poster must be configured for this entity.');
        }
    }
    assertWorkflowSelections(reviewerIds, approverIds, postingIds) {
        if (!reviewerIds.length) {
            throw new common_1.BadRequestException('At least one reviewer must be selected.');
        }
        if (!approverIds.length) {
            throw new common_1.BadRequestException('At least one approver must be selected.');
        }
        if (!postingIds.length) {
            throw new common_1.BadRequestException('At least one poster must be selected.');
        }
    }
    async getWorkflowRoleFromModel(workflowModel, user, entity, scanAll = false) {
        const userIdentifiers = (0, payroll_identity_util_1.collectPayrollIdentifierValues)(user?.id, user?._id, user?.userId, user?.email)
            .map((value) => String(value).trim())
            .filter((value) => value &&
            value.toLowerCase() !== 'null' &&
            value.toLowerCase() !== 'undefined' &&
            value.toLowerCase() !== '[object object]');
        const identifierSet = new Set(userIdentifiers.map((value) => value.toLowerCase()));
        const normalizedUserId = (0, payroll_identity_util_1.normalizePayrollUserId)(user?.id ??
            user?._id ??
            user?.userId ??
            user?.employeeId);
        const entityValue = entity;
        const readList = (...values) => values.flatMap((value) => (Array.isArray(value) ? value : value ? [value] : []));
        const matchesNormalizedUserId = (value) => {
            if (!normalizedUserId || value == null)
                return false;
            if (Array.isArray(value)) {
                return value.some((entry) => matchesNormalizedUserId(entry));
            }
            const normalized = (0, payroll_identity_util_1.normalizePayrollUserId)(value);
            if (normalized) {
                return normalized === normalizedUserId;
            }
            const raw = typeof value === 'string' ? value.trim() : '';
            return raw ? raw.toLowerCase() === normalizedUserId.toLowerCase() : false;
        };
        const matchesIdentifier = (value) => {
            if (matchesNormalizedUserId(value)) {
                return true;
            }
            const candidates = (0, payroll_identity_util_1.collectPayrollIdentifierValues)(value);
            return candidates.some((candidate) => {
                const normalized = String(candidate ?? '').trim();
                if (!normalized)
                    return false;
                const tokens = normalized
                    .split(',')
                    .map((part) => part.trim())
                    .filter(Boolean);
                return tokens.some((token) => {
                    const lowered = token.toLowerCase();
                    if (lowered === 'null' || lowered === 'undefined' || lowered === '[object object]') {
                        return false;
                    }
                    return identifierSet.has(lowered);
                });
            });
        };
        if (!identifierSet.size) {
            return this.emptyWorkflowRole(null);
        }
        let entityId = null;
        let entityString = null;
        if (entityValue) {
            try {
                entityId = new mongoose_2.Types.ObjectId(entityValue);
            }
            catch {
                entityString = String(entityValue).trim();
            }
        }
        if (scanAll) {
            if (!userIdentifiers.length) {
                return this.emptyWorkflowRole(null);
            }
            const identifierTokens = Array.from(new Set(userIdentifiers.map((value) => String(value).trim()).filter(Boolean)));
            const identifierObjectIds = identifierTokens
                .filter((value) => mongoose_2.Types.ObjectId.isValid(value))
                .map((value) => new mongoose_2.Types.ObjectId(value));
            if (!identifierTokens.length) {
                return this.emptyWorkflowRole(null);
            }
            const scanQueryOr = [
                { approverIds: { $in: identifierTokens } },
                { postingIds: { $in: identifierTokens } },
                { auditViewerIds: { $in: identifierTokens } },
                { reviewerIds: { $in: identifierTokens } },
                { initiatorIds: { $in: identifierTokens } },
                { approvers: { $in: identifierTokens } },
                { posters: { $in: identifierTokens } },
                { posterIds: { $in: identifierTokens } },
                { auditViewers: { $in: identifierTokens } },
                { reviewers: { $in: identifierTokens } },
                { initiators: { $in: identifierTokens } },
            ];
            if (identifierObjectIds.length) {
                scanQueryOr.push({ approverIds: { $in: identifierObjectIds } }, { postingIds: { $in: identifierObjectIds } }, { auditViewerIds: { $in: identifierObjectIds } }, { reviewerIds: { $in: identifierObjectIds } }, { initiatorIds: { $in: identifierObjectIds } });
            }
            const scanQuery = { $or: scanQueryOr };
            const configs = await workflowModel
                .find(scanQuery, {
                approverIds: 1,
                postingIds: 1,
                auditViewerIds: 1,
                reviewerIds: 1,
                initiatorIds: 1,
                financeIds: 1,
                entity: 1,
                approvers: 1,
                posters: 1,
                posterIds: 1,
                auditViewers: 1,
                reviewers: 1,
                initiators: 1,
                finance: 1,
            })
                .lean();
            const isFinalApprover = configs.some((config) => readList(config?.approverIds, config?.approvers).some(matchesIdentifier));
            const isPoster = configs.some((config) => readList(config?.postingIds, config?.posters, config?.posterIds).some(matchesIdentifier));
            const isAuditViewer = configs.some((config) => readList(config?.auditViewerIds, config?.auditViewers).some(matchesIdentifier));
            const isReviewer = configs.some((config) => readList(config?.reviewerIds, config?.reviewers).some(matchesIdentifier));
            const isInitiator = configs.some((config) => readList(config?.initiatorIds, config?.initiators).some(matchesIdentifier));
            const isFinance = configs.some((config) => readList(config?.financeIds, config?.finance).some(matchesIdentifier));
            const matchedEntities = new Set();
            configs.forEach((config) => {
                const match = readList(config?.approverIds, config?.approvers).some(matchesIdentifier) ||
                    readList(config?.postingIds, config?.posters, config?.posterIds).some(matchesIdentifier) ||
                    readList(config?.auditViewerIds, config?.auditViewers).some(matchesIdentifier) ||
                    readList(config?.reviewerIds, config?.reviewers).some(matchesIdentifier) ||
                    readList(config?.initiatorIds, config?.initiators).some(matchesIdentifier);
                if (match && config?.entity) {
                    matchedEntities.add(String(config.entity));
                }
            });
            const entities = Array.from(matchedEntities);
            return {
                status: 200,
                data: {
                    entity: entityId ?? entityString,
                    isFinalApprover: Boolean(isFinalApprover),
                    isPoster: Boolean(isPoster),
                    isAuditViewer: Boolean(isAuditViewer),
                    isReviewer: Boolean(isReviewer),
                    isInitiator: Boolean(isInitiator),
                    isFinance: Boolean(isFinance),
                    entities,
                    entityCount: entities.length,
                },
            };
        }
        if (!entityId && !entityString) {
            return this.emptyWorkflowRole(null);
        }
        const config = await workflowModel
            .findOne({
            $or: [
                entityId ? { entity: entityId } : null,
                entityString ? { entity: entityString } : null,
            ].filter(Boolean),
        })
            .lean();
        if (!config) {
            return this.emptyWorkflowRole(entityId ?? entityString);
        }
        const approverIds = readList(config.approverIds, config?.approvers);
        const postingIds = readList(config.postingIds, config?.posters, config?.posterIds);
        const auditViewerIds = readList(config.auditViewerIds, config?.auditViewers);
        const reviewerIds = readList(config.reviewerIds, config?.reviewers);
        const initiatorIds = readList(config.initiatorIds, config?.initiators);
        const financeMemberIds = readList(config?.financeIds, config?.finance);
        const isFinalApprover = approverIds.some(matchesIdentifier);
        const isPoster = postingIds.some(matchesIdentifier);
        const isAuditViewer = auditViewerIds.some(matchesIdentifier);
        const isReviewer = reviewerIds.some(matchesIdentifier);
        const isInitiator = initiatorIds.some(matchesIdentifier);
        const isFinance = financeMemberIds.some(matchesIdentifier);
        const hasMatch = isFinalApprover || isPoster || isAuditViewer || isReviewer || isInitiator;
        return {
            status: 200,
            data: {
                entity: entityId ?? entityString,
                isFinalApprover,
                isPoster,
                isAuditViewer,
                isReviewer,
                isInitiator,
                isFinance,
                entities: hasMatch && (entityId || entityString) ? [String(entityId ?? entityString)] : [],
                entityCount: hasMatch && (entityId || entityString) ? 1 : 0,
            },
        };
    }
    emptyWorkflowRole(entity) {
        return {
            status: 200,
            data: {
                entity,
                isFinalApprover: false,
                isPoster: false,
                isAuditViewer: false,
                isReviewer: false,
                isInitiator: false,
                isFinance: false,
                entities: [],
                entityCount: 0,
            },
        };
    }
};
exports.PayrollWorkflowConfigService = PayrollWorkflowConfigService;
exports.PayrollWorkflowConfigService = PayrollWorkflowConfigService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(payroll_workflow_schema_1.PayrollWorkflowConfig.name)),
    __param(1, (0, mongoose_1.InjectModel)(leave_allowance_workflow_schema_1.LeaveAllowanceWorkflowConfig.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        subsidiary_service_1.SubsidiaryService])
], PayrollWorkflowConfigService);
//# sourceMappingURL=payroll-workflow-config.service.js.map