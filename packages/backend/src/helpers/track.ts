import { Track, User } from '@sporty/api';

import { callSpotify, spotify } from '../services/spotify';
import { transformTrack } from '../transformers/track';

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
