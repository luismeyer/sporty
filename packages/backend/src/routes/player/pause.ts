import { RequestHandler } from "express";

import { PlayerResponse, Session } from "@qify/api";

import { hasActiveDevice } from "../../helpers/device";
import { pausePlayer as pausePlayerHelper } from "../../helpers/player";
import { authorizeRequest, sessionUsers } from "../../helpers/user";
import { getItem } from "../../services/db";
import { callSpotify, spotify } from "../../services/spotify";
import { stopSessionExecution } from "../../services/state-machine";

export const pausePlayer: RequestHandler<unknown, PlayerResponse> = async (
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

  const session = await getItem<Session>(user.session);

  if (!session) {
    return res.json({ success: false, error: "INTERNAL_ERROR" });
  }

  const activeDevice = await hasActiveDevice(user);

  if (!activeDevice) {
    return res.json({ success: false, error: "NO_ACTIVE_DEVICE" });
  }

  const playbackResponse = await callSpotify(user, () =>
    spotify.getMyCurrentPlaybackState()
  );

  if (!playbackResponse?.body.is_playing) {
    return res.json({ success: false, error: "ALREADY_UPDATED" });
  }

  await stopSessionExecution(session);

  const users = await sessionUsers(session.id);
  await pausePlayerHelper(users);

  res.json({
    success: true,
    body: {
      isActive: false,
    },
  });
};
