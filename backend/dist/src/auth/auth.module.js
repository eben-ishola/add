"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const jwt_stategy_1 = require("./strategies/jwt.stategy");
const mongoose_1 = require("@nestjs/mongoose");
const user_schema_1 = require("../schemas/user.schema");
const mfa_policy_schema_1 = require("../schemas/mfa-policy.schema");
const exit_clearance_schema_1 = require("../schemas/exit-clearance.schema");
const auth_service_1 = require("./services/auth.service");
const auth_controller_1 = require("./auth.controller");
const users_controller_1 = require("./users.controller");
const mail_service_1 = require("../services/comms/mail.service");
const mfa_service_1 = require("./services/mfa.service");
const mfa_controller_1 = require("./mfa.controller");
const permissions_guard_1 = require("./guards/permissions.guard");
const config_1 = require("../config");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: config_1.config.jwtSecret,
                signOptions: { expiresIn: '1h' },
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: mfa_policy_schema_1.MfaPolicy.name, schema: mfa_policy_schema_1.MfaPolicySchema },
                { name: exit_clearance_schema_1.ExitClearance.name, schema: exit_clearance_schema_1.ExitClearanceSchema },
            ]),
        ],
        providers: [jwt_stategy_1.JwtStrategy, auth_service_1.AuthService, mail_service_1.MailService, mfa_service_1.MfaService, permissions_guard_1.PermissionsGuard],
        controllers: [auth_controller_1.AuthController, users_controller_1.UsersController, mfa_controller_1.MfaController],
        exports: [jwt_1.JwtModule, auth_service_1.AuthService, mfa_service_1.MfaService, permissions_guard_1.PermissionsGuard],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map