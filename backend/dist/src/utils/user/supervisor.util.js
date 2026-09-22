"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectSupervisorMetadata = void 0;
const mongoose_1 = require("mongoose");
const buildSupervisorFilter = (userId) => ({
    $or: [{ supervisorId: userId }, { supervisor2Id: userId }],
});
const injectSupervisorMetadata = async (staffModel, user) => {
    if (!user?._id) {
        return;
    }
    const supervisorId = user._id instanceof mongoose_1.Types.ObjectId ? user._id : new mongoose_1.Types.ObjectId(String(user._id));
    const directReportCount = await staffModel.countDocuments(buildSupervisorFilter(supervisorId));
    const hasSubordinates = directReportCount > 0;
    if (typeof user.set === 'function') {
        user.set('hasSubordinates', hasSubordinates, { strict: false });
        user.set('directReportCount', directReportCount, { strict: false });
    }
    else {
        user.hasSubordinates = hasSubordinates;
        user.directReportCount = directReportCount;
    }
};
exports.injectSupervisorMetadata = injectSupervisorMetadata;
//# sourceMappingURL=supervisor.util.js.map