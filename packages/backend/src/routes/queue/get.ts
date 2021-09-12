import { RequestHandler } from "express";

import { QueueResponse } from "@sporty/api";

import { QueueService } from "../../services/queue.service";
import { RequestService } from "../../services/request.service";
import { SessionService } from "../../services/session.service";
import { transformQueue } from "../../transformers/queue";

export const getQueue: RequestHandler<unknown, QueueResponse> = async (
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

  const session = await requestService.getSession();

  if (!session) {
    return res.json({ success: false, error: "NO_SESSION" });
  }

  const sessionService = new SessionService(session);
  const users = await sessionService.getUsers();

  const queueService = new QueueService(session, users, user);

  res.json({
    success: true,
    body: await queueService.generateQueueResponse(),
  });
};
