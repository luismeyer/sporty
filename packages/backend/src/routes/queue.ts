import { RequestHandler } from "express";

import { populatedQueue } from "../helpers/queue";
import { authorizeRequest } from "../helpers/user";

export const queue: RequestHandler = async (req, res) => {
  const user = await authorizeRequest(req.headers);

  if (!user) {
    return res.json({
      error: "Wrong token",
    });
  }

  res.json({
    queue: await populatedQueue(user),
  });
};
