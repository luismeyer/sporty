import { RequestHandler } from "express";

import { SessionResponse } from "@qify/api";

import { hasActiveDevice } from "../../helpers/device";
import { updateQueue } from "../../helpers/queue";
import { generateSession, transformSession } from "../../helpers/session";
import { authorizeRequest, transformUser } from "../../helpers/user";
import { callSpotify, spotify } from "../../services/spotify";
import { createStateMachine } from "../../services/state-machine";

export const createSession: RequestHandler<unknown, SessionResponse> = async (
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

  if (user.session) {
    return res.json({
      success: false,
      error: "ALREADY_UPDATED",
    });
  }

  const session = await generateSession(user);

  if (!session) {
    return res.json({
      success: false,
      error: "INTERNAL_ERROR",
    });
  }

  // Search for active device
  const isActive = await hasActiveDevice(user);

  let timeInMS: number | undefined;

  // Calculate time based on the current Track
  if (isActive) {
    const response = await callSpotify(user, () =>
      spotify.getMyCurrentPlayingTrack()
    );

    if (!response) {
      return res.json({ success: false, error: "INTERNAL_ERROR" });
    }

    const { item, progress_ms } = response.body;

    timeInMS = item && progress_ms ? item.duration_ms - progress_ms : undefined;
  }

  await updateQueue(session);

  await createStateMachine(session, timeInMS);

  const frontendUser = await transformUser(user);

  if (!frontendUser) {
    return res.json({ success: false, error: "INTERNAL_ERROR" });
  }

  res.json({
    success: true,
    body: await transformSession(session, [frontendUser]),
  });
};
