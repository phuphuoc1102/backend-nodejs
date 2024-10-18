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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationCode = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const verificationCodeType_1 = __importDefault(require("../constants/verificationCodeType"));
const date_1 = require("../utils/date");
let VerificationCode = class VerificationCode {
};
exports.VerificationCode = VerificationCode;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], VerificationCode.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, () => VerificationCode, {
        nullable: false,
        onDelete: "CASCADE",
    }),
    __metadata("design:type", user_entity_1.User)
], VerificationCode.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: verificationCodeType_1.default,
        nullable: false,
    }),
    __metadata("design:type", String)
], VerificationCode.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], VerificationCode.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "timestamp",
        nullable: false,
        default: () => (0, date_1.thirtyDaysFromNow)(),
    }),
    __metadata("design:type", Date)
], VerificationCode.prototype, "expiresAt", void 0);
exports.VerificationCode = VerificationCode = __decorate([
    (0, typeorm_1.Entity)("verification_codes")
], VerificationCode);
