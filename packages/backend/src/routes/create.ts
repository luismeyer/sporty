import { RequestHandler } from "express";

import { SessionResponse, User } from "@qify/api";

import { updateQueue } from "../helpers/queue";
import { authorizeRequest } from "../helpers/user";
import { putItem } from "../services/db";
import { callSpotify, spotify } from "../services/spotify";
import { createStateMachine } from "../services/state-machine";
import { transformSession } from "../helpers/session";

export const create: RequestHandler<unknown, SessionResponse> = async (
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

  const session = String(Math.round(Math.random() * 9000 + 1000));

  // Update session and activate owner and player mode
  await putItem<User>({
    ...user,
    session,
    isOwner: true,
    isPlayer: true,
  });

  // Search for active device
  const devices = await callSpotify(user, () => spotify.getMyDevices());
  const hasActiveDevice = devices.body.devices.some(
    (device) => device.is_active
  );

  let timeInMS = 10000;

  // Calculate time based on the current Track
  if (hasActiveDevice) {
    const { body } = await callSpotify(user, () =>
      spotify.getMyCurrentPlayingTrack()
    );

    const { item, progress_ms } = body;

    timeInMS = item && progress_ms ? item.duration_ms - progress_ms : 10000;
  }

  await updateQueue(session);

  await createStateMachine(session, timeInMS);

  res.json({
    success: true,
    body: await transformSession(session, []),
  });
};
