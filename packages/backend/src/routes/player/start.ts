import { RequestHandler } from "express";

import { PlayerResponse, Session } from "@sporty/api";

import { getItem } from "../../services/db";
import { PlayerService } from "../../services/player.service";
import { RequestService } from "../../services/request.service";
import { SessionService } from "../../services/session.service";
import { callSpotify, spotify } from "../../services/spotify";
import {
  stopStateMachineExecution,
  updateStateMachine,
} from "../../services/state-machine";
import { UserService } from "../../services/user";

export const startPlayer: RequestHandler<unknown, PlayerResponse> = async (
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

  const activeDevices = await sessionService.hasActiveDevices();

  if (!activeDevices) {
    return res.json({ success: false, error: "NO_ACTIVE_DEVICE" });
  }

  await stopStateMachineExecution(session);

  const users = await sessionService.getUsers();

  const playerService = new PlayerService(users, user);

  const player = await playerService.sync();

  await updateStateMachine(session, user);

  res.json({
    success: true,
    body: player,
  });
};
