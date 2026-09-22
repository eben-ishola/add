"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toObjectIds = exports.toObjectId = void 0;
const mongoose_1 = require("mongoose");
const toObjectId = (value) => {
    const raw = String(value ?? '').trim();
    if (!raw || !mongoose_1.Types.ObjectId.isValid(raw))
        return null;
    return new mongoose_1.Types.ObjectId(raw);
};
exports.toObjectId = toObjectId;
const toObjectIds = (values) => values
    .map((value) => (0, exports.toObjectId)(value))
    .filter((value) => value !== null);
exports.toObjectIds = toObjectIds;
//# sourceMappingURL=mongo.js.map