"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSessionHandler = exports.getSessionsHandler = void 0;
const zod_1 = require("zod");
const http_1 = require("../constants/http");
const catchErrors_1 = __importDefault(require("../utils/catchErrors"));
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const typeorm_1 = require("typeorm");
const session_entity_1 = require("../model/session.entity"); // Adjust the import path as necessary
const datasource_1 = require("../database/datasource");
exports.getSessionsHandler = (0, catchErrors_1.default)(async (req, res) => {
    const sessionRepository = datasource_1.AppDataSource.getRepository(session_entity_1.Session);
    const sessions = await sessionRepository.find({
        where: {
            user: { id: req.userId },
            expiresAt: (0, typeorm_1.MoreThan)(new Date()),
        },
        order: {
            createdAt: "DESC",
        },
    });
    return res.status(http_1.OK).json(sessions.map((session) => ({
        ...session,
        ...(session.id === req.sessionId && { isCurrent: true }),
    })));
});
exports.deleteSessionHandler = (0, catchErrors_1.default)(async (req, res) => {
    const sessionId = zod_1.z.string().parse(req.params.id);
    const sessionRepository = (0, typeorm_1.getRepository)(session_entity_1.Session);
    const session = await sessionRepository.findOne({
        where: {
            id: sessionId,
            user: { id: req.userId }, // Use userId from request
        },
    });
    (0, appAssert_1.default)(session, http_1.NOT_FOUND, "Session not found");
    await sessionRepository.remove(session);
    return res.status(http_1.OK).json({ message: "Session removed" });
});
