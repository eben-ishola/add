"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toObjectId = toObjectId;
const mongoose_1 = require("mongoose");
function toObjectId(value) {
    if (!value)
        return value;
    if (mongoose_1.default.Types.ObjectId.isValid(value)) {
        return new mongoose_1.default.Types.ObjectId(value);
    }
    return value;
}
//# sourceMappingURL=index.utils.js.map