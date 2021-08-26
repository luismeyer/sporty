import { RequestHandler } from 'express';

import { User } from '@qify/api';

import { getItem } from '../services/db';
import { callSpotify, spotify } from '../services/spotify';

type Query = {
  id?: string;
  query?: string;
};

export const search: RequestHandler<any, any, any, Query> = async (
  req,
  res
) => {
  const { id, query } = req.query;

  if (!id) {
    return res.json({
      error: "Missing id",
    });
  }

  if (!query) {
    return res.json({
      error: "Missing query",
    });
  }

  const user = await getItem<User>(id);

  if (!user) {
    return res.json({
      error: "Couldn't find user",
    });
  }

  const response = await callSpotify(user, () => spotify.searchTracks(query));

  if (!response.body.tracks) {
    return res.json({
      error: "Couldn't find song",
    });
  }

  const tracks = await Promise.all(
    response.body.tracks.items.map(async (item) => {
      const album = await callSpotify(user, () =>
        spotify.getAlbum(item.album.id)
      );

      return {
        id: item.id,
        name: item.name,
        artists: item.artists,
        image: album.body.images[0],
      };
    })
  );

  res.json({
    tracks,
  });
};
