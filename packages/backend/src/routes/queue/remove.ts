import { RequestHandler } from "express";

import { QueueResponse } from "@sporty/api";

import { updateItem } from "../../services/db";
import { QueueService } from "../../services/queue.service";
import { RequestService } from "../../services/request.service";
import { SessionService } from "../../services/session.service";

type Query = {
  id?: string;
  songId?: string;
  force?: boolean;
};

export const removeSong: RequestHandler<any, QueueResponse, any, Query> =
  async (req, res) => {
    const { songId } = req.query;

    if (!songId) {
      return res.json({
        success: false,
        error: "MISSING_PARAMETER",
      });
    }

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

    // Dont remove the song if its not in the queue
    if (!user.queue.includes(songId)) {
      return res.json({
        success: false,
        error: "ALREADY_UPDATED",
      });
    }

    const songIndex = user.queue.findIndex((track) => track === songId);

    user.queue.splice(songIndex, 1);

    // Remove song from Queue
    await updateItem(user.id, {
      expressionAttributeNames: { "#queue": "queue" },
      updateExpression: `REMOVE #queue[${songIndex}]`,
    });

    const sessionService = new SessionService(session);
    const sessionUsers = await sessionService.getUsers();

    const queueService = new QueueService(session, sessionUsers, user);

    res.json({
      success: true,
      body: await queueService.generateQueueResponse(),
    });
  };
