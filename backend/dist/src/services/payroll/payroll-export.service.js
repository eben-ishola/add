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
exports.PayrollExportService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_service_1 = require("../user/user.service");
const subsidiary_service_1 = require("../org/subsidiary.service");
const access_control_util_1 = require("../../utils/shared/access-control.util");
const payroll_access_util_1 = require("../../utils/payroll/payroll-access.util");
const payroll_period_util_1 = require("../../utils/payroll/payroll-period.util");
const payroll_identity_util_1 = require("../../utils/payroll/payroll-identity.util");
const access_control_util_2 = require("../../utils/shared/access-control.util");
const PAYROLL_EXPORT_SUPER_ADMIN_ROLE_NAMES = access_control_util_2.SUPER_ADMIN_ROLE_NAME_SET;
let PayrollExportService = class PayrollExportService {
    constructor(processedPayrollModel, staffService, entityService) {
        this.processedPayrollModel = processedPayrollModel;
        this.staffService = staffService;
        this.entityService = entityService;
    }
    hasFinanceScope(user) {
        return (0, access_control_util_1.userHasScope)(user, ['finance', 'group']);
    }
    canViewUnapprovedPayslips(user) {
        return (this.hasFinanceScope(user) ||
            (0, payroll_access_util_1.payrollUserHasSuperAdminRole)(user, PAYROLL_EXPORT_SUPER_ADMIN_ROLE_NAMES));
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
    async getPayslipsForUser(idOrUser, viewer) {
        if (!viewer) {
            throw new common_1.UnauthorizedException('Authenticated user required to fetch payslips.');
        }
        const lookup = await this.staffService
            .getById(idOrUser)
            .catch(() => null);
        const slips = await this.processedPayrollModel
            .find({ staffId: lookup?.staffId })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        const canViewAll = this.canViewUnapprovedPayslips(viewer);
        const normalized = slips.map((slip) => {
            const createdAt = slip?.periodDate
                ? new Date(slip.periodDate)
                : slip?.createdAt
                    ? new Date(slip.createdAt)
                    : new Date();
            const periodKey = (typeof slip?.periodKey === 'string' && slip.periodKey.trim())
                ? slip.periodKey.toLowerCase()
                : (0, payroll_period_util_1.buildPayrollPeriodKey)(createdAt);
            const periodLabel = slip?.period ??
                createdAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            const payslipApproval = slip?.payslipApproval ?? 'Pending';
            const detailsVisible = canViewAll || payslipApproval === 'Approved';
            if (!detailsVisible) {
                return {
                    _id: slip?._id,
                    name: slip?.name,
                    staffId: slip?.staffId,
                    userId: slip?.userId ?? slip?._id,
                    staffObjectId: slip?.staffObjectId ?? slip?.userId ?? slip?._id,
                    employeeId: slip?.employeeId ?? slip?.staffId,
                    entity: slip?.entity,
                    batchId: slip?.batchId,
                    type: slip?.type,
                    status: slip?.status,
                    payslipApproval,
                    detailsVisible,
                    periodKey,
                    period: periodLabel,
                    periodDate: createdAt,
                };
            }
            return {
                ...slip,
                userId: slip?.userId ?? slip?._id,
                staffObjectId: slip?.staffObjectId ?? slip?.userId ?? slip?._id,
                employeeId: slip?.employeeId ?? slip?.staffId,
                payslipApproval,
                detailsVisible,
                periodKey,
                period: periodLabel,
                periodDate: createdAt,
            };
        });
        return { status: 200, data: normalized };
    }
    async getProcessedPayrollByStaffId(staffId, user) {
        const staffRef = typeof staffId === 'string' ? staffId.trim() : String(staffId ?? '').trim();
        if (!staffRef) {
            throw new common_1.BadRequestException('Staff ID is required');
        }
        const identifiers = new Set();
        const addId = (val) => {
            if (!val)
                return;
            if (typeof val === 'object') {
                const candidate = val?._id ??
                    val?.id ??
                    val?.userId ??
                    val?.staffId ??
                    val?.employeeId ??
                    val?.email;
                if (candidate) {
                    addId(candidate);
                }
                return;
            }
            const str = String(val).trim();
            if (str)
                identifiers.add(str);
        };
        addId(staffRef);
        const ids = Array.from(identifiers);
        const query = {
            $or: [
                { staffId: { $in: ids } },
                { employeeId: { $in: ids } },
                { userId: { $in: ids } },
                { staffObjectId: { $in: ids } },
            ],
        };
        const canViewAll = this.canViewUnapprovedPayslips(user);
        if (!canViewAll) {
            query.payslipApproval = 'Approved';
        }
        const slips = await this.processedPayrollModel
            .find(query)
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        const staffObjectId = (0, payroll_identity_util_1.normalizePayrollUserId)(staffRef);
        const normalized = slips.map((slip) => {
            const createdAt = slip?.periodDate
                ? new Date(slip.periodDate)
                : slip?.createdAt
                    ? new Date(slip.createdAt)
                    : new Date();
            const periodKey = (typeof slip?.periodKey === 'string' && slip.periodKey.trim())
                ? slip.periodKey.toLowerCase()
                : (0, payroll_period_util_1.buildPayrollPeriodKey)(createdAt);
            const periodLabel = slip?.period ??
                createdAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            return {
                ...slip,
                userId: slip?.userId ?? staffObjectId ?? slip?._id,
                staffObjectId: slip?.staffObjectId ?? slip?.userId ?? staffObjectId ?? slip?._id,
                employeeId: slip?.employeeId ?? slip?.staffId ?? staffRef,
                staffId: slip?.staffId ?? staffRef,
                periodKey,
                period: periodLabel,
                periodDate: createdAt,
            };
        });
        return { status: 200, data: normalized };
    }
    async getProcessedPayroll(entity, month, type) {
        try {
            const entityId = await this.normalizeEntityIdStrict(entity);
            const [year, mon] = month?.split('-').map(Number);
            const query = {
                entity: entityId,
                createdAt: {
                    $gte: new Date(year, mon - 1, 1),
                    $lt: new Date(year, mon, 1),
                },
            };
            if (type) {
                if (type === 'pension') {
                    query.type = { $in: ['pension', 'companyPension'] };
                }
                else {
                    query.type = type;
                }
            }
            const payrollData = await this.processedPayrollModel.find(query).lean().exec();
            return { status: 200, data: payrollData };
        }
        catch (error) {
            throw new Error(`Error fetching payroll data: ${error.message}`);
        }
    }
};
exports.PayrollExportService = PayrollExportService;
exports.PayrollExportService = PayrollExportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('ProcessedPayroll')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        user_service_1.StaffService,
        subsidiary_service_1.SubsidiaryService])
], PayrollExportService);
//# sourceMappingURL=payroll-export.service.js.map