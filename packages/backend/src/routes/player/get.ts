import { RequestHandler } from "express";

import { Player, PlayerResponse } from "@qify/api";

import { transformTrack } from "../../helpers/track";
import { authorizeRequest } from "../../helpers/user";
import { callSpotify, spotify } from "../../services/spotify";

export const getPlayer: RequestHandler<unknown, PlayerResponse> = async (
  req,
  res
) => {
  const user = await authorizeRequest(req.headers);

  if (!user) {
    return res.json({ success: false, error: "INVALID_TOKEN" });
  }

  if (!user.session) {
    return res.json({ success: false, error: "NO_SESSION" });
  }

  const playBackState = await callSpotify(user, () =>
    spotify.getMyCurrentPlaybackState()
  );

  if (!playBackState) {
    return res.json({ success: false, error: "INTERNAL_ERROR" });
  }

  const { body } = playBackState;

  if (body.currently_playing_type !== "track") {
    return res.json({ success: true, body: { isActive: false } });
  }

  const track = body.item as SpotifyApi.TrackObjectFull;
  const currentTrack = await transformTrack(user, track);

  if (!currentTrack) {
    return res.json({ success: true, body: { isActive: false } });
  }

  res.json({
    success: true,
    body: {
      isActive: true,
      info: {
        progress: playBackState.body.progress_ms ?? 0,
        track: currentTrack,
        isPlaying: playBackState.body.is_playing,
      },
    },
  });
};
