import { User } from "@qify/api";

import { callSpotify, generateUri, spotify } from "../services/spotify";

export const syncPlayer = async (
  initiator: User,
  users: User[]
): Promise<boolean> => {
  const players = users.filter((user) => user.isPlayer);

  if (!initiator) {
    return false;
  }

  const ownerPlayback = await callSpotify(initiator, () =>
    spotify.getMyCurrentPlaybackState()
  );

  if (!ownerPlayback?.body.item) {
    return false;
  }

  const { id } = ownerPlayback.body.item;

  // Get the Position of the Track or Fallback to zero
  const position = await callSpotify(initiator, () =>
    spotify.getMyCurrentPlayingTrack()
  ).then((res) => res?.body.progress_ms ?? 0);

  const songUri = generateUri(id);

  await Promise.all(
    players.map(async (player) => {
      const playerPlayback = await callSpotify(player, () =>
        spotify.getMyCurrentPlaybackState()
      );

      if (!playerPlayback?.body.device.is_active) {
        return;
      }

      // Seek and Play if the same song is on
      if (playerPlayback.body.item?.id === id) {
        await callSpotify(player, () => spotify.seek(position));
        await callSpotify(player, () => spotify.play());
        return;
      }

      // Start a new Playback
      await callSpotify(player, () =>
        spotify.play({ position_ms: position, uris: [songUri] })
      );
    })
  );

  return true;
};

export const pausePlayer = async (users: User[]) => {
  const players = users.filter((user) => user.isPlayer);

  await Promise.all(
    players.map(async (player) => {
      const playerPlayback = await callSpotify(player, () =>
        spotify.getMyCurrentPlaybackState()
      );

      if (!playerPlayback?.body.is_playing) {
        return;
      }

      await callSpotify(player, () => spotify.pause());
    })
  );
};
