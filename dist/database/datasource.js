"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const env_1 = require("../constants/env");
const user_entity_1 = require("../model/user.entity");
const session_entity_1 = require("../model/session.entity");
const verification_code_entity_1 = require("../model/verification-code.entity");
const language_entity_1 = require("../model/language.entity");
const user_provider_entity_1 = require("../model/user-provider.entity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: env_1.HOST,
    port: 5432,
    username: "postgres",
    password: env_1.PASSWORD,
    database: env_1.DATABASE,
    synchronize: true,
    logging: true,
    // entities: [__dirname + "/**/*.entity.{ts,js}"],
    entities: [user_entity_1.User, session_entity_1.Session, verification_code_entity_1.VerificationCode, language_entity_1.Language, user_provider_entity_1.UserProvider],
    migrations: [],
    subscribers: [],
});
