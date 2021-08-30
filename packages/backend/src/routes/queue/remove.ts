import { RequestHandler } from "express";

import { QueueResponse } from "@qify/api";

import { generateQueue } from "../../helpers/queue";
import { authorizeRequest } from "../../helpers/user";
import { updateItem } from "../../services/db";

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
        error: "Missing songId",
      });
    }

    const user = await authorizeRequest(req.headers);

    if (!user) {
      return res.json({
        success: false,
        error: "Wrong token",
      });
    }

    // Dont remove the song if its not in the queue
    if (!user.queue.includes(songId)) {
      return res.json({
        success: false,
        error: "Song is not in Queue",
      });
    }

    const songIndex = user.queue.findIndex((track) => track === songId);

    user.queue.splice(songIndex, 1);

    // Remove song from Queue
    await updateItem(user.id, {
      expressionAttributeNames: { "#queue": "queue" },
      updateExpression: `REMOVE #queue[${songIndex}]`,
    });

    res.json({
      success: true,
      body: {
        queue: await generateQueue(user),
      },
    });
  };
