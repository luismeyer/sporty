import { RequestHandler } from "express";

import { PlayerResponse } from "@qify/api";

import { hasActiveDevice } from "../../helpers/device";
import {
  pausePlayer as pausePlayerHelper,
  syncPlayer,
} from "../../helpers/player";
import { transformTrack } from "../../helpers/track";
import { authorizeRequest, sessionUsers } from "../../helpers/user";
import { callSpotify, spotify } from "../../services/spotify";

export const pausePlayer: RequestHandler<unknown, PlayerResponse> = async (
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

  if (!playbackResponse?.body.is_playing) {
    return res.json({
      success: false,
      error: "ALREADY_UPDATED",
    });
  }

  if (user.session) {
    const users = await sessionUsers(user.session);
    await pausePlayerHelper(users);
  } else {
    await callSpotify(user, () => spotify.pause());
  }

  res.json({
    success: true,
    body: {
      isActive: false,
    },
  });
};
