import { Track, User } from "@sporty/api";

import { callSpotify, generateUri, spotify } from "../services/spotify";

const findDataForSync = async (initiator: User) => {
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

  return {
    id,
    position,
  };
};

export const syncPlayer = async (
  initiator: User,
  users: User[],
  track?: Track
): Promise<boolean> => {
  const players = users.filter((user) => user.isPlayer);

  let id: string;
  let position: number;

  if (track) {
    id = track.id;
    position = 0;
  } else {
    const data = await findDataForSync(initiator);
    if (!data) return false;

    id = data.id;
    position = data.position;
  }

  const songUri = generateUri(id);

  await Promise.all(
    players.map(async (player) => {
      const playerPlayback = await callSpotify(player, () =>
        spotify.getMyCurrentPlaybackState()
      );

      if (!playerPlayback?.body.device?.is_active) {
        return;
      }

      // Play if the same song is on
      if (playerPlayback.body.item?.id === id) {
        // Seek the correct position
        if (playerPlayback.body.progress_ms !== position) {
          await callSpotify(player, () => spotify.seek(position));
        }

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
