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
exports.PayrollAccountSwitchService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const payrollApproval_schema_1 = require("../../schemas/payrollApproval.schema");
const user_schema_1 = require("../../schemas/user.schema");
const POSTED_STATUS = 'APPROVED';
const LABEL = {
    atlas: 'Atlas',
    addosser: 'Addosser',
};
let PayrollAccountSwitchService = class PayrollAccountSwitchService {
    constructor(payrollApprovalModel, processedPayrollModel, userModel) {
        this.payrollApprovalModel = payrollApprovalModel;
        this.processedPayrollModel = processedPayrollModel;
        this.userModel = userModel;
    }
    normalizeAccountType(accountType) {
        const normalized = String(accountType ?? '')
            .trim()
            .toLowerCase();
        if (normalized !== 'atlas' && normalized !== 'addosser') {
            throw new common_1.BadRequestException('accountType must be "atlas" or "addosser".');
        }
        return normalized;
    }
    rowStaffId(row) {
        return String(row?.staffId ?? row?.employeeId ?? row?.userId ?? row?.id ?? '').trim();
    }
    readAccount(row, accountType) {
        const source = accountType === 'atlas'
            ? row?.atlasAccount ?? row?.atlas
            : row?.addosserAccount ?? row?.addosser;
        return source === null || source === undefined ? '' : String(source).trim();
    }
    async buildUserAccountLookup(rows) {
        const objectIds = new Set();
        const staffCodes = new Set();
        for (const row of rows) {
            [row?.staffId, row?.employeeId, row?.userId, row?.id]
                .map((value) => String(value ?? '').trim())
                .filter(Boolean)
                .forEach((candidate) => {
                if (mongoose_2.Types.ObjectId.isValid(candidate))
                    objectIds.add(candidate);
                else
                    staffCodes.add(candidate);
            });
        }
        const [byId, byCode] = await Promise.all([
            objectIds.size
                ? this.userModel
                    .find({ _id: { $in: Array.from(objectIds) } })
                    .select('_id staffId atlasAccount addosserAccount')
                    .lean()
                    .exec()
                : Promise.resolve([]),
            staffCodes.size
                ? this.userModel
                    .find({ staffId: { $in: Array.from(staffCodes) } })
                    .select('_id staffId atlasAccount addosserAccount')
                    .lean()
                    .exec()
                : Promise.resolve([]),
        ]);
        const lookup = new Map();
        for (const user of [...byId, ...byCode]) {
            [user?._id, user?.staffId]
                .map((value) => String(value ?? '').trim().toLowerCase())
                .filter(Boolean)
                .forEach((key) => {
                if (!lookup.has(key))
                    lookup.set(key, user);
            });
        }
        return lookup;
    }
    readAccountFromUser(userDoc, accountType) {
        const source = accountType === 'atlas' ? userDoc?.atlasAccount : userDoc?.addosserAccount;
        return source === null || source === undefined ? '' : String(source).trim();
    }
    async switchApprovalAccountForAll(_user, approvalId, accountType) {
        const normalizedType = this.normalizeAccountType(accountType);
        const approval = await this.payrollApprovalModel.findById(approvalId);
        if (!approval) {
            throw new common_1.NotFoundException('Payroll approval request not found');
        }
        if (String(approval.status ?? '').toUpperCase() === POSTED_STATUS) {
            throw new common_1.BadRequestException('The payout account can no longer be switched after the batch has been posted.');
        }
        const rows = Array.isArray(approval.data)
            ? approval.data
            : [];
        if (!rows.length) {
            throw new common_1.NotFoundException('This approval has no rows to switch.');
        }
        const userLookup = await this.buildUserAccountLookup(rows);
        const userDocFor = (row) => [row?.staffId, row?.employeeId, row?.userId, row?.id]
            .map((value) => String(value ?? '').trim().toLowerCase())
            .filter(Boolean)
            .map((key) => userLookup.get(key))
            .find(Boolean);
        const accountByStaffId = new Map();
        let switched = 0;
        let skipped = 0;
        for (const row of rows) {
            const account = this.readAccount(row, normalizedType) ||
                this.readAccountFromUser(userDocFor(row), normalizedType);
            if (!account) {
                skipped += 1;
                continue;
            }
            row.account = account;
            row.accountNo = account;
            row.payoutAccountType = normalizedType;
            switched += 1;
            const staffId = this.rowStaffId(row);
            if (staffId)
                accountByStaffId.set(staffId, account);
        }
        if (!switched) {
            throw new common_1.BadRequestException(`No staff in this approval has a ${LABEL[normalizedType]} account on file.`);
        }
        approval.markModified('data');
        await approval.save();
        const batchId = approval.batchId;
        if (batchId && accountByStaffId.size) {
            const operations = Array.from(accountByStaffId.entries()).map(([staffId, account]) => ({
                updateMany: {
                    filter: { batchId, staffId },
                    update: {
                        $set: {
                            account,
                            accountNo: account,
                            payoutAccountType: normalizedType,
                        },
                    },
                },
            }));
            await this.processedPayrollModel.bulkWrite(operations);
        }
        return {
            status: 200,
            message: skipped
                ? `Payout account switched for ${switched} row(s); ${skipped} row(s) had no ${LABEL[normalizedType]} account on file and were left unchanged.`
                : 'Payout account switched successfully.',
            accountType: normalizedType,
            switched,
            skipped,
            appliedToAll: skipped === 0,
        };
    }
};
exports.PayrollAccountSwitchService = PayrollAccountSwitchService;
exports.PayrollAccountSwitchService = PayrollAccountSwitchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(payrollApproval_schema_1.PayrollApproval.name)),
    __param(1, (0, mongoose_1.InjectModel)('ProcessedPayroll')),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], PayrollAccountSwitchService);
//# sourceMappingURL=payroll-account-switch.service.js.map