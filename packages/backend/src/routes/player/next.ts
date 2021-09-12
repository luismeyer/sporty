import { RequestHandler } from "express";

import { PlayerResponse, Session } from "@sporty/api";

import { popQueueItem } from "../../helpers/queue";
import { playTrackInSession } from "../../helpers/track";
import { authorizeRequest } from "../../helpers/user";
import { getItem } from "../../services/db";
import {
  stopStateMachineExecution,
  updateStateMachine,
} from "../../services/state-machine";

export const nextPlayer: RequestHandler<unknown, PlayerResponse> = async (
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
    return res.json({ success: false, error: "NO_SESSION" });
  }

  const item = await popQueueItem(user);

  if (!item) {
    return res.json({ success: false, error: "INTERNAL_ERROR" });
  }

  await stopStateMachineExecution(session);

  const response = await playTrackInSession(user, item.track);

  if (!response) {
    return { success: false, error: "NO_SESSION" };
  }

  await updateStateMachine(session, user);

  res.json({
    success: true,
    body: {
      isActive: true,
      info: {
        track: response,
        isPlaying: true,
        progress: 0,
      },
    },
  });
};
