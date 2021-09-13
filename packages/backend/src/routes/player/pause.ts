import { RequestHandler } from "express";

import { PlayerResponse } from "@sporty/api";

import { PlayerService } from "../../services/player.service";
import { RequestService } from "../../services/request.service";
import { SessionService } from "../../services/session.service";
import { UserService } from "../../services/user";
import { StateMachineService } from "../../services/machine.service";

export const pausePlayer: RequestHandler<unknown, PlayerResponse> = async (
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

  const userService = new UserService(user);
  const activeDevice = await userService.hasActiveDevice();

  if (!activeDevice) {
    return res.json({ success: false, error: "NO_ACTIVE_DEVICE" });
  }

  const machineService = new StateMachineService(session);

  await machineService.stopExecution();

  const sessionService = new SessionService(session);
  const users = await sessionService.getUsers();

  const playerService = new PlayerService(users, user);
  const playerResponse = await playerService.pause();

  res.json({
    success: true,
    body: playerResponse,
  });
};
