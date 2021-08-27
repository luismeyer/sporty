import { RequestHandler } from "express";

import { SessionResponse } from "@qify/api";

import {
  authorizeRequest,
  sessionUsers,
  transformUsers,
} from "../../helpers/user";
import { transformSession } from "../../helpers/session";

export const getSession: RequestHandler<unknown, SessionResponse> = async (
  req,
  res
) => {
  const user = await authorizeRequest(req.headers);

  if (!user) {
    return res.json({
      success: false,
      error: "Wrong token",
    });
  }

  if (!user.session) {
    return res.json({
      success: false,
      error: "User is not in a session",
    });
  }

  const users = await sessionUsers(user.session);

  res.json({
    success: true,
    body: await transformSession(user.session, await transformUsers(users)),
  });
};
