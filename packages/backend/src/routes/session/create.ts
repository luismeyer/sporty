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
      error: "Wrong token",
    });
  }

  if (user.session) {
    return res.json({
      success: false,
      error: "Already in Session",
    });
  }

  const session = await generateSession(user);

  if (!session) {
    return res.json({
      success: false,
      error: "Error creating session",
    });
  }

  // Search for active device
  const isActive = await hasActiveDevice(user);

  let timeInMS: number | undefined;

  // Calculate time based on the current Track
  if (isActive) {
    const { body } = await callSpotify(user, () =>
      spotify.getMyCurrentPlayingTrack()
    );

    const { item, progress_ms } = body;

    timeInMS = item && progress_ms ? item.duration_ms - progress_ms : undefined;
  }

  await updateQueue(session.id);

  await createStateMachine(session.id, timeInMS);

  res.json({
    success: true,
    body: await transformSession(session, [await transformUser(user)]),
  });
};
