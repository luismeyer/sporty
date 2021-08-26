import { RequestHandler } from "express";

import { QueueResponse } from "@qify/api";

import { populatedQueue } from "../helpers/queue";
import { authorizeRequest } from "../helpers/user";

export const queue: RequestHandler<unknown, QueueResponse> = async (
  req,
  res
) => {
  const user = await authorizeRequest(req.headers);

  if (!user) {
    return res.json({
      success: false,
      error: "Wrong token",
    });
  }

  res.json({
    success: true,
    body: {
      queue: await populatedQueue(user),
    },
  });
};
