import { Track, User } from '@sporty/api';

import { callSpotify, spotify } from '../services/spotify';

export const transformTrack = async (
  user: User,
  track: Pick<
    SpotifyApi.SingleTrackResponse,
    "album" | "id" | "name" | "artists" | "duration_ms"
  >
): Promise<Track | undefined> => {
  const album = await callSpotify(user, () => spotify.getAlbum(track.album.id));

  if (!album) {
    return;
  }

  return {
    id: track.id,
    name: track.name,
    artists: track.artists.map((artist) => artist.name),
    image: album.body.images[0],
    duration: track.duration_ms,
  };
};
