import { RequestHandler } from "express";

import { PlayerResponse, Session } from "@sporty/api";

import { hasActiveDevice } from "../../helpers/device";
import { syncPlayer } from "../../helpers/player";
import { transformTrack } from "../../helpers/track";
import { authorizeRequest, sessionUsers } from "../../helpers/user";
import { getItem } from "../../services/db";
import { callSpotify, spotify } from "../../services/spotify";
import {
  stopStateMachineExecution,
  updateStateMachine,
} from "../../services/state-machine";

export const startPlayer: RequestHandler<unknown, PlayerResponse> = async (
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

  if (!playbackResponse || !playbackResponse.body.item) {
    return res.json({ success: false, error: "INTERNAL_ERROR" });
  }

  await stopStateMachineExecution(session);

  const users = await sessionUsers(session.id);
  const track = await syncPlayer(user, users);

  if (!track) {
    return res.json({ success: false, error: "INTERNAL_ERROR" });
  }

  await updateStateMachine(session, user);

  res.json({
    success: true,
    body: {
      isActive: true,
      info: {
        progress: playbackResponse.body.progress_ms ?? 0,
        track: track,
        isPlaying: true,
      },
    },
  });
};
