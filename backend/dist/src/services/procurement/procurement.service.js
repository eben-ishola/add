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
exports.ProcurementService = exports.buildOverdueReceiptQuery = exports.DEFAULT_RECEIPT_GRACE_DAYS = exports.DEFAULT_FINANCE_DEPARTMENTS = exports.DEFAULT_RESOLVING_DEPARTMENTS = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const procurement_requisition_schema_1 = require("../../schemas/procurement-requisition.schema");
const procurement_workflow_schema_1 = require("../../schemas/procurement-workflow.schema");
const expense_account_schema_1 = require("../../schemas/expense-account.schema");
const expense_budget_schema_1 = require("../../schemas/expense-budget.schema");
const department_schema_1 = require("../../schemas/department.schema");
const access_control_util_1 = require("../../utils/shared/access-control.util");
const workflow_notifier_service_1 = require("../comms/workflow-notifier.service");
exports.DEFAULT_RESOLVING_DEPARTMENTS = [
    'procurement and fleet management',
    'facility management',
];
exports.DEFAULT_FINANCE_DEPARTMENTS = ['finance', 'fincon'];
exports.DEFAULT_RECEIPT_GRACE_DAYS = 7;
const buildOverdueReceiptQuery = (now = new Date()) => {
    const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
    const graceCutoff = new Date(now.getTime() - exports.DEFAULT_RECEIPT_GRACE_DAYS * 24 * 60 * 60 * 1000);
    return {
        status: 'COMPLETED',
        $and: [
            {
                $or: [
                    { attachments: { $exists: false } },
                    { attachments: { $size: 0 } },
                    { attachments: { $not: { $elemMatch: { kind: 'RECEIPT' } } } },
                ],
            },
            {
                $or: [
                    { receiptDueAt: { $type: 9, $lte: todayEnd } },
                    {
                        $and: [
                            {
                                $or: [
                                    { receiptDueAt: { $exists: false } },
                                    { receiptDueAt: null },
                                ],
                            },
                            { disbursedAt: { $lt: graceCutoff } },
                        ],
                    },
                ],
            },
        ],
    };
};
exports.buildOverdueReceiptQuery = buildOverdueReceiptQuery;
let ProcurementService = class ProcurementService {
    constructor(requisitionModel, workflowModel, userModel, expenseModel, budgetModel, departmentModel, notifier) {
        this.requisitionModel = requisitionModel;
        this.workflowModel = workflowModel;
        this.userModel = userModel;
        this.expenseModel = expenseModel;
        this.budgetModel = budgetModel;
        this.departmentModel = departmentModel;
        this.notifier = notifier;
    }
    toObjectId(value, label) {
        const candidate = String(value?._id ?? value?.id ?? value ?? '').trim();
        if (!mongoose_2.Types.ObjectId.isValid(candidate)) {
            throw new common_1.BadRequestException(`A valid ${label} is required.`);
        }
        return new mongoose_2.Types.ObjectId(candidate);
    }
    optionalObjectId(value) {
        const candidate = String(value?._id ?? value?.id ?? value ?? '').trim();
        return mongoose_2.Types.ObjectId.isValid(candidate) ? new mongoose_2.Types.ObjectId(candidate) : null;
    }
    idString(value) {
        return String(value?._id ?? value?.id ?? value ?? '').trim();
    }
    normalizeName(value) {
        return String(value ?? '').trim().toLowerCase();
    }
    displayName(user) {
        const parts = [user?.firstName, user?.lastName].filter(Boolean);
        return parts.join(' ').trim() || user?.email || 'Unknown user';
    }
    toDate(value) {
        if (!value)
            return null;
        const parsed = value instanceof Date ? value : new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    toMinor(value) {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
    }
    async getWorkflowConfig(entity) {
        const entityId = this.toObjectId(entity, 'entity');
        const config = await this.workflowModel.findOne({ entity: entityId }).lean().exec();
        return { status: 200, data: config ?? null };
    }
    async listApproverPool(entity) {
        const entityId = this.toObjectId(entity, 'entity');
        const config = await this.workflowModel
            .findOne({ entity: entityId })
            .populate('approverPoolIds', '_id firstName lastName email staffId')
            .lean()
            .exec();
        return { status: 200, data: config?.approverPoolIds ?? [] };
    }
    async listResolvingDepartments(entity) {
        const entityId = this.optionalObjectId(entity);
        const [config, defaults] = await Promise.all([
            entityId
                ? this.workflowModel
                    .findOne({ entity: entityId })
                    .populate('reviewerDepartments', '_id name')
                    .lean()
                    .exec()
                : Promise.resolve(null),
            this.departmentModel
                .find({
                $or: exports.DEFAULT_RESOLVING_DEPARTMENTS.map((name) => ({
                    name: { $regex: `^${name.replace(/[.*+?^${}()|[]\]/g, '\$&')}$`, $options: 'i' },
                })),
            })
                .select('_id name')
                .sort({ name: 1 })
                .lean()
                .exec(),
        ]);
        const merged = [];
        const seen = new Set();
        const push = (row) => {
            const id = this.idString(row?._id ?? row);
            if (!id || seen.has(id))
                return;
            seen.add(id);
            merged.push({ _id: id, name: String(row?.name ?? '').trim() });
        };
        defaults.forEach(push);
        (config?.reviewerDepartments ?? []).forEach(push);
        return { status: 200, data: merged };
    }
    async saveWorkflowConfig(payload, actorId) {
        const entityId = this.toObjectId(payload?.entity, 'entity');
        const ids = (list) => (Array.isArray(list) ? list : [])
            .map((value) => this.optionalObjectId(value))
            .filter((value) => Boolean(value));
        const update = {
            reviewerIds: ids(payload?.reviewerIds),
            reviewerDepartments: ids(payload?.reviewerDepartments),
            approverPoolIds: ids(payload?.approverPoolIds),
            approverDepartments: ids(payload?.approverDepartments),
            postingIds: ids(payload?.postingIds),
            postingDepartments: ids(payload?.postingDepartments),
            disbursementIds: ids(payload?.disbursementIds),
            disbursementDepartments: ids(payload?.disbursementDepartments),
            auditViewerIds: ids(payload?.auditViewerIds),
            updatedBy: actorId ?? null,
        };
        if (payload?.receiptGraceDays !== undefined) {
            update.receiptGraceDays = this.toMinor(payload.receiptGraceDays);
        }
        const saved = await this.workflowModel
            .findOneAndUpdate({ entity: entityId }, { $set: update, $setOnInsert: { entity: entityId } }, { upsert: true, new: true, setDefaultsOnInsert: true })
            .lean()
            .exec();
        return { status: 200, data: saved };
    }
    async listExpenseTypes() {
        const query = { active: { $ne: false } };
        const types = await this.expenseModel.distinct('type', query).exec();
        return { status: 200, data: types.filter(Boolean).sort() };
    }
    async listExpenseAccounts(type) {
        const query = { active: { $ne: false } };
        if (type)
            query.type = type;
        const data = await this.expenseModel
            .find(query)
            .select('_id type name acct')
            .sort({ type: 1, name: 1 })
            .lean()
            .exec();
        return { status: 200, data };
    }
    async createExpenseAccount(payload) {
        const type = String(payload?.type ?? '').trim();
        const name = String(payload?.name ?? '').trim();
        const acct = String(payload?.acct ?? '').trim();
        if (!type || !name || !acct) {
            throw new common_1.BadRequestException('Type, GL name and GL account number are all required.');
        }
        const created = await this.expenseModel.create({ type, name, acct });
        return { status: 200, data: created.toObject() };
    }
    async importExpenseAccounts(rows) {
        if (!Array.isArray(rows) || !rows.length) {
            throw new common_1.BadRequestException('The uploaded file has no rows.');
        }
        const pick = (row, ...keys) => {
            for (const key of keys) {
                const found = Object.keys(row).find((column) => column.trim().toLowerCase() === key);
                if (found && String(row[found] ?? '').trim()) {
                    return String(row[found]).trim();
                }
            }
            return '';
        };
        const errors = [];
        const seen = new Set();
        const prepared = rows.map((row, index) => {
            const line = index + 2;
            const type = pick(row, 'type', 'expense type');
            const name = pick(row, 'name', 'gl name', 'expense name');
            const acct = pick(row, 'acct', 'account', 'gl account', 'gl account no');
            if (!type)
                errors.push(`Row ${line}: type is required.`);
            if (!name)
                errors.push(`Row ${line}: GL name is required.`);
            if (!acct)
                errors.push(`Row ${line}: GL account number is required.`);
            const key = `${type.toLowerCase()}|${acct}`;
            if (seen.has(key)) {
                errors.push(`Row ${line}: duplicates account ${acct} under ${type}.`);
            }
            seen.add(key);
            return { type, name, acct };
        });
        if (errors.length) {
            throw new common_1.BadRequestException(errors.slice(0, 20).join(' '));
        }
        const writes = prepared.map((account) => ({
            updateOne: {
                filter: { type: account.type, acct: account.acct },
                update: { $set: account, $setOnInsert: { active: true } },
                upsert: true,
            },
        }));
        const result = await this.expenseModel.bulkWrite(writes);
        return {
            status: 200,
            data: {
                received: rows.length,
                created: result?.upsertedCount ?? 0,
                updated: result?.modifiedCount ?? 0,
            },
        };
    }
    async importBudgets(rows, entity, actorId) {
        if (!Array.isArray(rows) || !rows.length) {
            throw new common_1.BadRequestException('The uploaded file has no rows.');
        }
        const entityId = this.toObjectId(entity, 'entity');
        const monthKeys = [
            'jan', 'feb', 'mar', 'apr', 'may', 'jun',
            'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
        ];
        const read = (row, key) => {
            const found = Object.keys(row).find((column) => column.trim().toLowerCase() === key);
            return found ? String(row[found] ?? '').trim() : '';
        };
        const accountNumbers = rows
            .map((row) => read(row, 'acct') || read(row, 'account'))
            .filter(Boolean);
        const accounts = await this.expenseModel
            .find({ acct: { $in: accountNumbers } })
            .select('_id acct')
            .lean()
            .exec();
        const byAcct = new Map(accounts.map((account) => [String(account.acct), account._id]));
        const errors = [];
        const prepared = rows.map((row, index) => {
            const line = index + 2;
            const acct = read(row, 'acct') || read(row, 'account');
            const year = Number(read(row, 'year')) || new Date().getFullYear();
            if (!acct) {
                errors.push(`Row ${line}: a GL account number is required.`);
            }
            else if (!byAcct.has(acct)) {
                errors.push(`Row ${line}: account ${acct} is not in the catalogue.`);
            }
            const monthlyAllocation = monthKeys.map((key) => {
                const raw = read(row, key);
                const parsed = Number(String(raw).replace(/,/g, ''));
                return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) : 0;
            });
            return { acct, year, monthlyAllocation, description: read(row, 'description') };
        });
        if (errors.length) {
            throw new common_1.BadRequestException(errors.slice(0, 20).join(' '));
        }
        const writes = prepared.map((budget) => ({
            updateOne: {
                filter: {
                    entity: entityId,
                    expenseAccount: byAcct.get(budget.acct),
                    year: budget.year,
                },
                update: {
                    $set: {
                        monthlyAllocation: budget.monthlyAllocation,
                        description: budget.description || undefined,
                        updatedBy: actorId ?? null,
                    },
                    $setOnInsert: {
                        entity: entityId,
                        expenseAccount: byAcct.get(budget.acct),
                        year: budget.year,
                    },
                },
                upsert: true,
            },
        }));
        const result = await this.budgetModel.bulkWrite(writes);
        return {
            status: 200,
            data: {
                received: rows.length,
                created: result?.upsertedCount ?? 0,
                updated: result?.modifiedCount ?? 0,
            },
        };
    }
    async listBudgets(entity, year) {
        const query = {};
        const entityId = this.optionalObjectId(entity);
        if (entityId)
            query.entity = entityId;
        const parsedYear = Number(year);
        if (Number.isFinite(parsedYear) && parsedYear > 0)
            query.year = parsedYear;
        const rows = await this.budgetModel
            .find(query)
            .populate('expenseAccount', '_id type name acct')
            .populate('entity', '_id name')
            .sort({ year: -1 })
            .lean()
            .exec();
        const consumption = await this.consumptionByBudget(rows.map((row) => row._id));
        const data = rows.map((row) => this.budgetTotals(row, consumption.get(String(row._id))));
        return { status: 200, data };
    }
    async saveBudget(payload, actorId) {
        const entityId = this.toObjectId(payload?.entity, 'entity');
        const accountId = this.toObjectId(payload?.expenseAccount, 'expense account');
        const year = Number(payload?.year);
        if (!Number.isFinite(year) || year < 2000 || year > 2100) {
            throw new common_1.BadRequestException('A valid budget year is required.');
        }
        const account = await this.expenseModel.findById(accountId).lean().exec();
        if (!account) {
            throw new common_1.BadRequestException('That expense account does not exist.');
        }
        const raw = Array.isArray(payload?.monthlyAllocation) ? payload.monthlyAllocation : [];
        if (raw.length && raw.length !== 12) {
            throw new common_1.BadRequestException('Provide twelve monthly allocations, one for each month.');
        }
        const monthlyAllocation = new Array(12)
            .fill(0)
            .map((_, index) => this.toMinor(raw[index]));
        const saved = await this.budgetModel
            .findOneAndUpdate({ entity: entityId, expenseAccount: accountId, year }, {
            $set: {
                monthlyAllocation,
                description: payload?.description,
                active: payload?.active === false ? false : true,
                updatedBy: actorId ?? null,
            },
            $setOnInsert: { entity: entityId, expenseAccount: accountId, year },
        }, { upsert: true, new: true, setDefaultsOnInsert: true })
            .exec();
        return { status: 200, data: saved?.toObject?.() ?? saved };
    }
    async consumptionByBudget(budgetIds) {
        const totals = new Map();
        const ids = (budgetIds ?? []).filter(Boolean);
        if (!ids.length)
            return totals;
        const rows = await this.requisitionModel
            .aggregate([
            { $match: { budget: { $in: ids } } },
            {
                $group: {
                    _id: {
                        budget: '$budget',
                        disbursed: { $cond: [{ $ifNull: ['$disbursedAt', false] }, true, false] },
                    },
                    total: { $sum: { $ifNull: ['$committedAmount', 0] } },
                },
            },
        ])
            .exec();
        for (const row of rows) {
            const key = String(row?._id?.budget ?? '');
            if (!key)
                continue;
            const entry = totals.get(key) ?? { committed: 0, spent: 0 };
            const amount = Number(row?.total) || 0;
            if (row?._id?.disbursed)
                entry.spent += amount;
            else
                entry.committed += amount;
            totals.set(key, entry);
        }
        return totals;
    }
    budgetTotals(budget, consumption, asOf = new Date()) {
        if (!budget)
            return budget;
        const months = Array.isArray(budget.monthlyAllocation)
            ? budget.monthlyAllocation
            : [];
        const sum = (values) => values.reduce((total, value) => total + (Number(value) || 0), 0);
        const monthsReleased = Number(budget.year) === asOf.getFullYear() ? asOf.getMonth() + 1 : 12;
        const allocated = sum(months);
        const allocatedToDate = sum(months.slice(0, monthsReleased));
        const committed = Number(consumption?.committed) || 0;
        const spent = Number(consumption?.spent) || 0;
        return {
            ...budget,
            allocated,
            allocatedToDate,
            committed,
            spent,
            balance: allocated - committed - spent,
            available: allocatedToDate - committed - spent,
        };
    }
    async budgetPositionFor(budgetId) {
        const budget = await this.budgetModel.findById(budgetId).lean().exec();
        if (!budget)
            return null;
        const consumption = await this.consumptionByBudget([budget._id]);
        return this.budgetTotals(budget, consumption.get(String(budget._id)));
    }
    async getBudgetPosition(entity, expenseAccount, year) {
        const budget = await this.budgetModel
            .findOne({
            entity: this.toObjectId(entity, 'entity'),
            expenseAccount: this.toObjectId(expenseAccount, 'expense account'),
            year: year ?? new Date().getFullYear(),
        })
            .lean()
            .exec();
        if (!budget)
            return { status: 200, data: null };
        const consumption = await this.consumptionByBudget([budget._id]);
        return {
            status: 200,
            data: this.budgetTotals(budget, consumption.get(String(budget._id))),
        };
    }
    async addAttachments(id, kind, files, user) {
        if (!Array.isArray(files) || !files.length) {
            throw new common_1.BadRequestException('Choose at least one file to attach.');
        }
        const normalizedKind = String(kind ?? 'OTHER').trim().toUpperCase();
        if (!['QUOTE', 'INVOICE', 'RECEIPT', 'OTHER'].includes(normalizedKind)) {
            throw new common_1.BadRequestException('Unknown attachment type.');
        }
        const requisition = await this.requisitionModel.findById(this.toObjectId(id, 'requisition id'));
        if (!requisition)
            throw new common_1.NotFoundException('Requisition not found.');
        const userId = this.idString(user?._id ?? user?.id);
        const isOwn = this.idString(requisition.requestedBy) === userId;
        if (normalizedKind === 'RECEIPT') {
            if (requisition.status !== 'COMPLETED') {
                throw new common_1.BadRequestException('A receipt can only be attached once the requisition has been disbursed.');
            }
        }
        else {
            if (requisition.status === 'COMPLETED' || requisition.status === 'REJECTED') {
                throw new common_1.BadRequestException('This requisition is already closed.');
            }
            const config = await this.configFor(requisition);
            const canAttach = (0, access_control_util_1.userIsSuperAdmin)(user) ||
                isOwn ||
                this.matchesStage(user, config, 'reviewer');
            if (!canAttach) {
                throw new common_1.ForbiddenException('Only the requester or the resolving department can attach invoices.');
            }
        }
        const attachments = Array.isArray(requisition.attachments)
            ? requisition.attachments
            : [];
        files.forEach((file) => {
            attachments.push({
                fileName: file.originalname,
                storedName: file.filename,
                kind: normalizedKind,
                size: Number(file.size) || 0,
                uploadedBy: this.optionalObjectId(user?._id ?? user?.id) ?? undefined,
                uploadedAt: new Date(),
            });
        });
        requisition.attachments = attachments;
        await requisition.save();
        return {
            status: 200,
            data: { attached: files.length, attachments: requisition.attachments },
        };
    }
    async resolveAttachment(id, storedName, user) {
        const { data: requisition, role } = await this.getRequisition(id, user);
        const attachment = (requisition?.attachments ?? []).find((entry) => String(entry?.storedName) === String(storedName));
        if (!attachment) {
            throw new common_1.NotFoundException('Attachment not found on this requisition.');
        }
        void role;
        return {
            storedName: String(attachment.storedName),
            fileName: String(attachment.fileName ?? attachment.storedName),
        };
    }
    async extendReceiptDue(id, dueAt, user) {
        const requisition = await this.requisitionModel.findById(this.toObjectId(id, 'requisition id'));
        if (!requisition)
            throw new common_1.NotFoundException('Requisition not found.');
        const parsed = this.toDate(dueAt);
        if (!parsed) {
            throw new common_1.BadRequestException('A valid new due date is required.');
        }
        await this.assertCanAct(requisition, user, 'reviewer');
        requisition.receiptDueAt = parsed;
        this.appendHistory(requisition, requisition.currentStage, 'FINANCE_COMMENT', user, `Receipt due date extended to ${parsed.toDateString()}`);
        await requisition.save();
        return { status: 200, data: { receiptDueAt: requisition.receiptDueAt } };
    }
    async buildGlExport(filters, user) {
        const role = await this.resolveWorkflowRole(user, filters?.entity);
        if (!role.isPoster && !role.isDisburser && !role.isSuperAdmin && !role.isAuditViewer) {
            throw new common_1.ForbiddenException('Only finance can export the posting batch.');
        }
        const query = {};
        const ids = String(filters?.ids ?? '')
            .split(',')
            .map((value) => value.trim())
            .filter((value) => mongoose_2.Types.ObjectId.isValid(value));
        if (ids.length) {
            query._id = { $in: ids.map((value) => new mongoose_2.Types.ObjectId(value)) };
        }
        else {
            const entityId = this.optionalObjectId(filters?.entity ?? user?.entity);
            if (entityId)
                query.entity = entityId;
            query.status = filters?.status || 'PENDING_DISBURSEMENT';
        }
        const requisitions = await this.requisitionModel
            .find(query)
            .sort({ createdAt: 1 })
            .lean()
            .exec();
        const money = (minor) => (Math.round(Number(minor) || 0) / 100).toFixed(2);
        const rows = [];
        const included = [];
        requisitions.forEach((requisition) => {
            const glEntries = Array.isArray(requisition?.glEntries) ? requisition.glEntries : [];
            if (!glEntries.length)
                return;
            glEntries.forEach((entry) => {
                rows.push([
                    entry?.glName ?? '',
                    money(entry?.amount),
                    entry?.glNumber ?? '',
                    entry?.narration ?? '',
                    entry?.glType || 'DR',
                ]);
            });
            rows.push([
                requisition?.payeeBank ?? '',
                money(requisition?.netPayable),
                requisition?.payeeAccount ?? '',
                [requisition?.narration, requisition?.payeeName]
                    .filter(Boolean)
                    .join(' ')
                    .trim(),
                'CR',
            ]);
            included.push(String(requisition?.reference ?? requisition?._id));
        });
        return {
            status: 200,
            data: {
                headers: ['GL Name', 'Amount', 'Account Number', 'Narration', 'Type'],
                rows,
                references: included,
                requisitions: included.length,
            },
        };
    }
    async commitBudget(requisition) {
        const accountId = this.optionalObjectId(requisition?.expenseCategory);
        if (!accountId)
            return;
        const year = new Date(requisition?.createdAt ?? Date.now()).getFullYear();
        const budget = await this.budgetModel
            .findOne({ entity: requisition.entity, expenseAccount: accountId, year })
            .exec();
        if (!budget)
            return;
        const amount = this.toMinor(requisition?.netPayable);
        const position = await this.budgetPositionFor(budget._id);
        const available = position?.available ?? 0;
        budget.committed = (budget.committed ?? 0) + amount;
        await budget.save();
        requisition.budget = budget._id;
        requisition.committedAmount = amount;
        requisition.budgetAvailableAtApproval = available;
        requisition.budgetOverrun = Math.max(0, amount - available);
    }
    async settleBudget(requisition) {
        const budgetId = this.optionalObjectId(requisition?.budget);
        const amount = this.toMinor(requisition?.committedAmount);
        if (!budgetId || !amount)
            return;
        await this.budgetModel
            .updateOne({ _id: budgetId }, { $inc: { committed: -amount, spent: amount } })
            .exec();
    }
    async releaseBudget(requisition) {
        const budgetId = this.optionalObjectId(requisition?.budget);
        const amount = this.toMinor(requisition?.committedAmount);
        if (!budgetId || !amount)
            return;
        await this.budgetModel
            .updateOne({ _id: budgetId }, { $inc: { committed: -amount } })
            .exec();
        requisition.committedAmount = 0;
    }
    matchesStage(user, config, stage) {
        const userId = this.idString(user?._id ?? user?.id);
        const departmentId = this.idString(user?.department?._id ?? user?.department);
        const departmentName = this.normalizeName(user?.department?.name ?? user?.department);
        const idField = {
            reviewer: 'reviewerIds',
            approver: 'approverPoolIds',
            posting: 'postingIds',
            disbursement: 'disbursementIds',
        }[stage];
        const deptField = {
            reviewer: 'reviewerDepartments',
            approver: 'approverDepartments',
            posting: 'postingDepartments',
            disbursement: 'disbursementDepartments',
        }[stage];
        const namedUsers = config?.[idField] ?? [];
        if (userId && namedUsers.some((entry) => this.idString(entry) === userId)) {
            return true;
        }
        const namedDepartments = config?.[deptField] ?? [];
        if (departmentId &&
            namedDepartments.some((entry) => this.idString(entry) === departmentId)) {
            return true;
        }
        const configured = namedUsers.length > 0 || namedDepartments.length > 0;
        if (configured || !departmentName)
            return false;
        if (stage === 'reviewer') {
            return exports.DEFAULT_RESOLVING_DEPARTMENTS.includes(departmentName);
        }
        if (stage === 'posting' || stage === 'disbursement') {
            return exports.DEFAULT_FINANCE_DEPARTMENTS.includes(departmentName);
        }
        return false;
    }
    async resolveWorkflowRole(user, entity) {
        const entityId = this.optionalObjectId(entity ?? user?.entity);
        const config = entityId
            ? await this.workflowModel.findOne({ entity: entityId }).lean().exec()
            : null;
        const isSuperAdmin = (0, access_control_util_1.userIsSuperAdmin)(user);
        const userId = this.idString(user?._id ?? user?.id);
        const isAuditViewer = (config?.auditViewerIds ?? []).some((entry) => this.idString(entry) === userId);
        const isReviewer = this.matchesStage(user, config, 'reviewer');
        const isPoster = this.matchesStage(user, config, 'posting');
        return {
            isReviewer,
            isApproverCandidate: this.matchesStage(user, config, 'approver'),
            isPoster,
            isDisburser: this.matchesStage(user, config, 'disbursement'),
            isAuditViewer,
            isSuperAdmin,
            canViewAll: isSuperAdmin || isReviewer || isPoster || isAuditViewer,
        };
    }
    assertStage(requisition, expected, what) {
        if (requisition?.currentStage !== expected) {
            throw new common_1.BadRequestException(`This requisition is at the ${requisition?.currentStage ?? 'unknown'} stage and cannot be ${what}.`);
        }
    }
    appendHistory(requisition, stage, action, user, comment) {
        requisition.history = Array.isArray(requisition.history) ? requisition.history : [];
        requisition.history.push({
            stage,
            action,
            actor: this.optionalObjectId(user?._id ?? user?.id) ?? undefined,
            actorName: this.displayName(user),
            comment: comment?.trim() || undefined,
            at: new Date(),
        });
    }
    async notify(requisition, event, actor) {
        try {
            await this.notifier?.dispatch({
                module: 'procurement',
                event: event,
                doc: requisition,
                extraRecipients: await this.stakeholderIds(requisition, actor),
            });
        }
        catch {
        }
    }
    async stakeholderIds(requisition, actor) {
        const ids = new Set();
        const add = (value) => {
            const id = this.idString(value);
            if (id)
                ids.add(id);
        };
        add(requisition?.assignedApprover);
        const departments = [];
        const pushDepartment = (value) => {
            const id = this.optionalObjectId(value);
            if (id)
                departments.push(id);
        };
        pushDepartment(requisition?.resolvingDepartment);
        try {
            const config = await this.configFor(requisition);
            if (config) {
                [...(config.postingIds ?? []), ...(config.disbursementIds ?? [])].forEach(add);
                [
                    ...(config.postingDepartments ?? []),
                    ...(config.disbursementDepartments ?? []),
                ].forEach(pushDepartment);
            }
        }
        catch {
        }
        try {
            if (departments.length) {
                const members = await this.userModel
                    .find({ department: { $in: departments }, status: { $ne: 'Inactive' } })
                    .select('_id')
                    .lean()
                    .exec();
                members.forEach((member) => add(member?._id));
            }
        }
        catch {
        }
        const actorId = this.idString(actor?._id ?? actor?.id);
        if (actorId)
            ids.delete(actorId);
        return Array.from(ids);
    }
    computeTotals(requisition) {
        const items = Array.isArray(requisition.items) ? requisition.items : [];
        items.forEach((item) => {
            const quantity = this.toMinor(item?.quantity) || 1;
            const unitPrice = this.toMinor(item?.unitPrice);
            item.quantity = quantity;
            item.unitPrice = unitPrice;
            item.lineTotal = quantity * unitPrice;
        });
        if (!requisition.estimatedAmount) {
            requisition.estimatedAmount = items.reduce((sum, item) => sum + (item.lineTotal ?? 0), 0);
        }
        const base = requisition.recommendedAmount || requisition.estimatedAmount || 0;
        const vatRate = Number(requisition.vatRate) || 0;
        const withholdingRate = Number(requisition.withholdingRate) || 0;
        requisition.vatAmount = Math.round((base * vatRate) / 100);
        requisition.totalAmount = base + requisition.vatAmount;
        requisition.withholdingAmount = Math.round((requisition.totalAmount * withholdingRate) / 100);
        requisition.netPayable = Math.max(requisition.totalAmount - requisition.withholdingAmount, 0);
    }
    async nextReference() {
        const year = new Date().getFullYear();
        const count = await this.requisitionModel.countDocuments({}).exec();
        return `PR-${year}-${String(count + 1).padStart(6, '0')}`;
    }
    async createRequisition(payload, user) {
        if (!user)
            throw new common_1.ForbiddenException('You must be signed in to raise a requisition.');
        const entityId = this.toObjectId(payload?.entity ?? user?.entity, 'entity');
        const requisition = new this.requisitionModel({
            reference: await this.nextReference(),
            entity: entityId,
            branch: this.optionalObjectId(payload?.branch ?? user?.branch) ?? undefined,
            department: this.optionalObjectId(payload?.department ?? user?.department) ?? undefined,
            resolvingDepartment: this.optionalObjectId(payload?.resolvingDepartment) ?? undefined,
            requestedBy: this.toObjectId(user?._id ?? user?.id, 'user'),
            requestedByName: this.displayName(user),
            title: String(payload?.title ?? '').trim(),
            justification: payload?.justification,
            assignee: payload?.assignee,
            items: Array.isArray(payload?.items) ? payload.items : [],
            currency: payload?.currency || 'NGN',
            payeeName: payload?.payeeName,
            status: 'PENDING_REVIEW',
            currentStage: 'REVIEWER',
        });
        if (!requisition.title) {
            throw new common_1.BadRequestException('A requisition title is required.');
        }
        this.computeTotals(requisition);
        this.appendHistory(requisition, 'REVIEWER', 'RAISED', user, payload?.justification);
        await requisition.save();
        await this.notify(requisition, 'submitted', user);
        return { status: 200, data: requisition.toObject() };
    }
    populate(query) {
        return query
            .populate('entity', '_id name short')
            .populate('branch', '_id name')
            .populate('department', '_id name')
            .populate('resolvingDepartment', '_id name')
            .populate('requestedBy', '_id firstName lastName email staffId')
            .populate('assignedApprover', '_id firstName lastName email staffId')
            .populate('expenseCategory', '_id type name acct');
    }
    userDepartmentId(user) {
        return this.optionalObjectId(user?.department?._id ?? user?.department);
    }
    buildNeedsActionClause(role, userId, departmentId) {
        const clauses = [];
        if (role?.isReviewer || role?.isSuperAdmin) {
            clauses.push({ currentStage: 'REVIEWER' });
        }
        else if (departmentId) {
            clauses.push({ currentStage: 'REVIEWER', resolvingDepartment: departmentId });
        }
        if (userId) {
            clauses.push({ currentStage: 'APPROVER', assignedApprover: userId });
        }
        if (role?.isPoster || role?.isSuperAdmin) {
            clauses.push({ currentStage: 'POSTING' });
        }
        if (role?.isDisburser || role?.isSuperAdmin) {
            clauses.push({ currentStage: 'DISBURSEMENT' });
        }
        return clauses;
    }
    async listRequisitions(filters, user) {
        const role = await this.resolveWorkflowRole(user, filters?.entity);
        const query = {};
        const and = [];
        const needsAction = String(filters?.needsAction ?? '').toLowerCase() === 'true';
        const wantsOwn = String(filters?.mine ?? '').toLowerCase() === 'true';
        const wantsUnit = String(filters?.unit ?? '').toLowerCase() === 'true';
        let entityId = this.optionalObjectId(filters?.entity ?? user?.entity);
        if (!entityId && !role.isSuperAdmin) {
            entityId = this.optionalObjectId(user?.entity);
        }
        if (entityId && !needsAction && !wantsOwn && !wantsUnit)
            query.entity = entityId;
        if (filters?.status)
            query.status = filters.status;
        const userId = this.optionalObjectId(user?._id ?? user?.id);
        const departmentId = this.userDepartmentId(user);
        if (wantsOwn) {
            and.push({ requestedBy: userId });
        }
        else if (wantsUnit) {
            and.push(departmentId ? { resolvingDepartment: departmentId } : { _id: null });
        }
        else if (!needsAction && !role.canViewAll) {
            const visible = [
                { requestedBy: userId },
                { assignedApprover: userId },
            ];
            if (departmentId)
                visible.push({ resolvingDepartment: departmentId });
            and.push({ $or: visible });
        }
        if (needsAction) {
            const clauses = this.buildNeedsActionClause(role, userId, departmentId);
            and.push(clauses.length
                ? {
                    $and: [
                        { status: { $nin: ['COMPLETED', 'REJECTED'] } },
                        { $or: clauses },
                    ],
                }
                : { _id: null });
        }
        const search = String(filters?.search ?? '').trim();
        if (search) {
            const pattern = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            and.push({
                $or: [
                    { reference: { $regex: pattern, $options: 'i' } },
                    { title: { $regex: pattern, $options: 'i' } },
                    { requestedByName: { $regex: pattern, $options: 'i' } },
                    { payeeName: { $regex: pattern, $options: 'i' } },
                ],
            });
        }
        if (and.length)
            query.$and = and;
        const page = Math.max(1, Number(filters?.page ?? 1) || 1);
        const rawLimit = Number(filters?.limit ?? 25) || 25;
        const limit = Math.min(200, Math.max(1, rawLimit));
        const [data, total] = await Promise.all([
            this.populate(this.requisitionModel
                .find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit))
                .lean()
                .exec(),
            this.requisitionModel.countDocuments(query).exec(),
        ]);
        return {
            status: 200,
            data,
            role,
            totals: {
                total,
                page,
                limit,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
        };
    }
    async countRequisitionsByStatus(filters, user) {
        const role = await this.resolveWorkflowRole(user, filters?.entity);
        const query = {};
        const and = [];
        const needsAction = String(filters?.needsAction ?? '').toLowerCase() === 'true';
        const wantsOwn = String(filters?.mine ?? '').toLowerCase() === 'true';
        const wantsUnit = String(filters?.unit ?? '').toLowerCase() === 'true';
        const entityId = this.optionalObjectId(filters?.entity ?? user?.entity);
        if (!needsAction && !wantsOwn && !wantsUnit) {
            if (entityId)
                query.entity = entityId;
            else if (!role.isSuperAdmin) {
                const own = this.optionalObjectId(user?.entity);
                if (own)
                    query.entity = own;
            }
        }
        const userId = this.optionalObjectId(user?._id ?? user?.id);
        const departmentId = this.userDepartmentId(user);
        if (wantsOwn) {
            and.push({ requestedBy: userId });
        }
        else if (wantsUnit) {
            and.push(departmentId ? { resolvingDepartment: departmentId } : { _id: null });
        }
        else if (!needsAction && !role.canViewAll) {
            const visible = [
                { requestedBy: userId },
                { assignedApprover: userId },
            ];
            if (departmentId)
                visible.push({ resolvingDepartment: departmentId });
            and.push({ $or: visible });
        }
        if (needsAction) {
            const clauses = this.buildNeedsActionClause(role, userId, departmentId);
            and.push(clauses.length
                ? {
                    $and: [
                        { status: { $nin: ['COMPLETED', 'REJECTED'] } },
                        { $or: clauses },
                    ],
                }
                : { _id: null });
        }
        if (and.length)
            query.$and = and;
        const [rows, needsActionCount] = await Promise.all([
            this.requisitionModel
                .aggregate([{ $match: query }, { $group: { _id: '$status', count: { $sum: 1 } } }])
                .exec(),
            (async () => {
                const clauses = this.buildNeedsActionClause(role, userId, departmentId);
                if (!clauses.length)
                    return 0;
                return this.requisitionModel
                    .countDocuments({
                    $and: [
                        { status: { $nin: ['COMPLETED', 'REJECTED'] } },
                        { $or: clauses },
                    ],
                })
                    .exec();
            })(),
        ]);
        const byStatus = {};
        let total = 0;
        rows.forEach((row) => {
            const count = Number(row?.count ?? 0);
            byStatus[String(row?._id ?? '')] = count;
            total += count;
        });
        return { status: 200, data: { byStatus, total, needsAction: needsActionCount }, role };
    }
    async getRequisition(id, user) {
        const requisitionId = this.toObjectId(id, 'requisition id');
        const requisition = await this.populate(this.requisitionModel.findById(requisitionId))
            .lean()
            .exec();
        if (!requisition)
            throw new common_1.NotFoundException('Requisition not found.');
        const role = await this.resolveWorkflowRole(user, this.idString(requisition.entity));
        const userId = this.idString(user?._id ?? user?.id);
        const isOwn = this.idString(requisition.requestedBy) === userId;
        const isAssigned = this.idString(requisition.assignedApprover) === userId;
        const isResolvingUnit = this.matchesResolvingDepartment(requisition, user);
        if (!role.canViewAll &&
            !role.isApproverCandidate &&
            !isOwn &&
            !isAssigned &&
            !isResolvingUnit) {
            throw new common_1.ForbiddenException('You do not have access to this requisition.');
        }
        return { status: 200, data: requisition, role };
    }
    async loadForAction(id) {
        const requisition = await this.requisitionModel.findById(this.toObjectId(id, 'requisition id'));
        if (!requisition)
            throw new common_1.NotFoundException('Requisition not found.');
        if (requisition.status === 'REJECTED' || requisition.status === 'COMPLETED') {
            throw new common_1.BadRequestException('This requisition is already closed.');
        }
        return requisition;
    }
    async configFor(requisition) {
        return this.workflowModel
            .findOne({ entity: requisition.entity })
            .lean()
            .exec();
    }
    isAssignedApprover(requisition, user) {
        const assigned = this.idString(requisition?.assignedApprover);
        if (!assigned)
            return false;
        return assigned === this.idString(user?._id ?? user?.id);
    }
    matchesResolvingDepartment(requisition, user) {
        const resolving = this.idString(requisition?.resolvingDepartment);
        if (!resolving)
            return false;
        return resolving === this.idString(user?.department?._id ?? user?.department);
    }
    async assertCanAct(requisition, user, stage) {
        if ((0, access_control_util_1.userIsSuperAdmin)(user))
            return;
        if (stage === 'reviewer' && this.matchesResolvingDepartment(requisition, user)) {
            return;
        }
        if (stage === 'approver' && this.isAssignedApprover(requisition, user)) {
            return;
        }
        const config = await this.configFor(requisition);
        if (!this.matchesStage(user, config, stage)) {
            throw new common_1.ForbiddenException('You are not assigned to act on this requisition at this stage.');
        }
    }
    async triage(id, payload, user) {
        const requisition = await this.loadForAction(id);
        this.assertStage(requisition, 'REVIEWER', 'triaged');
        await this.assertCanAct(requisition, user, 'reviewer');
        const approverId = this.toObjectId(payload?.assignedApprover, 'approver');
        const approver = await this.userModel
            .findById(approverId)
            .select('_id firstName lastName email')
            .lean()
            .exec();
        if (!approver)
            throw new common_1.BadRequestException('The chosen approver was not found.');
        if (Array.isArray(payload?.items) && payload.items.length) {
            const revised = payload.items;
            requisition.items = (requisition.items ?? []).map((item, index) => {
                const update = revised[index];
                if (!update)
                    return item;
                const quantity = update.quantity !== undefined ? this.toMinor(update.quantity) || 1 : item.quantity;
                const unitPrice = update.unitPrice !== undefined ? this.toMinor(update.unitPrice) : item.unitPrice;
                return {
                    ...item,
                    description: update.description?.trim() || item.description,
                    quantity,
                    unitPrice,
                    lineTotal: quantity * unitPrice,
                };
            });
        }
        if (payload?.recommendedAmount !== undefined) {
            requisition.recommendedAmount = this.toMinor(payload.recommendedAmount);
        }
        else if (Array.isArray(payload?.items) && payload.items.length) {
            requisition.recommendedAmount = (requisition.items ?? []).reduce((sum, item) => sum + (item.lineTotal ?? 0), 0);
        }
        const asRate = (value) => {
            const parsed = Number(value);
            if (!Number.isFinite(parsed) || parsed < 0)
                return 0;
            return Math.min(parsed, 100);
        };
        if (payload?.vatRate !== undefined) {
            requisition.vatRate = asRate(payload.vatRate);
        }
        if (payload?.withholdingRate !== undefined) {
            requisition.withholdingRate = asRate(payload.withholdingRate);
        }
        const expenseCategory = this.optionalObjectId(payload?.expenseCategory);
        if (!expenseCategory) {
            throw new common_1.BadRequestException('Select the expense account this is charged to.');
        }
        const account = await this.expenseModel.findById(expenseCategory).lean().exec();
        if (!account) {
            throw new common_1.BadRequestException('That expense account does not exist.');
        }
        requisition.expenseCategory = expenseCategory;
        const payeeFields = ['payeeName', 'payeeBank', 'payeeAccount', 'paymentType', 'narration'];
        payeeFields.forEach((field) => {
            const value = payload?.[field];
            if (typeof value === 'string' && value.trim()) {
                requisition[field] = value.trim();
            }
        });
        this.computeTotals(requisition);
        requisition.assignedApprover = approverId;
        requisition.assignedApproverName = this.displayName(approver);
        requisition.status = 'PENDING_APPROVAL';
        requisition.currentStage = 'APPROVER';
        this.appendHistory(requisition, 'REVIEWER', 'TRIAGED', user, payload?.comment);
        await requisition.save();
        await this.notify(requisition, 'reviewed', user);
        return { status: 200, data: requisition.toObject() };
    }
    async approve(id, payload, user) {
        const requisition = await this.loadForAction(id);
        this.assertStage(requisition, 'APPROVER', 'approved');
        const userId = this.idString(user?._id ?? user?.id);
        const assigned = this.idString(requisition.assignedApprover);
        if (!(0, access_control_util_1.userIsSuperAdmin)(user) && assigned && assigned !== userId) {
            throw new common_1.ForbiddenException('Only the approver named on this requisition can approve it.');
        }
        await this.commitBudget(requisition);
        requisition.status = 'PENDING_POSTING';
        requisition.currentStage = 'POSTING';
        this.appendHistory(requisition, 'APPROVER', 'APPROVED', user, payload?.comment);
        await requisition.save();
        await this.notify(requisition, 'approved', user);
        return { status: 200, data: requisition.toObject() };
    }
    async reject(id, payload, user) {
        const requisition = await this.loadForAction(id);
        const stage = requisition.currentStage;
        if (stage === 'DONE') {
            throw new common_1.BadRequestException('This requisition is already closed.');
        }
        await this.assertActorHoldsStage(requisition, user, stage);
        const reason = String(payload?.reason ?? '').trim();
        if (!reason)
            throw new common_1.BadRequestException('A rejection reason is required.');
        await this.releaseBudget(requisition);
        requisition.status = 'REJECTED';
        requisition.rejectionReason = reason;
        this.appendHistory(requisition, stage, 'REJECTED', user, reason);
        await requisition.save();
        await this.notify(requisition, 'rejected', user);
        return { status: 200, data: requisition.toObject() };
    }
    async requestClarification(id, payload, user) {
        const requisition = await this.loadForAction(id);
        const stage = requisition.currentStage;
        if (stage === 'REVIEWER') {
            throw new common_1.BadRequestException('This requisition is already with the requester.');
        }
        await this.assertActorHoldsStage(requisition, user, stage);
        const comment = String(payload?.comment ?? '').trim();
        if (!comment) {
            throw new common_1.BadRequestException('Say what needs clarifying.');
        }
        requisition.status = 'PENDING_REVIEW';
        requisition.currentStage = 'REVIEWER';
        this.appendHistory(requisition, stage, 'CLARIFICATION_REQUESTED', user, comment);
        await requisition.save();
        await this.notify(requisition, 'submitted', user);
        return { status: 200, data: requisition.toObject() };
    }
    async postGl(id, payload, user) {
        const requisition = await this.loadForAction(id);
        this.assertStage(requisition, 'POSTING', 'posted');
        await this.assertCanAct(requisition, user, 'posting');
        const entries = Array.isArray(payload?.entries) ? payload.entries : [];
        if (!entries.length) {
            throw new common_1.BadRequestException('At least one GL entry is required.');
        }
        const postingComment = String(payload?.comment ?? '').trim();
        if (!postingComment) {
            throw new common_1.BadRequestException('A posting comment is required.');
        }
        const accounts = await this.expenseModel
            .find({ acct: { $in: entries.map((entry) => String(entry?.glNumber ?? '').trim()) } })
            .select('acct name')
            .lean()
            .exec();
        const knownAccounts = new Map(accounts.map((account) => [String(account.acct), String(account.name)]));
        entries.forEach((entry, index) => {
            const line = index + 1;
            if (!String(entry?.businessUnit ?? '').trim()) {
                throw new common_1.BadRequestException(`Line ${line}: branch is required.`);
            }
            if (!String(entry?.glName ?? '').trim()) {
                throw new common_1.BadRequestException(`Line ${line}: GL name is required.`);
            }
            if (!String(entry?.glNumber ?? '').trim()) {
                throw new common_1.BadRequestException(`Line ${line}: GL account number is required.`);
            }
            if (!String(entry?.narration ?? '').trim()) {
                throw new common_1.BadRequestException(`Line ${line}: narration is required.`);
            }
            if (this.toMinor(entry?.amount) <= 0) {
                throw new common_1.BadRequestException(`Line ${line}: an amount is required.`);
            }
            const acct = String(entry?.glNumber ?? '').trim();
            if (knownAccounts.size && !knownAccounts.has(acct)) {
                throw new common_1.BadRequestException(`Line ${line}: GL account ${acct} is not in the expense catalogue.`);
            }
        });
        const posted = entries.reduce((sum, entry) => sum + this.toMinor(entry?.amount), 0);
        if (posted !== requisition.netPayable) {
            throw new common_1.BadRequestException(`GL lines total ${posted / 100} but the approved net payable is ${(requisition.netPayable ?? 0) / 100}. They must match.`);
        }
        requisition.glEntries = entries.map((entry) => ({
            businessUnit: entry?.businessUnit,
            glName: entry?.glName,
            glNumber: entry?.glNumber,
            glType: entry?.glType,
            subAccount: entry?.subAccount,
            narration: entry?.narration,
            amount: this.toMinor(entry?.amount),
        }));
        requisition.status = 'PENDING_DISBURSEMENT';
        requisition.currentStage = 'DISBURSEMENT';
        this.appendHistory(requisition, 'POSTING', 'GL_POSTED', user, postingComment);
        await requisition.save();
        await this.notify(requisition, 'posted', user);
        return { status: 200, data: requisition.toObject() };
    }
    async disburse(id, payload, user) {
        const requisition = await this.loadForAction(id);
        this.assertStage(requisition, 'DISBURSEMENT', 'disbursed');
        await this.assertCanAct(requisition, user, 'disbursement');
        const config = await this.configFor(requisition);
        const graceDays = payload?.receiptGraceDays !== undefined
            ? this.toMinor(payload.receiptGraceDays)
            : (config?.receiptGraceDays ?? 7);
        await this.settleBudget(requisition);
        requisition.status = 'COMPLETED';
        requisition.currentStage = 'DONE';
        requisition.disbursedAt = new Date();
        requisition.disbursedBy = this.optionalObjectId(user?._id ?? user?.id) ?? undefined;
        requisition.receiptDueAt = new Date(Date.now() + graceDays * 24 * 60 * 60 * 1000);
        this.appendHistory(requisition, 'DISBURSEMENT', 'DISBURSED', user, payload?.comment);
        await requisition.save();
        await this.notify(requisition, 'posted', user);
        return { status: 200, data: requisition.toObject() };
    }
    async addFinanceComment(id, payload, user) {
        const requisition = await this.loadForAction(id);
        const comment = String(payload?.comment ?? '').trim();
        if (!comment)
            throw new common_1.BadRequestException('A comment is required.');
        requisition.financeComment = comment;
        requisition.financeCommentBy =
            this.optionalObjectId(user?._id ?? user?.id) ?? undefined;
        requisition.financeCommentByName = this.displayName(user);
        requisition.financeCommentAt = new Date();
        this.appendHistory(requisition, requisition.currentStage, 'FINANCE_COMMENT', user, comment);
        await requisition.save();
        return { status: 200, data: requisition.toObject() };
    }
    async assertActorHoldsStage(requisition, user, stage) {
        if ((0, access_control_util_1.userIsSuperAdmin)(user))
            return;
        if (stage === 'APPROVER') {
            const userId = this.idString(user?._id ?? user?.id);
            const assigned = this.idString(requisition.assignedApprover);
            if (assigned && assigned === userId)
                return;
            throw new common_1.ForbiddenException('Only the approver named on this requisition can act on it.');
        }
        const key = stage === 'REVIEWER' ? 'reviewer' : stage === 'POSTING' ? 'posting' : 'disbursement';
        await this.assertCanAct(requisition, user, key);
    }
    async listOverdueReceipts(entity, user) {
        const role = await this.resolveWorkflowRole(user, entity);
        if (!role.canViewAll) {
            throw new common_1.ForbiddenException('You cannot review outstanding receipts.');
        }
        const query = (0, exports.buildOverdueReceiptQuery)();
        const entityId = this.optionalObjectId(entity ?? user?.entity);
        if (entityId)
            query.entity = entityId;
        const data = await this.populate(this.requisitionModel.find(query).sort({ receiptDueAt: 1, disbursedAt: 1 }))
            .lean()
            .exec();
        return { status: 200, data, count: data.length };
    }
};
exports.ProcurementService = ProcurementService;
exports.ProcurementService = ProcurementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(procurement_requisition_schema_1.ProcurementRequisition.name)),
    __param(1, (0, mongoose_1.InjectModel)(procurement_workflow_schema_1.ProcurementWorkflowConfig.name)),
    __param(2, (0, mongoose_1.InjectModel)('User')),
    __param(3, (0, mongoose_1.InjectModel)(expense_account_schema_1.ExpenseAccount.name)),
    __param(4, (0, mongoose_1.InjectModel)(expense_budget_schema_1.ExpenseBudget.name)),
    __param(5, (0, mongoose_1.InjectModel)(department_schema_1.Department.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        workflow_notifier_service_1.WorkflowNotifier])
], ProcurementService);
//# sourceMappingURL=procurement.service.js.map