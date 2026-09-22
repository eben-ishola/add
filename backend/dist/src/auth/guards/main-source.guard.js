"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainSourceGuard = void 0;
const common_1 = require("@nestjs/common");
const request_source_1 = require("../request-source");
let MainSourceGuard = class MainSourceGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const source = (0, request_source_1.normalizeRequestSource)(request?.user?.requestSource);
        if (source !== request_source_1.MAIN_REQUEST_SOURCE) {
            throw new common_1.ForbiddenException('Multi-factor authentication is set up in the HR application.');
        }
        return true;
    }
};
exports.MainSourceGuard = MainSourceGuard;
exports.MainSourceGuard = MainSourceGuard = __decorate([
    (0, common_1.Injectable)()
], MainSourceGuard);
//# sourceMappingURL=main-source.guard.js.map