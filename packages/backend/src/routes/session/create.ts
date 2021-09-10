import { RequestHandler } from "express";

import { SessionResponse } from "@sporty/api";

import { hasActiveDevice } from "../../helpers/device";
import { popQueueItem } from "../../helpers/queue";
import { generateSession, transformSession } from "../../helpers/session";
import { authorizeRequest, transformUser } from "../../helpers/user";
import { callSpotify, spotify } from "../../services/spotify";
import { createStateMachine } from "../../services/state-machine";
import { syncPlayer } from "../../helpers/player";

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

  const item = await popQueueItem(user);

  if (item) {
    await syncPlayer(user, [user], item.track);
  }

  let timeInMS: number | undefined;

  // Calculate time based on the current Track
  if (await hasActiveDevice(user)) {
    const response = await callSpotify(user, () =>
      spotify.getMyCurrentPlayingTrack()
    );

    if (response) {
      const { item, progress_ms } = response.body;

      timeInMS =
        item && progress_ms ? item.duration_ms - progress_ms : undefined;
    }
  }

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
