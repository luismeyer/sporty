import { RequestHandler } from 'express';

import { SearchResponse } from '@sporty/api';

import { filterNullish } from '../helpers/array';
import { RequestService } from '../services/request.service';
import { callSpotify, spotify } from '../services/spotify';
import { transformTrack } from '../transformers/track';

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

    const requestService = new RequestService(req);
    const user = await requestService.getUser();

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
