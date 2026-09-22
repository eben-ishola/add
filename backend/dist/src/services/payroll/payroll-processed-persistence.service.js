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
exports.PayrollProcessedPersistenceService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const payroll_period_util_1 = require("../../utils/payroll/payroll-period.util");
const payroll_proration_util_1 = require("../../utils/payroll/payroll-proration.util");
const payroll_calculation_util_1 = require("../../utils/payroll/payroll-calculation.util");
const payroll_row_util_1 = require("../../utils/payroll/payroll-row.util");
const payroll_identity_util_1 = require("../../utils/payroll/payroll-identity.util");
const exit_service_1 = require("../employee-lifecycle/exit.service");
let PayrollProcessedPersistenceService = class PayrollProcessedPersistenceService {
    constructor(processedPayrollModel, payrollModel, exitService, payrollApprovalModel) {
        this.processedPayrollModel = processedPayrollModel;
        this.payrollModel = payrollModel;
        this.exitService = exitService;
        this.payrollApprovalModel = payrollApprovalModel;
    }
    async resolvePayrollRunDate(batchId) {
        if (!this.payrollApprovalModel)
            return new Date();
        const batch = await this.payrollApprovalModel
            .findOne({ batchId })
            .select('createdAt')
            .lean()
            .exec();
        const generatedAt = batch?.createdAt ? new Date(batch.createdAt) : null;
        return generatedAt && !Number.isNaN(generatedAt.getTime()) ? generatedAt : new Date();
    }
    async persistProcessedPayroll(batchId, payrollData, entity, periodDate) {
        if (!Array.isArray(payrollData) || !payrollData.length) {
            throw new common_1.BadRequestException('No payroll data available for processing');
        }
        const existing = await this.processedPayrollModel.exists({ batchId });
        if (existing) {
            return;
        }
        const { workingDays, performanceBrackets } = await this.loadEntityPayrollSettings(entity);
        const normalizedData = this.normalizePayrollData(payrollData, {
            workingDays,
            performanceBrackets,
        });
        const resolvedPeriodDate = periodDate instanceof Date && !Number.isNaN(periodDate.getTime()) ? periodDate : new Date();
        const periodKey = (0, payroll_period_util_1.buildPayrollPeriodKey)(resolvedPeriodDate);
        const periodLabel = (0, payroll_period_util_1.formatPayrollMonthLabel)(resolvedPeriodDate);
        const periodFields = {
            periodDate: resolvedPeriodDate,
            periodKey,
            period: periodLabel,
        };
        const accountDetailOf = (row) => row?.accountDetail ?? row?.employeeInformation?.accountDetail ?? null;
        const resolveNhfAccount = (row) => {
            const detail = accountDetailOf(row);
            return (row?.nhfAccount ??
                detail?.nhf ??
                detail?.nhfAccount ??
                null);
        };
        const resolvePayeAccount = (row) => {
            const detail = accountDetailOf(row);
            return (row?.payeAccount ??
                detail?.payeAccount ??
                detail?.taxProfileId ??
                null);
        };
        const resolvePensionAccount = (row) => {
            const detail = accountDetailOf(row);
            return (row?.pensionAccount ??
                detail?.pensionAccount ??
                detail?.rsaNumber ??
                null);
        };
        const resolvePensionProvider = (row) => {
            const detail = accountDetailOf(row);
            return (row?.pensionProvider ??
                detail?.pensionProvider ??
                detail?.pfa ??
                null);
        };
        const resolveBranchName = (row) => {
            const raw = row?.branch ??
                row?.branchName ??
                row?.branchname ??
                row?.branchCode ??
                row?.branch_code ??
                row?.department ??
                row?.departmentName;
            if (!raw)
                return null;
            if (typeof raw === 'string')
                return raw.trim() || null;
            if (typeof raw === 'object') {
                return raw?.name ?? raw?.short ?? raw?.code ?? null;
            }
            try {
                return String(raw);
            }
            catch {
                return null;
            }
        };
        const hasSalary = normalizedData.some((item) => item.type === 'salary');
        const hasReimbursable = normalizedData.some((item) => item.type === 'reimbursable');
        const hasVariable = normalizedData.some((item) => item.type === 'variable');
        const resolveStaffId = (item) => item?.staffId ?? item?.employeeId ?? item?.userId ?? item?.id ?? null;
        const pendingNetAdjustment = (item) => (0, payroll_identity_util_1.parsePayrollBooleanFlag)(item?.netAdjustmentApplied)
            ? 0
            : (0, payroll_calculation_util_1.roundPayrollAmount)((0, payroll_calculation_util_1.toSafePayrollNumber)(item?.netAdjustment, 0), 2);
        const resolveAccountNo = (item) => item?.accountNo ??
            item?.accountNumber ??
            item?.account ??
            item?.addosserAccount ??
            item?.atlasAccount ??
            item?.bankAccount ??
            item?.employeeAccount ??
            null;
        const defaultPayslipApproval = 'Pending';
        if (hasSalary) {
            const salaryItems = normalizedData
                .filter((item) => item.type === 'salary')
                .map((item) => {
                const prorateFactor = (0, payroll_proration_util_1.resolvePayrollProrationFactor)(item, workingDays, {
                    type: 'salary',
                    periodDate: resolvedPeriodDate,
                });
                const branchName = resolveBranchName(item);
                const nhfAccount = resolveNhfAccount(item);
                const payeAccount = resolvePayeAccount(item);
                const pensionAccount = resolvePensionAccount(item);
                const pensionProvider = resolvePensionProvider(item);
                return {
                    batchId,
                    ...periodFields,
                    branch: branchName,
                    name: item.name,
                    account: item?.account || item?.addosserAccount,
                    accountNo: resolveAccountNo(item),
                    staffId: resolveStaffId(item),
                    grade: item.grade,
                    basic: item.basic * prorateFactor,
                    housing: item.housing * prorateFactor,
                    transport: item.transport * prorateFactor,
                    dress: item.dress * prorateFactor,
                    utilities: item.utilities * prorateFactor,
                    lunch: item.lunch * prorateFactor,
                    telephone: item.telephone * prorateFactor,
                    gross: item.gross * prorateFactor,
                    pension: item.pension * prorateFactor,
                    companyPension: item.monthlyCompanyPension * prorateFactor,
                    nhf: item.nhf * prorateFactor,
                    paye: item.paye * prorateFactor,
                    amount: item.monthlyNet * prorateFactor + pendingNetAdjustment(item),
                    type: 'salary',
                    status: 'Processed',
                    payslipApproval: defaultPayslipApproval,
                    entity,
                    nhfAccount,
                    payeAccount,
                    pensionAccount,
                    pensionProvider,
                };
            });
            const pensionData = salaryItems
                .filter((item) => item.pension || item.companyPension)
                .map(({ branch, name, grade, pensionAccount, pensionProvider, pension, companyPension, staffId, }) => {
                const employeeContribution = (0, payroll_calculation_util_1.toSafePayrollNumber)(pension);
                const employerContribution = (0, payroll_calculation_util_1.toSafePayrollNumber)(companyPension);
                const total = (0, payroll_calculation_util_1.roundPayrollAmount)(employeeContribution + employerContribution);
                const pensionAcctNo = pensionAccount ?? resolveAccountNo({
                    account: pensionAccount,
                    accountNumber: pensionAccount,
                });
                return {
                    batchId,
                    ...periodFields,
                    branch,
                    account: pensionAccount,
                    accountNo: pensionAcctNo,
                    pensionAccount,
                    pensionProvider,
                    staffId,
                    provider: pensionProvider,
                    pension: employeeContribution,
                    companyPension: employerContribution,
                    amount: total,
                    type: 'pension',
                    name,
                    grade,
                    status: 'Processed',
                    payslipApproval: defaultPayslipApproval,
                    entity,
                };
            });
            const nhfData = salaryItems
                .filter((item) => item.nhf)
                .map(({ branch, name, grade, nhfAccount, nhf, staffId }) => ({
                batchId,
                ...periodFields,
                branch,
                account: nhfAccount,
                accountNo: nhfAccount ?? resolveAccountNo({ account: nhfAccount, accountNumber: nhfAccount }),
                staffId,
                nhfAccount,
                nhf: nhfAccount,
                amount: nhf,
                type: 'nhf',
                name,
                grade,
                status: 'Processed',
                payslipApproval: defaultPayslipApproval,
                entity,
            }));
            const payeData = salaryItems
                .filter((item) => item.paye)
                .map(({ branch, name, grade, payeAccount, paye, staffId }) => ({
                batchId,
                ...periodFields,
                branch,
                account: payeAccount,
                accountNo: payeAccount ?? resolveAccountNo({ account: payeAccount, accountNumber: payeAccount }),
                staffId,
                payeAccount,
                amount: paye,
                type: 'paye',
                name,
                grade,
                status: 'Processed',
                payslipApproval: defaultPayslipApproval,
                entity,
            }));
            const payableSalaryItems = this.exitService
                ? await this.exitService.applyExitPayouts(salaryItems, {
                    entity,
                    runDate: await this.resolvePayrollRunDate(batchId),
                })
                : salaryItems;
            await this.processedPayrollModel.insertMany([
                ...payableSalaryItems.map((item) => this.stripSalaryStatutoryAccounts(item)),
                ...pensionData,
                ...payeData,
                ...nhfData,
            ]);
        }
        if (hasReimbursable) {
            const reimbursableData = normalizedData
                .filter((item) => item.type === 'reimbursable')
                .map((item) => {
                const prorateFactor = (0, payroll_proration_util_1.resolvePayrollProrationFactor)(item, workingDays, {
                    type: 'reimbursable',
                    periodDate: resolvedPeriodDate,
                });
                const branchName = resolveBranchName(item);
                return {
                    batchId,
                    ...periodFields,
                    branch: branchName,
                    name: item.name,
                    account: item?.addosserAccount,
                    accountNo: resolveAccountNo(item),
                    staffId: resolveStaffId(item),
                    grade: item.grade,
                    amount: item.reimbursable * prorateFactor + pendingNetAdjustment(item),
                    type: 'reimbursable',
                    status: 'Processed',
                    payslipApproval: defaultPayslipApproval,
                    entity,
                };
            });
            if (reimbursableData.length) {
                await this.processedPayrollModel.insertMany(reimbursableData);
            }
        }
        if (hasVariable) {
            const variableData = normalizedData.filter((item) => item.type === 'variable');
            const bankData = variableData.map((item) => {
                const prorateFactor = (0, payroll_proration_util_1.resolvePayrollProrationFactor)(item, workingDays, {
                    type: 'variable',
                    periodDate: resolvedPeriodDate,
                });
                const variableBase = item.variable * prorateFactor;
                const branchName = resolveBranchName(item);
                return {
                    batchId,
                    ...periodFields,
                    branch: branchName,
                    name: item.name,
                    account: item?.atlasAccount || item?.addosserAccount,
                    accountNo: resolveAccountNo(item),
                    staffId: resolveStaffId(item),
                    grade: item.grade,
                    amount: variableBase / 2,
                    type: 'bank',
                    status: 'Processed',
                    payslipApproval: defaultPayslipApproval,
                    entity,
                };
            });
            const individualData = variableData.map((item) => {
                const prorateFactor = (0, payroll_proration_util_1.resolvePayrollProrationFactor)(item, workingDays, {
                    type: 'variable',
                    periodDate: resolvedPeriodDate,
                });
                const variableBase = item.variable * prorateFactor;
                const performancePercent = (0, payroll_calculation_util_1.normalizePayrollPercent)(item.proratePercent ??
                    (0, payroll_proration_util_1.resolvePayrollPerformancePercent)(item.performanceScore, performanceBrackets) ??
                    100, 100);
                const branchName = resolveBranchName(item);
                return {
                    batchId,
                    ...periodFields,
                    branch: branchName,
                    name: item.name,
                    account: item?.atlasAccount || item?.addosserAccount,
                    accountNo: resolveAccountNo(item),
                    staffId: resolveStaffId(item),
                    grade: item.grade,
                    amount: (variableBase / 2) * (performancePercent / 100) + pendingNetAdjustment(item),
                    type: 'individual',
                    status: 'Processed',
                    payslipApproval: defaultPayslipApproval,
                    entity,
                };
            });
            await this.processedPayrollModel.insertMany([...bankData, ...individualData]);
        }
    }
    normalizePayrollData(data, options) {
        if (!Array.isArray(data))
            return [];
        return data.map((item) => {
            const type = item.type || (0, payroll_proration_util_1.detectPayrollRowType)(item);
            const workingDays = options?.workingDays ?? 30;
            const normalizeIdentifier = (value) => (0, payroll_row_util_1.normalizePayrollTextValue)(value) ?? undefined;
            const pensionAccount = normalizeIdentifier(item?.pensionAccount ?? item?.rsaNumber ?? item?.rsaPin ?? item?.rsa);
            const pensionProvider = normalizeIdentifier(item?.pensionProvider ?? item?.pfaCode ?? item?.pfaName ?? item?.pfa);
            const nhfAccount = normalizeIdentifier(item?.nhfAccount ?? item?.nhfNumber ?? item?.nhfNo ?? item?.nhfPin);
            const payeAccount = normalizeIdentifier(item?.payeAccount ?? item?.taxProfileId ?? item?.taxId ?? item?.taxID);
            const prorateValues = (0, payroll_calculation_util_1.toSafePayrollNumber)(item.prorateValues, workingDays);
            const prorateBase = (0, payroll_calculation_util_1.toSafePayrollNumber)(item.prorateBase ?? item.totalDays ?? item.workingDays ?? workingDays, workingDays);
            const performanceScore = item.performanceScore !== undefined && item.performanceScore !== null
                ? (0, payroll_calculation_util_1.toSafePayrollNumber)(item.performanceScore)
                : undefined;
            const resolvedPerformancePercent = type === 'variable'
                ? (0, payroll_proration_util_1.resolvePayrollPerformancePercent)(performanceScore, options?.performanceBrackets)
                : undefined;
            const proratePercent = type === 'variable'
                ? (0, payroll_calculation_util_1.normalizePayrollPercent)(item.proratePercent ?? resolvedPerformancePercent ?? 100, 100)
                : undefined;
            return {
                ...item,
                type,
                pensionAccount,
                pensionProvider,
                nhfAccount,
                payeAccount,
                rsaNumber: normalizeIdentifier(item?.rsaNumber),
                rsaPin: normalizeIdentifier(item?.rsaPin),
                rsa: normalizeIdentifier(item?.rsa),
                taxId: normalizeIdentifier(item?.taxId ?? item?.taxID),
                prorateValues,
                prorateBase,
                performanceScore,
                performancePercent: type === 'variable' ? proratePercent : undefined,
                proratePercent,
                basic: (0, payroll_calculation_util_1.toSafePayrollNumber)(item.basic),
                housing: (0, payroll_calculation_util_1.toSafePayrollNumber)(item.housing),
                transport: (0, payroll_calculation_util_1.toSafePayrollNumber)(item.transport),
                dress: (0, payroll_calculation_util_1.toSafePayrollNumber)(item.dress),
                utilities: (0, payroll_calculation_util_1.toSafePayrollNumber)(item.utilities),
                lunch: (0, payroll_calculation_util_1.toSafePayrollNumber)(item.lunch),
                telephone: (0, payroll_calculation_util_1.toSafePayrollNumber)(item.telephone),
                gross: (0, payroll_calculation_util_1.toSafePayrollNumber)(item.gross),
                pension: (0, payroll_calculation_util_1.toSafePayrollNumber)(item.pension),
                monthlyCompanyPension: (0, payroll_calculation_util_1.toSafePayrollNumber)(item.monthlyCompanyPension ?? item.companyPension),
                nhf: (0, payroll_calculation_util_1.toSafePayrollNumber)(item.nhf),
                paye: (0, payroll_calculation_util_1.toSafePayrollNumber)(item.paye),
                amount: (0, payroll_calculation_util_1.toSafePayrollNumber)(item.amount),
                monthlyNet: (0, payroll_calculation_util_1.toSafePayrollNumber)(item.monthlyNet),
                loanDeduction: (0, payroll_calculation_util_1.toSafePayrollNumber)(item.loanDeduction),
                reimbursable: (0, payroll_calculation_util_1.toSafePayrollNumber)(item.reimbursable),
                variable: (0, payroll_calculation_util_1.toSafePayrollNumber)(item.variable),
            };
        });
    }
    stripSalaryStatutoryAccounts(item) {
        const row = { ...item };
        delete row.nhfAccount;
        delete row.payeAccount;
        delete row.pensionAccount;
        delete row.pensionProvider;
        return row;
    }
    async loadEntityPayrollSettings(entityId) {
        const match = [{ entity: entityId }];
        if (mongoose_2.Types.ObjectId.isValid(entityId)) {
            match.push({ entity: new mongoose_2.Types.ObjectId(entityId) });
        }
        const config = await this.payrollModel.findOne({ $or: match }).lean();
        const workingDays = (0, payroll_calculation_util_1.toSafePayrollNumber)(config?.workingDays ?? 30, 30);
        const performanceBrackets = (0, payroll_proration_util_1.normalizePayrollPerformanceBrackets)(config?.performanceBrackets);
        return { workingDays, performanceBrackets };
    }
};
exports.PayrollProcessedPersistenceService = PayrollProcessedPersistenceService;
exports.PayrollProcessedPersistenceService = PayrollProcessedPersistenceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('ProcessedPayroll')),
    __param(1, (0, mongoose_1.InjectModel)('Payroll')),
    __param(2, (0, common_1.Optional)()),
    __param(3, (0, common_1.Optional)()),
    __param(3, (0, mongoose_1.InjectModel)('PayrollApproval')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        exit_service_1.ExitService,
        mongoose_2.Model])
], PayrollProcessedPersistenceService);
//# sourceMappingURL=payroll-processed-persistence.service.js.map