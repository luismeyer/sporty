import { RequestHandler } from "express";

import { transformTrack } from "../helpers/tracks";
import { authorizeRequest } from "../helpers/user";
import { callSpotify, spotify } from "../services/spotify";

type Query = {
  query?: string;
};

export const search: RequestHandler<any, any, any, Query> = async (
  req,
  res
) => {
  const { query } = req.query;

  if (!query) {
    return res.json({
      error: "Missing query",
    });
  }

  const user = await authorizeRequest(req.headers);

  if (!user) {
    return res.json({
      error: "Wrong token",
    });
  }

  const response = await callSpotify(user, () => spotify.searchTracks(query));

  if (!response.body.tracks) {
    return res.json({
      error: "Couldn't find song",
    });
  }

  const tracks = await Promise.all(
    response.body.tracks.items.map(transformTrack(user))
  );

  res.json({
    tracks,
  });
};
