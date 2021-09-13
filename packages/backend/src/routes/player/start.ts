import { RequestHandler } from "express";

import { PlayerResponse } from "@sporty/api";

import { PlayerService } from "../../services/player.service";
import { RequestService } from "../../services/request.service";
import { SessionService } from "../../services/session.service";
import { StateMachineService } from "../../services/state-machine";

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

  const machineService = new StateMachineService(session);

  await machineService.stopExecution();

  const users = await sessionService.getUsers();

  const playerService = new PlayerService(users, user);

  const player = await playerService.sync();

  await machineService.updateMachine(user);

  res.json({
    success: true,
    body: player,
  });
};
