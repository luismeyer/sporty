import { FrontendUser, User } from '@sporty/api';

import { filterNullish } from '../helpers/array';
import { callSpotify, spotify } from '../services/spotify';

export const transformUser = async (
  user: User
): Promise<FrontendUser | undefined> => {
  const sUser = await callSpotify(user, () => spotify.getMe());

  if (!sUser) {
    return;
  }

  return {
    name: sUser.body.display_name ?? user.spotifyId,
    image: sUser.body.images?.[0].url,
    isOwner: user.isOwner,
    isPlayer: user.isPlayer,
    tracksInQueue: user.queue.length,
  };
};

export const transformUsers = async (
  users: User[]
): Promise<FrontendUser[]> => {
  return Promise.all(users.map(transformUser)).then(filterNullish);
};
