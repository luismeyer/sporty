import { RequestHandler } from "express";

import { SessionResponse, SessionUser } from "@sporty/api";

import { generateSession } from "../../helpers/session";
import { PlayerService } from "../../services/player.service";
import { QueueService } from "../../services/queue.service";
import { RequestService } from "../../services/request.service";
import { StateMachineService } from "../../services/state-machine";
import { transformSession } from "../../transformers/session";
import { transformUser } from "../../transformers/user";

export const createSession: RequestHandler<unknown, SessionResponse> = async (
  req,
  res
) => {
  const requestService = new RequestService(req);
  const user = await requestService.getUser();

  if (!user) {
    return res.json({
      success: false,
      error: "INVALID_TOKEN",
    });
  }

  const oldSession = await requestService.getSession();

  if (oldSession) {
    return res.json({
      success: false,
      error: "ALREADY_UPDATED",
    });
  }

  const session = await generateSession(user);

  if (!session) {
    return res.json({
      success: false,
      error: "INTERNAL_ERROR",
    });
  }

  const sessionUsers: SessionUser[] = [
    {
      ...user,
      session: session.id,
    },
  ];

  const queueService = new QueueService(session, sessionUsers, user);
  const playerService = new PlayerService(sessionUsers, user);

  const item = await queueService.popItem();

  if (item) {
    await playerService.start(item.track);
  }

  const machineService = new StateMachineService(session);
  await machineService.createMachine(user);

  const frontendUser = await transformUser(user);

  if (!frontendUser) {
    return res.json({ success: false, error: "INTERNAL_ERROR" });
  }

  res.json({
    success: true,
    body: await transformSession(session, [frontendUser]),
  });
};
