import dotenv from "dotenv";

dotenv.config();

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;

  // Kiểm tra nếu biến môi trường không được thiết lập và không có giá trị mặc định
  if (value === undefined) {
    throw new Error(`Missing String environment variable for ${key}`);
  }

  return value;
};

// Khai báo các biến môi trường với giá trị mặc định
export const RESEND_API_KEY = getEnv("RESEND_API_KEY");
export const NODE_ENV = getEnv("NODE_ENV");
export const PORT = getEnv("PORT");
export const SERVER_PORT = getEnv("SERVER_PORT", "3000");
export const APP_ORIGIN = getEnv("APP_ORIGIN");
export const JWT_SECRET = getEnv("JWT_SECRET");
export const JWT_REFRESH_SECRET = getEnv("JWT_REFRESH_SECRET");
export const EMAIL_SENDER = getEnv("EMAIL_SENDER");
export const HOST = getEnv("HOST");
export const USERNAME = getEnv("USERNAME");
export const PASSWORD = getEnv("PASSWORD");
export const DATABASE = getEnv("DATABASE");
export const EMAIL_REGISTER_USER_SUBJECT = getEnv(
  "EMAIL_REGISTER_USER_SUBJECT"
);
export const EMAIL_REGISTER_USER_CONTENT_1_1 = getEnv(
  "EMAIL_REGISTER_USER_CONTENT_1_1"
);
export const EMAIL_REGISTER_USER_CONTENT_1_2 = getEnv(
  "EMAIL_REGISTER_USER_CONTENT_1_2"
);
export const EMAIL_REGISTER_USER_CONTENT_1_3 = getEnv(
  "EMAIL_REGISTER_USER_CONTENT_1_3"
);
export const EMAIL_REGISTER_USER_CONTENT_2 = getEnv(
  "EMAIL_REGISTER_USER_CONTENT_2"
);
export const EMAIL_REGISTER_USER_CONTENT_3 = getEnv(
  "EMAIL_REGISTER_USER_CONTENT_3"
);
export const EMAIL_RESET_PASSWORD_SUBJECT = getEnv(
  "EMAIL_RESET_PASSWORD_SUBJECT"
);
export const EMAIL_DELETE_USER_SUBJECT = getEnv("EMAIL_DELETE_USER_SUBJECT");
export const EMAIL_ACCEPT_SUBJECT = getEnv("EMAIL_ACCEPT_SUBJECT");
export const EMAIL_ACCEPT_SUBJECT_1 = getEnv("EMAIL_ACCEPT_SUBJECT_1");
export const EMAIL_ACCEPT_SUBJECT_2 = getEnv("EMAIL_ACCEPT_SUBJECT_2");
export const EMAIL_REJECT_SUBJECT = getEnv("EMAIL_REJECT_SUBJECT");
export const EMAIL_REJECT_SUBJECT_1 = getEnv("EMAIL_REJECT_SUBJECT_1");
export const EMAIL_REJECT_SUBJECT_2 = getEnv("EMAIL_REJECT_SUBJECT_2");
