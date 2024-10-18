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
exports.UserProvider = void 0;
const typeorm_1 = require("typeorm");
const auth_provider_enum_1 = require("../enum/auth-provider.enum");
const user_entity_1 = require("./user.entity");
let UserProvider = class UserProvider {
};
exports.UserProvider = UserProvider;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], UserProvider.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false }),
    __metadata("design:type", String)
], UserProvider.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false }),
    __metadata("design:type", String)
], UserProvider.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], UserProvider.prototype, "photo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: auth_provider_enum_1.AuthProvider, nullable: false }),
    __metadata("design:type", String)
], UserProvider.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.providers),
    __metadata("design:type", user_entity_1.User)
], UserProvider.prototype, "user", void 0);
exports.UserProvider = UserProvider = __decorate([
    (0, typeorm_1.Entity)("user_providers")
], UserProvider);
