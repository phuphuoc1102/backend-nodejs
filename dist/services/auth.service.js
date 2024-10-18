"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.sendPasswordResetEmail = exports.refreshUserAccessToken = exports.verifyEmail = exports.loginUser = exports.createAccount = void 0;
const bcrypt_1 = require("../utils/bcrypt");
const jwt_1 = require("../utils/jwt");
const sendMail_1 = require("../utils/sendMail");
const emailTemplates_1 = require("../utils/emailTemplates");
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const date_1 = require("../utils/date");
const env_1 = require("../constants/env");
const http_1 = require("../constants/http");
const verificationCodeType_1 = __importDefault(require("../constants/verificationCodeType"));
const user_entity_1 = require("../model/user.entity");
const session_entity_1 = require("../model/session.entity");
const verification_code_entity_1 = require("../model/verification-code.entity");
const datasource_1 = require("../database/datasource");
const typeorm_1 = require("typeorm");
const createAccount = async (data) => {
    const userRepository = datasource_1.AppDataSource.getRepository(user_entity_1.User);
    // Kiểm tra email có tồn tại
    const existingUser = await userRepository.findOne({
        where: { email: data.email },
    });
    (0, appAssert_1.default)(!existingUser, http_1.CONFLICT, "Email already in use");
    // Tạo user mới
    const user = userRepository.create({
        email: data.email,
        password: data.password,
    });
    await userRepository.save(user);
    const verificationCodeRepository = datasource_1.AppDataSource.getRepository(verification_code_entity_1.VerificationCode);
    // Tạo mã xác thực
    const verificationCode = verificationCodeRepository.create({
        user,
        type: verificationCodeType_1.default.EMAIL_VERIFICATION,
        expiresAt: (0, date_1.oneYearFromNow)(),
    });
    await verificationCodeRepository.save(verificationCode);
    const url = `${env_1.APP_ORIGIN}/email/verify/${verificationCode.id}`;
    // Gửi email xác thực
    const { error } = await (0, sendMail_1.sendMail)({
        to: user.email,
        ...(0, emailTemplates_1.getVerifyEmailTemplate)(url),
    });
    if (error)
        console.error(error);
    // Tạo session
    const sessionRepository = datasource_1.AppDataSource.getRepository(session_entity_1.Session);
    const session = sessionRepository.create({
        user,
        userAgent: data.userAgent,
    });
    await sessionRepository.save(session);
    // Tạo token
    const refreshToken = (0, jwt_1.signToken)({ sessionId: session.id }, jwt_1.refreshTokenSignOptions);
    const accessToken = (0, jwt_1.signToken)({ userId: user.id, sessionId: session.id });
    return {
        user: { ...user, password: undefined },
        accessToken,
        refreshToken,
    };
};
exports.createAccount = createAccount;
const loginUser = async ({ email, password, userAgent, }) => {
    const userRepository = datasource_1.AppDataSource.getRepository(user_entity_1.User);
    const user = await userRepository.findOne({ where: { email } });
    (0, appAssert_1.default)(user, http_1.UNAUTHORIZED, "Invalid email or password");
    const isValid = await user.comparePassword(password); // Assuming you have a password comparison method
    (0, appAssert_1.default)(isValid, http_1.UNAUTHORIZED, "Invalid email or password");
    const sessionRepository = datasource_1.AppDataSource.getRepository(session_entity_1.Session);
    const session = sessionRepository.create({
        user,
        userAgent,
    });
    await sessionRepository.save(session);
    const sessionInfo = { sessionId: session.id };
    const refreshToken = (0, jwt_1.signToken)(sessionInfo, jwt_1.refreshTokenSignOptions);
    const accessToken = (0, jwt_1.signToken)({ ...sessionInfo, userId: user.id });
    return {
        user: { ...user, password: undefined },
        accessToken,
        refreshToken,
    };
};
exports.loginUser = loginUser;
const verifyEmail = async (code) => {
    const verificationCodeRepository = datasource_1.AppDataSource.getRepository(verification_code_entity_1.VerificationCode);
    const verificationCode = await verificationCodeRepository.findOne({
        where: {
            id: code,
            type: verificationCodeType_1.default.EMAIL_VERIFICATION,
            expiresAt: (0, typeorm_1.MoreThan)(new Date()),
        },
    });
    (0, appAssert_1.default)(verificationCode, http_1.NOT_FOUND, "Invalid or expired verification code");
    const userRepository = datasource_1.AppDataSource.getRepository(user_entity_1.User);
    const user = await userRepository.findOne({
        where: { id: verificationCode.user.id },
    });
    (0, appAssert_1.default)(user, http_1.INTERNAL_SERVER_ERROR, "Failed to verify email");
    user.isEnabled = true;
    await userRepository.save(user);
    await verificationCodeRepository.delete(verificationCode.id);
    return { user: { ...user, password: undefined } };
};
exports.verifyEmail = verifyEmail;
const refreshUserAccessToken = async (refreshToken) => {
    const { payload } = (0, jwt_1.verifyToken)(refreshToken, {
        secret: jwt_1.refreshTokenSignOptions.secret,
    });
    (0, appAssert_1.default)(payload, http_1.UNAUTHORIZED, "Invalid refresh token");
    const sessionRepository = datasource_1.AppDataSource.getRepository(session_entity_1.Session);
    const session = await sessionRepository.findOne({
        where: { id: payload.sessionId },
    });
    const now = Date.now();
    (0, appAssert_1.default)(session && session.expiresAt.getTime() > now, http_1.UNAUTHORIZED, "Session expired");
    const sessionNeedsRefresh = session.expiresAt.getTime() - now <= date_1.ONE_DAY_MS;
    if (sessionNeedsRefresh) {
        session.expiresAt = (0, date_1.thirtyDaysFromNow)();
        await sessionRepository.save(session);
    }
    const newRefreshToken = sessionNeedsRefresh
        ? (0, jwt_1.signToken)({ sessionId: session.id }, jwt_1.refreshTokenSignOptions)
        : undefined;
    const accessToken = (0, jwt_1.signToken)({
        userId: session.user.id,
        sessionId: session.id,
    });
    return { accessToken, newRefreshToken };
};
exports.refreshUserAccessToken = refreshUserAccessToken;
const sendPasswordResetEmail = async (email) => {
    const userRepository = datasource_1.AppDataSource.getRepository(user_entity_1.User);
    const user = await userRepository.findOne({ where: { email } });
    (0, appAssert_1.default)(user, http_1.NOT_FOUND, "User not found");
    const verificationCodeRepository = datasource_1.AppDataSource.getRepository(verification_code_entity_1.VerificationCode);
    const fiveMinAgo = (0, date_1.fiveMinutesAgo)();
    const count = await verificationCodeRepository.count({
        where: {
            id: user.id,
            type: verificationCodeType_1.default.PASSWORD_RESET,
            createdAt: (0, typeorm_1.MoreThan)(fiveMinAgo),
        },
    });
    (0, appAssert_1.default)(count <= 1, http_1.TOO_MANY_REQUESTS, "Too many requests, please try again later");
    const expiresAt = (0, date_1.oneHourFromNow)();
    const verificationCode = verificationCodeRepository.create({
        user,
        type: verificationCodeType_1.default.PASSWORD_RESET,
        expiresAt,
    });
    await verificationCodeRepository.save(verificationCode);
    const url = `${env_1.APP_ORIGIN}/password/reset?code=${verificationCode.id}&exp=${expiresAt.getTime()}`;
    const { data, error } = await (0, sendMail_1.sendMail)({
        to: email,
        ...(0, emailTemplates_1.getPasswordResetTemplate)(url),
    });
    (0, appAssert_1.default)(data?.id, http_1.INTERNAL_SERVER_ERROR, `${error?.name} - ${error?.message}`);
    return { url, emailId: data.id };
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const resetPassword = async ({ verificationCode, password, }) => {
    const verificationCodeRepository = datasource_1.AppDataSource.getRepository(verification_code_entity_1.VerificationCode);
    const validCode = await verificationCodeRepository.findOne({
        where: {
            id: verificationCode,
            type: verificationCodeType_1.default.PASSWORD_RESET,
            expiresAt: (0, typeorm_1.MoreThan)(new Date()),
        },
    });
    (0, appAssert_1.default)(validCode, http_1.NOT_FOUND, "Invalid or expired verification code");
    const userRepository = datasource_1.AppDataSource.getRepository(user_entity_1.User);
    const user = await userRepository.findOne({
        where: {
            id: validCode.user.id,
        },
    });
    (0, appAssert_1.default)(user, http_1.INTERNAL_SERVER_ERROR, "Failed to reset password");
    user.password = await (0, bcrypt_1.hashValue)(password);
    await userRepository.save(user);
    await verificationCodeRepository.delete(validCode.id);
    const sessionRepository = datasource_1.AppDataSource.getRepository(session_entity_1.Session);
    await sessionRepository.delete({ id: validCode.id });
    return { user: { ...user, password: undefined } };
};
exports.resetPassword = resetPassword;
