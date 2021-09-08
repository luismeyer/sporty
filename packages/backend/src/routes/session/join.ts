import { RequestHandler } from "express";

import { Session, SessionResponse } from "@qify/api";

import { transformSession } from "../../helpers/session";
import {
  authorizeRequest,
  sessionUsers,
  transformUsers,
} from "../../helpers/user";
import { getItem, updateItem } from "../../services/db";

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
    return res.json({
      success: false,
      error: "MISSING_PARAMETER",
    });
  }

  const session = await getItem<Session>(String(sessionId));

  if (!session) {
    return res.json({
      success: false,
      error: "INTERNAL_ERROR",
    });
  }

  const user = await authorizeRequest(req.headers);

  if (!user) {
    return res.json({
      success: false,
      error: "INVALID_TOKEN",
    });
  }

  if (user.session) {
    return res.json({
      success: false,
      error: "ALREADY_UPDATED",
    });
  }

  const users = await sessionUsers(session.id);

  if (users.length === 0) {
    return res.json({
      success: false,
      error: "WRONG_PARAMETER",
    });
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

  const updatedUsers = await sessionUsers(session.id);

  res.json({
    success: true,
    body: await transformSession(session, await transformUsers(updatedUsers)),
  });
};
