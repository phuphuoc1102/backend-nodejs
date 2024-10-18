import { z } from "zod";
import { NOT_FOUND, OK } from "../constants/http";
import catchErrors from "../utils/catchErrors";
import appAssert from "../utils/appAssert";
import { getRepository, MoreThan } from "typeorm";
import { Session } from "../model/session.entity"; // Adjust the import path as necessary
import { AppDataSource } from "../database/datasource";

export const getSessionsHandler = catchErrors(async (req, res) => {
  const sessionRepository = AppDataSource.getRepository(Session);
  const sessions = await sessionRepository.find({
    where: {
      user: { id: req.userId }, 
      expiresAt: MoreThan(new Date()),
    },
    order: {
      createdAt: "DESC",
    },
  });

  return res.status(OK).json(
    sessions.map((session) => ({
      ...session,
      ...(session.id === req.sessionId && { isCurrent: true }),
    }))
  );
});

export const deleteSessionHandler = catchErrors(async (req, res) => {
  const sessionId = z.string().parse(req.params.id);
  const sessionRepository = getRepository(Session);

  const session = await sessionRepository.findOne({
    where: {
      id: sessionId,
      user: { id: req.userId }, // Use userId from request
    },
  });

  appAssert(session, NOT_FOUND, "Session not found");

  await sessionRepository.remove(session);

  return res.status(OK).json({ message: "Session removed" });
});
