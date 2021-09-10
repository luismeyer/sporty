import { RequestHandler } from "express";

import { SearchResponse } from "@sporty/api";

import { filterNullish } from "../helpers/array";
import { transformTrack } from "../helpers/track";
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
        error: "MISSING_PARAMETER",
      });
    }

    const user = await authorizeRequest(req.headers);

    if (!user) {
      return res.json({
        success: false,
        error: "INVALID_TOKEN",
      });
    }

    const response = await callSpotify(user, () => spotify.searchTracks(query));

    if (!response) {
      return res.json({ success: false, error: "INTERNAL_ERROR" });
    }

    if (!response.body.tracks) {
      return res.json({ success: false, error: "WRONG_PARAMETER" });
    }

    const tracks = await Promise.all(
      response.body.tracks.items.map((track) => transformTrack(user, track))
    );

    if (!tracks) {
      return res.json({ success: false, error: "INTERNAL_ERROR" });
    }

    res.json({
      success: true,
      body: {
        tracks: filterNullish(tracks),
      },
    });
  };
