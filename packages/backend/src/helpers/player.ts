import { Track, User } from "@sporty/api";

import { callSpotify, generateUri, spotify } from "../services/spotify";
import { transformTrack } from "./track";

type PlayOptions =
  | undefined
  | {
      uris?: ReadonlyArray<string> | undefined;
      position_ms?: number | undefined;
      player: User;
    };

const findDataForSync = async (initiator: User) => {
  const ownerPlayback = await callSpotify(initiator, () =>
    spotify.getMyCurrentPlaybackState()
  );

  if (!ownerPlayback?.body.item || ownerPlayback.body.item.type === "episode") {
    return false;
  }

  const track = await transformTrack(initiator, ownerPlayback.body.item);

  // Get the Position of the Track or Fallback to zero
  const position = await callSpotify(initiator, () =>
    spotify.getMyCurrentPlayingTrack()
  ).then((res) => res?.body.progress_ms ?? 0);

  return {
    track,
    position,
  };
};

export const syncPlayer = async (
  initiator: User,
  users: User[],
  track?: Track
): Promise<Track | undefined> => {
  const players = users.filter((user) => user.isPlayer);

  let song = track;
  let songPosition = 0;

  if (!track) {
    const data = await findDataForSync(initiator);
    if (!data) return;

    song = data.track;
    songPosition = data.position;
  }

  // Error if no song is given
  if (!song) {
    return;
  }

  const songUri = generateUri(song.id);

  const playOptions: PlayOptions[] = await Promise.all(
    players.map(async (player) => {
      const playerPlayback = await callSpotify(player, () =>
        spotify.getMyCurrentPlaybackState()
      );

      if (!playerPlayback?.body.device?.is_active) {
        return;
      }

      // Play if the same song is on
      if (playerPlayback.body.item?.id === song?.id) {
        // Seek the correct position
        if (playerPlayback.body.progress_ms !== songPosition) {
          await callSpotify(player, () => spotify.seek(songPosition));
        }

        await callSpotify(player, () => spotify.play());
        return { player };
      }

      return { position_ms: songPosition, uris: [songUri], player };
    })
  );

  // Start playback
  await Promise.all(
    playOptions.map((options) => {
      if (!options) {
        return;
      }

      return callSpotify(options.player, () => spotify.play(options));
    })
  );

  return song;
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
