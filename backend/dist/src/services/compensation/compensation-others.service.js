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
var CompensationOthersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompensationOthersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const compensation_others_schema_1 = require("../../schemas/compensation-others.schema");
const compensation_config_schema_1 = require("../../schemas/compensation-config.schema");
const user_schema_1 = require("../../schemas/user.schema");
const subsidiary_schema_1 = require("../../schemas/subsidiary.schema");
const workflow_notifier_service_1 = require("../comms/workflow-notifier.service");
const access_control_util_1 = require("../../utils/shared/access-control.util");
const PRORATE_DAYS = 30;
const proratedAmount = (base, days) => {
    if (!Number.isFinite(base) || base <= 0)
        return 0;
    const safeDays = Number.isFinite(days) && days > 0 ? Math.min(days, PRORATE_DAYS) : 0;
    return Math.round((base * safeDays) / PRORATE_DAYS * 100) / 100;
};
let CompensationOthersService = CompensationOthersService_1 = class CompensationOthersService {
    constructor(othersModel, userModel, subsidiaryModel, configModel, workflowNotifier) {
        this.othersModel = othersModel;
        this.userModel = userModel;
        this.subsidiaryModel = subsidiaryModel;
        this.configModel = configModel;
        this.workflowNotifier = workflowNotifier;
    }
    async resolveEntityObjectId(value) {
        if (!value)
            return null;
        const trimmed = String(value).trim();
        if (!trimmed)
            return null;
        if (mongoose_2.default.Types.ObjectId.isValid(trimmed)) {
            return new mongoose_2.default.Types.ObjectId(trimmed);
        }
        const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const exact = new RegExp(`^${escaped}$`, 'i');
        const subsidiary = (await this.subsidiaryModel
            .findOne({ $or: [{ short: exact }, { name: exact }] })
            .select('_id')
            .lean()
            .exec());
        if (subsidiary?._id) {
            return new mongoose_2.default.Types.ObjectId(String(subsidiary._id));
        }
        return null;
    }
    toObjectId(value, field) {
        if (!value || !mongoose_2.default.Types.ObjectId.isValid(value)) {
            throw new common_1.BadRequestException(`Invalid ${field} provided.`);
        }
        return new mongoose_2.default.Types.ObjectId(value);
    }
    normalizeIdentifier(value) {
        if (value == null)
            return null;
        const candidate = typeof value === 'object'
            ? value?._id ?? value?.id ?? value?.userId ?? value?.email ?? value
            : value;
        const str = String(candidate ?? '').trim();
        if (!str)
            return null;
        const lowered = str.toLowerCase();
        if (lowered === 'undefined' || lowered === 'null' || lowered === '[object object]') {
            return null;
        }
        return str;
    }
    getUserIdentifierVariants(user) {
        const candidates = [user?.id, user?._id, user?.userId];
        return Array.from(new Set(candidates
            .map((value) => this.normalizeIdentifier(value))
            .filter((value) => Boolean(value))));
    }
    extractRoleNames(roleLike) {
        const names = [];
        const register = (value) => {
            if (typeof value === 'string' && value.trim()) {
                names.push(value.trim().toLowerCase());
            }
        };
        if (!roleLike)
            return names;
        if (typeof roleLike === 'string') {
            register(roleLike);
            return names;
        }
        register(roleLike?.name);
        register(roleLike?.label);
        if (roleLike?.role) {
            register(roleLike?.role?.name);
            register(roleLike?.role?.label);
        }
        return names;
    }
    extractPermissionNames(user) {
        const names = new Set();
        const register = (source) => {
            if (!source)
                return;
            const values = Array.isArray(source) ? source : [source];
            values.forEach((permission) => {
                if (!permission)
                    return;
                if (typeof permission === 'string') {
                    names.add(permission.trim().toLowerCase());
                }
                else if (typeof permission?.name === 'string') {
                    names.add(permission.name.trim().toLowerCase());
                }
            });
        };
        register(user?.permissions);
        register(user?.role?.permissions);
        if (Array.isArray(user?.roles)) {
            user.roles.forEach((role) => {
                register(role?.permissions);
                register(role?.role?.permissions);
            });
        }
        const additional = Array.isArray(user?.additionalRoles)
            ? user.additionalRoles
            : user?.additionalRoles
                ? [user.additionalRoles]
                : [];
        additional.forEach((assignment) => {
            const roleNode = assignment?.role ?? assignment;
            register(roleNode?.permissions);
        });
        return names;
    }
    hasGlobalAccess(user) {
        if (!user)
            return false;
        const permissions = this.extractPermissionNames(user);
        if (permissions.has('all'))
            return true;
        for (const name of permissions) {
            if (CompensationOthersService_1.SUPER_ADMIN_ROLE_NAMES.has(name)) {
                return true;
            }
        }
        const additional = Array.isArray(user?.additionalRoles)
            ? user.additionalRoles.map((assignment) => assignment?.role ?? assignment)
            : [];
        const sources = [
            user?.role,
            ...(Array.isArray(user?.roles) ? user.roles : []),
            ...additional,
        ];
        return sources.some((roleLike) => this.extractRoleNames(roleLike).some((name) => CompensationOthersService_1.SUPER_ADMIN_ROLE_NAMES.has(name)));
    }
    async generate(dto) {
        if (!dto) {
            throw new common_1.BadRequestException('Payload is required.');
        }
        const title = (dto.title ?? '').trim();
        const glCode = (dto.glCode ?? '').trim();
        const month = (dto.month ?? '').trim();
        if (!title)
            throw new common_1.BadRequestException('Title is required.');
        if (!glCode)
            throw new common_1.BadRequestException('GL code is required.');
        if (!month)
            throw new common_1.BadRequestException('Month is required.');
        if (!dto.workflow) {
            throw new common_1.BadRequestException('Workflow assignments are required.');
        }
        if (!Array.isArray(dto.entries) || dto.entries.length === 0) {
            throw new common_1.BadRequestException('At least one entry is required.');
        }
        const entity = this.toObjectId(dto.entity, 'entity');
        const workflow = {
            reviewerId: this.toObjectId(dto.workflow.reviewerId, 'reviewer'),
            approverId: this.toObjectId(dto.workflow.approverId, 'approver'),
            posterId: this.toObjectId(dto.workflow.posterId, 'poster'),
            reviewerStatus: 'Pending',
            approverStatus: 'Pending',
            posterStatus: 'Pending',
        };
        const draftEntries = dto.entries
            .map((entry) => {
            const base = Number(entry?.baseAmount ?? entry?.amount) || 0;
            const days = Number(entry?.days ?? PRORATE_DAYS);
            const providedAmount = Number(entry?.amount);
            const amount = Number.isFinite(providedAmount) && providedAmount > 0
                ? Math.round(providedAmount * 100) / 100
                : proratedAmount(base, days);
            return {
                userId: this.toObjectId(entry.userId, 'entry userId'),
                staffId: entry.staffId ?? '',
                atlasAccount: entry.atlasAccount ?? '',
                baseAmount: base,
                days: Number.isFinite(days) && days > 0 ? days : PRORATE_DAYS,
                amount,
            };
        })
            .filter((entry) => entry.amount > 0);
        if (draftEntries.length === 0) {
            throw new common_1.BadRequestException('No valid entries with amounts greater than zero.');
        }
        const userIds = draftEntries.map((entry) => entry.userId);
        const users = userIds.length
            ? await this.userModel
                .find({ _id: { $in: userIds } })
                .populate('branch', '_id name gl')
                .select('_id branch')
                .lean()
                .exec()
            : [];
        const branchByUser = new Map();
        for (const u of users) {
            const branch = u?.branch;
            if (branch && typeof branch === 'object') {
                branchByUser.set(String(u._id), {
                    branchId: branch?._id,
                    name: branch?.name ?? '',
                    gl: branch?.gl ?? '',
                });
            }
        }
        const entries = draftEntries.map((entry) => {
            const branchInfo = branchByUser.get(String(entry.userId));
            return {
                ...entry,
                branch: branchInfo?.branchId,
                branchName: branchInfo?.name ?? '',
                branchGL: branchInfo?.gl ?? '',
            };
        });
        const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);
        const created = await this.othersModel.create({
            entity,
            title,
            glCode,
            month,
            totalAmount,
            entries,
            workflow,
            status: 'PENDING_REVIEW',
            createdBy: dto.createdBy
                ? this.toObjectId(dto.createdBy, 'createdBy')
                : undefined,
        });
        await this.workflowNotifier?.dispatch({
            module: 'others',
            event: 'submitted',
            doc: created,
        });
        return { success: true, data: created.toObject() };
    }
    async hasAssignmentsFor(user) {
        if (this.hasGlobalAccess(user)) {
            const count = await this.othersModel.countDocuments({});
            return { hasAssignments: true, count };
        }
        const rawId = user?._id ?? user?.id ?? user?.userId;
        const userId = rawId ? String(rawId) : '';
        if (!userId || !mongoose_2.default.Types.ObjectId.isValid(userId)) {
            return { hasAssignments: false, count: 0 };
        }
        const objectId = new mongoose_2.default.Types.ObjectId(userId);
        const count = await this.othersModel.countDocuments({
            $or: [
                { 'workflow.reviewerId': objectId },
                { 'workflow.approverId': objectId },
                { 'workflow.posterId': objectId },
                { createdBy: objectId },
            ],
        });
        return { hasAssignments: count > 0, count };
    }
    async list(filter = {}, user) {
        const query = {};
        if (filter.entity) {
            const resolvedEntity = await this.resolveEntityObjectId(filter.entity);
            if (!resolvedEntity) {
                return [];
            }
            query.entity = resolvedEntity;
        }
        if (filter.month)
            query.month = filter.month;
        if (filter.status)
            query.status = filter.status;
        const requesterIdentifiers = this.getUserIdentifierVariants(user);
        const requesterIdentifierSet = new Set(requesterIdentifiers.map((value) => value.toLowerCase()));
        const requestedAssignedId = this.normalizeIdentifier(filter.assignedId);
        const hasGlobalAccess = this.hasGlobalAccess(user);
        if (requestedAssignedId &&
            requesterIdentifierSet.size &&
            !requesterIdentifierSet.has(requestedAssignedId.toLowerCase()) &&
            !hasGlobalAccess) {
            throw new common_1.ForbiddenException('You are not allowed to filter compensation others for another user.');
        }
        const targetAssignedIdentifiers = requestedAssignedId
            ? requesterIdentifierSet.has(requestedAssignedId.toLowerCase())
                ? requesterIdentifiers
                : [requestedAssignedId]
            : requesterIdentifiers;
        const shouldRestrictToAssigned = Boolean(filter.assignedOnly) &&
            Boolean(targetAssignedIdentifiers.length) &&
            (!hasGlobalAccess || Boolean(requestedAssignedId));
        if (shouldRestrictToAssigned && targetAssignedIdentifiers.length) {
            const objectIds = targetAssignedIdentifiers
                .filter((id) => mongoose_2.default.Types.ObjectId.isValid(id))
                .map((id) => new mongoose_2.default.Types.ObjectId(id));
            if (objectIds.length) {
                query.$or = [
                    { 'workflow.reviewerId': { $in: objectIds } },
                    { 'workflow.approverId': { $in: objectIds } },
                    { 'workflow.posterId': { $in: objectIds } },
                    { createdBy: { $in: objectIds } },
                ];
            }
            else {
                return [];
            }
        }
        return this.othersModel
            .find(query)
            .sort({ createdAt: -1 })
            .populate({ path: 'entity', select: '_id name short' })
            .populate({ path: 'workflow.reviewerId', select: '_id firstName lastName email' })
            .populate({ path: 'workflow.approverId', select: '_id firstName lastName email' })
            .populate({ path: 'workflow.posterId', select: '_id firstName lastName email' })
            .populate({ path: 'createdBy', select: '_id firstName lastName email' })
            .lean();
    }
    async updateFinanceComment(id, user, comment) {
        if (!mongoose_2.default.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid id.');
        }
        if ((0, access_control_util_1.userDepartmentIncludes)(user, 'audit')) {
            throw new common_1.ForbiddenException('Audit department has read-only access.');
        }
        const doc = await this.othersModel.findById(id);
        if (!doc)
            throw new common_1.NotFoundException('Compensation record not found.');
        if (!(0, access_control_util_1.userIsSuperAdmin)(user) && !(0, access_control_util_1.userCanLeaveFinanceComment)(user)) {
            throw new common_1.ForbiddenException('Only super admins and the finance/fincon departments can leave a finance comment.');
        }
        const financeComment = typeof comment === 'string' ? comment.trim() : '';
        doc.financeComment = financeComment || undefined;
        const actorId = user?._id ?? user?.id ?? user?.userId;
        doc.financeCommentBy =
            actorId && mongoose_2.default.Types.ObjectId.isValid(String(actorId))
                ? new mongoose_2.default.Types.ObjectId(String(actorId))
                : undefined;
        doc.financeCommentByName =
            (typeof user?.fullName === 'string' && user.fullName.trim()) ||
                [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
                user?.email ||
                undefined;
        doc.financeCommentAt = new Date();
        await doc.save();
        return { status: 200, message: 'Finance comment updated successfully.' };
    }
    async act(id, stage, action, userId) {
        if (!mongoose_2.default.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid id.');
        }
        if (!['reviewer', 'approver', 'poster'].includes(stage)) {
            throw new common_1.BadRequestException('Invalid stage.');
        }
        if (!['approve', 'reject'].includes(action)) {
            throw new common_1.BadRequestException('Invalid action.');
        }
        const doc = await this.othersModel.findById(id);
        if (!doc)
            throw new common_1.NotFoundException('Compensation record not found.');
        const stageStatusField = `${stage}Status`;
        const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
        const stageAssigneeField = `${stage}Id`;
        const assignee = doc.workflow[stageAssigneeField];
        if (!userId ||
            !mongoose_2.default.Types.ObjectId.isValid(userId) ||
            !assignee ||
            String(assignee) !== String(userId)) {
            throw new common_1.BadRequestException('You are not assigned to this workflow stage.');
        }
        if (action === 'approve') {
            const { reviewerStatus: revStatus, approverStatus: appStatus } = doc.workflow;
            if (stage === 'approver' && revStatus !== 'Approved') {
                throw new common_1.BadRequestException('Reviewer approval is required before approver approval.');
            }
            if (stage === 'poster' && appStatus !== 'Approved') {
                throw new common_1.BadRequestException('Approver approval is required before posting.');
            }
        }
        doc.workflow[stageStatusField] = newStatus;
        const { reviewerStatus, approverStatus, posterStatus } = doc.workflow;
        if (reviewerStatus === 'Rejected' ||
            approverStatus === 'Rejected' ||
            posterStatus === 'Rejected') {
            doc.status = 'REJECTED';
        }
        else if (posterStatus === 'Approved') {
            doc.status = 'APPROVED';
        }
        else if (approverStatus === 'Approved') {
            doc.status = 'PENDING_POSTING';
        }
        else if (reviewerStatus === 'Approved') {
            doc.status = 'PENDING_APPROVAL';
        }
        else {
            doc.status = 'PENDING_REVIEW';
        }
        await doc.save();
        const event = action === 'reject'
            ? 'rejected'
            : stage === 'reviewer'
                ? 'reviewed'
                : stage === 'approver'
                    ? 'approved'
                    : 'posted';
        if (event) {
            await this.workflowNotifier?.dispatch({
                module: 'others',
                event,
                doc,
            });
        }
        return doc.toObject();
    }
    async switchApprovalAccount(_user, othersId, staffId, accountType) {
        if (!mongoose_2.default.Types.ObjectId.isValid(othersId)) {
            throw new common_1.BadRequestException('Invalid id.');
        }
        const normalizedType = String(accountType ?? '').trim().toLowerCase();
        if (normalizedType !== 'atlas' && normalizedType !== 'addosser') {
            throw new common_1.BadRequestException('accountType must be "atlas" or "addosser".');
        }
        const target = String(staffId ?? '').trim();
        if (!target) {
            throw new common_1.BadRequestException('staffId is required.');
        }
        const doc = await this.othersModel.findById(othersId);
        if (!doc)
            throw new common_1.NotFoundException('Compensation record not found.');
        if (String(doc.status ?? '').toUpperCase() === 'APPROVED') {
            throw new common_1.BadRequestException('The payout account can no longer be switched after the batch has been posted.');
        }
        const entries = Array.isArray(doc.entries)
            ? doc.entries
            : [];
        const targetKey = target.toLowerCase();
        const idOf = (entry) => String(entry?.staffId ?? entry?.userId ?? '')
            .trim()
            .toLowerCase();
        const matches = entries.filter((entry) => idOf(entry) === targetKey);
        if (!matches.length) {
            throw new common_1.NotFoundException('Staff not found in this approval.');
        }
        const userIds = Array.from(new Set(matches
            .map((entry) => this.normalizeIdentifier(entry?.userId))
            .filter((value) => Boolean(value))));
        const userDoc = userIds.length
            ? await this.userModel
                .findOne({ _id: { $in: userIds } })
                .select('_id atlasAccount addosserAccount')
                .lean()
                .exec()
            : null;
        const source = normalizedType === 'atlas'
            ? userDoc?.atlasAccount
            : userDoc?.addosserAccount;
        const account = source === null || source === undefined ? '' : String(source).trim();
        if (!account) {
            throw new common_1.BadRequestException(`This staff has no ${normalizedType === 'atlas' ? 'Atlas' : 'Addosser'} account on file.`);
        }
        for (const entry of matches) {
            entry.payoutAccount = account;
            entry.payoutAccountType = normalizedType;
        }
        doc.markModified('entries');
        await doc.save();
        return {
            status: 200,
            message: 'Payout account switched successfully.',
            accountType: normalizedType,
            account,
        };
    }
    async switchApprovalAccountForAll(_user, othersId, accountType) {
        if (!mongoose_2.default.Types.ObjectId.isValid(othersId)) {
            throw new common_1.BadRequestException('Invalid id.');
        }
        const normalizedType = String(accountType ?? '').trim().toLowerCase();
        if (normalizedType !== 'atlas' && normalizedType !== 'addosser') {
            throw new common_1.BadRequestException('accountType must be "atlas" or "addosser".');
        }
        const doc = await this.othersModel.findById(othersId);
        if (!doc)
            throw new common_1.NotFoundException('Compensation record not found.');
        if (String(doc.status ?? '').toUpperCase() === 'APPROVED') {
            throw new common_1.BadRequestException('The payout account can no longer be switched after the batch has been posted.');
        }
        const entries = Array.isArray(doc.entries)
            ? doc.entries
            : [];
        if (!entries.length) {
            throw new common_1.NotFoundException('This record has no entries to switch.');
        }
        const userIds = Array.from(new Set(entries
            .map((entry) => this.normalizeIdentifier(entry?.userId))
            .filter((value) => Boolean(value))));
        const users = userIds.length
            ? await this.userModel
                .find({ _id: { $in: userIds } })
                .select('_id atlasAccount addosserAccount')
                .lean()
                .exec()
            : [];
        const usersById = new Map(users.map((user) => [String(user._id), user]));
        let switched = 0;
        let skipped = 0;
        for (const entry of entries) {
            const userDoc = usersById.get(this.normalizeIdentifier(entry?.userId) ?? '');
            const source = normalizedType === 'atlas'
                ? userDoc?.atlasAccount
                : userDoc?.addosserAccount;
            const account = source === null || source === undefined ? '' : String(source).trim();
            if (!account) {
                skipped += 1;
                continue;
            }
            entry.payoutAccount = account;
            entry.payoutAccountType = normalizedType;
            switched += 1;
        }
        const label = normalizedType === 'atlas' ? 'Atlas' : 'Addosser';
        if (!switched) {
            throw new common_1.BadRequestException(`No staff in this record has a ${label} account on file.`);
        }
        doc.markModified('entries');
        await doc.save();
        return {
            status: 200,
            message: skipped
                ? `Payout account switched for ${switched} entry(ies); ${skipped} entry(ies) had no ${label} account on file and were left unchanged.`
                : 'Payout account switched successfully.',
            accountType: normalizedType,
            switched,
            skipped,
            appliedToAll: skipped === 0,
        };
    }
    async findById(id) {
        if (!mongoose_2.default.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid id.');
        }
        const doc = await this.othersModel
            .findById(id)
            .populate({
            path: 'entries.userId',
            select: '_id firstName lastName staffId email branch',
            populate: { path: 'branch', select: '_id name short code gl' },
        })
            .populate({ path: 'entries.branch', select: '_id name short code gl' })
            .populate({ path: 'workflow.reviewerId', select: '_id firstName lastName email' })
            .populate({ path: 'workflow.approverId', select: '_id firstName lastName email' })
            .populate({ path: 'workflow.posterId', select: '_id firstName lastName email' })
            .populate({ path: 'createdBy', select: '_id firstName lastName email' })
            .populate({ path: 'entity', select: '_id name short gl' })
            .lean();
        if (!doc)
            throw new common_1.NotFoundException('Compensation record not found.');
        return doc;
    }
};
exports.CompensationOthersService = CompensationOthersService;
CompensationOthersService.SUPER_ADMIN_ROLE_NAMES = access_control_util_1.SUPER_ADMIN_ROLE_NAME_SET_WITH_MD;
exports.CompensationOthersService = CompensationOthersService = CompensationOthersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(compensation_others_schema_1.CompensationOthers.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(subsidiary_schema_1.Subsidiary.name)),
    __param(3, (0, common_1.Optional)()),
    __param(3, (0, mongoose_1.InjectModel)(compensation_config_schema_1.CompensationConfig.name)),
    __param(4, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        workflow_notifier_service_1.WorkflowNotifier])
], CompensationOthersService);
//# sourceMappingURL=compensation-others.service.js.map