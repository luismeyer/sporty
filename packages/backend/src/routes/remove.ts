import { RequestHandler } from "express";

import { authorizeRequest } from "../helpers/user";
import { updateItem } from "../services/db";

type Query = {
  id?: string;
  songId?: string;
  force?: boolean;
};

export const remove: RequestHandler<any, any, any, Query> = async (
  req,
  res
) => {
  const { songId } = req.query;

  if (!songId) {
    return res.json({
      error: "Missing songId",
    });
  }

  const user = await authorizeRequest(req.headers);

  if (!user) {
    return res.json({
      error: "Wrong token",
    });
  }

  if (!user.queue.includes(songId)) {
    return res.json({
      error: "Song is not in Queue",
    });
  }

  // Remove song from Queue
  await updateItem(user.id, {
    expressionAttributeNames: { "#queue": "queue" },
    expressionAttributeValues: {
      ":queue": user.queue.filter((song) => song !== songId),
    },
    updateExpression: "SET #queue = :queue",
  });

  res.json({
    message: "Success",
  });
};
