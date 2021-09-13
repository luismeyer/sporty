import { RequestHandler } from "express";

import { SessionResponse } from "@sporty/api";

import { RequestService } from "../../services/request.service";
import { SessionService } from "../../services/session.service";

export const getSession: RequestHandler<unknown, SessionResponse> = async (
  req,
  res
) => {
  const requestService = new RequestService(req);
  const user = await requestService.getUser();

  if (!user) {
    return res.json({ success: false, error: "INVALID_TOKEN" });
  }

  const session = await requestService.getSession();

  if (!session) {
    return res.json({ success: false, error: "NO_SESSION" });
  }

  const sessionService = new SessionService(session);

  res.json({
    success: true,
    body: await sessionService.get(),
  });
};
