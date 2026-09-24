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
exports.ExitService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const exit_request_schema_1 = require("../../schemas/exit-request.schema");
const exit_clearance_schema_1 = require("../../schemas/exit-clearance.schema");
const exit_interview_schema_1 = require("../../schemas/exit-interview.schema");
const exit_workflow_schema_1 = require("../../schemas/exit-workflow.schema");
const mail_service_1 = require("../comms/mail.service");
const exit_payout_1 = require("./exit-payout");
const DUPLICATE_KEY = 11000;
let ExitService = class ExitService {
    constructor(requestModel, clearanceModel, userModel, departmentModel, workflowModel, mailService, payrollConfigModel, interviewModel) {
        this.requestModel = requestModel;
        this.clearanceModel = clearanceModel;
        this.userModel = userModel;
        this.departmentModel = departmentModel;
        this.workflowModel = workflowModel;
        this.mailService = mailService;
        this.payrollConfigModel = payrollConfigModel;
        this.interviewModel = interviewModel;
    }
    text(value) {
        return String(value ?? '').trim();
    }
    objectId(value, label) {
        const raw = this.text(value?._id ?? value?.id ?? value);
        if (!raw || !mongoose_2.Types.ObjectId.isValid(raw)) {
            throw new common_1.BadRequestException(`${label} is required.`);
        }
        return new mongoose_2.Types.ObjectId(raw);
    }
    optionalObjectId(value) {
        const raw = this.text(value?._id ?? value?.id ?? value);
        return raw && mongoose_2.Types.ObjectId.isValid(raw) ? new mongoose_2.Types.ObjectId(raw) : null;
    }
    toDate(value, label) {
        const parsed = value instanceof Date ? value : new Date(this.text(value));
        if (!this.text(value) || Number.isNaN(parsed.getTime())) {
            throw new common_1.BadRequestException(`${label} must be a valid date.`);
        }
        return parsed;
    }
    startOfDay(value) {
        return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }
    noticePeriod(value) {
        const normalized = this.text(value).toLowerCase();
        if (!normalized)
            return null;
        const match = exit_request_schema_1.NOTICE_PERIODS.find((period) => period.toLowerCase() === normalized);
        if (!match) {
            throw new common_1.BadRequestException(`Notice period must be one of: ${exit_request_schema_1.NOTICE_PERIODS.join(', ')}.`);
        }
        return match;
    }
    appendHistory(request, action, actor, comment) {
        request.history = [
            ...(request.history ?? []),
            {
                action,
                actor: mongoose_2.Types.ObjectId.isValid(actor.id) ? new mongoose_2.Types.ObjectId(actor.id) : null,
                actorName: actor.name,
                comment: this.text(comment),
                at: new Date(),
            },
        ];
    }
    canSeeDetail(doc, actor) {
        if (actor.isHr)
            return true;
        return this.text(doc?.staff?._id ?? doc?.staff) === this.text(actor.id);
    }
    isLineManagerOf(doc, actor) {
        const lineManager = this.text(doc?.lineManager?._id ?? doc?.lineManager);
        return Boolean(lineManager) && lineManager === this.text(actor.id);
    }
    mapRequest(doc, actor) {
        const full = this.canSeeDetail(doc, actor);
        const lineManager = !full && this.isLineManagerOf(doc, actor);
        const base = {
            id: String(doc?._id ?? ''),
            staffObjectId: String(doc?.staff?._id ?? doc?.staff ?? ''),
            staffName: this.text(doc?.staffName),
            staffId: this.text(doc?.staffId) || '-',
            proposedExitDate: doc?.proposedExitDate
                ? new Date(doc.proposedExitDate).toISOString()
                : null,
            approvedExitDate: doc?.approvedExitDate
                ? new Date(doc.approvedExitDate).toISOString()
                : null,
            status: doc?.status ?? 'PENDING',
            submittedAt: doc?.submittedAt ? new Date(doc.submittedAt).toISOString() : null,
            decidedByName: this.text(doc?.decidedByName),
            decidedAt: doc?.decidedAt ? new Date(doc.decidedAt).toISOString() : null,
            restricted: !full,
        };
        const handover = {
            handoverNote: this.text(doc?.handoverNote),
            handoverAttachments: (doc?.handoverAttachments ?? []).map((file) => ({
                fileName: this.text(file?.fileName),
                storedName: this.text(file?.storedName),
                uploadedAt: file?.uploadedAt ? new Date(file.uploadedAt).toISOString() : null,
            })),
        };
        if (lineManager)
            return { ...base, ...handover };
        if (!full)
            return base;
        return {
            ...base,
            ...handover,
            reason: this.text(doc?.reason),
            noticePeriod: doc?.noticePeriod ?? null,
            decisionComment: this.text(doc?.decisionComment),
            history: (doc?.history ?? []).map((entry) => ({
                action: entry?.action,
                actorName: this.text(entry?.actorName),
                comment: this.text(entry?.comment),
                at: entry?.at ? new Date(entry.at).toISOString() : null,
            })),
        };
    }
    async listMine(actor) {
        const docs = await this.requestModel
            .find({ staff: this.objectId(actor.id, 'Staff') })
            .sort({ submittedAt: -1 })
            .lean()
            .exec();
        return docs.map((doc) => this.mapRequest(doc, actor));
    }
    async list(filters, actor) {
        const query = {};
        if (!actor.isHr) {
            const userId = this.optionalObjectId(actor.id);
            if (!userId) {
                throw new common_1.ForbiddenException('Only HR can review exit requests.');
            }
            query.lineManager = userId;
        }
        const status = this.text(filters?.status);
        if (status && status !== 'all') {
            const match = exit_request_schema_1.EXIT_REQUEST_STATUSES.find((value) => value.toLowerCase() === status.toLowerCase());
            if (!match)
                throw new common_1.BadRequestException('Unknown exit request status.');
            query.status = match;
        }
        const search = this.text(filters?.search);
        if (search) {
            const pattern = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.$or = [
                { staffName: { $regex: pattern, $options: 'i' } },
                { staffId: { $regex: pattern, $options: 'i' } },
            ];
        }
        const docs = await this.requestModel
            .find(query)
            .sort({ submittedAt: -1 })
            .lean()
            .exec();
        return docs.map((doc) => this.mapRequest(doc, actor));
    }
    async getOne(id, actor) {
        const doc = await this.requestModel
            .findById(this.objectId(id, 'Exit request'))
            .lean()
            .exec();
        if (!doc)
            throw new common_1.NotFoundException('Exit request not found.');
        if (!this.canSeeDetail(doc, actor) && !this.isLineManagerOf(doc, actor)) {
            throw new common_1.ForbiddenException('Only HR, the staff member and their line manager can open this request.');
        }
        return this.mapRequest(doc, actor);
    }
    buildClearance(request, exitDate, user, departmentName, configuredStages) {
        const marketFacing = (0, exit_clearance_schema_1.isMarketFacingDepartment)(departmentName);
        const stageSource = (configuredStages ?? []).length
            ? [
                {
                    key: exit_workflow_schema_1.LINE_MANAGER_STAGE_KEY,
                    label: 'Line manager',
                    unit: 'Line Manager',
                },
                ...(configuredStages ?? [])
                    .slice()
                    .sort((a, b) => Number(a?.order ?? 0) - Number(b?.order ?? 0))
                    .map((stage) => ({
                    key: this.text(stage?.key),
                    label: this.text(stage?.label) || this.text(stage?.key),
                    unit: this.text(stage?.unit),
                })),
            ]
            : exit_clearance_schema_1.CLEARANCE_SECTIONS.map((section) => ({ ...section }));
        return {
            exitRequest: request._id,
            staff: request.staff,
            staffName: request.staffName,
            staffId: request.staffId,
            designation: this.text(user?.employeeInformation?.position),
            entity: request.entity,
            department: request.department,
            branch: request.branch,
            lineManager: request.lineManager,
            exitDate,
            marketFacing,
            items: exit_clearance_schema_1.CLEARANCE_ITEMS.map((item) => ({
                key: item.key,
                label: item.label,
                unit: item.unit,
                status: 'PENDING',
            })),
            sections: stageSource.map((section) => ({
                key: section.key,
                label: section.label,
                unit: section.unit,
                status: section.key === 'LOAN_MONITORING' && !marketFacing
                    ? 'NOT_APPLICABLE'
                    : 'PENDING',
                data: {},
            })),
            status: 'IN_PROGRESS',
        };
    }
    async exitAccountFor(entity) {
        const entityId = this.optionalObjectId(entity);
        if (!entityId || !this.payrollConfigModel)
            return '';
        const config = await this.payrollConfigModel
            .findOne({ entity: entityId })
            .select('exitAccount')
            .lean()
            .exec();
        return this.text(config?.exitAccount);
    }
    async applyExitPayouts(rows, options) {
        if (!Array.isArray(rows) || !rows.length)
            return rows ?? [];
        const staffIds = rows
            .map((row) => this.optionalObjectId(row?.staffObjectId ?? row?.userId))
            .filter((value) => Boolean(value));
        if (!staffIds.length)
            return rows;
        const clearances = await this.clearanceModel
            .find({ staff: { $in: staffIds } })
            .select('staff status completedAt')
            .lean()
            .exec();
        if (!clearances.length)
            return rows;
        const byStaff = new Map(clearances.map((row) => [this.text(row?.staff), row]));
        const exitAccountNumber = await this.exitAccountFor(options?.entity);
        return rows.map((row) => {
            const key = this.text(row?.staffObjectId ?? row?.userId);
            const clearance = key ? byStaff.get(key) : null;
            if (!clearance)
                return row;
            const decision = (0, exit_payout_1.resolveExitPayout)({
                staffName: row?.name,
                staffId: row?.staffId,
                accountNumber: this.text(row?.accountNo ?? row?.account),
                baseNarration: this.text(row?.narration),
                clearanceStatus: clearance?.status,
                clearanceCompletedAt: clearance?.completedAt,
                payrollRunDate: options?.runDate ?? null,
                exitAccountNumber,
            });
            if (!decision.redirected)
                return row;
            return {
                ...row,
                account: decision.accountNumber,
                accountNo: decision.accountNumber,
                narration: decision.narration,
                exitRedirected: true,
            };
        });
    }
    async notifyLineManager(request, exitDate) {
        if (!this.mailService || !this.userModel)
            return false;
        const lineManagerId = this.optionalObjectId(request?.lineManager);
        if (!lineManagerId)
            return false;
        const manager = await this.userModel
            .findById(lineManagerId)
            .select('email firstName lastName')
            .lean()
            .exec();
        const to = this.text(manager?.email);
        if (!to)
            return false;
        const staffName = this.text(request?.staffName) || 'A member of your team';
        const when = exitDate.toDateString();
        try {
            const result = await this.mailService.sendMail({
                to,
                subject: `Exit clearance: ${staffName}`,
                text: [
                    `${staffName} is leaving on ${when}.`,
                    '',
                    'As their line manager you are asked to confirm the hand over and comment on it',
                    'as part of their exit clearance. The other clearance units have been opened too.',
                    '',
                    'You were not chosen for this in the exit workflow settings; it follows from being',
                    'recorded as their supervisor.',
                ].join('\n'),
            });
            return Boolean(result?.success);
        }
        catch {
            return false;
        }
    }
    async resolveDepartmentName(department) {
        if (!this.departmentModel || !department)
            return '';
        const id = this.optionalObjectId(department);
        if (!id)
            return '';
        const doc = await this.departmentModel
            .findById(id)
            .select('name')
            .lean()
            .exec();
        return this.text(doc?.name);
    }
    hrActor(actor) {
        return {
            id: this.text(actor?.id),
            name: this.text(actor?.name) || 'HR',
            isHr: true,
            isSuperAdmin: false,
        };
    }
    async commenceExit(staffId, rawExitDate, actor) {
        const staff = await this.userModel.findById(staffId).exec();
        if (!staff)
            return null;
        const parsed = new Date(rawExitDate);
        if (Number.isNaN(parsed.getTime()))
            return null;
        const exitDate = this.startOfDay(parsed);
        const initiator = this.hrActor(actor);
        const decidedBy = this.optionalObjectId(initiator.id);
        if (!this.text(actor?.name) && decidedBy) {
            const hr = await this.userModel
                .findById(decidedBy)
                .select('firstName lastName middleName email')
                .lean()
                .exec();
            const resolved = [hr?.lastName, hr?.firstName, hr?.middleName]
                .map((part) => this.text(part))
                .filter(Boolean)
                .join(' ')
                .trim();
            if (resolved)
                initiator.name = resolved;
        }
        const now = new Date();
        let request = await this.requestModel
            .findOne({ staff: staff._id, status: { $in: ['PENDING', 'APPROVED'] } })
            .sort({ submittedAt: -1 })
            .exec();
        if (request) {
            const alreadyOnThisDate = request.status === 'APPROVED' &&
                request.approvedExitDate &&
                new Date(request.approvedExitDate).getTime() === exitDate.getTime();
            if (!alreadyOnThisDate) {
                request.status = 'APPROVED';
                request.approvedExitDate = exitDate;
                request.decidedBy = decidedBy;
                request.decidedByName = initiator.name;
                request.decidedAt = now;
                this.appendHistory(request, 'INITIATED', initiator, 'Exit date set by HR.');
                await request.save();
            }
        }
        else {
            const staffName = [staff?.lastName, staff?.firstName, staff?.middleName]
                .map((part) => this.text(part))
                .filter(Boolean)
                .join(' ')
                .trim();
            request = new this.requestModel({
                staff: staff._id,
                staffName: staffName || this.text(staff?.email),
                staffId: this.text(staff?.staffId),
                entity: this.optionalObjectId(staff?.entity),
                department: this.optionalObjectId(staff?.department),
                branch: this.optionalObjectId(staff?.branch),
                lineManager: this.optionalObjectId(staff?.supervisorId),
                proposedExitDate: exitDate,
                approvedExitDate: exitDate,
                status: 'APPROVED',
                submittedAt: now,
                decidedBy,
                decidedByName: initiator.name,
                decidedAt: now,
            });
            this.appendHistory(request, 'INITIATED', initiator, 'Exit date set by HR.');
            await request.save();
        }
        let clearance = await this.clearanceModel
            .findOne({ exitRequest: request._id })
            .exec();
        if (clearance) {
            if (new Date(clearance.exitDate).getTime() !== exitDate.getTime()) {
                clearance.exitDate = exitDate;
                await clearance.save();
            }
            return {
                created: false,
                requestId: String(request._id),
                clearanceId: String(clearance._id),
            };
        }
        const departmentName = await this.resolveDepartmentName(request.department);
        const workflow = await this.workflowModel
            ?.findOne({ entity: request.entity })
            .lean()
            .exec();
        clearance = await this.clearanceModel.create(this.buildClearance(request, exitDate, typeof staff?.toObject === 'function' ? staff.toObject() : staff, departmentName, workflow?.stages ?? []));
        await this.notifyLineManager(request, exitDate);
        return {
            created: true,
            requestId: String(request._id),
            clearanceId: String(clearance._id),
        };
    }
    async getMyClearance(actor) {
        const staffId = this.text(actor?.id);
        if (!staffId || !mongoose_2.Types.ObjectId.isValid(staffId))
            return { data: null };
        const doc = await this.clearanceModel
            .findOne({ staff: new mongoose_2.Types.ObjectId(staffId) })
            .sort({ exitDate: -1 })
            .lean()
            .exec();
        if (!doc)
            return { data: null };
        return {
            data: this.mapClearance(doc, {
                isHr: false,
                isStageMember: false,
                stages: [],
                userId: staffId,
            }),
        };
    }
    async resolveAccess(user, actor) {
        if (actor.isHr) {
            return {
                isHr: true,
                isStageMember: true,
                isLineManager: false,
                canSeeClearance: true,
                stages: [],
            };
        }
        const entityId = this.optionalObjectId(user?.entity?._id ?? user?.entity);
        const config = entityId
            ? await this.workflowModel?.findOne({ entity: entityId }).lean().exec()
            : null;
        const userId = this.text(user?._id ?? user?.id);
        const departmentId = this.text(user?.department?._id ?? user?.department);
        const stages = (config?.stages ?? [])
            .filter((stage) => {
            const byUser = (stage?.userIds ?? []).some((id) => this.text(id) === userId);
            const byDepartment = (stage?.departmentIds ?? []).some((id) => this.text(id) === departmentId);
            return byUser || byDepartment;
        })
            .map((stage) => this.text(stage?.key));
        const managesAnExit = userId
            ? Boolean(await this.clearanceModel
                .findOne({ lineManager: userId, status: 'IN_PROGRESS' })
                .select('_id')
                .lean()
                .exec())
            : false;
        return {
            isHr: false,
            isStageMember: stages.length > 0,
            isLineManager: managesAnExit,
            canSeeClearance: stages.length > 0 || managesAnExit,
            stages,
        };
    }
    stageKeyFrom(label, taken) {
        const base = this.text(label)
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .slice(0, 40) || 'STAGE';
        let key = base;
        let suffix = 2;
        while (taken.has(key) || key === exit_workflow_schema_1.LINE_MANAGER_STAGE_KEY) {
            key = `${base}_${suffix}`;
            suffix += 1;
        }
        return key;
    }
    async getWorkflowConfig(entity, actor) {
        if (!actor.isSuperAdmin) {
            throw new common_1.ForbiddenException('Only a super admin can view the exit workflow.');
        }
        const entityId = this.objectId(entity, 'Entity');
        const config = await this.workflowModel
            ?.findOne({ entity: entityId })
            .populate('stages.userIds', '_id firstName lastName email staffId')
            .populate('stages.departmentIds', '_id name')
            .populate('hrIds', '_id firstName lastName email staffId')
            .lean()
            .exec();
        const saved = Array.isArray(config?.stages) ? config.stages : [];
        const stages = saved
            .slice()
            .sort((a, b) => Number(a?.order ?? 0) - Number(b?.order ?? 0))
            .map((stage, index) => ({
            key: this.text(stage?.key),
            label: this.text(stage?.label) || this.text(stage?.key),
            unit: this.text(stage?.unit),
            order: index,
            userIds: stage?.userIds ?? [],
            departmentIds: stage?.departmentIds ?? [],
        }));
        return {
            entity: String(entityId),
            hrIds: config?.hrIds ?? [],
            usingDefaults: saved.length === 0,
            stages,
        };
    }
    async saveWorkflowConfig(payload, actor) {
        if (!actor.isSuperAdmin) {
            throw new common_1.ForbiddenException('Only a super admin can change the exit workflow.');
        }
        if (!this.workflowModel) {
            throw new common_1.ConflictException('Exit workflow storage is not available.');
        }
        const entityId = this.objectId(payload?.entity, 'Entity');
        const ids = (list) => (Array.isArray(list) ? list : [])
            .map((value) => this.optionalObjectId(value))
            .filter((value) => Boolean(value));
        const incoming = Array.isArray(payload?.stages) ? payload.stages : [];
        if (!incoming.length) {
            throw new common_1.BadRequestException('An exit workflow needs at least one stage.');
        }
        const taken = new Set();
        const stages = incoming.map((stage, index) => {
            const label = this.text(stage?.label);
            if (!label) {
                throw new common_1.BadRequestException('Every stage needs a name.');
            }
            let key = this.text(stage?.key);
            if (key === exit_workflow_schema_1.LINE_MANAGER_STAGE_KEY) {
                throw new common_1.BadRequestException('The line manager comes from the staff member\'s supervisor and is not configured here.');
            }
            if (!key || taken.has(key)) {
                key = this.stageKeyFrom(label, taken);
            }
            taken.add(key);
            return {
                key,
                label,
                unit: this.text(stage?.unit) || label,
                order: index,
                userIds: ids(stage?.userIds),
                departmentIds: ids(stage?.departmentIds),
            };
        });
        const saved = await this.workflowModel
            .findOneAndUpdate({ entity: entityId }, {
            $set: {
                entity: entityId,
                stages,
                hrIds: ids(payload?.hrIds),
                updatedBy: mongoose_2.Types.ObjectId.isValid(actor.id)
                    ? new mongoose_2.Types.ObjectId(actor.id)
                    : null,
            },
        }, { new: true, upsert: true, setDefaultsOnInsert: true })
            .lean()
            .exec();
        return { status: 200, data: saved };
    }
    mapClearance(doc, access) {
        return {
            id: String(doc?._id ?? ''),
            staffName: this.text(doc?.staffName),
            staffId: this.text(doc?.staffId) || '-',
            designation: this.text(doc?.designation),
            exitDate: doc?.exitDate ? new Date(doc.exitDate).toISOString() : null,
            marketFacing: doc?.marketFacing === true,
            status: doc?.status ?? 'IN_PROGRESS',
            lineManagerId: this.text(doc?.lineManager),
            items: (doc?.items ?? []).map((item) => ({
                key: item?.key,
                label: item?.label,
                unit: item?.unit,
                status: item?.status ?? 'PENDING',
                confirmedByName: this.text(item?.confirmedByName),
                confirmedAt: item?.confirmedAt ? new Date(item.confirmedAt).toISOString() : null,
                comment: this.text(item?.comment),
            })),
            sections: (doc?.sections ?? []).map((section) => ({
                key: section?.key,
                label: section?.label,
                unit: section?.unit,
                status: section?.status ?? 'PENDING',
                data: section?.data ?? {},
                comment: this.text(section?.comment),
                completedByName: this.text(section?.completedByName),
                completedAt: section?.completedAt ? new Date(section.completedAt).toISOString() : null,
                canEdit: this.canEditSection(doc, section?.key, access),
            })),
        };
    }
    canEditSection(clearance, key, access) {
        if (clearance?.status !== 'IN_PROGRESS')
            return false;
        if (access?.isHr)
            return true;
        if (key === 'LINE_MANAGER') {
            return this.text(clearance?.lineManager) === this.text(access?.userId);
        }
        return Array.isArray(access?.stages) && access.stages.includes(key);
    }
    async getClearance(id, user, actor) {
        const doc = await this.clearanceModel
            .findById(this.objectId(id, 'Clearance'))
            .lean()
            .exec();
        if (!doc)
            throw new common_1.NotFoundException('Exit clearance not found.');
        const access = await this.resolveAccess(user, actor);
        access.userId = this.text(user?._id ?? user?.id);
        const isLineManager = this.text(doc?.lineManager) === access.userId;
        const isExitingStaff = this.text(doc?.staff) === access.userId;
        if (!access.isHr && !access.isStageMember && !isLineManager && !isExitingStaff) {
            throw new common_1.ForbiddenException('You are not part of this exit clearance.');
        }
        return this.mapClearance(doc, access);
    }
    async saveSection(id, key, payload, user, actor) {
        const clearance = await this.clearanceModel
            .findById(this.objectId(id, 'Clearance'))
            .exec();
        if (!clearance)
            throw new common_1.NotFoundException('Exit clearance not found.');
        if (clearance.status !== 'IN_PROGRESS') {
            throw new common_1.ConflictException('This clearance is closed.');
        }
        const sectionKey = this.text(key);
        const section = (clearance.sections ?? []).find((row) => this.text(row?.key) === sectionKey);
        if (!section)
            throw new common_1.NotFoundException('That clearance section does not exist.');
        const access = await this.resolveAccess(user, actor);
        access.userId = this.text(user?._id ?? user?.id);
        if (!this.canEditSection(clearance, sectionKey, access)) {
            throw new common_1.ForbiddenException('Your unit does not sign this section.');
        }
        if (payload?.data && typeof payload.data === 'object') {
            section.data = { ...(section.data ?? {}), ...payload.data };
        }
        if (payload?.comment !== undefined) {
            section.comment = this.text(payload.comment);
        }
        if (payload?.complete) {
            section.status = 'COMPLETED';
            section.completedBy = mongoose_2.Types.ObjectId.isValid(actor.id)
                ? new mongoose_2.Types.ObjectId(actor.id)
                : null;
            section.completedByName = actor.name;
            section.completedAt = new Date();
            if (sectionKey === 'LINE_MANAGER') {
                const handoverNote = (clearance.items ?? []).find((item) => this.text(item?.key) === 'HANDOVER_NOTE');
                if (handoverNote) {
                    handoverNote.status = 'COMPLETED';
                    handoverNote.confirmedBy = mongoose_2.Types.ObjectId.isValid(actor.id)
                        ? new mongoose_2.Types.ObjectId(actor.id)
                        : null;
                    handoverNote.confirmedByName = actor.name;
                    handoverNote.confirmedAt = new Date();
                }
            }
        }
        clearance.markModified('sections');
        clearance.markModified('items');
        await clearance.save();
        return this.mapClearance(clearance.toObject(), access);
    }
    async setItemStatus(id, key, payload, user, actor) {
        const clearance = await this.clearanceModel
            .findById(this.objectId(id, 'Clearance'))
            .exec();
        if (!clearance)
            throw new common_1.NotFoundException('Exit clearance not found.');
        if (clearance.status !== 'IN_PROGRESS') {
            throw new common_1.ConflictException('This clearance is closed.');
        }
        const item = (clearance.items ?? []).find((row) => this.text(row?.key) === this.text(key));
        if (!item)
            throw new common_1.NotFoundException('That clearance item does not exist.');
        const status = this.text(payload?.status).toUpperCase();
        if (!['PENDING', 'COMPLETED', 'NOT_APPLICABLE'].includes(status)) {
            throw new common_1.BadRequestException('Item status must be PENDING, COMPLETED or NOT_APPLICABLE.');
        }
        const access = await this.resolveAccess(user, actor);
        access.userId = this.text(user?._id ?? user?.id);
        if (!access.isHr && !access.isStageMember) {
            throw new common_1.ForbiddenException('Your unit does not sign off items.');
        }
        item.status = status;
        item.comment = this.text(payload?.comment);
        item.confirmedBy = mongoose_2.Types.ObjectId.isValid(actor.id)
            ? new mongoose_2.Types.ObjectId(actor.id)
            : null;
        item.confirmedByName = actor.name;
        item.confirmedAt = status === 'PENDING' ? null : new Date();
        clearance.markModified('items');
        await clearance.save();
        return this.mapClearance(clearance.toObject(), access);
    }
    outstandingSections(clearance) {
        return (clearance?.sections ?? [])
            .filter((section) => section?.status === 'PENDING')
            .map((section) => this.text(section?.label) || this.text(section?.key));
    }
    async completeClearance(id, actor) {
        if (!actor.isHr) {
            throw new common_1.ForbiddenException('Only HR can close an exit clearance.');
        }
        const clearance = await this.clearanceModel
            .findById(this.objectId(id, 'Clearance'))
            .exec();
        if (!clearance)
            throw new common_1.NotFoundException('Exit clearance not found.');
        if (clearance.status !== 'IN_PROGRESS') {
            throw new common_1.ConflictException('This clearance is already closed.');
        }
        const outstanding = this.outstandingSections(clearance);
        if (outstanding.length) {
            throw new common_1.ConflictException(`Still waiting on: ${outstanding.join(', ')}.`);
        }
        clearance.status = 'COMPLETED';
        clearance.completedAt = new Date();
        clearance.completedBy = mongoose_2.Types.ObjectId.isValid(actor.id)
            ? new mongoose_2.Types.ObjectId(actor.id)
            : null;
        await clearance.save();
        return { status: 200, completedAt: clearance.completedAt };
    }
    async attachHandover(id, files, actor) {
        const request = await this.requestModel
            .findById(this.objectId(id, 'Exit request'))
            .exec();
        if (!request)
            throw new common_1.NotFoundException('Exit request not found.');
        if (this.text(request.staff) !== this.text(actor.id)) {
            throw new common_1.ForbiddenException('You can only attach to your own exit request.');
        }
        if (request.status !== 'PENDING') {
            throw new common_1.ConflictException('This request has already been decided.');
        }
        if (!Array.isArray(files) || !files.length) {
            throw new common_1.BadRequestException('Attach at least one file.');
        }
        request.handoverAttachments = [
            ...(request.handoverAttachments ?? []),
            ...files.map((file) => ({
                fileName: this.text(file?.originalname),
                storedName: this.text(file?.filename),
                uploadedBy: mongoose_2.Types.ObjectId.isValid(actor.id)
                    ? new mongoose_2.Types.ObjectId(actor.id)
                    : null,
                uploadedAt: new Date(),
            })),
        ];
        await request.save();
        return this.mapRequest(request.toObject(), actor);
    }
    blankInterview(exitRequest, actor) {
        return {
            id: '',
            exitRequestId: this.text(exitRequest?._id),
            staffName: this.text(exitRequest?.staffName) || actor.name,
            answers: {},
            submitted: false,
            submittedAt: null,
        };
    }
    mapInterview(doc) {
        return {
            id: String(doc?._id ?? ''),
            exitRequestId: this.text(doc?.exitRequest),
            staffName: this.text(doc?.staffName),
            answers: (doc?.answers ?? {}),
            submitted: doc?.submitted === true,
            submittedAt: doc?.submittedAt ? new Date(doc.submittedAt).toISOString() : null,
        };
    }
    async getMyInterview(actor) {
        if (!this.interviewModel)
            return null;
        const staff = this.objectId(actor.id, 'Staff');
        const request = await this.requestModel
            .findOne({ staff, status: { $in: ['PENDING', 'APPROVED'] } })
            .sort({ submittedAt: -1 })
            .lean()
            .exec();
        if (!request)
            return null;
        const existing = await this.interviewModel
            .findOne({ exitRequest: request._id })
            .lean()
            .exec();
        return existing
            ? this.mapInterview(existing)
            : this.blankInterview(request, actor);
    }
    async saveMyInterview(payload, actor) {
        if (!this.interviewModel) {
            throw new common_1.ConflictException('Exit interview storage is not available.');
        }
        const staff = this.objectId(actor.id, 'Staff');
        const request = await this.requestModel
            .findOne({ staff, status: { $in: ['PENDING', 'APPROVED'] } })
            .sort({ submittedAt: -1 })
            .lean()
            .exec();
        if (!request) {
            throw new common_1.ConflictException('Raise an exit request first and your interview will open alongside it.');
        }
        const existing = await this.interviewModel
            .findOne({ exitRequest: request._id })
            .exec();
        if (existing?.submitted) {
            throw new common_1.ConflictException('You have already submitted your exit interview.');
        }
        const answers = {};
        exit_interview_schema_1.EXIT_INTERVIEW_QUESTIONS.forEach((question) => {
            const value = this.text((payload?.answers ?? {})[question.key]);
            if (value)
                answers[question.key] = value;
        });
        const doc = existing ?? new this.interviewModel({
            exitRequest: request._id,
            staff,
            staffName: this.text(request?.staffName) || actor.name,
        });
        doc.answers = { ...(doc.answers ?? {}), ...answers };
        doc.markModified('answers');
        if (payload?.submit) {
            doc.submitted = true;
            doc.submittedAt = new Date();
        }
        await doc.save();
        return this.mapInterview(doc.toObject());
    }
    async getInterviewFor(exitRequestId, actor) {
        if (!actor.isHr) {
            throw new common_1.ForbiddenException('Only HR can read an exit interview.');
        }
        if (!this.interviewModel)
            return null;
        const doc = await this.interviewModel
            .findOne({ exitRequest: this.objectId(exitRequestId, 'Exit request') })
            .lean()
            .exec();
        return doc ? this.mapInterview(doc) : null;
    }
    async listClearances(actor, user) {
        const query = {};
        if (!actor.isHr) {
            const access = await this.resolveAccess(user, actor);
            const userId = this.optionalObjectId(actor.id);
            const clauses = [];
            if (userId)
                clauses.push({ lineManager: userId });
            if ((access?.stages ?? []).length) {
                clauses.push({ 'sections.key': { $in: access.stages } });
            }
            if (!clauses.length) {
                throw new common_1.ForbiddenException('You are not part of any exit clearance.');
            }
            query.$or = clauses;
        }
        const docs = await this.clearanceModel
            .find(query)
            .sort({ exitDate: -1 })
            .lean()
            .exec();
        return docs.map((doc) => ({
            id: String(doc?._id ?? ''),
            staffName: this.text(doc?.staffName),
            staffId: this.text(doc?.staffId) || '-',
            exitDate: doc?.exitDate ? new Date(doc.exitDate).toISOString() : null,
            status: doc?.status ?? 'IN_PROGRESS',
            itemsOutstanding: (doc?.items ?? []).filter((item) => item?.status === 'PENDING').length,
            sectionsOutstanding: (doc?.sections ?? []).filter((section) => section?.status === 'PENDING').length,
            sections: (doc?.sections ?? []).map((section) => ({
                key: section?.key,
                label: section?.label,
                unit: section?.unit,
                status: section?.status,
                completedByName: this.text(section?.completedByName),
                completedAt: section?.completedAt
                    ? new Date(section.completedAt).toISOString()
                    : null,
            })),
        }));
    }
};
exports.ExitService = ExitService;
exports.ExitService = ExitService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(exit_request_schema_1.ExitRequest.name)),
    __param(1, (0, mongoose_1.InjectModel)(exit_clearance_schema_1.ExitClearance.name)),
    __param(2, (0, mongoose_1.InjectModel)('User')),
    __param(3, (0, common_1.Optional)()),
    __param(3, (0, mongoose_1.InjectModel)('Department')),
    __param(4, (0, common_1.Optional)()),
    __param(4, (0, mongoose_1.InjectModel)(exit_workflow_schema_1.ExitWorkflowConfig.name)),
    __param(5, (0, common_1.Optional)()),
    __param(6, (0, common_1.Optional)()),
    __param(6, (0, mongoose_1.InjectModel)('Payroll')),
    __param(7, (0, common_1.Optional)()),
    __param(7, (0, mongoose_1.InjectModel)(exit_interview_schema_1.ExitInterview.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mail_service_1.MailService,
        mongoose_2.Model,
        mongoose_2.Model])
], ExitService);
//# sourceMappingURL=exit.service.js.map