import { RequestHandler } from "express";

import { PlayerResponse } from "@sporty/api";

import { PlayerService } from "../../services/player.service";
import { RequestService } from "../../services/request.service";
import { SessionService } from "../../services/session.service";

export const getPlayer: RequestHandler<unknown, PlayerResponse> = async (
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
  const sessionUsers = await sessionService.getUsers();

  const playerService = new PlayerService(sessionUsers, user);
  const playerResponse = await playerService.get();

  res.json({
    success: true,
    body: playerResponse,
  });
};
