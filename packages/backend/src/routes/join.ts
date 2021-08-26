import { RequestHandler } from "express";

import { SessionResponse } from "@qify/api";

import {
  authorizeRequest,
  sessionUsers,
  transformUsers,
} from "../helpers/user";
import { updateItem } from "../services/db";
import { transformSession } from "../helpers/session";

type Params = {
  session: string;
};

export const join: RequestHandler<unknown, SessionResponse, unknown, Params> =
  async (req, res) => {
    const { session } = req.query;

    if (!session) {
      return res.json({ success: false, error: "Missing session" });
    }

    const user = await authorizeRequest(req.headers);

    if (!user) {
      return res.json({ success: false, error: "Wrong Token" });
    }

    if (user.session) {
      return res.json({ success: false, error: "Already in Session" });
    }

    const users = await sessionUsers(session);

    if (users.length === 0) {
      return res.json({ success: false, error: "Session doesn't exist" });
    }

    await updateItem(user.id, {
      expressionAttributeNames: {
        "#isOwner": "isOwner",
        "#session": "session",
      },
      expressionAttributeValues: {
        ":isOwner": false,
        ":session": session,
      },
      updateExpression: "SET #isOwner = :isOwner, #session = :session",
    });

    const updatedUsers = await sessionUsers(session);

    res.json({
      success: true,
      body: await transformSession(session, await transformUsers(updatedUsers)),
    });
  };
