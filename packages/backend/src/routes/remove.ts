import { RequestHandler } from 'express';

import { User } from '@qify/api';

import { getItem, updateItem } from '../services/db';

type Query = {
  id?: string;
  songId?: string;
  force?: boolean;
};

export const remove: RequestHandler<any, any, any, Query> = async (
  req,
  res
) => {
  const { id, songId } = req.query;

  if (!id) {
    return res.json({
      error: "Missing id",
    });
  }

  if (!songId) {
    return res.json({
      error: "Missing songId",
    });
  }

  const user = await getItem<User>(id);

  if (!user) {
    return res.json({
      error: "Can't find user",
    });
  }

  if (!user.queue.includes(songId)) {
    return res.json({
      error: "Song is not in Queue",
    });
  }

  // Remove song from Queue
  await updateItem(id, {
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
