import { RequestHandler } from "express";

import { PlayerResponse } from "@sporty/api";

import { PlayerService } from "../../services/player.service";
import { QueueService } from "../../services/queue.service";
import { RequestService } from "../../services/request.service";
import { SessionService } from "../../services/session.service";
import { StateMachineService } from "../../services/state-machine";

export const nextPlayer: RequestHandler<unknown, PlayerResponse> = async (
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

  const queueService = new QueueService(session, sessionUsers, user);

  const item = await queueService.popItem();

  if (!item) {
    return res.json({ success: false, error: "INTERNAL_ERROR" });
  }

  const machineService = new StateMachineService(session);

  await machineService.stopExecution();

  const playerResponse = await playerService.start(item.track);

  await machineService.updateMachine(user);

  res.json({
    success: true,
    body: playerResponse,
  });
};
