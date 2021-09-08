import { Track, User } from "@qify/api";

import { callSpotify, generateUri, spotify } from "../services/spotify";
import { hasActiveDevice } from "./device";

export const transformTrack = async (
  user: User,
  track: Pick<
    SpotifyApi.SingleTrackResponse,
    "album" | "id" | "name" | "artists"
  >
) => {
  const album = await callSpotify(user, () => spotify.getAlbum(track.album.id));

  if (!album) {
    return;
  }

  return {
    id: track.id,
    name: track.name,
    artists: track.artists.map((artist) => artist.name),
    image: album.body.images[0],
  };
};

export const generateTrack = async (
  user: User,
  id: string
): Promise<Track | undefined> => {
  const res = await callSpotify(user, () => spotify.getTrack(id));

  if (!res) {
    return;
  }

  return transformTrack(user, res.body);
};

export const playTrack = async (
  user: User,
  trackId: string
): Promise<boolean> => {
  if (!hasActiveDevice(user)) {
    return false;
  }

  const trackUri = generateUri(trackId);

  await callSpotify(user, () => spotify.play({ uris: [trackUri] }));

  return true;
};
