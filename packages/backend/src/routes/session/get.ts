import { RequestHandler } from "express";

import { Session, SessionResponse } from "@qify/api";

import { transformSession } from "../../helpers/session";
import {
  authorizeRequest,
  sessionUsers,
  transformUsers,
} from "../../helpers/user";
import { getItem } from "../../services/db";

export const getSession: RequestHandler<unknown, SessionResponse> = async (
  req,
  res
) => {
  const user = await authorizeRequest(req.headers);

  if (!user) {
    return res.json({ success: false, error: "INVALID_TOKEN" });
  }

  if (!user.session) {
    return res.json({ success: false, error: "NO_SESSION" });
  }

  const session = await getItem<Session>(user.session);

  if (!session) {
    return res.json({ success: false, error: "INTERNAL_ERROR" });
  }

  const users = await sessionUsers(user.session);

  res.json({
    success: true,
    body: await transformSession(session, await transformUsers(users)),
  });
};
