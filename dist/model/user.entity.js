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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const abtract_entity_entity_1 = require("./abtract-entity.entity");
const user_provider_entity_1 = require("./user-provider.entity");
const role_enum_1 = require("../enum/role.enum");
const activity_status_enum_1 = require("../enum/activity-status.enum");
const language_entity_1 = require("./language.entity");
const theme_enum_1 = require("../enum/theme.enum");
const session_timeout_action_enum_1 = require("../enum/session-timeout-action.enum");
const bcrypt_1 = require("../utils/bcrypt");
const session_entity_1 = require("./session.entity");
let User = class User extends abtract_entity_entity_1.AbstractEntity {
    getSubRole() {
        return this.role.replace("ROLE_", "");
    }
    omitPassword() {
        const { password, ...userWithoutPassword } = this; // Destructure to omit password
        return userWithoutPassword; // Type assertion
    }
    async comparePassword(val) {
        return (0, bcrypt_1.compareValue)(val, this.password);
    }
    async hashPassword() {
        this.password = await (0, bcrypt_1.hashValue)(this.password);
    }
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", unique: true, nullable: false }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false, name: "encrypted_password" }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_provider_entity_1.UserProvider, (userProvider) => userProvider.user, {
        cascade: true,
        orphanedRowAction: "delete",
    }),
    __metadata("design:type", Array)
], User.prototype, "providers", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: role_enum_1.Role }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: activity_status_enum_1.ActiveStatus, default: activity_status_enum_1.ActiveStatus.INACTIVE }),
    __metadata("design:type", String)
], User.prototype, "activeStatus", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => language_entity_1.Language),
    __metadata("design:type", language_entity_1.Language)
], User.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: theme_enum_1.Theme, default: theme_enum_1.Theme.LIGHT }),
    __metadata("design:type", String)
], User.prototype, "theme", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, default: null }),
    __metadata("design:type", Date)
], User.prototype, "confirmedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], User.prototype, "confirmationCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], User.prototype, "resetPasswordCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, default: null }),
    __metadata("design:type", Date)
], User.prototype, "resetPasswordConfirmedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true, default: null }),
    __metadata("design:type", Date)
], User.prototype, "requestDeleteAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], User.prototype, "requestDeleteCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "unlockFaceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], User.prototype, "unlockPinCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "loginWithFaceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 15 }),
    __metadata("design:type", Number)
], User.prototype, "sessionTimeout", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: session_timeout_action_enum_1.SessionTimeoutAction,
        default: session_timeout_action_enum_1.SessionTimeoutAction.LOGOUT,
    }),
    __metadata("design:type", String)
], User.prototype, "sessionTimeoutAction", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "rememberEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "rememberPassword", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "logoutOnClose", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "twoFactorsAuthentication", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "allowScreenShots", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 30 }),
    __metadata("design:type", Number)
], User.prototype, "clearClipboard", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => session_entity_1.Session, (session) => session.user),
    __metadata("design:type", Array)
], User.prototype, "sessions", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], User.prototype, "hashPassword", null);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)("users")
], User);
