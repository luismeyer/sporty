import { RequestHandler } from "express";

import { QueueResponse } from "@qify/api";

import { populatedQueue } from "../helpers/queue";
import { authorizeRequest } from "../helpers/user";
import { updateItem } from "../services/db";

type Query = {
  id?: string;
  songId?: string;
  force?: boolean;
};

export const remove: RequestHandler<any, QueueResponse, any, Query> = async (
  req,
  res
) => {
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

  const newUser = {
    ...user,
    queue: user.queue.filter((song) => song !== songId),
  };

  // Remove song from Queue
  await updateItem(user.id, {
    expressionAttributeNames: { "#queue": "queue" },
    expressionAttributeValues: { ":queue": newUser.queue },
    updateExpression: "SET #queue = :queue",
  });

  res.json({
    success: true,
    body: {
      queue: await populatedQueue(newUser),
    },
  });
};
