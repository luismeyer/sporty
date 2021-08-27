import { RequestHandler } from "express";

import { QueueResponse } from "@qify/api";

import { generateQueue } from "../../helpers/queue";
import { authorizeRequest } from "../../helpers/user";

export const getQueue: RequestHandler<unknown, QueueResponse> = async (
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
      queue: await generateQueue(user),
    },
  });
};
