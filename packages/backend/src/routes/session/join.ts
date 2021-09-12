import { RequestHandler } from "express";

import { Session, SessionResponse } from "@sporty/api";

import { getItem, updateItem } from "../../services/db";
import { RequestService } from "../../services/request.service";
import { SessionService } from "../../services/session.service";
import { PlayerService } from "../../services/player.service";

type Params = {
  session: string;
};

export const joinSession: RequestHandler<
  unknown,
  SessionResponse,
  unknown,
  Params
> = async (req, res) => {
  const { session: sessionId } = req.query;

  if (!sessionId) {
    return res.json({ success: false, error: "MISSING_PARAMETER" });
  }

  const session = await getItem<Session>(String(sessionId));

  if (!session) {
    return res.json({ success: false, error: "WRONG_PARAMETER" });
  }

  const requestService = new RequestService(req);
  const user = await requestService.getUser();

  if (!user) {
    return res.json({ success: false, error: "INVALID_TOKEN" });
  }

  if (user.session) {
    return res.json({ success: false, error: "ALREADY_UPDATED" });
  }

  await updateItem(user.id, {
    expressionAttributeNames: {
      "#isOwner": "isOwner",
      "#session": "session",
    },
    expressionAttributeValues: {
      ":isOwner": false,
      ":session": session.id,
    },
    updateExpression: "SET #isOwner = :isOwner, #session = :session",
  });

  const sessionService = new SessionService(session);
  const sessionUsers = await sessionService.getUsers();

  const playerService = new PlayerService(sessionUsers, user);
  playerService.sync();

  res.json({
    success: true,
    body: await sessionService.get(),
  });
};
