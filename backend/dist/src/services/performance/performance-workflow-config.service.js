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
exports.PerformanceWorkflowConfigService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const performance_workflow_schema_1 = require("../../schemas/performance-workflow.schema");
const performance_access_util_1 = require("../../utils/performance/performance-access.util");
let PerformanceWorkflowConfigService = class PerformanceWorkflowConfigService {
    constructor(workflowModel) {
        this.workflowModel = workflowModel;
    }
    normalizeEntityIdStrict(value) {
        const candidate = value?._id ??
            value?.id ??
            value?.entityId ??
            value?.value ??
            (typeof value === 'string' || typeof value === 'number' ? value : undefined);
        if (!candidate) {
            throw new common_1.BadRequestException('Entity is required.');
        }
        const normalized = String(candidate).trim();
        if (!mongoose_2.Types.ObjectId.isValid(normalized)) {
            throw new common_1.BadRequestException('Entity is invalid.');
        }
        return new mongoose_2.Types.ObjectId(normalized).toHexString();
    }
    normalizeUserId(value) {
        if (value == null)
            return null;
        const candidate = typeof value === 'object'
            ? value?._id ?? value?.id ?? value?.userId ?? value
            : value;
        const normalized = String(candidate ?? '').trim();
        if (!normalized ||
            normalized.toLowerCase() === 'undefined' ||
            normalized.toLowerCase() === 'null') {
            return null;
        }
        if (!mongoose_2.Types.ObjectId.isValid(normalized))
            return null;
        return normalized;
    }
    normalizeUserIdList(values) {
        const list = Array.isArray(values) ? values : values ? [values] : [];
        const unique = new Set();
        list.forEach((value) => {
            const normalized = this.normalizeUserId(value);
            if (normalized) {
                unique.add(normalized);
            }
        });
        return Array.from(unique);
    }
    normalizeWeight(value) {
        if (value === null || value === undefined || value === '')
            return 0;
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) {
            throw new common_1.BadRequestException('Weight must be a number between 0 and 100.');
        }
        if (parsed < 0 || parsed > 100) {
            throw new common_1.BadRequestException('Weight must be between 0 and 100.');
        }
        return parsed;
    }
    async getWorkflowConfigs(user, entity) {
        (0, performance_access_util_1.assertCanManagePerformanceWorkflow)(user);
        const query = {};
        if (entity) {
            query.entity = new mongoose_2.Types.ObjectId(this.normalizeEntityIdStrict(entity));
        }
        const configs = await this.workflowModel
            .find(query)
            .populate('entity', 'name short code')
            .lean();
        return { status: 200, data: configs };
    }
    async saveWorkflowConfig(user, payload) {
        (0, performance_access_util_1.assertCanManagePerformanceWorkflow)(user);
        const entityId = this.normalizeEntityIdStrict(payload?.entity);
        const existing = await this.workflowModel
            .findOne({ entity: new mongoose_2.Types.ObjectId(entityId) })
            .lean()
            .exec();
        const fallbackEmployeeWeight = Number.isFinite(Number(existing?.employeeScoreWeight))
            ? Number(existing?.employeeScoreWeight)
            : 40;
        const fallbackReviewerWeight = Number.isFinite(Number(existing?.reviewerScoreWeight))
            ? Number(existing?.reviewerScoreWeight)
            : 60;
        const enabled = payload?.enabled !== false;
        const autoIncludeManager = payload?.autoIncludeManager !== false;
        const initiatorIds = this.normalizeUserIdList(payload?.initiators ?? payload?.initiatorIds);
        const reviewerIds = this.normalizeUserIdList(payload?.reviewers ?? payload?.reviewerIds);
        const approverIds = this.normalizeUserIdList(payload?.approvers ?? payload?.approverIds);
        const hrReviewerIds = this.normalizeUserIdList(payload?.hrReviewers ?? payload?.hrReviewerIds);
        const finalApproverIds = this.normalizeUserIdList(payload?.finalApprovers ?? payload?.finalApproverIds);
        const employeeScoreWeight = payload?.employeeScoreWeight !== undefined
            ? this.normalizeWeight(payload?.employeeScoreWeight)
            : payload?.employeeWeight !== undefined
                ? this.normalizeWeight(payload?.employeeWeight)
                : fallbackEmployeeWeight;
        const reviewerScoreWeight = payload?.reviewerScoreWeight !== undefined
            ? this.normalizeWeight(payload?.reviewerScoreWeight)
            : payload?.supervisorScoreWeight !== undefined
                ? this.normalizeWeight(payload?.supervisorScoreWeight)
                : fallbackReviewerWeight;
        const weightTotal = employeeScoreWeight + reviewerScoreWeight;
        if (Math.abs(weightTotal - 100) > 0.01) {
            throw new common_1.BadRequestException('Employee and supervisor weights must total 100.');
        }
        if (reviewerScoreWeight <= employeeScoreWeight) {
            throw new common_1.BadRequestException('Supervisor weight must be greater than employee weight.');
        }
        if (enabled) {
            if (!reviewerIds.length) {
                throw new common_1.BadRequestException('At least one reviewer must be selected.');
            }
            if (!approverIds.length) {
                throw new common_1.BadRequestException('At least one approver must be selected.');
            }
        }
        const config = await this.workflowModel
            .findOneAndUpdate({ entity: new mongoose_2.Types.ObjectId(entityId) }, {
            $set: {
                entity: new mongoose_2.Types.ObjectId(entityId),
                enabled,
                autoIncludeManager,
                initiatorIds,
                reviewerIds,
                approverIds,
                hrReviewerIds,
                finalApproverIds,
                employeeScoreWeight,
                reviewerScoreWeight,
            },
        }, { upsert: true, new: true, setDefaultsOnInsert: true })
            .populate('entity', 'name short code')
            .lean();
        return { status: 200, data: config };
    }
};
exports.PerformanceWorkflowConfigService = PerformanceWorkflowConfigService;
exports.PerformanceWorkflowConfigService = PerformanceWorkflowConfigService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(performance_workflow_schema_1.PerformanceWorkflowConfig.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PerformanceWorkflowConfigService);
//# sourceMappingURL=performance-workflow-config.service.js.map