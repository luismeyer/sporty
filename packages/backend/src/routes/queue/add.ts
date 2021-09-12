import { RequestHandler } from "express";

import { QueueResponse } from "../../../../api/dist";
import { updateItem } from "../../services/db";
import { QueueService } from "../../services/queue.service";
import { RequestService } from "../../services/request.service";
import { SessionService } from "../../services/session.service";
import { callSpotify, spotify } from "../../services/spotify";
import { transformQueue } from "../../transformers/queue";

type Query = {
  songId?: string;
  force?: boolean;
};

export const addSong: RequestHandler<unknown, QueueResponse, unknown, Query> =
  async (req, res) => {
    const { songId, force } = req.query;

    if (!songId) {
      return res.json({
        success: false,
        error: "MISSING_PARAMETER",
      });
    }

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
    const users = await sessionService.getUsers();

    const queue = users.reduce<string[]>(
      (acc, user) => [...acc, ...user.queue],
      []
    );

    // Return if song is in Queue and force is disabled
    if (queue.includes(songId) && !force) {
      return res.json({
        success: false,
        error: "ALREADY_UPDATED",
      });
    }

    // Validate that the Song Id is correct
    const track = await callSpotify(user, () => spotify.getTrack(songId)).catch(
      () => undefined
    );

    if (!track) {
      return res.json({
        success: false,
        error: "WRONG_PARAMETER",
      });
    }

    const queueService = new QueueService(session, users, user);

    await queueService.appendItem(track.body.id);

    res.json({
      success: true,
      body: await queueService.generateQueueResponse(),
    });
  };
