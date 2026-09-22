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
exports.BusinessUnitService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const businessunit_schema_1 = require("../../schemas/businessunit.schema");
const subsidiary_schema_1 = require("../../schemas/subsidiary.schema");
const territory_schema_1 = require("../../schemas/territory.schema");
let BusinessUnitService = class BusinessUnitService {
    constructor(businessunitModel, territoryModel, subsidiaryModel) {
        this.businessunitModel = businessunitModel;
        this.territoryModel = territoryModel;
        this.subsidiaryModel = subsidiaryModel;
    }
    normaliseType(payload) {
        if (!payload || !Object.prototype.hasOwnProperty.call(payload, 'unit'))
            return;
        const raw = String(payload.unit ?? '').trim().toLowerCase();
        if (!raw) {
            payload.unit = null;
            return;
        }
        if (!businessunit_schema_1.UNIT_TYPES.includes(raw)) {
            throw new common_1.BadRequestException(`A business unit's unit must be one of: ${businessunit_schema_1.UNIT_TYPES.join(', ')}.`);
        }
        payload.unit = raw;
    }
    normaliseSubsidiary(payload) {
        if (!payload || !Object.prototype.hasOwnProperty.call(payload, 'subsidiary'))
            return;
        const raw = String(payload.subsidiary ?? '').trim();
        if (!raw) {
            payload.subsidiary = null;
            return;
        }
        if (!mongoose_2.Types.ObjectId.isValid(raw)) {
            throw new common_1.BadRequestException('That subsidiary is not a valid reference.');
        }
        payload.subsidiary = new mongoose_2.Types.ObjectId(raw);
    }
    normaliseTerritory(payload) {
        if (!payload || !Object.prototype.hasOwnProperty.call(payload, 'territory'))
            return;
        const raw = String(payload.territory ?? '').trim();
        if (!raw) {
            payload.territory = null;
            return;
        }
        if (!mongoose_2.Types.ObjectId.isValid(raw)) {
            throw new common_1.BadRequestException('That territory is not a valid reference.');
        }
        payload.territory = new mongoose_2.Types.ObjectId(raw);
    }
    async inheritSubsidiaryFromTerritory(payload) {
        if (!payload || Object.prototype.hasOwnProperty.call(payload, 'subsidiary'))
            return;
        if (!payload.territory)
            return;
        const territory = await this.territoryModel
            .findById(payload.territory)
            .select('subsidiary')
            .lean()
            .exec();
        if (territory?.subsidiary)
            payload.subsidiary = territory.subsidiary;
    }
    async createBusinessUnit(createUserDto) {
        try {
            this.normaliseType(createUserDto);
            this.normaliseSubsidiary(createUserDto);
            this.normaliseTerritory(createUserDto);
            await this.inheritSubsidiaryFromTerritory(createUserDto);
            const createdUser = new this.businessunitModel(createUserDto);
            return createdUser.save();
        }
        catch (e) {
            if (e instanceof common_1.HttpException)
                throw e;
            throw new Error(e.message);
        }
    }
    async findAllBusinessUnit(page, limit, searchText) {
        try {
            let query = {};
            if (searchText) {
                query = {
                    $or: [
                        { name: new RegExp(searchText, 'i') }
                    ],
                };
            }
            const totalItems = await this.businessunitModel.countDocuments(query);
            const totalPages = Math.ceil(totalItems / limit);
            const items = await this.businessunitModel
                .find(query)
                .populate('territory', '_id name type')
                .populate('subsidiary', '_id name short')
                .skip((page - 1) * limit)
                .limit(limit)
                .exec();
            return {
                status: 200,
                totalPages,
                rows: items,
                totalItems,
                currentPage: page
            };
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async findBusinessUnites() {
        try {
            const BusinessUnits = await this.businessunitModel
                .find()
                .populate('territory', '_id name type')
                .populate('subsidiary', '_id name short')
                .exec();
            return { data: BusinessUnits };
        }
        catch (error) {
            console.error("Error fetching BusinessUnits:", error);
            return null;
        }
    }
    async getBusinessUnitByName(name) {
        try {
            const BusinessUnits = await this.businessunitModel.findOne({ BU_NM: { $regex: new RegExp(`^${name}$`, 'i') } }).exec();
            return BusinessUnits;
        }
        catch (error) {
            console.error("Error fetching BusinessUnits:", error);
            return null;
        }
    }
    async updateBusinessUnit(id, updateBusinessUnitDto) {
        try {
            this.normaliseType(updateBusinessUnitDto);
            this.normaliseSubsidiary(updateBusinessUnitDto);
            this.normaliseTerritory(updateBusinessUnitDto);
            await this.inheritSubsidiaryFromTerritory(updateBusinessUnitDto);
            const updatedBusinessUnit = await this.businessunitModel
                .findByIdAndUpdate(id, updateBusinessUnitDto, { new: true })
                .populate('territory', '_id name type')
                .populate('subsidiary', '_id name short')
                .exec();
            if (!updatedBusinessUnit) {
                throw new Error('Business Unit not found');
            }
            return updatedBusinessUnit;
        }
        catch (e) {
            if (e instanceof common_1.HttpException)
                throw e;
            throw new Error(e.message);
        }
    }
    async importBusinessUnits(rows) {
        if (!Array.isArray(rows) || !rows.length) {
            throw new common_1.BadRequestException('The uploaded file has no rows.');
        }
        const read = (row, ...keys) => {
            for (const key of keys) {
                const found = Object.keys(row).find((column) => column.trim().toLowerCase() === key);
                if (found && String(row[found] ?? '').trim()) {
                    return String(row[found]).trim();
                }
            }
            return '';
        };
        const [territories, subsidiaries] = await Promise.all([
            this.territoryModel.find().select('_id name subsidiary').lean().exec(),
            this.subsidiaryModel.find().select('_id name short').lean().exec(),
        ]);
        const byName = new Map(territories.map((item) => [String(item.name).trim().toLowerCase(), item._id]));
        const subsidiaryOfTerritory = new Map(territories.map((item) => [String(item._id), item.subsidiary ?? null]));
        const subsidiaryByName = new Map();
        for (const item of subsidiaries) {
            for (const label of [item.name, item.short]) {
                const key = String(label ?? '').trim().toLowerCase();
                if (key)
                    subsidiaryByName.set(key, item._id);
            }
        }
        const errors = [];
        const prepared = rows.map((row, index) => {
            const line = index + 2;
            const name = read(row, 'bu_nm', 'business unit', 'name', 'unit');
            const unitId = read(row, 'bu_id', 'bu id', 'id');
            const unitNo = read(row, 'bu_no', 'bu no', 'number');
            const territoryName = read(row, 'territory', 'territory name');
            const subsidiaryName = read(row, 'subsidiary', 'entity', 'company');
            const unit = read(row, 'unit', 'unit type', 'business unit type', 'type').toLowerCase();
            const address = read(row, 'address', 'unit address', 'location');
            if (!name && !unitNo) {
                errors.push(`Row ${line}: a business unit name or number is required.`);
            }
            let territory = undefined;
            if (territoryName) {
                territory = byName.get(territoryName.toLowerCase());
                if (!territory) {
                    errors.push(`Row ${line}: territory "${territoryName}" does not exist.`);
                }
            }
            let subsidiary = undefined;
            if (subsidiaryName) {
                subsidiary = subsidiaryByName.get(subsidiaryName.toLowerCase());
                if (!subsidiary) {
                    errors.push(`Row ${line}: subsidiary "${subsidiaryName}" does not exist.`);
                }
            }
            else if (territory) {
                subsidiary = subsidiaryOfTerritory.get(String(territory)) ?? undefined;
            }
            if (unit && !businessunit_schema_1.UNIT_TYPES.includes(unit)) {
                errors.push(`Row ${line}: unit "${unit}" is not one of ${businessunit_schema_1.UNIT_TYPES.join(', ')}.`);
            }
            if (unitId && !Number.isFinite(Number(unitId))) {
                errors.push(`Row ${line}: BU_ID must be a number.`);
            }
            if (unitNo && !Number.isFinite(Number(unitNo))) {
                errors.push(`Row ${line}: BU_NO must be a number.`);
            }
            return { line, name, unitId, unitNo, territory, subsidiary, unit, address };
        });
        if (errors.length) {
            throw new common_1.BadRequestException(errors.slice(0, 20).join(' '));
        }
        const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        let created = 0;
        let updated = 0;
        const failures = [];
        for (const entry of prepared) {
            const filter = entry.unitNo
                ? { BU_NO: Number(entry.unitNo) }
                : { BU_NM: new RegExp(`^${escape(entry.name)}$`, 'i') };
            const existing = await this.businessunitModel.findOne(filter).exec();
            if (existing) {
                const changes = {};
                if (entry.name)
                    changes.BU_NM = entry.name;
                if (entry.unitId)
                    changes.BU_ID = Number(entry.unitId);
                if (entry.unitNo)
                    changes.BU_NO = Number(entry.unitNo);
                if (entry.territory !== undefined)
                    changes.territory = entry.territory;
                if (entry.subsidiary !== undefined)
                    changes.subsidiary = entry.subsidiary;
                if (entry.unit)
                    changes.unit = entry.unit;
                if (entry.address)
                    changes.address = entry.address;
                if (Object.keys(changes).length) {
                    try {
                        await this.businessunitModel
                            .updateOne({ _id: existing._id }, { $set: changes })
                            .exec();
                    }
                    catch (error) {
                        failures.push(`Row ${entry.line}: ${error?.message ?? 'could not be updated.'}`);
                        continue;
                    }
                }
                updated += 1;
                continue;
            }
            if (!entry.name || !entry.unitId || !entry.unitNo) {
                failures.push(`Row ${entry.line}: no business unit matched, and BU_NM, BU_ID and BU_NO are all needed to create one.`);
                continue;
            }
            try {
                await this.businessunitModel.create({
                    BU_NM: entry.name,
                    BU_ID: Number(entry.unitId),
                    BU_NO: Number(entry.unitNo),
                    unit: entry.unit || null,
                    address: entry.address || null,
                    territory: entry.territory ?? null,
                    subsidiary: entry.subsidiary ?? null,
                });
                created += 1;
            }
            catch (error) {
                failures.push(`Row ${entry.line}: ${error?.message ?? 'could not be created.'}`);
            }
        }
        return {
            status: 200,
            data: {
                received: rows.length,
                created,
                updated,
                failed: failures.length,
                failures: failures.slice(0, 20),
            },
        };
    }
};
exports.BusinessUnitService = BusinessUnitService;
exports.BusinessUnitService = BusinessUnitService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('BusinessUnit')),
    __param(1, (0, mongoose_1.InjectModel)(territory_schema_1.Territory.name)),
    __param(2, (0, mongoose_1.InjectModel)(subsidiary_schema_1.Subsidiary.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], BusinessUnitService);
//# sourceMappingURL=businessUnit.service.js.map