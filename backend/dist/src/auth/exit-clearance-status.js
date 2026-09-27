"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exitClearanceClosed = exports.latestClearanceStatus = void 0;
const mongoose_1 = require("mongoose");
const latestClearanceStatus = async (clearanceModel, userId) => {
    if (!clearanceModel)
        return null;
    const id = String(userId ?? '').trim();
    if (!id || !mongoose_1.Types.ObjectId.isValid(id))
        return null;
    const clearance = await clearanceModel
        .findOne({ staff: new mongoose_1.Types.ObjectId(id) })
        .sort({ createdAt: -1 })
        .select('status')
        .lean()
        .exec();
    return clearance?.status ? String(clearance.status) : null;
};
exports.latestClearanceStatus = latestClearanceStatus;
const exitClearanceClosed = (status) => status === 'COMPLETED';
exports.exitClearanceClosed = exitClearanceClosed;
//# sourceMappingURL=exit-clearance-status.js.map