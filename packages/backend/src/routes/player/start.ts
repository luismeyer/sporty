import { RequestHandler } from "express";

import { PlayerResponse } from "@qify/api";

import { hasActiveDevice } from "../../helpers/device";
import { syncPlayer } from "../../helpers/player";
import { transformTrack } from "../../helpers/track";
import { authorizeRequest, sessionUsers } from "../../helpers/user";
import { callSpotify, spotify } from "../../services/spotify";

export const startPlayer: RequestHandler<unknown, PlayerResponse> = async (
  req,
  res
) => {
  const user = await authorizeRequest(req.headers);

  if (!user) {
    return res.json({
      success: false,
      error: "INVALID_TOKEN",
    });
  }

  const activeDevice = await hasActiveDevice(user);

  if (!activeDevice) {
    return res.json({
      success: false,
      error: "NO_ACTIVE_DEVICE",
    });
  }

  const playbackResponse = await callSpotify(user, () =>
    spotify.getMyCurrentPlaybackState()
  );

  if (!playbackResponse) {
    return res.json({ success: false, error: "INTERNAL_ERROR" });
  }

  if (playbackResponse.body.is_playing) {
    return res.json({ success: false, error: "ALREADY_UPDATED" });
  }

  if (user.session) {
    const users = await sessionUsers(user.session);
    await syncPlayer(user, users);
  } else {
    await callSpotify(user, () => spotify.play());
  }

  const track = playbackResponse.body.item as SpotifyApi.TrackObjectFull;

  const currentTrack = await transformTrack(user, track);

  if (!currentTrack) {
    return res.json({ success: false, error: "INTERNAL_ERROR" });
  }

  res.json({
    success: true,
    body: {
      isActive: true,
      currentTrack,
    },
  });
};
