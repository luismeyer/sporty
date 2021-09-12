import { RequestHandler } from "express";

import { PlayerResponse, Session } from "@sporty/api";

import { hasActiveDevice } from "../../helpers/device";
import { pausePlayer as pausePlayerHelper } from "../../helpers/player";
import { authorizeRequest, sessionUsers } from "../../helpers/user";
import { getItem } from "../../services/db";
import { callSpotify, spotify } from "../../services/spotify";
import { stopStateMachineExecution } from "../../services/state-machine";
import { transformTrack } from "../../helpers/track";

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

  if (!playbackResponse || playbackResponse.body.item?.type !== "track") {
    return res.json({ success: false, error: "INTERNAL_ERROR" });
  }

  if (!playbackResponse.body.is_playing) {
    return res.json({ success: false, error: "ALREADY_UPDATED" });
  }

  await stopStateMachineExecution(session);

  const users = await sessionUsers(session.id);
  await pausePlayerHelper(users);

  const track = await transformTrack(user, playbackResponse.body.item);

  if (!track) {
    return res.json({ success: false, error: "INTERNAL_ERROR" });
  }

  res.json({
    success: true,
    body: {
      isActive: true,
      info: {
        isPlaying: false,
        progress: playbackResponse.body.progress_ms ?? 0,
        track,
      },
    },
  });
};
