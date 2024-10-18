"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATABASE = exports.PASSWORD = exports.USERNAME = exports.HOST = exports.EMAIL_SENDER = exports.JWT_REFRESH_SECRET = exports.JWT_SECRET = exports.APP_ORIGIN = exports.PORT = exports.NODE_ENV = exports.RESEND_API_KEY = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getEnv = (key, defaultValue) => {
    const value = process.env[key] || defaultValue;
    // Kiểm tra nếu biến môi trường không được thiết lập và không có giá trị mặc định
    if (value === undefined) {
        throw new Error(`Missing String environment variable for ${key}`);
    }
    console.log(`Loaded environment variable: ${key} = ${value}`);
    return value;
};
// Khai báo các biến môi trường với giá trị mặc định
exports.RESEND_API_KEY = getEnv("RESEND_API_KEY");
exports.NODE_ENV = getEnv("NODE_ENV");
exports.PORT = getEnv("PORT", "3000");
exports.APP_ORIGIN = getEnv("APP_ORIGIN");
exports.JWT_SECRET = getEnv("JWT_SECRET");
exports.JWT_REFRESH_SECRET = getEnv("JWT_REFRESH_SECRET");
exports.EMAIL_SENDER = getEnv("EMAIL_SENDER");
exports.HOST = getEnv("HOST");
exports.USERNAME = getEnv("USERNAME");
exports.PASSWORD = getEnv("PASSWORD");
exports.DATABASE = getEnv("DATABASE");
