import { Track, User } from "@qify/api";

import { callSpotify, spotify } from "../services/spotify";

export const transformTrack =
  (user: User) =>
  async (track: SpotifyApi.TrackObjectFull): Promise<Track> => {
    const album = await callSpotify(user, () =>
      spotify.getAlbum(track.album.id)
    );

    return {
      id: track.id,
      name: track.name,
      artists: track.artists.map((artist) => artist.name),
      image: album.body.images[0],
    };
  };
