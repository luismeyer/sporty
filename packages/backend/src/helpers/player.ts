import { Player, SessionUser, Track, User } from "@sporty/api";

import { callSpotify, generateUri, spotify } from "../services/spotify";
import { transformTrack } from "../transformers/track";

export const getDataForSync = async (initiator: User) => {
  const ownerPlayback = await callSpotify(initiator, () =>
    spotify.getMyCurrentPlaybackState()
  );

  if (!ownerPlayback?.body.item || ownerPlayback.body.item.type === "episode") {
    return;
  }

  return {
    track: await transformTrack(initiator, ownerPlayback.body.item),
    position: ownerPlayback.body.progress_ms ?? 0,
  };
};

export const getSyncOptions = (
  players: SessionUser[],
  song: Track,
  songPosition: number
) => {
  const songUri = generateUri(song.id);

  return Promise.all(
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

        return { player };
      }

      return { position_ms: songPosition, uris: [songUri], player };
    })
  );
};

export const generatePlayer = async (user?: User): Promise<Player> => {
  if (!user) {
    return { isActive: false };
  }

  const playbackResponse = await callSpotify(user, () =>
    spotify.getMyCurrentPlaybackState()
  );

  if (
    !playbackResponse ||
    !playbackResponse.body.item ||
    playbackResponse.body.item.type !== "track"
  ) {
    return { isActive: false };
  }

  const track = await transformTrack(user, playbackResponse.body.item);

  if (!track) {
    return { isActive: false };
  }

  return {
    isActive: true,
    data: {
      isPlaying: playbackResponse.body.is_playing,
      progress: playbackResponse.body.progress_ms ?? 0,
      track,
    },
  };
};
