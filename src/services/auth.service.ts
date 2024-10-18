import { hashValue } from "../utils/bcrypt";
import {
  signToken,
  verifyToken,
  RefreshTokenPayload,
  refreshTokenSignOptions,
} from "../utils/jwt";
import { sendMail } from "../utils/sendMail";
import {
  getVerifyEmailTemplate,
  getPasswordResetTemplate,
} from "../utils/emailTemplates";
import appAssert from "../utils/appAssert";
import {
  fiveMinutesAgo,
  ONE_DAY_MS,
  oneHourFromNow,
  oneYearFromNow,
  thirtyDaysFromNow,
} from "../utils/date";
import { APP_ORIGIN, EMAIL_SENDER } from "../constants/env";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
} from "../constants/http";
import VerificationCodeType from "../constants/verificationCodeType";
import { User } from "../model/user.entity";
import { Session } from "../model/session.entity";
import { VerificationCode } from "../model/verification-code.entity";
import { AppDataSource } from "../database/datasource";
import { MoreThan } from "typeorm";
import { randomBytes } from "crypto";

type CreateAccountParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export const createAccount = async (data: CreateAccountParams) => {
  const userRepository = AppDataSource.getRepository(User);

  // Kiểm tra email có tồn tại
  const existingUser = await userRepository.findOne({
    where: { email: data.email },
  });
  appAssert(!existingUser, CONFLICT, "Email already in use");

  // Tạo user mới
  const user = userRepository.create({
    email: data.email,
    password: data.password,
  });
  await userRepository.save(user);
  const verificationCodeRepository =
    AppDataSource.getRepository(VerificationCode);

  // Tạo mã xác thực
  const verificationCode = verificationCodeRepository.create({
    user,
    type: VerificationCodeType.EMAIL_VERIFICATION,
    expiresAt: oneYearFromNow(),
  });
  await verificationCodeRepository.save(verificationCode);
  const url = `${APP_ORIGIN}/email/verify/${verificationCode.id}`;

  // Gửi email xác thực
  const { error } = await sendMail({
    to: user.email,
    ...getVerifyEmailTemplate(url, user.email),
  });
  if (error) console.error(error);

  // Tạo session
  const sessionRepository = AppDataSource.getRepository(Session);
  const session = sessionRepository.create({
    user,
    userAgent: data.userAgent,
  });
  await sessionRepository.save(session);

  // Tạo token
  const refreshToken = signToken(
    { sessionId: session.id },
    refreshTokenSignOptions
  );
  const accessToken = signToken({ userId: user.id, sessionId: session.id });

  return {
    user: { ...user, password: undefined },
    accessToken,
    refreshToken,
  };
};

type LoginParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export const loginUser = async ({
  email,
  password,
  userAgent,
}: LoginParams) => {
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { email } });
  appAssert(user, UNAUTHORIZED, "Invalid email or password");

  const isValid = await user.comparePassword(password); // Assuming you have a password comparison method
  appAssert(isValid, UNAUTHORIZED, "Invalid email or password");

  const sessionRepository = AppDataSource.getRepository(Session);
  const session = sessionRepository.create({
    user,
    userAgent,
  });
  await sessionRepository.save(session);

  const sessionInfo: RefreshTokenPayload = { sessionId: session.id };
  const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);
  const accessToken = signToken({ ...sessionInfo, userId: user.id });

  return {
    user: { ...user, password: undefined },
    accessToken,
    refreshToken,
  };
};

export const verifyEmail = async (code: string) => {
  const verificationCodeRepository =
    AppDataSource.getRepository(VerificationCode);
  const verificationCode = await verificationCodeRepository.findOne({
    where: {
      id: code,
      type: VerificationCodeType.EMAIL_VERIFICATION,
      expiresAt: MoreThan(new Date()),
    },
  });
  appAssert(
    verificationCode,
    NOT_FOUND,
    "Invalid or expired verification code"
  );

  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({
    where: { id: verificationCode.user.id },
  });
  appAssert(user, INTERNAL_SERVER_ERROR, "Failed to verify email");

  user.isEnabled = true;
  await userRepository.save(user);
  await verificationCodeRepository.delete(verificationCode.id);

  return { user: { ...user, password: undefined } };
};

export const refreshUserAccessToken = async (refreshToken: string) => {
  const { payload } = verifyToken<RefreshTokenPayload>(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  });
  appAssert(payload, UNAUTHORIZED, "Invalid refresh token");

  const sessionRepository = AppDataSource.getRepository(Session);
  const session = await sessionRepository.findOne({
    where: { id: payload.sessionId },
  });
  const now = Date.now();
  appAssert(
    session && session.expiresAt.getTime() > now,
    UNAUTHORIZED,
    "Session expired"
  );

  const sessionNeedsRefresh = session.expiresAt.getTime() - now <= ONE_DAY_MS;
  if (sessionNeedsRefresh) {
    session.expiresAt = thirtyDaysFromNow();
    await sessionRepository.save(session);
  }

  const newRefreshToken = sessionNeedsRefresh
    ? signToken({ sessionId: session.id }, refreshTokenSignOptions)
    : undefined;
  const accessToken = signToken({
    userId: session.user.id,
    sessionId: session.id,
  });

  return { accessToken, newRefreshToken };
};

export const sendPasswordResetEmail = async (email: string) => {
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { email } });
  appAssert(user, NOT_FOUND, "User not found");

  const verificationCodeRepository =
    AppDataSource.getRepository(VerificationCode);
  const fiveMinAgo = fiveMinutesAgo();
  const count = await verificationCodeRepository.count({
    where: {
      id: user.id,
      type: VerificationCodeType.PASSWORD_RESET,
      createdAt: MoreThan(fiveMinAgo),
    },
  });
  appAssert(
    count <= 1,
    TOO_MANY_REQUESTS,
    "Too many requests, please try again later"
  );

  const expiresAt = oneHourFromNow();
  const verificationCode = verificationCodeRepository.create({
    user,
    type: VerificationCodeType.PASSWORD_RESET,
    expiresAt,
  });
  await verificationCodeRepository.save(verificationCode);

  const url = `${APP_ORIGIN}/password/reset?code=${
    verificationCode.id
  }&exp=${expiresAt.getTime()}`;

  const { data, error } = await sendMail({
    to: email,
    ...getPasswordResetTemplate(url),
  });

  appAssert(
    data?.id,
    INTERNAL_SERVER_ERROR,
    `${error?.name} - ${error?.message}`
  );
  return { url, emailId: data.id };
};

type ResetPasswordParams = {
  password: string;
  verificationCode: string;
};

export const resetPassword = async ({
  verificationCode,
  password,
}: ResetPasswordParams) => {
  const verificationCodeRepository =
    AppDataSource.getRepository(VerificationCode);
  const validCode = await verificationCodeRepository.findOne({
    where: {
      id: verificationCode,
      type: VerificationCodeType.PASSWORD_RESET,
      expiresAt: MoreThan(new Date()),
    },
  });
  appAssert(validCode, NOT_FOUND, "Invalid or expired verification code");

  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({
    where: {
      id: validCode.user.id,
    },
  });
  appAssert(user, INTERNAL_SERVER_ERROR, "Failed to reset password");

  user.password = await hashValue(password);
  await userRepository.save(user);
  await verificationCodeRepository.delete(validCode.id);

  const sessionRepository = AppDataSource.getRepository(Session);
  await sessionRepository.delete({ id: validCode.id });

  return { user: { ...user, password: undefined } };
};
