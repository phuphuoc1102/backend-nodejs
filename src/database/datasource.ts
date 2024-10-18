import { DataSource } from "typeorm";
import { DATABASE, HOST, PASSWORD, USERNAME } from "../constants/env";
import { User } from "../model/user.entity";
import { Session } from "../model/session.entity";
import { VerificationCode } from "../model/verification-code.entity";
import { Language } from "../model/language.entity";
import { UserProvider } from "../model/user-provider.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: HOST,
  port: 5432,
  username: "postgres",
  password: PASSWORD,
  database: DATABASE,
  synchronize: true,
  logging: true,
  // entities: [__dirname + "/**/*.entity.{ts,js}"],
  entities: [User, Session, VerificationCode, Language, UserProvider],
  migrations: [],
  subscribers: [],
});
