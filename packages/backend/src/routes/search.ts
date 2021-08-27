import { RequestHandler } from "express";

import { SearchResponse } from "@qify/api";

import { generateTrack, transformTrack } from "../helpers/track";
import { authorizeRequest } from "../helpers/user";
import { callSpotify, spotify } from "../services/spotify";

type Query = {
  query?: string;
};

export const search: RequestHandler<unknown, SearchResponse, unknown, Query> =
  async (req, res) => {
    const { query } = req.query;

    if (!query) {
      return res.json({
        success: false,
        error: "Missing query",
      });
    }

    const user = await authorizeRequest(req.headers);

    if (!user) {
      return res.json({
        success: false,
        error: "Wrong token",
      });
    }

    const response = await callSpotify(user, () => spotify.searchTracks(query));

    if (!response.body.tracks) {
      return res.json({
        success: false,
        error: "Couldn't find song",
      });
    }

    const tracks = await Promise.all(
      response.body.tracks.items.map(transformTrack(user))
    );

    res.json({
      success: true,
      body: {
        tracks,
      },
    });
  };
