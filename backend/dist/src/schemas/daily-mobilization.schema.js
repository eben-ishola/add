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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyMobilizationSchema = exports.DailyMobilization = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Mobilization = class Mobilization {
};
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Mobilization.prototype, "region", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Mobilization.prototype, "min", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Mobilization.prototype, "max", void 0);
Mobilization = __decorate([
    (0, mongoose_1.Schema)()
], Mobilization);
let DailyMobilization = class DailyMobilization {
};
exports.DailyMobilization = DailyMobilization;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DailyMobilization.prototype, "lengthOfService", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: [] }),
    __metadata("design:type", Array)
], DailyMobilization.prototype, "mobilization", void 0);
exports.DailyMobilization = DailyMobilization = __decorate([
    (0, mongoose_1.Schema)({ collection: 'dailymobilizations' })
], DailyMobilization);
exports.DailyMobilizationSchema = mongoose_1.SchemaFactory.createForClass(DailyMobilization);
//# sourceMappingURL=daily-mobilization.schema.js.map