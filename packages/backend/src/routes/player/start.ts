import { RequestHandler } from "express";

import { PlayerResponse, Session } from "@qify/api";

import { hasActiveDevice } from "../../helpers/device";
import { syncPlayer } from "../../helpers/player";
import { transformTrack } from "../../helpers/track";
import { authorizeRequest, sessionUsers } from "../../helpers/user";
import { getItem } from "../../services/db";
import { callSpotify, spotify } from "../../services/spotify";
import {
  stopSessionExecution,
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

  if (!playbackResponse) {
    return res.json({ success: false, error: "INTERNAL_ERROR" });
  }

  if (playbackResponse.body.is_playing) {
    return res.json({ success: false, error: "ALREADY_UPDATED" });
  }

  await stopSessionExecution(session);

  const users = await sessionUsers(session.id);
  await syncPlayer(user, users);

  const track = playbackResponse.body.item as SpotifyApi.TrackObjectFull;

  await updateStateMachine(session, track.duration_ms);

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
