import { RequestHandler } from "express";

import { transformTrack } from "../helpers/tracks";
import { authorizeRequest } from "../helpers/user";
import { callSpotify, spotify } from "../services/spotify";

export const queue: RequestHandler = async (req, res) => {
  const user = await authorizeRequest(req.headers);

  if (!user) {
    return res.json({
      error: "Wrong token",
    });
  }

  const tracks = await Promise.all(
    user.queue.map((track) => callSpotify(user, () => spotify.getTrack(track)))
  );

  const queue = await Promise.all(
    tracks.map((track) => track.body).map(transformTrack(user))
  );

  res.json({
    queue,
  });
};
